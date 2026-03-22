import type { State } from '../state/state.js';
import type { Executor, Registry } from '../tool/types.js';

/** NodeExecutor executes a node and returns the output state. */
export interface NodeExecutor {
  execute(signal: AbortSignal | undefined, input: State): Promise<State>;
  branch(): string;
}

/** Dependencies holds shared dependencies for node executors. */
export interface Dependencies {
  toolExecutor?: Executor;
  toolRegistry?: Registry;
  verbose?: boolean;
}
