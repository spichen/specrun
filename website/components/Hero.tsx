"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Copy, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import type HlsType from "hls.js";

// ---------- HLS Video Background ----------
const HLS_URL =
  "https://customer-cbeadsgr09pnsezs.cloudflarestream.com/697945ca6b876878dba3b23fbd2f1561/manifest/video.m3u8";
const MP4_FALLBACK =
  "https://customer-cbeadsgr09pnsezs.cloudflarestream.com/697945ca6b876878dba3b23fbd2f1561/downloads/default.mp4";

function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: HlsType | null = null;

    import("hls.js").then(({ default: Hls }) => {
      if (!videoRef.current) return;

      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(HLS_URL);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            video.src = MP4_FALLBACK;
            video.load();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = HLS_URL;
      } else {
        video.src = MP4_FALLBACK;
      }
    });

    return () => {
      hls?.destroy();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      className="h-full w-full object-cover [transform:scaleY(-1)]"
    />
  );
}

// ---------- Hero ----------
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
    <section className="relative -mt-14 min-h-screen overflow-hidden bg-[#010101]">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <HeroVideo />
        {/* Gradient fade to bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(1,1,1,0)] from-[26%] to-[#010101] to-[67%]" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center gap-8 px-6 pt-32 text-center sm:pt-40 md:pt-52 lg:pt-[290px]">
        {/* Announcement Pill */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 rounded-full border border-white/10 bg-[rgba(28,27,36,0.15)] px-4 py-2 backdrop-blur-md"
        >
          <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#FA93FA] via-[#C967E8] to-[#983AD6]">
            <Zap className="h-3.5 w-3.5 text-white" fill="currentColor" />
            <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#FA93FA] via-[#C967E8] to-[#983AD6] opacity-50 blur-md" />
          </span>
          <span className="text-sm text-white/70">
            Used by founders. Loved by devs.
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-4xl font-medium leading-tight sm:text-5xl md:text-6xl lg:text-[80px]"
          style={{ letterSpacing: "-0.04em" }}
        >
          <span className="bg-gradient-to-b from-white via-white/90 to-white/70 bg-clip-text text-transparent">
            Build agents at the{" "}
          </span>
          <span className="bg-gradient-to-b from-[#FA93FA] via-[#C967E8] to-[#983AD6] bg-clip-text font-instrument-serif italic text-transparent sm:text-6xl md:text-7xl lg:text-[100px]">
            speed
          </span>{" "}
          <span className="bg-gradient-to-b from-white via-white/90 to-white/70 bg-clip-text text-transparent">
            of spec
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="max-w-[554px] text-[18px] leading-relaxed text-white/60"
        >
          Define workflows in YAML. Wire tools in any language. Run from one
          command.
        </motion.p>

        {/* Install Commands */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          {commands.map((c, i) => (
            <div
              key={c.label}
              className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 py-2 pl-6 pr-2 backdrop-blur-md"
            >
              <code className="font-mono text-sm text-white/80">
                <span className="text-white/30">$</span> {c.cmd}
              </code>
              <button
                onClick={() => handleCopy(c.cmd, i)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FA93FA] via-[#C967E8] to-[#983AD6] text-white transition-transform hover:scale-105"
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

        {/* Get Started + Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col items-center gap-5"
        >
          {/* CTA with glass wrapper */}
          <div className="rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md">
            <Link
              href="/docs"
              className="group flex items-center gap-3 rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#FA93FA] via-[#C967E8] to-[#983AD6]">
                <ArrowRight className="h-3.5 w-3.5 text-white transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {["Open Agent Spec compliant", "MIT Licensed", "Any LLM Provider"].map(
              (label) => (
                <span
                  key={label}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/50 backdrop-blur-sm"
                >
                  {label}
                </span>
              )
            )}
          </div>
        </motion.div>
      </div>

    </section>
  );
}
