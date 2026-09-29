"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";

// The highlighter stroke. It marks decisions, so use it sparingly.
export function Highlight({
  children,
  full = false,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  full?: boolean;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setOn(true), delay);
    return () => clearTimeout(t);
  }, [inView, delay]);

  return (
    <span ref={ref} data-on={on} className={cn("hl", full && "hl-full", className)}>
      {children}
    </span>
  );
}
