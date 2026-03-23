# Go-Style Coding Patterns in Specrun

This document catalogs the Go-style coding patterns adopted throughout the
Specrun TypeScript codebase. While the project is written in TypeScript, it
deliberately follows Go idioms for error handling, interface design, and code
organization.

---

## 1. Multiple Return Values with `[value, ok]`

The project's most distinctive pattern. Instead of throwing on missing values,
functions return a tuple mirroring Go's `val, ok := ...` idiom.

**Files:**
- `src/state/state.ts` — `get(key): [unknown, boolean]`, `getString(key): [string, boolean]`
- `src/tool/types.ts` / `src/tool/registry.ts` — `lookup(name): [ToolDef, boolean]`
- `src/graph/types.ts` — `getNode(name): [CompiledNode, boolean]`

**Usage examples:**
```typescript
const [startNode, ok] = this.graph.getNode(this.graph.start);
if (!ok) throw new Error(`run: start node "${this.graph.start}" not found`);

const [toolDef, ok] = this.deps.toolRegistry.lookup(tc.name);
```

---

## 2. Interface-Based Design

Lean interfaces define contracts; concrete types implement them.

| Interface      | File                    | Implementors                          |
|---------------|-------------------------|---------------------------------------|
| `Provider`     | `src/llm/types.ts`      | `OpenAIProvider`                      |
| `Executor`     | `src/tool/types.ts`     | `SubprocessExecutor`                  |
| `Registry`     | `src/tool/types.ts`     | `FileRegistry`                        |
| `NodeExecutor` | `src/node/types.ts`     | `AgentExecutor`, `LLMExecutor`, `BranchingExecutor`, `PassthroughExecutor`, `ToolNodeExecutor` |

---

## 3. Composition Over Inheritance

Classes embed dependencies as private fields rather than extending base classes.

```typescript
// src/node/agent.ts
export class AgentExecutor implements NodeExecutor {
  private node: AgentNode;
  private deps: Dependencies;
  private provider: Provider;
  private model: string;
}
```

No class in the codebase uses `extends` for behavioral inheritance.

---

## 4. Error Wrapping with Context Prefixes

Errors follow Go's `pkg: message` convention, providing call-site context:

```
"run: start node \"X\" not found"
"run: exceeded max iterations (100)"
"tool: execution timed out after 30000ms"
"tool: failed to parse output JSON: ..."
"llm: OpenAI API error: ..."
"validate: flow name is required; flow must have at least one node"
```

**Files:** `src/runner/runner.ts`, `src/node/agent.ts`, `src/tool/executor.ts`,
`src/llm/openai.ts`, `src/spec/validate.ts`

---

## 5. AbortSignal as `context.Context`

`AbortSignal` is threaded through every `execute()` method as the first
parameter, mirroring Go's `ctx context.Context` convention.

```typescript
// src/node/types.ts
export interface NodeExecutor {
  execute(signal: AbortSignal | undefined, input: State): Promise<State>;
}

// src/runner/runner.ts — signal composition (like context.WithTimeout)
const signals = [AbortSignal.timeout(this.opts.timeout)];
if (signal) signals.push(signal);
return this._run(AbortSignal.any(signals), inputs);
```

---

## 6. Package-Style Module Organization

```
src/
├── cli/        # CLI entry points
├── graph/      # Graph compilation and types
├── llm/        # LLM provider abstraction
├── node/       # Node executors
├── runner/     # Flow execution engine
├── spec/       # Spec parsing and validation
├── state/      # Immutable state container
└── tool/       # Tool registry and subprocess execution
```

Each directory acts as a self-contained package with a clear responsibility.

---

## 7. Factory Functions

Go-style constructor functions that return interface types:

```typescript
// src/llm/provider.ts
export function createProvider(config: LLMConfig): Provider {
  // validates config, returns concrete OpenAIProvider
}
```

---

## 8. Default Options Pattern

```typescript
// src/runner/options.ts
export function defaultOptions(): RunnerOptions {
  return {
    maxIterations: DEFAULT_MAX_ITERATIONS,
    timeout: DEFAULT_TIMEOUT,
    verbose: false,
  };
}
```

---

## 9. Immutable Value Semantics

`State` methods return new instances instead of mutating, mirroring Go
value-type behavior:

```typescript
// src/state/state.ts
set(key: string, value: unknown): State {
  return State.fromOwned({ ...this.data, [key]: value });
}

merge(other: State): State {
  return State.fromOwned({ ...this.data, ...other.data });
}
```

---

## 10. Type Switches

```typescript
// src/graph/compile.ts
switch (n.componentType) {
  case 'StartNode':
  case 'EndNode':
    return new PassthroughExecutor();
  case 'AgentNode':
    return new AgentExecutor(n, deps);
  // ...
  default:
    throw new Error(`unknown node type: ${n.componentType}`);
}
```

---

## 11. Table-Driven Tests

```typescript
// src/state/__tests__/state.test.ts
const tests: Record<string, string> = {
  a: '1',
  b: 'overridden',
  c: '3',
};
for (const [k, expected] of Object.entries(tests)) {
  const [v, ok] = merged.getString(k);
  expect(ok).toBe(true);
  expect(v).toBe(expected);
}
```

---

## 12. Error Aggregation

```typescript
// src/spec/validate.ts
const errs: string[] = [];
if (!pf.name) errs.push('flow name is required');
// ... more checks ...
if (errs.length > 0) {
  throw new Error(`validate: ${errs.join('; ')}`);
}
```

---

## 13. Defer-Like Cleanup

Event listener registration and removal around async operations:

```typescript
// src/tool/executor.ts
signal?.addEventListener('abort', onExternalAbort, { once: true });
try {
  // ... await operation ...
} finally {
  signal?.removeEventListener('abort', onExternalAbort);
}
```

---

## 14. Dependency Injection via Structs

```typescript
// src/node/types.ts
export interface Dependencies {
  toolExecutor?: Executor;
  toolRegistry?: Registry;
  verbose?: boolean;
}
```

Passed to every executor constructor, equivalent to Go's dependency struct
pattern.

---

## 15. Exported vs Unexported Naming

- **Exported (public):** PascalCase — `AgentExecutor`, `State`, `Provider`
- **Unexported (private):** `private` keyword + camelCase — `private node`,
  `private deps`

Mirrors Go's capitalization-based visibility rules.

---

## 16. Graceful Degradation with Optional Chaining

```typescript
const toolDefs = agent.tools?.map(...) ?? [];
this.opts.eventHandler?.(e);
```

Equivalent to Go's nil-check patterns before method calls.
