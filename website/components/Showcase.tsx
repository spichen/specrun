"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { showcaseItems } from "@/lib/constants";
import ShowcaseCard from "./ShowcaseCard";
import SectionReveal from "./SectionReveal";

export default function Showcase() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 400;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionReveal>
          <div className="mb-10 flex items-end justify-between">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              See it in action
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => scroll("left")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/50 transition-colors hover:border-white/30 hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/50 transition-colors hover:border-white/30 hover:text-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <div
            ref={scrollRef}
            className="hide-scrollbar flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4"
          >
            {showcaseItems.map((item) => (
              <ShowcaseCard key={item.title} {...item} />
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
