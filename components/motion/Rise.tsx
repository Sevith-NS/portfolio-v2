"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { usePageTransition } from "@/components/transition/TransitionProvider";
import { EASE } from "@/lib/utils";

// A word's mask: it clips at the word's own baseline, with room below for commas.
export const MASK = "inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-top";
// Seconds between one word and the next.
export const STEP = 0.07;

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

// Words rise into place out of a mask, one after another, like Lusion's headlines.
// One string per line. *Stars* mark the accent words.
export function Rise({ lines, delay = 0 }: { lines: string[]; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const go = useArrived(ref);
  const reduce = useReducedMotion();
  let n = 0;
  return (
    <span ref={ref}>
      <span className="sr-only">{lines.join(" ").replace(/\*/g, "")}</span>
      <span aria-hidden>
        {lines.map((line, l) => {
          const words = line.split(/\*([^*]+)\*/).flatMap((part, k) => part.split(" ").filter(Boolean).map((w) => ({ w, accent: k % 2 === 1 })));
          return (
            <span key={l} className="block">
              {words.map(({ w, accent }, k) => {
                const i = n++;
                return (
                  <span key={k}>
                    {k > 0 && " "}
                    <span className={MASK}>
                      <motion.span
                        className={accent ? "inline-block text-warm" : "inline-block"}
                        initial={reduce ? false : { y: "110%" }}
                        animate={go ? { y: "0%" } : undefined}
                        transition={{ duration: 1.1, delay: delay + i * STEP, ease: EASE }}
                      >
                        {w}
                      </motion.span>
                    </span>
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>
    </span>
  );
}
