"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

interface InfiniteSliderProps {
  children: ReactNode[];
  speed?: number;
  gap?: number;
  className?: string;
}

export function InfiniteSlider({
  children,
  speed = 30,
  gap = 48,
  className = "",
}: InfiniteSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const firstSet = containerRef.current.children[0] as HTMLElement;
    if (firstSet) {
      setContentWidth(firstSet.scrollWidth + gap);
    }
  }, [children, gap]);

  const duration = contentWidth > 0 ? contentWidth / speed : 20;

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        ref={containerRef}
        className="flex"
        style={{ gap }}
        animate={
          contentWidth > 0
            ? { x: [0, -contentWidth] }
            : undefined
        }
        transition={
          contentWidth > 0
            ? {
                x: {
                  duration,
                  repeat: Infinity,
                  ease: "linear",
                  repeatType: "loop",
                },
              }
            : undefined
        }
      >
        <div className="flex shrink-0 items-center" style={{ gap }}>
          {children}
        </div>
        <div className="flex shrink-0 items-center" style={{ gap }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
