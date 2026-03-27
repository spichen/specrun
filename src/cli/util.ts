import { readFileSync } from 'node:fs';
import type { ComponentBase } from 'agentspec';
import { parseFlow, parseFlowYaml, parseComponentYaml, parseComponentJson } from '../spec/parser.js';
import { validateFlow } from '../spec/validate.js';
import type { ParsedFlow } from '../spec/types.js';

/** Load and validate a flow file (JSON or YAML detected by extension). */
export function loadFlow(flowPath: string): ParsedFlow {
  const data = readFileSync(flowPath, 'utf-8');
  const pf =
    flowPath.endsWith('.yaml') || flowPath.endsWith('.yml')
      ? parseFlowYaml(data)
      : parseFlow(data);

  validateFlow(pf);
  return pf;
}

/** Load any agent-spec component (Flow, Agent, Swarm, etc.) via SDK deserialization. */
export function loadComponent(filePath: string): ComponentBase {
  const data = readFileSync(filePath, 'utf-8');
  return filePath.endsWith('.yaml') || filePath.endsWith('.yml')
    ? parseComponentYaml(data)
    : parseComponentJson(data);
}
