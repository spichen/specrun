import type { AgentNode, ToolSpec } from '../spec/types.js';
import { propertyTitle } from '../spec/types.js';
import { State } from '../state/state.js';
import type { Message, ToolCall, ToolDefinition } from '../llm/types.js';
import type { NodeExecutor, Dependencies } from './types.js';
import { createProvider } from '../llm/provider.js';

const MAX_TOOL_ROUNDS = 10;

/** AgentExecutor executes an AgentNode with LLM + tool-calling loop. */
export class AgentExecutor implements NodeExecutor {
  private node: AgentNode;
  private deps: Dependencies;

  constructor(node: AgentNode, deps: Dependencies) {
    this.node = node;
    this.deps = deps;
  }

  branch(): string {
    return '';
  }

  async execute(
    signal: AbortSignal | undefined,
    input: State,
  ): Promise<State> {
    const agent = this.node.agent;
    if (!agent) {
      throw new Error(`run: AgentNode "${this.node.name}" has no agent`);
    }

    if (!agent.llmConfig) {
      throw new Error(
        `run: AgentNode "${this.node.name}": agent has no llmConfig`,
      );
    }

    // Resolve LLM provider from the spec's llmConfig
    const provider = createProvider(agent.llmConfig);
    const model = agent.llmConfig.modelId;

    // Build system prompt with template substitution
    const systemPrompt = substituteTemplate(
      agent.systemPrompt ?? '',
      input,
    );

    // Build tool definitions for LLM
    const toolDefs: ToolDefinition[] = [];
    if (agent.tools) {
      for (const t of agent.tools) {
        toolDefs.push({
          name: t.name,
          description: t.description ?? '',
          parameters: buildToolSchema(t),
        });
      }
    }

    // Build initial messages
    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add input context as user message
    const inputJSON = JSON.stringify(input.toData());
    messages.push({ role: 'user', content: inputJSON });

    // Tool-calling loop
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const resp = await provider.chatCompletion(signal, {
        model,
        messages,
        tools: toolDefs.length > 0 ? toolDefs : undefined,
      });

      // If no tool calls, we're done
      if (!resp.tool_calls || resp.tool_calls.length === 0) {
        let output = new State();
        output = output.set('result', resp.content);
        // Also try to parse structured output
        if (resp.content) {
          try {
            const parsed = JSON.parse(resp.content) as Record<
              string,
              unknown
            >;
            for (const [k, v] of Object.entries(parsed)) {
              output = output.set(k, v);
            }
          } catch {
            // Not JSON, that's fine
          }
        }
        return output;
      }

      // Add assistant message with tool calls
      messages.push({
        role: 'assistant',
        content: resp.content,
        tool_calls: resp.tool_calls,
      });

      // Execute each tool call
      for (const tc of resp.tool_calls) {
        try {
          const toolResult = await this.executeTool(signal, tc);
          const resultJSON = JSON.stringify(toolResult);
          if (this.deps.verbose) {
            console.error(`  Tool "${tc.name}" result: ${resultJSON}`);
          }
          messages.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: resultJSON,
          });
        } catch (err) {
          if (this.deps.verbose) {
            console.error(`  Tool "${tc.name}" error: ${err}`);
          }
          messages.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: `Error: ${err}`,
          });
        }
      }
    }

    throw new Error(
      `run: AgentNode "${this.node.name}" exceeded max tool rounds (${MAX_TOOL_ROUNDS})`,
    );
  }

  private async executeTool(
    signal: AbortSignal | undefined,
    tc: ToolCall,
  ): Promise<Record<string, unknown>> {
    // Parse arguments
    let args: Record<string, unknown>;
    try {
      args = JSON.parse(tc.arguments);
    } catch (err) {
      throw new Error(`failed to parse tool arguments: ${err}`);
    }

    if (!this.deps.toolRegistry) {
      throw new Error(`tool "${tc.name}" not found in registry`);
    }

    const [toolDef, ok] = this.deps.toolRegistry.lookup(tc.name);
    if (!ok) {
      throw new Error(`tool "${tc.name}" not found in registry`);
    }

    if (this.deps.verbose) {
      console.error(
        `  Executing tool "${tc.name}" with args: ${JSON.stringify(args)}`,
      );
    }

    if (!this.deps.toolExecutor) {
      throw new Error(`no tool executor configured`);
    }

    const result = await this.deps.toolExecutor.execute(
      signal,
      toolDef.path,
      args,
    );

    return result.output;
  }
}

/** Substitute {{key}} placeholders in a template string. */
export function substituteTemplate(template: string, s: State): string {
  let result = template;
  for (const key of s.keys()) {
    const [v] = s.getString(key);
    result = result.replaceAll(`{{${key}}}`, v);
  }
  return result;
}

/** Build a JSON Schema object from a ToolSpec's inputs. */
export function buildToolSchema(t: ToolSpec): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  if (t.inputs) {
    for (const input of t.inputs) {
      const name = propertyTitle(input);
      if (!name) continue;
      const prop: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(input.jsonSchema)) {
        if (k !== 'title') {
          prop[k] = v;
        }
      }
      properties[name] = prop;
      required.push(name);
    }
  }

  return {
    type: 'object',
    properties,
    required,
  };
}
