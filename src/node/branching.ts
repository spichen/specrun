import type { StartNode, EndNode, BranchingNode } from '../spec/types.js';
import { State } from '../state/state.js';
import type { NodeExecutor, Dependencies } from './types.js';

const DEFAULT_BRANCH = 'DEFAULT_BRANCH';

/** BranchingExecutor executes a BranchingNode by routing based on a mapping. */
export class BranchingExecutor implements NodeExecutor {
  private node: BranchingNode;
  private _branch = '';

  constructor(node: BranchingNode, _deps: Dependencies) {
    this.node = node;
  }

  branch(): string {
    return this._branch;
  }

  async execute(
    _signal: AbortSignal | undefined,
    input: State,
  ): Promise<State> {
    // Read the branching key from input
    let [keyValue, ok] = input.getString('branching_mapping_key');

    if (!ok) {
      // Try to find any input value
      for (const key of input.keys()) {
        const [v, found] = input.getString(key);
        if (found) {
          keyValue = v;
          break;
        }
      }
      if (!keyValue) {
        throw new Error(
          `run: BranchingNode "${this.node.name}": no branching_mapping_key in input`,
        );
      }
    }

    // Look up in mapping
    if (keyValue in this.node.mapping) {
      this._branch = this.node.mapping[keyValue];
    } else if (DEFAULT_BRANCH in this.node.mapping) {
      this._branch = this.node.mapping[DEFAULT_BRANCH];
    } else {
      this._branch = 'default';
    }

    return input.clone();
  }
}

/** StartExecutor passes inputs through to outputs. */
export class StartExecutor implements NodeExecutor {
  constructor(private node: StartNode) {}

  branch(): string {
    return '';
  }

  async execute(
    _signal: AbortSignal | undefined,
    input: State,
  ): Promise<State> {
    return input.clone();
  }
}

/** EndExecutor collects final outputs. */
export class EndExecutor implements NodeExecutor {
  constructor(private node: EndNode) {}

  branch(): string {
    return '';
  }

  async execute(
    _signal: AbortSignal | undefined,
    input: State,
  ): Promise<State> {
    return input.clone();
  }
}
