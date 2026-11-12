"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { TransitionLink } from "./transition/TransitionLink";
import { usePageTransition } from "./transition/TransitionProvider";

// How much more scrolling, in pixels of wheel or finger, takes you to the next project.
const PULL = 900;

// The end of a case study, after Lusion: keep scrolling past the bottom of the page
// and a bar fills; when it is full you are taken to the next project. Stop, and it
// drains. It is a plain link as well, for keyboards, screen readers and reduced motion.
export function NextProject({ slug, title }: { slug: string; title: string }) {
  const { navigate } = usePageTransition();
  const reduce = useReducedMotion();
  const fill = useMotionValue(0);
  const href = `/work/${slug}`;
  const gone = useRef(false);

  useEffect(() => {
    if (reduce) return;
    let drain: ReturnType<typeof animate> | undefined, idle = 0, touchY = 0;
    const atEnd = () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    const add = (px: number) => {
      if (gone.current || px <= 0 || !atEnd()) return;
      drain?.stop();
      fill.set(Math.min(1, fill.get() + px / PULL));
      if (fill.get() >= 1) {
        gone.current = true;
        navigate(href);
        return;
      }
      window.clearTimeout(idle);
      idle = window.setTimeout(() => (drain = animate(fill, 0, { duration: 0.6, ease: [0.35, 0, 0, 1] })), 220);
    };
    const wheel = (e: WheelEvent) => add(e.deltaY);
    const start = (e: TouchEvent) => (touchY = e.touches[0].clientY);
    const move = (e: TouchEvent) => {
      add(touchY - e.touches[0].clientY);
      touchY = e.touches[0].clientY;
    };
    window.addEventListener("wheel", wheel, { passive: true });
    window.addEventListener("touchstart", start, { passive: true });
    window.addEventListener("touchmove", move, { passive: true });
    return () => {
      drain?.stop();
      window.clearTimeout(idle);
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("touchstart", start);
      window.removeEventListener("touchmove", move);
    };
  }, [fill, href, navigate, reduce]);

  return (
    // `band`: the inverted colours of How I build, so the page ends on a full stop.
    <TransitionLink href={href} data-cursor="Next project" className="band group block bg-paper">
      <div className="mx-auto flex max-w-page flex-col gap-10 px-4 py-14 md:flex-row md:items-end md:justify-between md:px-8 md:py-20">
        <div>
          <p className="font-mono text-[0.75rem] uppercase leading-relaxed tracking-[0.18em] text-ink-2">
            Keep scrolling
            <br />
            for the next project
          </p>
          <p className="mt-5 font-wide text-[clamp(2.2rem,6vw,4.75rem)] font-semibold uppercase leading-[0.95] tracking-[-0.01em] text-ink">{title}</p>
        </div>
        <div className="flex items-center gap-4 font-mono text-[0.75rem] uppercase tracking-[0.18em] text-ink md:pb-3">
          Next project
          {/* The bar: empty track, filling from the left as you keep scrolling. */}
          <span aria-hidden className="relative h-px w-28 bg-ink/30 md:w-44">
            <motion.span style={{ scaleX: fill }} className="absolute inset-x-0 -top-px h-[3px] origin-left bg-ink" />
          </span>
          <ArrowRight aria-hidden size={18} className="transition-transform duration-500 ease-[cubic-bezier(0.35,0,0,1)] group-hover:translate-x-1.5" />
        </div>
      </div>
    </TransitionLink>
  );
}
