"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useMotionValueEvent, usePresence, useReducedMotion, useScroll } from "framer-motion";
import { approach } from "@/data";
import { DustReveal } from "./motion/PixelDissolve";
import { Copy } from "./ui/Copy";

const ease = [0.16, 1, 0.3, 1] as const;

// The phase's verb, as big as the screen allows. It assembles from dust like
// the hero, and crumbles away again when the next phase takes its place.
function Verb({ word }: { word: string }) {
  const [present, done] = usePresence();
  const out = useMotionValue(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (present || !done) return;
    if (reduce) {
      done();
      return;
    }
    const run = animate(out, 0.6, { duration: 0.6, ease: "linear" });
    run.then(done);
    return () => run.stop();
  }, [present, done, out, reduce]);

  return (
    <DustReveal out={out} duration={1200}>
      <p className="px-[0.1em]">{word}.</p>
    </DustReveal>
  );
}

// How I build: one phase per screen, pinned while you scroll through it, its
// verb at full size, on a band in the inverted colours (`band` in lib/theme.ts).
const Approach = () => {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(approach.length - 1, Math.floor(v * approach.length))));
  const step = approach[active];
  // The first verb waits until it is on screen, or it assembles unseen on load.
  const verb = useRef<HTMLDivElement>(null);
  const seen = useInView(verb, { once: true, amount: 1 });

  return (
    <section ref={ref} id="approach" className="band relative bg-paper" style={{ height: `${approach.length * 100}dvh` }}>
      <div className="sticky top-0 mx-auto flex h-[100dvh] max-w-page flex-col justify-center px-4 md:px-8">
        <h2 className="font-mono text-[0.75rem] uppercase tracking-[0.18em] text-accent">
          How I build <span className="text-ink-3">· {step.phase}</span>
        </h2>
        {/* "DESIGN." with its dust padding is 5.4em wide, so that's what fits the
            screen. The -ml cancels the padding: the letters line up with the heading. */}
        <div ref={verb} aria-hidden className="-ml-[0.17em] mt-4 h-[0.92em] font-wide text-[min(calc((100vw-2rem)/5.4),13rem)] font-semibold uppercase leading-[0.92] tracking-[-0.01em] text-ink">
          <AnimatePresence mode="wait">{seen && <Verb key={active} word={step.title.split(" ")[0]} />}</AnimatePresence>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease }}
            className="mt-8 grid gap-8 md:grid-cols-12"
          >
            <div className="md:col-span-6">
              <h3 className="font-wide text-xl font-semibold uppercase tracking-[-0.01em] text-ink md:text-2xl">{step.title}</h3>
              <p className="mt-3 max-w-[52ch] leading-relaxed text-ink-2">
                <Copy text={step.des} />
              </p>
              <p className="mt-4 text-sm text-ink">
                <span className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-accent">In practice </span>
                {step.proof}
              </p>
            </div>
            <ul className="md:col-span-5 md:col-start-8">
              {step.artifact.rows.map((row) => (
                <li key={row.text} className="flex items-baseline gap-3 border-b border-rule py-2 last:border-0">
                  <span className="w-16 shrink-0 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-accent">{row.tag}</span>
                  <span className="text-sm leading-snug text-ink-2">{row.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Approach;
