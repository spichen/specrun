import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const flowTemplate = `{
  "component_type": "Flow",
  "agentspec_version": "26.1.0",
  "name": "my-flow",
  "start_node": {
    "component_type": "StartNode",
    "name": "start",
    "inputs": [{"json_schema": {"title": "query", "type": "string"}}]
  },
  "nodes": [
    {
      "component_type": "StartNode",
      "name": "start",
      "inputs": [{"json_schema": {"title": "query", "type": "string"}}]
    },
    {
      "component_type": "AgentNode",
      "name": "assistant",
      "agent": {
        "component_type": "Agent",
        "name": "assistant-agent",
        "system_prompt": "You are a helpful assistant. Answer the user's question: {{query}}",
        "llm_config": {
          "component_type": "OpenAIConfig",
          "model_id": "gpt-4o"
        },
        "tools": [
          {
            "component_type": "ServerTool",
            "name": "example_tool",
            "description": "An example tool that echoes input",
            "inputs": [{"json_schema": {"title": "message", "type": "string"}}],
            "outputs": [{"json_schema": {"title": "response", "type": "string"}}]
          }
        ]
      }
    },
    {
      "component_type": "EndNode",
      "name": "end",
      "inputs": [{"json_schema": {"title": "result", "type": "string"}}]
    }
  ],
  "control_flow_connections": [
    {"from_node": "start", "to_node": "assistant"},
    {"from_node": "assistant", "to_node": "end"}
  ],
  "data_flow_connections": [
    {"source_node": "start", "source_output": "query", "destination_node": "assistant", "destination_input": "query"},
    {"source_node": "assistant", "source_output": "result", "destination_node": "end", "destination_input": "result"}
  ]
}
`;

const toolTemplate = `#!/usr/bin/env bash
# Example tool: reads JSON from stdin, writes JSON to stdout
set -euo pipefail

# Parse input
INPUT=$(cat)
MESSAGE=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message','no message'))" 2>/dev/null || echo "no message")

# Return JSON output
echo "{\\"response\\": \\"Echo: $MESSAGE\\"}"
`;

/** Generate creates a new project in the given directory. */
export function generate(dir: string): void {
  const toolsDir = join(dir, 'tools');
  try {
    mkdirSync(toolsDir, { recursive: true });
  } catch (err) {
    throw new Error(`scaffold: failed to create directory: ${err}`);
  }

  const flowPath = join(dir, 'flow.json');
  try {
    writeFileSync(flowPath, flowTemplate, { mode: 0o644 });
  } catch (err) {
    throw new Error(`scaffold: failed to write flow.json: ${err}`);
  }

  const toolPath = join(toolsDir, 'example_tool.sh');
  try {
    writeFileSync(toolPath, toolTemplate, { mode: 0o755 });
  } catch (err) {
    throw new Error(`scaffold: failed to write example_tool.sh: ${err}`);
  }
}
