"use client";

import { motion } from "framer-motion";

function TerminalLine({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export default function TerminalMockup() {
  return (
    <div className="glass mx-auto w-full max-w-2xl rounded-2xl p-6">
      {/* Window dots */}
      <div className="mb-4 flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-white/10" />
        <div className="h-3 w-3 rounded-full bg-white/10" />
        <div className="h-3 w-3 rounded-full bg-white/10" />
        <span className="ml-2 font-mono text-xs text-white/30">terminal</span>
      </div>

      {/* Terminal content */}
      <div className="space-y-1 font-mono text-sm leading-relaxed">
        <TerminalLine delay={0.3}>
          <span className="terminal-prompt">$</span>{" "}
          <span className="terminal-command">specrun init</span>{" "}
          <span className="terminal-string">my-agent</span>
        </TerminalLine>
        <TerminalLine delay={0.6}>
          <span className="terminal-success">✓</span>{" "}
          <span className="terminal-output">Created flow.json</span>
        </TerminalLine>
        <TerminalLine delay={0.8}>
          <span className="terminal-success">✓</span>{" "}
          <span className="terminal-output">Created tools/example_tool.sh</span>
        </TerminalLine>

        <TerminalLine delay={1.2}>
          <div className="mt-3">
            <span className="terminal-prompt">$</span>{" "}
            <span className="terminal-command">specrun run</span>{" "}
            <span className="terminal-string">flow.json</span>{" "}
            <span className="terminal-flag">--tools-dir</span>{" "}
            <span className="terminal-string">tools</span>{" "}
            <span className="terminal-flag">--input</span>{" "}
            <span className="terminal-string">
              {`'{"query": "quantum computing"}'`}
            </span>
          </div>
        </TerminalLine>
        <TerminalLine delay={1.6}>
          <span className="terminal-arrow">▸</span>{" "}
          <span className="terminal-output">Starting flow: research-assistant</span>
        </TerminalLine>
        <TerminalLine delay={1.9}>
          <span className="terminal-arrow">▸</span>{" "}
          <span className="terminal-output">Agent calling:</span>{" "}
          <span className="terminal-command">web_search</span>
        </TerminalLine>
        <TerminalLine delay={2.2}>
          <span className="terminal-arrow">▸</span>{" "}
          <span className="terminal-output">Flow complete</span>
        </TerminalLine>
        <TerminalLine delay={2.5}>
          <span className="terminal-string">
            {`{"result": "Quantum computing uses..."}`}
          </span>
        </TerminalLine>
      </div>
    </div>
  );
}
