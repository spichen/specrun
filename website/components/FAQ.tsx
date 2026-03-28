"use client";

import { faqItems } from "@/lib/constants";
import FAQItem from "./FAQItem";
import SectionReveal from "./SectionReveal";

export default function FAQ() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-3xl px-6">
        <SectionReveal>
          <h2 className="mb-12 text-4xl font-bold tracking-tight sm:text-5xl">
            Questions?
          </h2>
        </SectionReveal>

        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <SectionReveal key={item.question} delay={i * 0.05}>
              <FAQItem {...item} />
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
