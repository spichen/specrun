# agentflow

A lightweight CLI framework for building and executing agentic workflows using the [Oracle Agent Spec](https://docs.oracle.com/en/cloud/paas/digital-assistant/agent-spec/) (v26.1.0).

Define multi-step AI workflows as JSON, wire up LLM-powered agents and external tools, and run them from the command line.

## Features

- **Agent Spec compliant** - Implements the Oracle Agent Spec v26.1.0 format for portable workflow definitions
- **Graph-based execution** - Flows are compiled into directed graphs with control flow and data flow edges
- **LLM integration** - OpenAI-compatible LLM provider with tool-calling loop support
- **External tools** - Tools are standalone executables (shell scripts, Python, etc.) that communicate via JSON over stdin/stdout
- **Branching logic** - Conditional routing with `BranchingNode` for dynamic workflows
- **Validation** - Spec-level and graph-level validation catches errors before execution
- **Scaffolding** - `agentflow init` generates a project template to get started quickly

## Installation

```bash
npm install
npm run build
```

This produces the `agentflow` CLI at `dist/index.js`.

## Quick Start

### 1. Scaffold a new project

```bash
agentflow init my-project
```

This creates:

```
my-project/
  flow.json              - Agent Spec flow definition
  tools/example_tool.sh  - Example tool script
```

### 2. Run a flow

```bash
agentflow run my-project/flow.json \
  --tools-dir my-project/tools \
  --input '{"query": "hello"}'
```

### 3. Validate a flow

```bash
agentflow validate my-project/flow.json --tools-dir my-project/tools
```

## CLI Reference

```
agentflow [options] <command>

Options:
  -v, --verbose   Enable verbose logging

Commands:
  run <flow.json>          Run an Agent Spec flow
    --tools-dir <dir>      Directory containing tool executables
    --input <json>         Input JSON object

  validate <flow.json>     Validate a flow definition
    --tools-dir <dir>      Directory containing tool executables

  init <project-name>      Scaffold a new agentflow project
```

## How It Works

### Flow Definition

Flows are JSON files following the Agent Spec format. A flow consists of **nodes** connected by **control flow** (execution order) and **data flow** (data passing) edges.

```json
{
  "component_type": "Flow",
  "agentspec_version": "26.1.0",
  "name": "my-flow",
  "start_node": {
    "component_type": "StartNode",
    "name": "start",
    "inputs": [{"json_schema": {"title": "query", "type": "string"}}]
  },
  "nodes": [ ... ],
  "control_flow_connections": [
    {"from_node": "start", "to_node": "agent"},
    {"from_node": "agent", "to_node": "end"}
  ],
  "data_flow_connections": [
    {"source_node": "start", "source_output": "query", "destination_node": "agent", "destination_input": "query"},
    {"source_node": "agent", "source_output": "result", "destination_node": "end", "destination_input": "result"}
  ]
}
```

### Node Types

| Node | Description |
|------|-------------|
| `StartNode` | Entry point of the flow. Defines expected inputs. |
| `EndNode` | Exit point. Supports named branches for multi-branch flows. |
| `AgentNode` | LLM-powered agent with a system prompt and optional tools. Runs an automatic tool-calling loop (up to 10 rounds). |
| `LlmNode` | Runs a prompt template through an LLM. Supports `{{variable}}` substitution. |
| `ToolNode` | Executes an external tool directly within the flow. |
| `BranchingNode` | Routes execution to different branches based on an input-to-branch mapping. |

### Tools

Tools are standalone executables placed in a directory. They receive JSON input on stdin and return JSON output on stdout:

```bash
#!/usr/bin/env bash
# tools/echo_tool.sh
INPUT=$(cat)
MESSAGE=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message',''))")
echo "{\"response\": \"Echo: $MESSAGE\"}"
```

Tools are referenced by name in flow definitions and resolved from the `--tools-dir` at runtime.

### Execution Pipeline

```
JSON file → Parse → Validate spec → Compile graph → Validate graph → Run
```

1. **Parse** - Reads the Agent Spec JSON and resolves all node types
2. **Validate spec** - Checks structural correctness (required fields, valid references)
3. **Compile** - Builds an executable graph with control and data flow edges
4. **Validate graph** - Ensures the graph is well-formed (reachable nodes, valid connections)
5. **Run** - Executes the graph from `StartNode` to `EndNode`, passing state between nodes

### Runner Defaults

| Setting | Default |
|---------|---------|
| Max iterations | 50 |
| Timeout | 5 minutes |
| Max tool rounds (per agent) | 10 |
| Tool execution timeout | 30 seconds |

## Project Structure

```
src/
  cli/           Command handlers (run, validate, init)
  spec/          Agent Spec parser and validator
  graph/         Graph compilation and validation
  node/          Node executors (agent, llm, tool, branching)
  runner/        Flow execution engine with event system
  tool/          Tool registry (filesystem) and subprocess executor
  llm/           LLM provider interface and OpenAI implementation
  state/         Immutable state management
  scaffold/      Project template generation
examples/
  research-assistant/   Example flow with web_search and calculator tools
testdata/               Test flow definitions and tool scripts
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Required. API key for the OpenAI provider. |

## Development

```bash
# Run in development mode
npm run dev -- run flow.json

# Run tests
npm test

# Type check
npm run typecheck

# Build
npm run build
```

## License

See [LICENSE](LICENSE) for details.
