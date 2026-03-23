import { Command } from 'commander';
import { compile } from '../graph/compile.js';
import { validate } from '../graph/validate.js';
import { FileRegistry } from '../tool/registry.js';
import { collectToolNames } from '../spec/types.js';
import { loadFlow } from './util.js';

export const validateCommand = new Command('validate')
  .description('Validate an Agent Spec flow definition')
  .argument('<flow>', 'Path to flow JSON or YAML file')
  .option('--tools-dir <dir>', 'Directory containing tool executables')
  .action((flowPath: string, options: { toolsDir?: string }) => {
    const pf = loadFlow(flowPath);
    console.log(`  Parsed flow: ${pf.name}`);

    const cg = compile(pf, {});
    console.log('  Spec + graph validation passed');

    validate(cg);

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
