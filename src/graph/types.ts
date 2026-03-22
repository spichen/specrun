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
  name: string;
  nodes: Map<string, CompiledNode>;
  start: string;
  dataFlowEdges: DataFlowEdge[];

  constructor(
    name: string,
    nodes: Map<string, CompiledNode>,
    start: string,
    dataFlowEdges: DataFlowEdge[],
  ) {
    this.name = name;
    this.nodes = nodes;
    this.start = start;
    this.dataFlowEdges = dataFlowEdges;
  }

  /** GetNode returns a compiled node by name. */
  getNode(name: string): [CompiledNode, boolean] {
    const n = this.nodes.get(name);
    if (n) return [n, true];
    return [undefined as unknown as CompiledNode, false];
  }

  /** NextNode resolves the next node from the current node. */
  nextNode(current: CompiledNode, branch: string): [CompiledNode, boolean] {
    for (const edge of current.edges) {
      if (branch === '' && (edge.from_branch ?? '') === '') {
        const next = this.nodes.get(edge.to_node);
        if (next) return [next, true];
      }
      if (branch !== '' && edge.from_branch === branch) {
        const next = this.nodes.get(edge.to_node);
        if (next) return [next, true];
      }
    }
    // Fallback: if no branch match, try first edge with no branch
    if (branch !== '') {
      for (const edge of current.edges) {
        if ((edge.from_branch ?? '') === '') {
          const next = this.nodes.get(edge.to_node);
          if (next) return [next, true];
        }
      }
    }
    return [undefined as unknown as CompiledNode, false];
  }
}
