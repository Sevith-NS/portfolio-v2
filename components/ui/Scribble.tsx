"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";

// A handwritten lapis margin note that writes itself on when it scrolls into view.
export function Scribble({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setOn(true), delay);
    return () => clearTimeout(t);
  }, [inView, delay]);
  return (
    <span ref={ref} data-on={on} className={cn("scribble inline-block select-none", className)}>
      {children}
    </span>
  );
}
