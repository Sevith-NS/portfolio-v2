"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { useLenis } from "lenis/react";
import { Play, X } from "@phosphor-icons/react";
import { intro } from "@/data";
import { EASE } from "@/lib/utils";
import { Rise } from "./motion/Rise";
import { Line, type Route } from "./motion/Line";
import { Copy } from "./ui/Copy";
import { TransitionLink } from "./transition/TransitionLink";
import { useInView3D } from "./three/useInView3D";

const ReelPlane = dynamic(() => import("./three/ReelPlane"), { ssr: false });

// Lusion's "Bold Ideas, Brought to Life" in Sevith's words: the heading, the paragraph,
// a link to the about page, a lapis line that draws as you scroll, and the reel's small
// card under the heading. Scroll on and the card bends, grows and locks over the whole
// screen as PLAY and REEL snap in (three/ReelPlane draws it). Select it to watch with sound.

// Lusion's line: in from the left at the heading, down behind its second line, round
// the left of the reel card and under it, a wave to the right under the paragraph, then
// out down the right edge into the reel's run, where it carries on behind the growing card.
const ROUTE: Route = ({ W, vh, t, c }) => [
  [-0.05 * W, t.t + t.h * 0.15],
  [0.1 * W, t.t + t.h * 0.75],
  [c.l - 0.035 * W, c.t + c.h * 0.55],
  [c.l + c.w * 0.45, c.b + 0.05 * vh],
  [c.r + 0.06 * W, c.t + c.h * 0.35],
  [0.6 * W, c.b + 0.06 * vh],
  [0.86 * W, c.t + c.h * 0.2],
  [1.05 * W, c.b + 0.55 * vh],
];

function Player({ open, onClose }: { open: boolean; onClose: () => void }) {
  const lenis = useLenis();
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    close.current?.focus();
    window.dispatchEvent(new Event("reel:open")); // the ambient track steps aside (Ambient.tsx)
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => {
      lenis?.start();
      window.dispatchEvent(new Event("reel:close"));
      window.removeEventListener("keydown", key);
    };
  }, [open, lenis, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Reel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="fixed inset-0 z-[150] grid place-items-center bg-[rgb(var(--shade)/0.94)] p-4 md:p-10"
        >
          <video src="/reel/reel.mp4" poster="/reel/poster.webp" controls autoPlay playsInline className="max-h-full w-full max-w-[calc((100svh-5rem)*16/9)] rounded-[14px]" />
          <button ref={close} type="button" onClick={onClose} aria-label="Close the reel" className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-paper text-ink md:right-8 md:top-8">
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Intro() {
  const reduce = useReducedMotion() ?? false;
  const heading = useRef<HTMLHeadingElement>(null);
  const slot = useRef<HTMLDivElement>(null);
  const run = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  // 0 while the card sits in its slot, 1 once it fills the pinned stage.
  const { scrollYProgress: progress } = useScroll({ target: run, offset: ["start end", "start start"] });
  const [locked, setLocked] = useState(false);
  useMotionValueEvent(progress, "change", (p) => setLocked(p > 0.94));
  const [open, setOpen] = useState(false);
  const active = useInView3D(section, "300px");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (active) setLoaded(true);
  }, [active]);
  const [phone, setPhone] = useState(false);
  useEffect(() => setPhone(matchMedia("(max-width: 767px), (pointer: coarse)").matches), []);
  const live = loaded && !reduce;
  const shown = locked || reduce;

  return (
    <section ref={section} id="intro" className="relative">
      {/* First in the section and with no z-index, so the heading, the text and the reel all sit on top of it. */}
      <Line section={section} heading={heading} slot={slot} route={ROUTE} />
      <div className="relative px-4 pb-[10vh] pt-[16vh] md:px-[5vw]">
        <h2 ref={heading} className="relative z-20 font-wide text-[clamp(2.2rem,5vw,6.2rem)] font-semibold uppercase leading-[0.98] tracking-[-0.01em] text-ink">
          <Rise lines={intro.heading} stagger />
        </h2>
        <div className="relative z-20 mt-10 grid gap-10 md:mt-12 md:grid-cols-12">
          <div className="md:col-span-4 md:col-start-8 md:row-start-1">
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -15% 0px" }}
              transition={{ duration: 1, ease: EASE }}
              className="text-[1.0625rem] leading-relaxed text-ink-2"
            >
              <Copy text={intro.short} />
            </motion.p>
            <TransitionLink href={intro.link.href} className="mt-6 inline-flex items-center gap-2.5 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-ink transition-colors hover:text-accent">
              <span aria-hidden className="size-[0.35rem] rounded-full bg-current" />
              {intro.link.label}
            </TransitionLink>
          </div>
          {/* The reel's slot: the canvas draws the card here and grows it from here. */}
          <div ref={slot} className="relative aspect-video w-full md:col-span-3 md:col-start-1 md:row-start-1 md:mt-[22vh]">
            {!live && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/reel/poster.webp" alt="" className="h-full w-full rounded-[18px] object-cover" />
            )}
          </div>
        </div>
      </div>

      {/* The run the card grows over, then the screen it locks to. */}
      <div ref={run} className={reduce ? "" : "relative h-[220vh]"}>
        {/* z-20: a sticky box is a layer of its own, so it must sit above the reel's fixed canvas (z-10) for PLAY REEL to show on the video. */}
        <div ref={stage} data-header={shown ? "dark" : undefined} className={reduce ? "relative aspect-video" : "sticky top-0 z-20 h-[100svh] overflow-hidden"}>
          {reduce && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/reel/poster.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          {/* A soft scrim once it locks, so PLAY REEL reads over frames full of white type. */}
          <motion.div aria-hidden initial={false} animate={{ opacity: shown ? 1 : 0 }} transition={{ duration: 0.8, ease: EASE }} className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(var(--shade)/0.45),rgb(var(--shade)/0.15)_70%)]" />
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={!shown}
            data-cursor="Play reel"
            aria-label="Play the reel with sound"
            className="absolute inset-0 z-20 flex items-center justify-center gap-[3vw] font-wide text-[clamp(2.4rem,8vw,9rem)] font-semibold uppercase leading-none text-on-hl disabled:pointer-events-none"
          >
            <motion.span aria-hidden initial={false} animate={shown ? { x: 0, opacity: 1 } : { x: "-40vw", opacity: 0 }} transition={{ duration: 0.9, ease: EASE }}>
              Play
            </motion.span>
            <motion.span
              aria-hidden
              initial={false}
              animate={shown ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ duration: 0.7, delay: shown ? 0.15 : 0, ease: EASE }}
              className="grid size-[clamp(3.5rem,6vw,6rem)] place-items-center rounded-full bg-lamp"
            >
              <Play weight="fill" className="size-[38%]" />
            </motion.span>
            <motion.span aria-hidden initial={false} animate={shown ? { x: 0, opacity: 1 } : { x: "40vw", opacity: 0 }} transition={{ duration: 0.9, ease: EASE }}>
              Reel
            </motion.span>
          </button>
        </div>
      </div>

      {live && <ReelPlane slot={slot} stage={stage} progress={progress} active={active} phone={phone} />}
      <Player open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
