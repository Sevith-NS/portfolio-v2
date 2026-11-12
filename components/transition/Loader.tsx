"use client";

import { motion } from "framer-motion";
import { EASE } from "@/lib/utils";

// How long the mark takes to build and the counter to reach 100 (the same figure is in globals.css).
export const LOAD_MS = 1150;

// The favicon's "s", block by block as it is drawn in public/1.svg: x, y, width, height.
const BLOCKS = [
  [112, 120, 46, 76],
  [135, 195, 24, 20],
  [158, 195, 92, 38],
  [250, 214, 22, 19],
  [250, 232, 47, 113],
  [250, 345, 22, 18],
  [112, 345, 138, 38],
];

// The first thing a visitor sees, once per visit, after Lusion's loader: the mark from
// the favicon builds itself block by block while a counter runs to 100, its dot lands
// last, and the whole screen lifts off the landing page. The build and the count are
// CSS (globals.css), so they start with the first paint and don't wait for scripts.
// Skipped on later pages of the same visit and under reduced motion: the script in
// app/layout.tsx sets data-seen before the first paint, and CSS hides this.
export function Loader() {
  return (
    <motion.div
      data-loader
      aria-hidden
      className="fixed inset-0 z-[120] grid place-items-center bg-paper text-ink"
      exit={{ y: "-100%" }}
      transition={{ duration: 0.85, ease: EASE }}
    >
      <svg viewBox="100 108 300 288" className="w-[min(40vw,12rem)] overflow-visible">
        {BLOCKS.map(([x, y, width, height], i) => (
          <rect key={i} {...{ x, y, width, height }} rx={6} fill="currentColor" style={{ animationDelay: `${60 + i * 110}ms` }} />
        ))}
        {/* The full stop, in the accent, like the dot of "sevith." in the nav. */}
        <rect x={341} y={345} width={47} height={38} rx={6} className="text-warm" fill="currentColor" style={{ animationDelay: "900ms" }} />
      </svg>
      <span data-count className="absolute bottom-5 left-5 font-wide text-[clamp(3rem,9vw,7rem)] font-semibold leading-none tracking-[-0.02em] [font-variant-numeric:tabular-nums] md:bottom-8 md:left-8" />
    </motion.div>
  );
}
