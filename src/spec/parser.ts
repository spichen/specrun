import type {
  Agent,
  Component,
  Flow,
  ParsedFlow,
  SpecNode,
  StartNode,
  EndNode,
  AgentNode,
  ToolNode,
  LLMNode,
  BranchingNode,
} from './types.js';

/** ParseFlow parses a JSON string into a ParsedFlow. */
export function parseFlow(data: string | Buffer): ParsedFlow {
  let raw: unknown;
  try {
    raw = JSON.parse(typeof data === 'string' ? data : data.toString());
  } catch (err) {
    throw new Error(`spec: failed to parse component: ${err}`);
  }

  const base = raw as Component;
  if (base.component_type !== 'Flow') {
    throw new Error(
      `spec: expected component_type 'Flow', got "${base.component_type}"`,
    );
  }

  const flow = raw as Flow;
  const parsed: ParsedFlow = {
    ...flow,
    parsedNodes: [],
  };

  if (!Array.isArray(flow.nodes)) {
    throw new Error('spec: failed to parse flow: nodes must be an array');
  }

  for (let i = 0; i < flow.nodes.length; i++) {
    try {
      const node = parseNode(flow.nodes[i]);
      parsed.parsedNodes.push(node);
    } catch (err) {
      throw new Error(`spec: failed to parse node ${i}: ${err}`);
    }
  }

  return parsed;
}

/** ParseAgent parses a JSON string into an Agent. */
export function parseAgent(data: string | Buffer): Agent {
  let raw: unknown;
  try {
    raw = JSON.parse(typeof data === 'string' ? data : data.toString());
  } catch (err) {
    throw new Error(`spec: failed to parse component: ${err}`);
  }

  const base = raw as Component;
  if (base.component_type !== 'Agent') {
    throw new Error(
      `spec: expected component_type 'Agent', got "${base.component_type}"`,
    );
  }

  return raw as Agent;
}

/** ParseNode parses a single node object into the appropriate SpecNode type. */
export function parseNode(data: unknown): SpecNode {
  if (typeof data !== 'object' || data === null) {
    throw new Error('spec: failed to parse node base: not an object');
  }

  const base = data as Component;

  switch (base.component_type) {
    case 'StartNode':
      return data as StartNode;
    case 'EndNode':
      return data as EndNode;
    case 'AgentNode':
      return data as AgentNode;
    case 'ToolNode':
      return data as ToolNode;
    case 'LlmNode':
      return data as LLMNode;
    case 'BranchingNode':
      return data as BranchingNode;
    default:
      throw new Error(
        `spec: unknown component_type "${base.component_type}"`,
      );
  }
}

/** ParseComponent parses JSON and returns either a ParsedFlow or Agent. */
export function parseComponent(data: string | Buffer): ParsedFlow | Agent {
  let raw: unknown;
  try {
    raw = JSON.parse(typeof data === 'string' ? data : data.toString());
  } catch (err) {
    throw new Error(`spec: failed to parse component: ${err}`);
  }

  const base = raw as Component;

  switch (base.component_type) {
    case 'Flow':
      return parseFlow(typeof data === 'string' ? data : data.toString());
    case 'Agent':
      return parseAgent(typeof data === 'string' ? data : data.toString());
    default:
      throw new Error(
        `spec: unsupported top-level component_type "${base.component_type}"`,
      );
  }
}
