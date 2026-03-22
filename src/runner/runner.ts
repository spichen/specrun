import type { CompiledGraph, CompiledNode } from '../graph/types.js';
import { State } from '../state/state.js';
import type { Event } from './events.js';
import type { RunnerOptions } from './options.js';

/** Runner executes a compiled graph. */
export class Runner {
  private graph: CompiledGraph;
  private opts: RunnerOptions;

  constructor(graph: CompiledGraph, opts: RunnerOptions) {
    this.graph = graph;
    this.opts = opts;
  }

  /** Run executes the flow with the given initial inputs. */
  async run(
    signal: AbortSignal | undefined,
    inputs: Record<string, unknown>,
  ): Promise<State> {
    // Create a timeout signal
    const timeoutSignal = AbortSignal.timeout(this.opts.timeout);
    const combinedAc = new AbortController();

    const onTimeout = () => combinedAc.abort();
    const onExternal = () => combinedAc.abort();
    timeoutSignal.addEventListener('abort', onTimeout, { once: true });
    signal?.addEventListener('abort', onExternal, { once: true });

    const effectiveSignal = combinedAc.signal;

    try {
      return await this._run(effectiveSignal, inputs);
    } finally {
      timeoutSignal.removeEventListener('abort', onTimeout);
      signal?.removeEventListener('abort', onExternal);
    }
  }

  private async _run(
    signal: AbortSignal,
    inputs: Record<string, unknown>,
  ): Promise<State> {
    this.emit({ type: 'flow_start' });

    const nodeOutputs = new Map<string, State>();

    const [startNode, ok] = this.graph.getNode(this.graph.start);
    if (!ok) {
      throw new Error(`run: start node "${this.graph.start}" not found`);
    }

    let current: CompiledNode = startNode;
    let currentState = new State(inputs);

    for (
      let iteration = 0;
      iteration < this.opts.maxIterations;
      iteration++
    ) {
      if (signal.aborted) {
        throw new Error('run: context cancelled: operation was aborted');
      }

      if (this.opts.verbose) {
        console.error(
          `Executing node: ${current.name} (${current.type})`,
        );
      }

      this.emit({
        type: 'node_start',
        nodeName: current.name,
        nodeType: current.type,
        state: currentState,
      });

      // Resolve inputs from data flow edges
      const nodeInput = this.resolveInputs(
        current,
        nodeOutputs,
        currentState,
      );

      // Execute node with error recovery
      let output: State;
      try {
        output = await current.executor.execute(signal, nodeInput);
      } catch (err) {
        const execErr =
          err instanceof Error ? err : new Error(String(err));
        this.emit({
          type: 'node_error',
          nodeName: current.name,
          nodeType: current.type,
          error: execErr,
        });
        throw execErr;
      }

      // Store node outputs
      nodeOutputs.set(current.name, output);

      this.emit({
        type: 'node_complete',
        nodeName: current.name,
        nodeType: current.type,
        state: output,
      });

      // Check if we've reached an EndNode
      if (current.type === 'EndNode') {
        this.emit({ type: 'flow_complete', state: output });
        return output;
      }

      // Update current state with outputs
      currentState = currentState.merge(output);

      // Resolve next node
      const branch = current.executor.branch();
      const [next, found] = this.graph.nextNode(current, branch);
      if (!found) {
        throw new Error(
          `run: no next node from "${current.name}" (branch="${branch}")`,
        );
      }

      current = next;
    }

    throw new Error(
      `run: exceeded max iterations (${this.opts.maxIterations})`,
    );
  }

  private resolveInputs(
    cn: CompiledNode,
    nodeOutputs: Map<string, State>,
    currentState: State,
  ): State {
    if (cn.inputMappings.size === 0) {
      return currentState;
    }

    let resolved = new State();
    for (const [destInput, src] of cn.inputMappings) {
      const srcOutput = nodeOutputs.get(src.sourceNode);
      if (srcOutput) {
        const [val, ok] = srcOutput.get(src.sourceOutput);
        if (ok) {
          resolved = resolved.set(destInput, val);
        }
      }
    }

    // Merge with current state (data flow edges take precedence)
    return currentState.merge(resolved);
  }

  private emit(e: Event): void {
    if (this.opts.eventHandler) {
      this.opts.eventHandler(e);
    }
  }
}
