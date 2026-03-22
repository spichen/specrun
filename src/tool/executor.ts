import { spawn } from 'node:child_process';
import type { ExecResult, Executor } from './types.js';

const DEFAULT_TIMEOUT = 30_000;

/** SubprocessExecutor runs tools as external processes. */
export class SubprocessExecutor implements Executor {
  private timeout: number;

  constructor(timeout?: number) {
    this.timeout = timeout ?? DEFAULT_TIMEOUT;
  }

  async execute(
    signal: AbortSignal | undefined,
    toolPath: string,
    input: Record<string, unknown>,
  ): Promise<ExecResult> {
    const inputJSON = JSON.stringify(input);

    return new Promise<ExecResult>((resolve, reject) => {
      const ac = new AbortController();
      const timer = setTimeout(() => {
        ac.abort();
        reject(
          new Error(
            `tool: execution timed out after ${this.timeout}ms`,
          ),
        );
      }, this.timeout);

      // If external signal is already aborted, reject immediately
      if (signal?.aborted) {
        clearTimeout(timer);
        reject(new Error('tool: execution aborted'));
        return;
      }

      const onExternalAbort = () => {
        ac.abort();
        clearTimeout(timer);
        reject(new Error('tool: execution aborted'));
      };
      signal?.addEventListener('abort', onExternalAbort, { once: true });

      const proc = spawn(toolPath, [], {
        stdio: ['pipe', 'pipe', 'pipe'],
        signal: ac.signal,
      });

      const stdoutChunks: Buffer[] = [];
      const stderrChunks: Buffer[] = [];

      proc.stdout.on('data', (chunk: Buffer) => stdoutChunks.push(chunk));
      proc.stderr.on('data', (chunk: Buffer) => stderrChunks.push(chunk));

      proc.on('error', (err) => {
        clearTimeout(timer);
        signal?.removeEventListener('abort', onExternalAbort);
        if (ac.signal.aborted) return; // already handled by timeout
        const stderrStr = Buffer.concat(stderrChunks).toString();
        reject(
          new Error(`tool: execution failed: ${err.message}: ${stderrStr}`),
        );
      });

      proc.on('close', (code) => {
        clearTimeout(timer);
        signal?.removeEventListener('abort', onExternalAbort);

        const stderrStr = Buffer.concat(stderrChunks).toString();

        if (code !== 0) {
          reject(
            new Error(
              `tool: execution failed: exit code ${code}: ${stderrStr}`,
            ),
          );
          return;
        }

        const stdoutStr = Buffer.concat(stdoutChunks).toString();
        let output: Record<string, unknown>;

        if (stdoutStr.length > 0) {
          try {
            output = JSON.parse(stdoutStr);
          } catch (err) {
            reject(
              new Error(
                `tool: failed to parse output JSON: ${err}: raw output: ${stdoutStr}`,
              ),
            );
            return;
          }
        } else {
          output = {};
        }

        resolve({ output, stderr: stderrStr });
      });

      // Write input to stdin
      proc.stdin.write(inputJSON);
      proc.stdin.end();
    });
  }
}
