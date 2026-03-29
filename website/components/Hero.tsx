"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";

export default function Hero() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const commands = [
    { label: "npm", cmd: "npm install -g @specrun/cli" },
    { label: "brew", cmd: "brew install spichen/tap/specrun" },
  ];

  const handleCopy = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover [transform:scaleY(-1)]"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4"
            type="video/mp4"
          />
        </video>
        {/* White gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[26.416%] from-[rgba(255,255,255,0)] to-[66.943%] to-white" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center gap-8 px-6 pt-32 text-center sm:pt-40 md:pt-52 lg:pt-[290px]">
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="font-geist text-4xl font-medium leading-tight text-black sm:text-5xl md:text-6xl lg:text-[80px]"
          style={{ letterSpacing: "-0.04em" }}
        >
          Build agents at the{" "}
          <span className="font-instrument-serif italic sm:text-6xl md:text-7xl lg:text-[100px]">
            speed
          </span>{" "}
          of spec
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="max-w-[554px] font-geist text-[18px] leading-relaxed text-[#373a46]/80"
        >
          Define workflows in YAML. Wire tools in any language. Run from one
          command.
        </motion.p>

        {/* Install Commands */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="flex flex-row gap-3"
        >
          {commands.map((c, i) => (
            <div
              key={c.label}
              className="flex items-center gap-3 rounded-[40px] border border-gray-200 bg-[#fcfcfc] py-2 pl-6 pr-2"
              style={{ boxShadow: "0px 10px 40px 5px rgba(194,194,194,0.25)" }}
            >
              <code className="font-mono text-sm text-[#373a46]">
                <span className="text-[#373a46]/40">$</span> {c.cmd}
              </code>
              <button
                onClick={() => handleCopy(c.cmd, i)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] text-white shadow-[inset_-4px_-6px_25px_0px_rgba(201,201,201,0.08),inset_4px_4px_10px_0px_rgba(29,29,29,0.24)] transition-transform hover:scale-105"
              >
                {copiedIdx === i ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <span className="rounded-full border border-black/8 bg-white/60 px-4 py-1.5 text-xs font-medium text-[#373a46]/70">
            Open Agent Spec compliant
          </span>
          <span className="rounded-full border border-black/8 bg-white/60 px-4 py-1.5 text-xs font-medium text-[#373a46]/70">
            MIT Licensed
          </span>
          <span className="rounded-full border border-black/8 bg-white/60 px-4 py-1.5 text-xs font-medium text-[#373a46]/70">
            Any LLM Provider
          </span>
        </motion.div>
      </div>

      {/* Transition gradient to dark sections */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 h-[200px]"
        style={{
          background: "linear-gradient(to bottom, white, #07070a)",
        }}
      />
    </section>
  );
}
