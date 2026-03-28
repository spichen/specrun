"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";

export default function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full rounded-2xl border border-card-border bg-card p-5 text-left transition-colors hover:border-white/15"
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-medium sm:text-lg">{question}</h3>
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center text-white/40">
          {open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
