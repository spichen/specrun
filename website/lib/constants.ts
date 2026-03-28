import {
  FileJson,
  GitBranch,
  Bot,
  Terminal,
  Shuffle,
  MessageSquare,
} from "lucide-react";

export const GITHUB_URL = "https://github.com/spichen/specrun";
export const NPM_URL = "https://www.npmjs.com/package/@specrun/cli";

export const showcaseItems = [
  {
    title: "Research Assistant",
    category: "Flow",
    description: "Agent with web search and calculator tools",
    code: `nodes:
  - name: researcher
    type: AgentNode
    agent:
      tools:
        - web_search
        - calculator
    llm:
      type: OpenAiConfig
      model: gpt-4o`,
  },
  {
    title: "Math Homework Agent",
    category: "Agent",
    description: "Multiplication tool powered by vLLM",
    code: `type: Agent
name: math-helper
llm:
  type: VllmConfig
  model: meta-llama/Llama-3.1-8B
tools:
  - name: multiplication_tool
    inputs:
      - a: integer
      - b: integer`,
  },
  {
    title: "RAG Agent",
    category: "Agent",
    description: "Domain expert with retrieval-augmented generation",
    code: `type: Agent
name: rag-expert
systemPrompt: |
  You are an expert in
  {{domain_of_expertise}}.
tools:
  - name: rag_tool
    inputs:
      - query: string`,
  },
  {
    title: "IT Assistant",
    category: "Agent",
    description: "Enterprise IT support with local LLM",
    code: `type: Agent
name: it-assistant
llm:
  type: VllmConfig
  model: meta-llama/Llama-3.1-8B
systemPrompt: |
  You are an IT assistant.
  Help users troubleshoot.`,
  },
];

export const steps = [
  {
    number: "01",
    title: "Define",
    description:
      "Describe your workflow in YAML or JSON using the Open Agent Specification.",
    code: `# flow.yaml
nodes:
  - name: start
    type: StartNode
  - name: agent
    type: AgentNode
    agent:
      tools: [web_search]
    llm:
      type: OpenAiConfig
      model: gpt-4o
  - name: end
    type: EndNode`,
  },
  {
    number: "02",
    title: "Wire Tools",
    description:
      "Tools are standalone executables. Write them in any language — no SDK required.",
    code: `#!/usr/bin/env python3
import sys, json

args = json.load(sys.stdin)
query = args.get("query", "")

results = search(query)

json.dump({
  "results": results
}, sys.stdout)`,
  },
  {
    number: "03",
    title: "Run",
    description:
      "Compile, validate, and execute — all from one command.",
    code: `$ specrun run flow.yaml \\
    --tools-dir ./tools \\
    --input '{"query": "quantum computing"}'

▸ Starting flow: research-assistant
▸ Agent calling: web_search
▸ Agent calling: web_search
▸ Flow complete

{"result": "Quantum computing uses..."}`,
  },
];

export const features = [
  {
    icon: FileJson,
    title: "Declarative Workflows",
    description:
      "Define multi-step agent flows in YAML/JSON. No boilerplate code.",
  },
  {
    icon: GitBranch,
    title: "Graph-Based Execution",
    description:
      "Flows compile into directed graphs with control and data flow edges, validated before running.",
  },
  {
    icon: Bot,
    title: "LLM Tool-Calling Loop",
    description:
      "Agents autonomously call tools in a loop until the task is done. Up to 10 rounds per node.",
  },
  {
    icon: Terminal,
    title: "Any-Language Tools",
    description:
      "Tools are subprocesses that speak JSON over stdin/stdout. Use Bash, Python, Go — anything.",
  },
  {
    icon: Shuffle,
    title: "Provider Agnostic",
    description:
      "Works with OpenAI, vLLM, Ollama, or any OpenAI-compatible endpoint.",
  },
  {
    icon: MessageSquare,
    title: "Interactive Chat Mode",
    description:
      "Debug and explore flows with persistent multi-turn conversations via --chat.",
  },
];

export const faqItems = [
  {
    question: "What is Specrun?",
    answer:
      "Specrun is a lightweight CLI framework for building and executing agentic AI workflows. It lets you define multi-step agent workflows in YAML or JSON using the Open Agent Specification, then compiles and runs them locally with a single command.",
  },
  {
    question: "What is the Open Agent Specification?",
    answer:
      "The Open Agent Specification is a portable, standardized format created by Oracle for defining agent workflows. Specrun implements this spec, meaning your workflow definitions are portable across any compliant runtime.",
  },
  {
    question: "What LLM providers are supported?",
    answer:
      "Specrun supports OpenAI, vLLM, Ollama, and any OpenAI-compatible endpoint out of the box. You can swap providers by changing a few lines in your spec — no code changes needed.",
  },
  {
    question: "How do I create custom tools?",
    answer:
      "Tools are standalone executables that read JSON from stdin and write JSON to stdout. Write them in any language — Bash, Python, Go, Node.js — no SDK required. Just make them executable and place them in your tools directory.",
  },
  {
    question: "Is Specrun free?",
    answer:
      "Yes. Specrun is fully open source under the MIT license. You can use it freely in personal and commercial projects.",
  },
  {
    question: "Does it work offline?",
    answer:
      "Specrun itself runs entirely locally with no backend or cloud service required. However, if your workflow uses a cloud LLM provider like OpenAI, you'll need internet access for those API calls. With a local provider like Ollama or vLLM, everything runs offline.",
  },
];
