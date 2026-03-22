import type { LLMNode } from '../spec/types.js';
import { State } from '../state/state.js';
import type { NodeExecutor, Dependencies } from './types.js';
import { substituteTemplate } from './agent.js';

/** LLMExecutor executes an LlmNode by running a prompt template through the LLM. */
export class LLMExecutor implements NodeExecutor {
  private node: LLMNode;
  private deps: Dependencies;

  constructor(node: LLMNode, deps: Dependencies) {
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
    if (!this.deps.llmProvider) {
      throw new Error(
        `run: LlmNode "${this.node.name}": no LLM provider configured`,
      );
    }

    const prompt = substituteTemplate(this.node.prompt_template, input);

    let model = 'gpt-4o';
    if (this.node.llm_config?.model_id) {
      model = this.node.llm_config.model_id;
    }

    const resp = await this.deps.llmProvider.chatCompletion(signal, {
      model,
      messages: [{ role: 'user', content: prompt }],
    });

    let output = new State();
    output = output.set('generated_text', resp.content);
    return output;
  }
}
