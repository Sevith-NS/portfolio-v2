"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, EnvelopeSimple } from "@phosphor-icons/react";
import { email } from "@/data";

const ease = [0.16, 1, 0.3, 1] as const;

// The first five seconds: what I offer and my name, nothing moving until it has
// been read. Lit by one warm lamp low on the left, its shadow falling right in
// maroon, the whole frame under grain. See ART-DIRECTION.md.
const Hero = () => {
  const reduce = useReducedMotion();
  // On the way out the words fall behind the page: they move at half the scroll
  // speed and fade, instead of sliding off with everything else.
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sinkY = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const sinkO = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const enter = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14, filter: "blur(8px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 1.1, delay, ease },
        };

  return (
    <section ref={ref} id="top" className="relative isolate flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 pb-20 pt-28 md:px-8">
      {/* The lamp itself lives on the page, straddling this section's bottom edge
          (see app/page.tsx). Only its shadow, top right, belongs to the hero. */}
      <div aria-hidden className="lamp-shadow pointer-events-none absolute inset-0 -z-10" />

      <motion.div style={reduce ? undefined : { y: sinkY, opacity: sinkO }} className="mx-auto flex max-w-[68rem] flex-col items-center text-center">
        <motion.p {...enter(0)} className="flex items-center gap-3 font-mono text-[0.75rem] uppercase tracking-[0.18em] text-ink-3">
          <span>Sevith Sadashiva</span>
          <span aria-hidden className="h-px w-6 bg-lamp" />
          <span>Bangalore</span>
        </motion.p>

        <h1 className="mt-8 font-wide text-[clamp(2.1rem,7.4vw,6.25rem)] font-semibold uppercase leading-[0.98] tracking-[-0.01em] text-ink">
          <motion.span {...enter(0.1)} className="block">
            I design it,
          </motion.span>
          <motion.span {...enter(0.22)} className="block">
            then I{" "}
            <span className="font-serif text-[1.08em] font-normal normal-case italic tracking-[-0.02em] text-lamp">actually</span>
          </motion.span>
          <motion.span {...enter(0.34)} className="block">
            build it.
          </motion.span>
        </h1>

        <motion.p {...enter(0.55)} className="mt-9 max-w-[40ch] text-[1.0625rem] leading-relaxed text-ink-2 md:text-lg">
          Product engineer. The interface, the product calls and the code. One person, no handoff.
        </motion.p>

        <motion.div {...enter(0.7)} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a href="#projects" className="btn btn-primary" data-cursor="See the work">
            See the work <ArrowRight size={16} />
          </a>
          <a href={`mailto:${email}`} className="btn btn-ghost">
            <EnvelopeSimple size={16} /> Say hi
          </a>
        </motion.div>
      </motion.div>

      <motion.a
        href="#projects"
        aria-label="Scroll to the work"
        initial={reduce ? undefined : { opacity: 0 }}
        animate={reduce ? undefined : { opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-ink-3 hover:text-ink"
      >
        <motion.span animate={reduce ? undefined : { y: [0, 5, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
          <ArrowDown size={16} />
        </motion.span>
        scroll
      </motion.a>
    </section>
  );
};

export default Hero;
