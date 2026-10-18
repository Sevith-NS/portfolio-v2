"use client";

import { useEffect, useState } from "react";
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

  const text = state === "copied" ? "Copied" : state === "failed" ? email : label;

  return (
    <button type="button" onClick={copy} className={cn("btn", className)} aria-live="polite">
      {text}
    </button>
  );
}
