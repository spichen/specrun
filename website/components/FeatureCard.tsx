"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export default function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group rounded-2xl border border-card-border bg-card p-6 transition-colors hover:border-white/15"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-blue/10">
        <Icon className="h-5 w-5 text-accent-blue" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-text-muted">{description}</p>
    </motion.div>
  );
}
