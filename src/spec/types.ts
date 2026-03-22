/** Component is the base for all Agent Spec types. */
export interface Component {
  id?: string;
  name: string;
  description?: string;
  component_type: string;
  agentspec_version?: string;
  metadata?: Record<string, unknown>;
}

/** Property represents a JSON-Schema-based property definition. */
export interface Property {
  json_schema: Record<string, unknown>;
}

/** Returns the "title" field from the JSON schema. */
export function propertyTitle(p: Property): string {
  const t = p.json_schema['title'];
  return typeof t === 'string' ? t : '';
}

/** Returns the "type" field from the JSON schema. */
export function propertyType(p: Property): string {
  const t = p.json_schema['type'];
  return typeof t === 'string' ? t : '';
}

/** LLMConfig holds LLM provider configuration. */
export interface LLMConfig {
  component_type?: string;
  model_id: string;
  url?: string;
  default_generation_parameters?: Record<string, unknown>;
}

/** ToolSpec defines a tool in Agent Spec. */
export interface ToolSpec {
  component_type: string;
  name: string;
  description?: string;
  inputs?: Property[];
  outputs?: Property[];
}

/** Agent represents an Agent Spec Agent component. */
export interface Agent extends Component {
  system_prompt?: string;
  llm_config?: LLMConfig;
  tools?: ToolSpec[];
  inputs?: Property[];
  outputs?: Property[];
  human_in_the_loop?: boolean;
}

/** Flow represents an Agent Spec Flow component. */
export interface Flow extends Component {
  start_node: unknown;
  nodes: unknown[];
  control_flow_connections: ControlFlowEdge[];
  data_flow_connections?: DataFlowEdge[];
}

/** ControlFlowEdge represents a control flow connection between nodes. */
export interface ControlFlowEdge {
  from_node: string;
  from_branch?: string;
  to_node: string;
}

/** DataFlowEdge represents a data flow connection between nodes. */
export interface DataFlowEdge {
  source_node: string;
  source_output: string;
  destination_node: string;
  destination_input: string;
}

/** StartNode is the entry point of a flow. */
export interface StartNode extends Component {
  component_type: 'StartNode';
  inputs?: Property[];
  outputs?: Property[];
}

/** EndNode is the exit point of a flow. */
export interface EndNode extends Component {
  component_type: 'EndNode';
  branch_name?: string;
  inputs?: Property[];
}

/** AgentNode wraps an Agent within a flow. */
export interface AgentNode extends Component {
  component_type: 'AgentNode';
  agent?: Agent;
  inputs?: Property[];
  outputs?: Property[];
}

/** ToolNode executes a tool within a flow. */
export interface ToolNode extends Component {
  component_type: 'ToolNode';
  tool?: ToolSpec;
  inputs?: Property[];
  outputs?: Property[];
}

/** LLMNode runs a prompt template through an LLM. */
export interface LLMNode extends Component {
  component_type: 'LlmNode';
  llm_config?: LLMConfig;
  prompt_template: string;
  inputs?: Property[];
  outputs?: Property[];
}

/** BranchingNode routes execution based on a mapping. */
export interface BranchingNode extends Component {
  component_type: 'BranchingNode';
  mapping: Record<string, string>;
  inputs?: Property[];
}

/** SpecNode is a discriminated union of all node types. */
export type SpecNode =
  | StartNode
  | EndNode
  | AgentNode
  | ToolNode
  | LLMNode
  | BranchingNode;

/** Returns the node name. */
export function nodeName(n: SpecNode): string {
  return n.name;
}

/** Returns the node type (component_type). */
export function nodeType(n: SpecNode): string {
  return n.component_type;
}

/** ParsedFlow holds the fully parsed flow with resolved nodes. */
export interface ParsedFlow extends Flow {
  parsedNodes: SpecNode[];
}
