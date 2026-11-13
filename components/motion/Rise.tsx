"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { usePageTransition } from "@/components/transition/TransitionProvider";
import { cn, EASE } from "@/lib/utils";

// A line's mask: it clips at the line's own edge, with room below for descenders
// (the italic y of "actually" hangs lowest).
const MASK = "block overflow-hidden pb-[0.18em] -mb-[0.18em]";
// Seconds between one line and the next.
const LINE_STEP = 0.12;

// True once `ref` is on screen with no page change over it, and stays true, so an
// entrance plays once, where the reader can see it.
export function useArrived(ref: RefObject<Element | null>) {
  const { covered } = usePageTransition();
  const seen = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [go, setGo] = useState(false);
  useEffect(() => {
    if (seen && !covered) setGo(true);
  }, [seen, covered]);
  return go;
}

// *Stars* mark the accent words.
function accented(line: string) {
  return line.split(/\*([^*]+)\*/).map((part, k) => (k % 2 ? <span key={k} className="text-warm">{part}</span> : part));
}

// Lines rise into place out of a mask, one after another, like Lusion's headings.
// One entry per line: a string (with *stars*), or markup when a line needs it, then pass `label`.
// `stagger` pushes the first line of a two-line heading right, as Lusion sets them.
export function Rise({ lines, delay = 0, label, stagger = false }: { lines: ReactNode[]; delay?: number; label?: string; stagger?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const go = useArrived(ref);
  const reduce = useReducedMotion();
  const text = label ?? lines.map((l) => (typeof l === "string" ? l : "")).join(" ").replace(/\*/g, "");
  return (
    <span ref={ref}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {lines.map((line, l) => (
          <span key={l} className={cn(MASK, stagger && l === 0 && "pl-[1.6em]")}>
            <motion.span
              className="block"
              initial={reduce ? false : { y: "110%" }}
              animate={go ? { y: "0%" } : undefined}
              transition={{ duration: 1.1, delay: delay + l * LINE_STEP, ease: EASE }}
            >
              {typeof line === "string" ? accented(line) : line}
            </motion.span>
          </span>
        ))}
      </span>
    </span>
  );
}
