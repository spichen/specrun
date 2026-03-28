"use client";

import { steps } from "@/lib/constants";
import SectionReveal from "./SectionReveal";

export default function HowItWorks() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionReveal>
          <h2 className="mb-16 text-center text-4xl font-bold tracking-tight sm:text-5xl">
            Three steps to your first agent
          </h2>
        </SectionReveal>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <SectionReveal key={step.number} delay={i * 0.1}>
              <div className="flex h-full flex-col rounded-2xl border border-card-border bg-card p-6">
                {/* Step number */}
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue/10 font-mono text-sm font-bold text-accent-blue">
                    {step.number}
                  </span>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                </div>

                <p className="mb-5 text-sm leading-relaxed text-text-muted">
                  {step.description}
                </p>

                {/* Code block */}
                <div className="flex-1 overflow-hidden rounded-xl bg-bg p-4">
                  <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-white/70">
                    <code>{step.code}</code>
                  </pre>
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
