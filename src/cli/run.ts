import { Command } from 'commander';
import { compile } from '../graph/compile.js';
import { validate } from '../graph/validate.js';
import { FileRegistry } from '../tool/registry.js';
import { SubprocessExecutor } from '../tool/executor.js';
import { Runner } from '../runner/runner.js';
import { DEFAULT_RUNNER_OPTIONS } from '../runner/options.js';
import type { Event } from '../runner/events.js';
import { collectToolNames } from '../spec/types.js';
import { loadFlow } from './util.js';

export const runCommand = new Command('run')
  .description('Run an Agent Spec flow')
  .argument('<flow>', 'Path to flow JSON or YAML file')
  .option('--tools-dir <dir>', 'Directory containing tool executables')
  .option('--input <json>', 'Input JSON object')
  .action(
    async (
      flowPath: string,
      options: { toolsDir?: string; input?: string },
      command: Command,
    ) => {
      const verbose = command.parent?.opts().verbose ?? false;

      const pf = loadFlow(flowPath);

      const reg = FileRegistry.create(options.toolsDir ?? '');
      const toolNames = collectToolNames(pf);
      if (toolNames.length > 0) {
        reg.validateTools(toolNames);
      }

      const deps = {
        toolExecutor: new SubprocessExecutor(),
        toolRegistry: reg,
        verbose,
      };

      const cg = compile(pf, deps);
      validate(cg);

      let inputs: Record<string, unknown>;
      if (options.input) {
        try {
          inputs = JSON.parse(options.input);
        } catch (err) {
          throw new Error('failed to parse --input JSON', { cause: err });
        }
      } else {
        inputs = {};
      }

      const opts = { ...DEFAULT_RUNNER_OPTIONS, verbose };
      if (verbose) {
        opts.eventHandler = (e: Event) => {
          switch (e.type) {
            case 'node_start':
              console.error(
                `[${e.nodeName}] Starting ${e.nodeType}`,
              );
              break;
            case 'node_complete':
              console.error(`[${e.nodeName}] Completed`);
              break;
            case 'node_error':
              console.error(
                `[${e.nodeName}] Error: ${e.error}`,
              );
              break;
            case 'flow_start':
              console.error('Flow started');
              break;
            case 'flow_complete':
              console.error('Flow completed');
              break;
          }
        };
      }

      const runner = new Runner(cg, opts);
      const result = await runner.run(undefined, inputs);
      console.log(JSON.stringify(result.toData(), null, 2));
    },
  );
