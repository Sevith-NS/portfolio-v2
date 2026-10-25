"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, EnvelopeSimple } from "@phosphor-icons/react";
import { email } from "@/data";
import { useDust } from "./motion/PixelDissolve";

const ease = [0.16, 1, 0.3, 1] as const;

// The headline is alive but quiet (Q120, Q121). Letters near the cursor run a
// touch wider and heavier on Archivo's axes. Written straight to the DOM, so
// moving the mouse never re-renders React. (It no longer narrows on scroll: the
// dust is cut from the letters as they sit.)
const REST_W = 115, MAX_W = 125;
const REST_WT = 600, MAX_WT = 720;
const REACH = 150;
const FAR = -1e4;

// Each word stays unbroken; each letter can be styled on its own.
function Letters({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, w) => (
        <span key={w}>
          {w > 0 && " "}
          <span className="inline-block whitespace-nowrap">
            {[...word].map((c, i) => (
              <span key={i} data-l className="transition-[font-variation-settings] duration-300 ease-out">
                {c}
              </span>
            ))}
          </span>
        </span>
      ))}
    </>
  );
}

// Phones: the longest line ("then I actually", 7.92em with the padding) spans the
// screen with a little slack, capped where it meets the clamp at 768px.
const HEADLINE = "px-[0.1em] font-wide text-[clamp(2.1rem,7.4vw,6.25rem)] max-md:text-[min(calc((100vw-2rem)/8.1),3.55rem)] font-semibold uppercase leading-[0.98] tracking-[-0.01em]";

const lines = (
  <>
    <span className="block">
      <Letters text="I design it," />
    </span>
    <span className="block">
      <Letters text="then I" />{" "}
      <span className="font-serif text-[1.08em] font-normal normal-case italic tracking-[-0.02em] text-warm">actually</span>
    </span>
    <span className="block">
      <Letters text="build it." />
    </span>
  </>
);

// The first five seconds: what I offer and my name, quiet and type-led, the
// whole frame under grain. No lamp glow (Q116). See ART-DIRECTION.md.
const Hero = () => {
  const reduce = useReducedMotion();
  // On the way out the words fall behind the page at half the scroll speed and
  // turn to dust letter by letter (useDust); the lines around them just fade.
  // Scrubbed, so scrolling back rebuilds them.
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sinkY = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const fade = useTransform(scrollYProgress, [0.04, 0.3], [1, 0]);

  const headline = useRef<HTMLHeadingElement>(null);
  const blue = useRef<HTMLDivElement>(null);
  const dust = useRef<HTMLCanvasElement>(null);
  useDust(headline, blue, dust, scrollYProgress);
  useEffect(() => {
    const h = headline.current;
    if (!h || reduce) return;
    // The headline's letters and its blue copy's, so the two stay in step.
    const letters = Array.from(h.parentElement!.querySelectorAll<HTMLElement>("[data-l]"));
    let px = FAR, py = FAR, raf = 0;

    const paint = () => {
      raf = 0;
      // Read every position first, then write, so layout is measured once.
      const near = letters.map((el) => {
        const r = el.getBoundingClientRect();
        const k = Math.max(0, 1 - Math.hypot(r.left + r.width / 2 - px, r.top + r.height / 2 - py) / REACH);
        return k * k * (3 - 2 * k);
      });
      letters.forEach((el, i) => {
        const e = near[i];
        el.style.fontVariationSettings = `"wdth" ${REST_W + (MAX_W - REST_W) * e}, "wght" ${REST_WT + (MAX_WT - REST_WT) * e}`;
      });
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      queue();
    };
    const leave = () => {
      px = py = FAR;
      queue();
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [reduce]);
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
      <motion.div style={reduce ? undefined : { y: sinkY }} className="relative mx-auto flex max-w-[68rem] flex-col items-center text-center">
        <motion.div style={reduce ? undefined : { opacity: fade }}>
          <motion.p {...enter(0)} className="flex items-center gap-3 font-mono text-[0.75rem] uppercase tracking-[0.18em] text-ink-3">
            <span>Sevith Sadashiva</span>
            <span aria-hidden className="h-px w-6 bg-lamp" />
            <span>Bangalore</span>
          </motion.p>
        </motion.div>

        {/* px: room for the italic y's overhang, so its ink falls inside the
            dust's cells. The clip classes hide the type and its blue copy until
            the dust has assembled it (useDust). */}
        <div className="relative mt-8">
          <h1
            ref={headline}
            style={{ fontVariationSettings: `"wdth" ${REST_W}` }}
            className={`${HEADLINE} text-ink [clip-path:inset(50%)] motion-reduce:[clip-path:none]`}
          >
            <span className="sr-only">I design it, then I actually build it.</span>
            <span aria-hidden>{lines}</span>
          </h1>
          <div
            ref={blue}
            aria-hidden
            style={{ fontVariationSettings: `"wdth" ${REST_W}` }}
            className={`${HEADLINE} pointer-events-none absolute inset-0 select-none text-warm [clip-path:inset(50%)] [&_*]:!text-warm`}
          >
            {lines}
          </div>
          <canvas ref={dust} aria-hidden className="pointer-events-none absolute z-10" />
        </div>

        <motion.div style={reduce ? undefined : { opacity: fade }}>
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
