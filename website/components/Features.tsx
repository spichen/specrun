"use client";

import { features } from "@/lib/constants";
import FeatureCard from "./FeatureCard";
import SectionReveal from "./SectionReveal";

export default function Features() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionReveal>
          <h2 className="mb-16 text-center text-4xl font-bold tracking-tight sm:text-5xl">
            Everything you need
          </h2>
        </SectionReveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <SectionReveal key={feature.title} delay={i * 0.08}>
              <FeatureCard {...feature} />
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
