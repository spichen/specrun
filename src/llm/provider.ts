import type { LLMConfig } from '../spec/types.js';
import type { Provider } from './types.js';
import { OpenAIProvider } from './openai.js';
import { LLMError } from '../errors.js';

/**
 * Supported OpenAI-compatible config types.
 * All of these use the OpenAI chat completions API under the hood.
 */
const OPENAI_COMPATIBLE_TYPES = new Set([
  'OpenAiConfig',
  'OpenAiCompatibleConfig',
  'VllmConfig',
  'OllamaConfig',
]);

/**
 * Creates an LLM Provider from a spec LLMConfig.
 *
 * All currently supported configs (OpenAI, vLLM, Ollama, OpenAI-compatible)
 * use the OpenAI SDK with different base URLs and optional API keys.
 */
export function createProvider(config: LLMConfig): Provider {
  const configType = config.componentType ?? 'OpenAiConfig';

  if (!OPENAI_COMPATIBLE_TYPES.has(configType)) {
    throw new LLMError(
      `unsupported config type "${configType}". ` +
        `Supported: ${[...OPENAI_COMPATIBLE_TYPES].join(', ')}`,
    );
  }

  const opts: { apiKey?: string; baseURL?: string } = {};

  if (config.apiKey) {
    opts.apiKey = config.apiKey;
  }

  if (config.url) {
    opts.baseURL = config.url;
  }

  return new OpenAIProvider(opts);
}
