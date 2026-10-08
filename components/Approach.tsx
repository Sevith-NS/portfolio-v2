"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { approach } from "@/data";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./SectionHeader";

type Step = (typeof approach)[number];

// The working document each phase produces. Illustrative, and labeled that way.
const Artifact = ({ step, className }: { step: Step; className?: string }) => (
  <div className={cn("rounded-2xl border border-rule bg-sheet p-5 shadow-[0_24px_48px_-32px_rgb(0_0_0/0.35)] md:p-7", className)}>
    <div className="flex items-center justify-between border-b border-rule pb-4">
      <p className="text-[0.9375rem] font-medium text-ink">{step.artifact.heading}</p>
    </div>
    <ul className="mt-2">
      {step.artifact.rows.map((row, i) => (
        <motion.li
          key={row.text}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 20, delay: 0.08 + i * 0.07 }}
          className="flex items-center gap-3 border-b border-rule/70 py-3.5 last:border-0"
        >
          <span
            className={cn(
              "w-[4.75rem] shrink-0 rounded-full border px-2 py-0.5 text-center font-mono text-[0.6875rem]",
              i === 0 ? "border-transparent bg-hl text-on-hl" : "border-rule text-ink-2"
            )}
          >
            {row.tag}
          </span>
          <span className="text-[0.9375rem] leading-snug text-ink">{row.text}</span>
        </motion.li>
      ))}
    </ul>
  </div>
);

const Approach = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 60%", "end 60%"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(approach.length - 1, Math.max(0, Math.floor(v * approach.length)));
    setActive(i);
  });

  return (
    <section id="approach" className="mx-auto max-w-page px-4 py-20 md:px-8 md:py-24">
      <SectionHeader
        title="How I work."
        note="Three phases I run on every release, with the kind of working document each one produces."
      />

      <div ref={ref} className="mt-14 grid gap-8 md:grid-cols-12">
        <ol className="md:col-span-6">
          {approach.map((step, i) => (
            <li
              key={step.title}
              className={cn(
                "border-t border-rule py-8 transition-opacity duration-500 md:flex md:min-h-[62vh] md:flex-col md:justify-center md:py-0",
                active === i ? "md:opacity-100" : "md:opacity-35"
              )}
            >
              <h3 className="text-3xl font-semibold tracking-[-0.03em] text-ink md:text-4xl">{step.title}</h3>
              <p className="mt-4 max-w-[52ch] leading-relaxed text-ink-2 md:text-lg md:leading-relaxed">{step.des}</p>
              <p className="mt-5 text-sm text-ink">
                <span className="text-ink-3">In practice: </span>
                {step.proof}
              </p>
              <Artifact step={step} className="mt-8 md:hidden" />
            </li>
          ))}
        </ol>

        <div className="hidden md:col-span-5 md:col-start-8 md:block">
          <div className="sticky top-[calc(50vh-11rem)]">
            <div className="mb-4 flex gap-1.5" aria-hidden>
              {approach.map((s, i) => (
                <span key={s.title} className="h-1 flex-1 overflow-hidden rounded-full bg-rule">
                  <motion.span
                    className="block h-full origin-left bg-ink"
                    animate={{ scaleX: i <= active ? 1 : 0 }}
                    transition={{ type: "spring", stiffness: 120, damping: 24 }}
                  />
                </span>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <Artifact step={approach[active]} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Approach;
