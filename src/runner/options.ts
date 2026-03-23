import type { EventHandler } from './events.js';

/** Options configures runner behavior. */
export interface RunnerOptions {
  maxIterations: number;
  timeout: number;
  verbose: boolean;
  eventHandler?: EventHandler;
}

export const DEFAULT_RUNNER_OPTIONS: Readonly<RunnerOptions> = {
  maxIterations: 50,
  timeout: 300_000, // 5 minutes
  verbose: false,
};
