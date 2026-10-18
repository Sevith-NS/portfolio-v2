"use client";

import { useId, useRef } from "react";
import { useInView } from "framer-motion";

const VARIANTS = ["neg", "slice", "slam"] as const;

// Hard cut on scroll: content arrives in three or four held frames (a negative,
// a slice, a slam), like a shot cut into an edit. The frames live in
// globals.css under THE CUT. Each instance picks its cut from its React id, so
// neighbours rarely cut the same way and server and client always agree.
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const id = useId();
  const v = VARIANTS[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % VARIANTS.length];
  return (
    <Tag
      ref={ref as never}
      className={className}
      data-cut={inView ? "in" : ""}
      data-cut-v={v}
      style={delay ? { animationDelay: `${delay * 1.6}s` } : undefined}
    >
      {children}
    </Tag>
  );
}
