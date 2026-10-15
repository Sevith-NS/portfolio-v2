"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

// A section that arrives as a sheet sliding over the page: it starts slightly
// small with rounded top corners, and squares up to full width as its top edge
// reaches the upper part of the screen. The handoff between sections becomes a
// physical thing rather than a hard line. Static for reduced motion.
export function RiseSheet({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 20%"] });
  const radius = useTransform(scrollYProgress, [0, 1], [56, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);

  return (
    <motion.div
      ref={ref}
      style={reduce ? undefined : { borderTopLeftRadius: radius, borderTopRightRadius: radius, scale }}
      className={cn("origin-top", className)}
    >
      {children}
    </motion.div>
  );
}
