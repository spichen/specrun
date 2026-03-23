import type { ControlFlowEdge, DataFlowEdge, SpecNode } from '../spec/types.js';
import type { NodeExecutor } from '../node/types.js';

/** DataSource identifies where a node input value comes from. */
export interface DataSource {
  sourceNode: string;
  sourceOutput: string;
}

/** CompiledNode wraps a spec node with its executor and edge metadata. */
export interface CompiledNode {
  name: string;
  type: string;
  specNode: SpecNode;
  executor: NodeExecutor;
  edges: ControlFlowEdge[];
  inputMappings: Map<string, DataSource>;
}

/** CompiledGraph is the fully compiled and ready-to-execute graph. */
export class CompiledGraph {
  constructor(
    public name: string,
    public nodes: Map<string, CompiledNode>,
    public start: string,
    public dataFlowEdges: DataFlowEdge[],
  ) {}

  getNode(name: string): [CompiledNode, boolean] {
    const n = this.nodes.get(name);
    if (n) return [n, true];
    return [undefined as unknown as CompiledNode, false];
  }

  /** Resolves the next node, preferring an exact branch match, then falling back to an unbranchd edge. */
  nextNode(current: CompiledNode, branch: string): [CompiledNode, boolean] {
    let fallback: CompiledNode | undefined;

    for (const edge of current.edges) {
      const edgeBranch = edge.fromBranch ?? '';
      if (branch && edgeBranch === branch) {
        const next = this.nodes.get(edge.toNode);
        if (next) return [next, true];
      }
      if (!edgeBranch && !fallback) {
        fallback = this.nodes.get(edge.toNode);
      }
    }

    // Exact match for empty branch, or fallback for non-empty branch
    if (fallback) return [fallback, true];
    return [undefined as unknown as CompiledNode, false];
  }
}
