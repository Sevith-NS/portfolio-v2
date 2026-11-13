"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { EASE } from "@/lib/utils";
import { useArrived } from "./Rise";

// A block that rises into place on the site's one curve, once it is on screen.
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article";
}) {
  const M = motion[as];
  const ref = useRef<HTMLElement>(null);
  const go = useArrived(ref);
  return (
    <M
      ref={ref as never}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={go ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 1.1, delay, ease: EASE }}
    >
      {children}
    </M>
  );
}
