import type { Agent, ParsedFlow } from './types.js';

/** ValidateFlow checks a ParsedFlow for spec-level validity. */
export function validateFlow(pf: ParsedFlow): void {
  const errs: string[] = [];

  if (!pf.name) {
    errs.push('flow name is required');
  }

  if (pf.component_type !== 'Flow') {
    errs.push(
      `expected component_type 'Flow', got "${pf.component_type}"`,
    );
  }

  if (pf.parsedNodes.length === 0) {
    errs.push('flow must have at least one node');
  }

  let hasStart = false;
  let hasEnd = false;
  const nodeNames = new Map<string, number>();

  for (const n of pf.parsedNodes) {
    const name = n.name;
    const count = (nodeNames.get(name) ?? 0) + 1;
    nodeNames.set(name, count);
    if (count > 1) {
      errs.push(`duplicate node name "${name}"`);
    }
    if (n.component_type === 'StartNode') {
      hasStart = true;
    }
    if (n.component_type === 'EndNode') {
      hasEnd = true;
    }
  }

  if (!hasStart) {
    errs.push('flow must have a StartNode');
  }
  if (!hasEnd) {
    errs.push('flow must have an EndNode');
  }

  // Validate control flow edges reference valid nodes
  for (let i = 0; i < pf.control_flow_connections.length; i++) {
    const edge = pf.control_flow_connections[i];
    if (!nodeNames.has(edge.from_node)) {
      errs.push(
        `control_flow_connections[${i}]: from_node "${edge.from_node}" not found`,
      );
    }
    if (!nodeNames.has(edge.to_node)) {
      errs.push(
        `control_flow_connections[${i}]: to_node "${edge.to_node}" not found`,
      );
    }
  }

  // Validate data flow edges reference valid nodes
  const dataEdges = pf.data_flow_connections ?? [];
  for (let i = 0; i < dataEdges.length; i++) {
    const edge = dataEdges[i];
    if (!nodeNames.has(edge.source_node)) {
      errs.push(
        `data_flow_connections[${i}]: source_node "${edge.source_node}" not found`,
      );
    }
    if (!nodeNames.has(edge.destination_node)) {
      errs.push(
        `data_flow_connections[${i}]: destination_node "${edge.destination_node}" not found`,
      );
    }
  }

  // Validate node-specific requirements
  for (const n of pf.parsedNodes) {
    if (n.component_type === 'AgentNode') {
      if (!n.agent) {
        errs.push(`AgentNode "${n.name}" must have an agent`);
      } else {
        if (!n.agent.system_prompt) {
          errs.push(
            `AgentNode "${n.name}": agent must have a system_prompt`,
          );
        }
        if (!n.agent.llm_config) {
          errs.push(
            `AgentNode "${n.name}": agent must have llm_config`,
          );
        }
      }
    }

    if (n.component_type === 'LlmNode') {
      if (!n.prompt_template) {
        errs.push(`LlmNode "${n.name}" must have a prompt_template`);
      }
      if (!n.llm_config) {
        errs.push(`LlmNode "${n.name}" must have llm_config`);
      }
    }

    if (n.component_type === 'BranchingNode') {
      if (!n.mapping || Object.keys(n.mapping).length === 0) {
        errs.push(
          `BranchingNode "${n.name}" must have a non-empty mapping`,
        );
      }
    }

    if (n.component_type === 'ToolNode') {
      if (!n.tool) {
        errs.push(`ToolNode "${n.name}" must have a tool`);
      }
    }
  }

  if (errs.length > 0) {
    throw new Error(`validate: ${errs.join('; ')}`);
  }
}

/** ValidateAgent checks an Agent for spec-level validity. */
export function validateAgent(agent: Agent): void {
  const errs: string[] = [];

  if (!agent.name) {
    errs.push('agent name is required');
  }
  if (agent.component_type !== 'Agent') {
    errs.push(
      `expected component_type 'Agent', got "${agent.component_type}"`,
    );
  }
  if (!agent.system_prompt) {
    errs.push('agent must have a system_prompt');
  }
  if (!agent.llm_config) {
    errs.push('agent must have llm_config');
  }

  if (errs.length > 0) {
    throw new Error(`validate: ${errs.join('; ')}`);
  }
}
