"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { TransitionLink } from "./transition/TransitionLink";
import { usePageTransition } from "./transition/TransitionProvider";

// How much more scrolling, in pixels of wheel or finger, takes you to the next project.
const PULL = 900;

// The end of a case study, after Lusion: keep scrolling past the end of the strip
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
    // A light panel closing the strip (the page's colours turned over), like Lusion's: edge to
    // edge and full height on a laptop, full width on a phone.
    <TransitionLink
      href={href}
      data-cursor="Next project"
      data-header="light"
      className="group -mx-4 flex h-[75vh] shrink-0 flex-col justify-between bg-ink p-8 text-paper md:-mx-8 md:p-12 lg:mx-0 lg:-mr-[5vw] lg:-mt-[4rem] lg:h-screen lg:w-[52vw] lg:p-[4vw] lg:pt-[8.5rem]"
    >
      <p className="font-mono text-[0.75rem] uppercase leading-relaxed tracking-[0.18em] text-paper/70">
        Keep scrolling
        <br />
        for the next project
      </p>
      <p className="font-wide text-[clamp(2.6rem,6vw,6.5rem)] font-semibold uppercase leading-[0.92] tracking-[-0.01em]">{title}</p>
      <div className="flex items-center gap-4 font-mono text-[0.75rem] uppercase tracking-[0.18em]">
        Next project
        {/* The bar: empty track, filling from the left as you keep scrolling. */}
        <span aria-hidden className="relative h-px w-28 bg-paper/30 md:w-44">
          <motion.span style={{ scaleX: fill }} className="absolute inset-x-0 -top-px h-[3px] origin-left bg-paper" />
        </span>
        <ArrowRight aria-hidden size={18} className="transition-transform duration-500 ease-[cubic-bezier(0.35,0,0,1)] group-hover:translate-x-1.5" />
      </div>
    </TransitionLink>
  );
}
