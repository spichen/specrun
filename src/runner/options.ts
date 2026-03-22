import type { EventHandler } from './events.js';

const DEFAULT_MAX_ITERATIONS = 50;
const DEFAULT_TIMEOUT = 300_000; // 5 minutes

/** Options configures runner behavior. */
export interface RunnerOptions {
  maxIterations: number;
  timeout: number;
  verbose: boolean;
  eventHandler?: EventHandler;
}

/** DefaultOptions returns sensible defaults. */
export function defaultOptions(): RunnerOptions {
  return {
    maxIterations: DEFAULT_MAX_ITERATIONS,
    timeout: DEFAULT_TIMEOUT,
    verbose: false,
  };
}
