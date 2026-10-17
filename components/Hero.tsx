"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, EnvelopeSimple } from "@phosphor-icons/react";
import { email } from "@/data";
import { PixelFlash, usePixelDissolve } from "./motion/PixelDissolve";

const ease = [0.16, 1, 0.3, 1] as const;

// The headline is alive but quiet (Q120, Q121). Letters near the cursor run a
// touch wider and heavier on Archivo's axes; on scroll the whole line settles
// narrower, so phones get it too. Written straight to the DOM, so moving the
// mouse never re-renders React.
const REST_W = 115, MAX_W = 125, MIN_W = 92;
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

// The first five seconds: what I offer and my name, quiet and type-led, the
// whole frame under grain. No lamp glow (Q116). See ART-DIRECTION.md.
const Hero = () => {
  const reduce = useReducedMotion();
  // On the way out the words fall behind the page at half the scroll speed and
  // break up into pixels: the same ragged lapis front as the theme switch,
  // running down from the top of the block. Scrubbed, so scrolling back
  // rebuilds them.
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sinkY = useTransform(scrollYProgress, [0, 1], [0, 220]);

  const block = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLCanvasElement>(null);
  usePixelDissolve(block, flash);

  const headline = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const h = headline.current;
    if (!h || reduce) return;
    const letters = Array.from(h.querySelectorAll<HTMLElement>("[data-l]"));
    let px = FAR, py = FAR, base = REST_W, raf = 0;

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
        el.style.fontVariationSettings = `"wdth" ${base + (MAX_W - base) * e}, "wght" ${REST_WT + (MAX_WT - REST_WT) * e}`;
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
    const off = scrollYProgress.on("change", (v) => {
      base = REST_W + (MIN_W - REST_W) * Math.min(1, v / 0.6);
      queue();
    });

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      off();
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [reduce, scrollYProgress]);
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
      <motion.div ref={block} style={reduce ? undefined : { y: sinkY }} className="relative mx-auto flex max-w-[68rem] flex-col items-center text-center">
        <PixelFlash ref={flash} />
        <motion.p {...enter(0)} className="flex items-center gap-3 font-mono text-[0.75rem] uppercase tracking-[0.18em] text-ink-3">
          <span>Sevith Sadashiva</span>
          <span aria-hidden className="h-px w-6 bg-lamp" />
          <span>Bangalore</span>
        </motion.p>

        <h1
          ref={headline}
          style={{ fontVariationSettings: `"wdth" ${REST_W}` }}
          className="mt-8 font-wide text-[clamp(2.1rem,7.4vw,6.25rem)] font-semibold uppercase leading-[0.98] tracking-[-0.01em] text-ink"
        >
          <span className="sr-only">I design it, then I actually build it.</span>
          <span aria-hidden>
            <motion.span {...enter(0.1)} className="block">
              <Letters text="I design it," />
            </motion.span>
            <motion.span {...enter(0.22)} className="block">
              <Letters text="then I" />{" "}
              <span className="font-serif text-[1.08em] font-normal normal-case italic tracking-[-0.02em] text-warm">actually</span>
            </motion.span>
            <motion.span {...enter(0.34)} className="block">
              <Letters text="build it." />
            </motion.span>
          </span>
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
