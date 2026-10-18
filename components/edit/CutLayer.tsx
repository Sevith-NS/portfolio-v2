"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { BURSTS, FRAME_MS, cut, type CutDetail, type Frame } from "@/lib/cut";

// The edit layer over every page: a full-screen flash that plays frames thrown
// at it through lib/cut.ts, and a director that cuts every time a [data-scene]
// section crosses the middle of the screen (flash, plus a two-frame punch-in).
// Reduced motion: no flashes, no punches; scenes are still announced.

const FILL: Record<Frame, { bg: string; fx: string }> = {
  white: { bg: "rgb(var(--bone))", fx: "" },
  black: { bg: "rgb(var(--void))", fx: "" },
  blood: { bg: "rgb(var(--blood))", fx: "" },
  invert: { bg: "transparent", fx: "invert(1)" },
  clear: { bg: "transparent", fx: "" },
};

// One burst at a time, and never two within this window, however fast the scroll.
const GAP_MS = 420;

export function CutLayer() {
  const flash = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // The flash: plays a burst frame by frame, straight to the DOM.
  useEffect(() => {
    const el = flash.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let last = 0;
    const paint = (f: Frame) => {
      el.style.background = FILL[f].bg;
      el.style.backdropFilter = FILL[f].fx;
      el.style.setProperty("-webkit-backdrop-filter", FILL[f].fx);
    };
    const play = (e: Event) => {
      const { frames } = (e as CustomEvent<CutDetail>).detail;
      if (reduce.matches || !frames.length) return;
      const now = performance.now();
      if (now - last < GAP_MS) return;
      last = now;
      cancelAnimationFrame(raf);
      const tick = (t: number) => {
        // rAF stamps the frame's start, which can land just before `now`.
        const i = Math.max(0, Math.floor((t - now) / FRAME_MS));
        if (i >= frames.length) return paint("clear");
        paint(frames[i]);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("cut", play);
    return () => {
      window.removeEventListener("cut", play);
      cancelAnimationFrame(raf);
    };
  }, []);

  // The director: a cut every time a scene's edge crosses the middle of the screen.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let io: IntersectionObserver | undefined;
    // Wait a beat so the new route's scenes are in the DOM.
    const t = window.setTimeout(() => {
      const scenes = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
      let primed = false;
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            const el = e.target as HTMLElement;
            const i = scenes.indexOf(el);
            // The scene on screen at load just names itself; no flash on arrival.
            if (!primed || reduce) {
              cut([], el.dataset.scene, i);
              continue;
            }
            cut(BURSTS[i % BURSTS.length], el.dataset.scene, i);
            // Punch toward the middle of the screen, wherever that is in a tall scene.
            el.style.transformOrigin = `50% ${window.innerHeight / 2 - e.boundingClientRect.top}px`;
            el.removeAttribute("data-punch");
            void el.offsetWidth;
            el.setAttribute("data-punch", "");
          }
          primed = true;
        },
        { rootMargin: "-50% 0px -50% 0px" }
      );
      scenes.forEach((s) => io!.observe(s));
    }, 80);
    return () => {
      window.clearTimeout(t);
      io?.disconnect();
    };
  }, [pathname]);

  return <div ref={flash} aria-hidden className="pointer-events-none fixed inset-0 z-[95]" />;
}
