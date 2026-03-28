"use client";

import { motion } from "framer-motion";
import GradientBlobs from "./GradientBlobs";
import DotGrid from "./DotGrid";
import TerminalMockup from "./TerminalMockup";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20">
      <GradientBlobs />
      <DotGrid />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Build agents at the speed of spec
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="mx-auto mt-6 max-w-2xl text-lg text-text-muted sm:text-xl"
        >
          Define workflows in YAML. Wire tools in any language. Run from one
          command.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="mt-12"
        >
          <TerminalMockup />
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/50">
            Open Agent Spec compliant
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/50">
            v0.1.0-beta4
          </span>
        </motion.div>
      </div>
    </section>
  );
}
