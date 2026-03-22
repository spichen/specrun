import { readFileSync } from 'node:fs';
import { Command } from 'commander';
import { parseFlow } from '../spec/parser.js';
import { validateFlow } from '../spec/validate.js';
import { compile } from '../graph/compile.js';
import { validate } from '../graph/validate.js';
import { FileRegistry } from '../tool/registry.js';
import type { ParsedFlow, SpecNode, AgentNode, ToolNode } from '../spec/types.js';

export const validateCommand = new Command('validate')
  .description('Validate an Agent Spec flow definition')
  .argument('<flow.json>', 'Path to flow JSON file')
  .option('--tools-dir <dir>', 'Directory containing tool executables')
  .action((flowPath: string, options: { toolsDir?: string }) => {
    const data = readFileSync(flowPath, 'utf-8');

    // Parse
    const pf = parseFlow(data);
    console.log(`  Parsed flow: ${pf.name}`);

    // Spec validation
    validateFlow(pf);
    console.log('  Spec validation passed');

    // Compile graph (with empty deps for validation)
    const deps = {};
    const cg = compile(pf, deps);
    console.log('  Graph compilation passed');

    // Graph validation
    validate(cg);
    console.log('  Graph validation passed');

    // Tool validation if --tools-dir provided
    if (options.toolsDir) {
      const reg = FileRegistry.create(options.toolsDir);

      const toolNames = collectToolNames(pf);
      if (toolNames.length > 0) {
        reg.validateTools(toolNames);
        console.log(
          `  Tool validation passed (${toolNames.length} tools found)`,
        );
      } else {
        console.log('  No tools to validate');
      }
    }

    console.log(`Valid: ${flowPath}`);
  });

/** Collect all ServerTool names from the parsed flow. */
export function collectToolNames(pf: ParsedFlow): string[] {
  const names: string[] = [];
  const seen = new Set<string>();

  for (const n of pf.parsedNodes) {
    if (n.component_type === 'AgentNode') {
      const an = n as AgentNode;
      if (an.agent?.tools) {
        for (const t of an.agent.tools) {
          if (t.component_type === 'ServerTool' && !seen.has(t.name)) {
            names.push(t.name);
            seen.add(t.name);
          }
        }
      }
    } else if (n.component_type === 'ToolNode') {
      const tn = n as ToolNode;
      if (
        tn.tool &&
        tn.tool.component_type === 'ServerTool' &&
        !seen.has(tn.tool.name)
      ) {
        names.push(tn.tool.name);
        seen.add(tn.tool.name);
      }
    }
  }

  return names;
}
