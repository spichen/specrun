import React, { useState, useCallback } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import type { CompiledGraph } from '../graph/types.js';
import type { RunnerOptions } from '../runner/options.js';
import { Runner } from '../runner/runner.js';
import type { ChatSession } from './session.js';
import { addMessage } from './session.js';

interface ChatEntry {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatProps {
  graph: CompiledGraph;
  opts: RunnerOptions;
  session: ChatSession;
  inputKey: string;
}

function Chat({ graph, opts, session, inputKey }: ChatProps) {
  const { exit } = useApp();
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);

  useInput((_input, key) => {
    if (key.ctrl && _input === 'c') {
      exit();
    }
  });

  const handleSubmit = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || running) return;

      if (trimmed === '/exit' || trimmed === '/quit') {
        exit();
        return;
      }

      setInput('');
      setHistory((prev) => [...prev, { role: 'user', content: trimmed }]);
      addMessage(session, 'user', trimmed);
      setRunning(true);

      try {
        const inputs: Record<string, unknown> = { [inputKey]: trimmed };
        const runner = new Runner(graph, opts);
        const result = await runner.run(undefined, inputs);

        const data = result.toData();
        const response =
          typeof data.result === 'string'
            ? data.result
            : JSON.stringify(data, null, 2);

        setHistory((prev) => [
          ...prev,
          { role: 'assistant', content: response },
        ]);
        addMessage(session, 'assistant', response);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        setHistory((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${errMsg}` },
        ]);
        addMessage(session, 'assistant', `Error: ${errMsg}`);
      } finally {
        setRunning(false);
      }
    },
    [graph, opts, session, inputKey, running, exit],
  );

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          specrun chat
        </Text>
        <Text dimColor> - {graph.name}</Text>
      </Box>
      <Box marginBottom={1}>
        <Text dimColor>
          Session: {session.id} | Type /exit to quit | Ctrl+C to abort
        </Text>
      </Box>

      {history.map((entry, i) => (
        <Box key={i} marginBottom={0}>
          {entry.role === 'user' ? (
            <Text>
              <Text bold color="green">
                {'> '}
              </Text>
              {entry.content}
            </Text>
          ) : (
            <Text>
              <Text bold color="blue">
                {'< '}
              </Text>
              {entry.content}
            </Text>
          )}
        </Box>
      ))}

      {running && (
        <Box marginTop={0}>
          <Text dimColor>Running flow...</Text>
        </Box>
      )}

      <Box marginTop={history.length > 0 ? 1 : 0}>
        <Text bold color="green">
          {'> '}
        </Text>
        <TextInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          placeholder={running ? 'Waiting...' : 'Type a message...'}
        />
      </Box>
    </Box>
  );
}

export interface StartChatOptions {
  graph: CompiledGraph;
  opts: RunnerOptions;
  session: ChatSession;
  inputKey: string;
}

export function startChat({
  graph,
  opts,
  session,
  inputKey,
}: StartChatOptions): void {
  const instance = render(
    <Chat graph={graph} opts={opts} session={session} inputKey={inputKey} />,
  );
  instance.waitUntilExit().catch(() => {});
}
