# specrun

A lightweight CLI framework for building and executing agentic workflows using the [Open Agent Specification](https://oracle.github.io/agent-spec/).

Define multi-step AI workflows as JSON, wire up LLM-powered agents and external tools, and run them from the command line.

## Features

- **Agent Spec compliant** - Implements the [Open Agent Specification](https://oracle.github.io/agent-spec/) format for portable workflow definitions
- **Graph-based execution** - Flows are compiled into directed graphs with control flow and data flow edges
- **LLM integration** - OpenAI-compatible LLM provider with tool-calling loop support
- **External tools** - Tools are standalone executables (shell scripts, Python, etc.) that communicate via JSON over stdin/stdout
- **Branching logic** - Conditional routing with `BranchingNode` for dynamic workflows
- **Validation** - Spec-level and graph-level validation catches errors before execution
- **Scaffolding** - `specrun init` generates a project template to get started quickly

## Installation

```bash
# npm
npm install -g @specrun/cli

# Homebrew
brew install spichen/tap/specrun
```

## Quick Start

### 1. Scaffold a new project

```bash
specrun init my-project
```

This creates:

```
my-project/
  flow.json              - Agent Spec flow definition
  tools/example_tool.sh  - Example tool script
```

### 2. Run a flow

```bash
specrun run my-project/flow.json \
  --tools-dir my-project/tools \
  --input '{"query": "hello"}'
```

### 3. Validate a flow

```bash
specrun validate my-project/flow.json --tools-dir my-project/tools
```

## CLI Reference

```
specrun [options] <command>

Options:
  -v, --verbose   Enable verbose logging

Commands:
  run <flow>               Run an Agent Spec flow (JSON or YAML)
    --tools-dir <dir>      Directory containing tool executables
    --input <json>         Input JSON object

  validate <flow>          Validate a flow definition (JSON or YAML)
    --tools-dir <dir>      Directory containing tool executables

  init <project-name>      Scaffold a new specrun project
```

## How It Works

### Flow Definition

Flows are JSON or YAML files following the [Open Agent Specification](https://oracle.github.io/agent-spec/) format. A flow consists of **nodes** connected by **control flow** (execution order) and **data flow** (data passing) edges. Nodes and edges use `$component_ref` references — see `testdata/` for examples.

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

1. **Parse** - Reads the Agent Spec JSON/YAML via the [agentspec SDK](https://oracle.github.io/agent-spec/) and resolves all node types
2. **Validate spec** - Zod schema validation via the SDK plus graph-level checks
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

## LLM Configuration

LLM providers are configured in the flow's `llm_config` field. Supported types:

| Config Type | Description |
|-------------|-------------|
| `OpenAiConfig` | OpenAI API (uses `OPENAI_API_KEY` env var or `api_key` in spec) |
| `OpenAiCompatibleConfig` | Any OpenAI-compatible endpoint with a custom `url` |
| `VllmConfig` | vLLM self-hosted endpoint |
| `OllamaConfig` | Ollama local endpoint |

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

MIT - See [LICENSE](LICENSE) for details.
