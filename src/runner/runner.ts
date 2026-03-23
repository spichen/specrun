import type { CompiledGraph, CompiledNode } from '../graph/types.js';
import { State } from '../state/state.js';
import type { Event } from './events.js';
import type { RunnerOptions } from './options.js';

export class Runner {
  constructor(
    private graph: CompiledGraph,
    private opts: RunnerOptions,
  ) {}

  async run(
    signal: AbortSignal | undefined,
    inputs: Record<string, unknown>,
  ): Promise<State> {
    const signals = [AbortSignal.timeout(this.opts.timeout)];
    if (signal) signals.push(signal);
    return this._run(AbortSignal.any(signals), inputs);
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

      const nodeInput = this.resolveInputs(
        current,
        nodeOutputs,
        currentState,
      );

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

      nodeOutputs.set(current.name, output);

      this.emit({
        type: 'node_complete',
        nodeName: current.name,
        nodeType: current.type,
        state: output,
      });

      if (current.type === 'EndNode') {
        this.emit({ type: 'flow_complete', state: output });
        return output;
      }

      currentState = currentState.merge(output);

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

    // Build resolved data in one shot to avoid chained State allocations
    const resolvedData: Record<string, unknown> = {};
    for (const [destInput, src] of cn.inputMappings) {
      const srcOutput = nodeOutputs.get(src.sourceNode);
      if (srcOutput) {
        const [val, ok] = srcOutput.get(src.sourceOutput);
        if (ok) {
          resolvedData[destInput] = val;
        }
      }
    }

    return currentState.merge(new State(resolvedData));
  }

  private emit(e: Event): void {
    this.opts.eventHandler?.(e);
  }
}
