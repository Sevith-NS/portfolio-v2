"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "@phosphor-icons/react";
import { intro } from "@/data";
import { EASE } from "@/lib/utils";
import { Rise } from "./motion/Rise";
import { Reveal } from "./motion/Reveal";
import { useInView3D } from "./three/useInView3D";
import { BEATS, ramp } from "./three/beats";

const SpaceScene = dynamic(() => import("./three/SpaceScene"), { ssr: false });

// The close of the landing page, after Lusion's: a card of deep space sits beside a
// few words; scroll, and it opens out to the whole screen (`.space-card` in
// globals.css, driven by --open). A line of type comes up over the astronaut, spreads
// and flies past as the astronaut falls away down a tunnel, and at the far end it
// comes back to wave under the last line. The stage stays pinned while the contact
// sheet (children) slides up over it. three.js loads only when the section is near.
export default function Space({ children }: { children: React.ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const run = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // 0 as the stage pins, 1 as the contact sheet starts to come up.
  const { scrollYProgress } = useScroll({ target: run, offset: ["start end", "end end"] });
  const near = useInView3D(stage, "900px");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (near) setLoaded(true);
  }, [near]);

  const open = useTransform(scrollYProgress, (p) => (reduce ? 1 : ramp(BEATS.open, p)));
  const aside = useTransform(open, [0, 0.6], [1, 0]);
  // The line: up, held, then it spreads and comes at you until it has gone past.
  const [w0, w1] = BEATS.words;
  const wordsIn = useTransform(scrollYProgress, [w0, w0 + 0.05, w1 - 0.06, w1], [0, 1, 1, 0]);
  const spread = useTransform(scrollYProgress, [w0 + 0.1, w1], [0, 1], { ease: (t) => t * t * t });
  const wordsScale = useTransform(spread, [0, 1], [1, 11]);
  const tracking = useTransform(spread, [0, 1], ["-0.01em", "0.55em"]);
  const [said, setSaid] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (p) => p > BEATS.back[0] + 0.12 && setSaid(true));
  useEffect(() => {
    if (reduce) setSaid(true);
  }, [reduce]);

  return (
    <section id="space" className="relative">
      <div ref={stage} className="sticky top-0 h-[100dvh] overflow-hidden bg-paper">
        {/* Deep space is night in either theme, so everything on the card takes the dark tokens. */}
        <motion.div style={{ "--open": open } as never} className="dark space-card absolute inset-0 bg-paper text-ink">
          {loaded && <SpaceScene progress={scrollYProgress} active={near} />}

          {!reduce && (
            <motion.p
              aria-hidden
              style={{ opacity: wordsIn, scale: wordsScale, letterSpacing: tracking }}
              className="pointer-events-none absolute inset-0 grid place-content-center text-center font-wide text-[clamp(1.6rem,4.6vw,4.25rem)] font-semibold uppercase leading-[1.08]"
            >
              <span className="block">Learn it at 2am.</span>
              <span className="block">Ship it</span>
              <span className="block">by morning.</span>
            </motion.p>
          )}

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={said ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 1.1, ease: EASE }}
              className="font-mono text-[0.75rem] uppercase tracking-[0.18em] text-ink-2"
            >
              Got a product that needs building?
            </motion.p>
            <h2 className="mt-5 font-wide text-[clamp(2.4rem,8vw,7rem)] font-semibold uppercase leading-[0.95] tracking-[-0.01em]">
              {said ? (
                <Rise lines={["Let's build", "something."]} delay={0.1} />
              ) : (
                <>
                  <span className="sr-only">Let&apos;s build something.</span>
                  <span aria-hidden className="invisible">
                    <span className="block">Let&apos;s build</span>
                    <span className="block">something.</span>
                  </span>
                </>
              )}
            </h2>
            <motion.a
              href="#contact"
              initial={{ opacity: 0, y: 24 }}
              animate={said ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 1.1, delay: 0.5, ease: EASE }}
              className="pointer-events-auto absolute bottom-10 inline-flex h-12 items-center gap-3 rounded-full bg-ink px-6 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-paper"
            >
              <ArrowDown size={14} /> Keep scrolling <ArrowDown size={14} />
            </motion.a>
          </div>
        </motion.div>

        {/* Beside the card until it opens: what this is, in his own words (the intro's last line). */}
        <motion.div style={{ opacity: aside }} className="pointer-events-none absolute inset-x-0 top-0 flex flex-col justify-center px-4 pt-24 md:inset-y-0 md:left-auto md:right-0 md:w-[46%] md:px-8 md:pt-0">
          <Reveal>
            <p className="font-mono text-[0.75rem] uppercase tracking-[0.18em] text-accent">After hours</p>
          </Reveal>
          <p className="mt-5 font-wide text-[clamp(1.9rem,4.4vw,3.75rem)] font-semibold uppercase leading-[1] tracking-[-0.01em] text-ink">
            <Rise lines={["This is where", "it gets built."]} />
          </p>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-[40ch] leading-relaxed text-ink-2">{intro.text.split(". ").at(-1)!.replace(/\*/g, "")}</p>
          </Reveal>
        </motion.div>
      </div>
      {/* The length of the journey. Under reduced motion there isn't one: the scene is shown at its end. */}
      <div ref={run} className={reduce ? "" : "h-[420dvh]"} />
      <div className="relative z-10">{children}</div>
    </section>
  );
}
