import { readFileSync } from 'node:fs';
import { parseFlow, parseFlowYaml } from '../spec/parser.js';
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
