import type { AgentNode, ToolSpec } from '../spec/types.js';
import { propertyTitle } from '../spec/types.js';
import { State } from '../state/state.js';
import type { Message, ToolCall, ToolDefinition, Provider, JsonSchema } from '../llm/types.js';
import type { NodeExecutor, Dependencies } from './types.js';
import { createProvider } from '../llm/provider.js';
import { RunError, ToolError } from '../errors.js';

const MAX_TOOL_ROUNDS = 10;

/** AgentExecutor executes an AgentNode with LLM + tool-calling loop. */
export class AgentExecutor implements NodeExecutor {
  private node: AgentNode;
  private deps: Dependencies;
  private provider: Provider;
  private model: string;

  constructor(node: AgentNode, deps: Dependencies) {
    this.node = node;
    this.deps = deps;

    const agent = node.agent;
    if (!agent?.llmConfig) {
      throw new RunError(
        `AgentNode "${node.name}": agent or llmConfig is missing`,
      );
    }
    this.provider = createProvider(agent.llmConfig);
    this.model = agent.llmConfig.modelId;
  }

  branch(): string {
    return '';
  }

  async execute(
    signal: AbortSignal | undefined,
    input: State,
  ): Promise<State> {
    const agent = this.node.agent!;

    const systemPrompt = substituteTemplate(
      agent.systemPrompt ?? '',
      input,
    );

    const toolDefs: ToolDefinition[] = agent.tools?.map((t) => ({
      name: t.name,
      description: t.description ?? '',
      parameters: buildToolSchema(t),
    })) ?? [];

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(input.toData()) },
    ];

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const resp = await this.provider.chatCompletion(signal, {
        model: this.model,
        messages,
        tools: toolDefs.length > 0 ? toolDefs : undefined,
      });

      if (!resp.tool_calls || resp.tool_calls.length === 0) {
        const outputData: Record<string, unknown> = { result: resp.content };
        if (resp.content) {
          try {
            Object.assign(outputData, JSON.parse(resp.content));
          } catch {
            // Not JSON, that's fine
          }
        }
        return new State(outputData);
      }

      messages.push({
        role: 'assistant',
        content: resp.content,
        tool_calls: resp.tool_calls,
      });

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

    throw new RunError(
      `AgentNode "${this.node.name}" exceeded max tool rounds (${MAX_TOOL_ROUNDS})`,
    );
  }

  private async executeTool(
    signal: AbortSignal | undefined,
    tc: ToolCall,
  ): Promise<Record<string, unknown>> {
    let args: Record<string, unknown>;
    try {
      args = JSON.parse(tc.arguments);
    } catch (err) {
      throw new ToolError(`failed to parse arguments for "${tc.name}"`, { cause: err });
    }

    if (!this.deps.toolRegistry || !this.deps.toolExecutor) {
      throw new ToolError(`"${tc.name}": registry or executor not configured`);
    }

    const toolDef = this.deps.toolRegistry.lookup(tc.name);
    if (!toolDef) {
      throw new ToolError(`"${tc.name}" not found in registry`);
    }

    if (this.deps.verbose) {
      console.error(
        `  Executing tool "${tc.name}" with args: ${JSON.stringify(args)}`,
      );
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
    result = result.replaceAll(`{{${key}}}`, s.getString(key) ?? '');
  }
  return result;
}

/** Build a JSON Schema object from a ToolSpec's inputs. */
export function buildToolSchema(t: ToolSpec): JsonSchema {
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];

  if (t.inputs) {
    for (const input of t.inputs) {
      const name = propertyTitle(input);
      if (!name) continue;
      const prop: JsonSchema = {};
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
