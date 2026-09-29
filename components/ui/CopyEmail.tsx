"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "@phosphor-icons/react";
import { email } from "@/data";
import { cn } from "@/lib/utils";

export function CopyEmail({ className, label = "Copy email" }: { className?: string; label?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const t = setTimeout(() => setState("idle"), 2400);
    return () => clearTimeout(t);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      setState("failed");
    }
  };

  const text = state === "copied" ? "Copied to clipboard" : state === "failed" ? email : label;

  return (
    <button type="button" onClick={copy} className={cn("btn btn-ghost", className)} aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={state}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="inline-flex items-center gap-2"
        >
          {state === "copied" ? <Check size={16} weight="bold" /> : <Copy size={16} />}
          {text}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
