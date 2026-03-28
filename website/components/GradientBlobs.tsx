"use client";

import { motion } from "framer-motion";

const blobs = [
  {
    color: "bg-accent-purple/25",
    size: "w-[600px] h-[600px]",
    position: "top-[-10%] left-[-5%]",
    animation: {
      x: [0, 120, -60, 0],
      y: [0, -80, 50, 0],
      scale: [1, 1.15, 0.9, 1],
    },
    duration: 22,
  },
  {
    color: "bg-accent-teal/20",
    size: "w-[500px] h-[500px]",
    position: "bottom-[-15%] left-[10%]",
    animation: {
      x: [0, -70, 90, 0],
      y: [0, 60, -40, 0],
      scale: [1, 0.95, 1.1, 1],
    },
    duration: 18,
  },
  {
    color: "bg-accent-pink/15",
    size: "w-[450px] h-[450px]",
    position: "top-[10%] right-[-8%]",
    animation: {
      x: [0, -100, 40, 0],
      y: [0, 70, -60, 0],
      scale: [1, 1.1, 0.95, 1],
    },
    duration: 25,
  },
  {
    color: "bg-accent-blue/20",
    size: "w-[400px] h-[400px]",
    position: "bottom-[5%] right-[15%]",
    animation: {
      x: [0, 60, -80, 0],
      y: [0, -50, 70, 0],
      scale: [1, 1.05, 0.9, 1],
    },
    duration: 20,
  },
];

export default function GradientBlobs({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className ?? ""}`}
    >
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-[120px] ${blob.color} ${blob.size} ${blob.position}`}
          animate={blob.animation}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
