import { readFileSync } from 'node:fs';
import { Command } from 'commander';
import { parseFlow } from '../spec/parser.js';
import { validateFlow } from '../spec/validate.js';
import { compile } from '../graph/compile.js';
import { validate } from '../graph/validate.js';
import { FileRegistry } from '../tool/registry.js';
import { SubprocessExecutor } from '../tool/executor.js';
import { OpenAIProvider } from '../llm/openai.js';
import { Runner } from '../runner/runner.js';
import { defaultOptions } from '../runner/options.js';
import type { Event } from '../runner/events.js';
import { collectToolNames } from './validate.js';

export const runCommand = new Command('run')
  .description('Run an Agent Spec flow')
  .argument('<flow.json>', 'Path to flow JSON file')
  .option('--tools-dir <dir>', 'Directory containing tool executables')
  .option('--input <json>', 'Input JSON object')
  .action(
    async (
      flowPath: string,
      options: { toolsDir?: string; input?: string },
      command: Command,
    ) => {
      const verbose = command.parent?.opts().verbose ?? false;

      const data = readFileSync(flowPath, 'utf-8');

      // Parse
      const pf = parseFlow(data);

      // Validate spec
      validateFlow(pf);

      // Set up tool registry
      const reg = FileRegistry.create(options.toolsDir ?? '');

      // Validate tools
      const toolNames = collectToolNames(pf);
      if (toolNames.length > 0) {
        reg.validateTools(toolNames);
      }

      // Set up LLM provider
      const provider = new OpenAIProvider();

      // Set up dependencies
      const deps = {
        llmProvider: provider,
        toolExecutor: new SubprocessExecutor(),
        toolRegistry: reg,
        verbose,
      };

      // Compile graph
      const cg = compile(pf, deps);

      // Validate graph
      validate(cg);

      // Parse input
      let inputs: Record<string, unknown>;
      if (options.input) {
        try {
          inputs = JSON.parse(options.input);
        } catch (err) {
          throw new Error(`failed to parse --input JSON: ${err}`);
        }
      } else {
        inputs = {};
      }

      // Configure runner
      const opts = defaultOptions();
      opts.verbose = verbose;
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

      // Run
      const runner = new Runner(cg, opts);
      const result = await runner.run(undefined, inputs);

      // Output result
      const output = JSON.stringify(result.toData(), null, 2);
      console.log(output);
    },
  );
