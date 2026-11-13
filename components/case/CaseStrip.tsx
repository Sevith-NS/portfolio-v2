"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";

// A case study after Lusion's: on a laptop or desktop the page pins and scrolling slides one
// long strip sideways, a pixel scrolled for a pixel slid, and each picture's panel drifts a
// little as it passes, the picture whole, never cropped. Below that width it is the same
// panels, top to bottom. The panels are server-rendered children; the box holding a
// `[data-drift]` picture is the panel that drifts.
export function CaseStrip({ children, hint }: { children: React.ReactNode; hint: React.ReactNode }) {
  const run = useRef<HTMLDivElement>(null), track = useRef<HTMLDivElement>(null), cue = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const [wide, setWide] = useState(false);
  const [travel, setTravel] = useState(0);

  useEffect(() => {
    const mq = matchMedia("(min-width: 1024px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // How far the strip travels: its width less the screen's. The run is that much taller than
  // the screen, so the last panel comes fully in exactly as the page ends.
  useEffect(() => {
    const t = track.current;
    if (!t || !wide) return setTravel(0);
    const measure = () => setTravel(Math.max(0, t.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(t);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [wide]);

  const slide = useCallback(
    (p: number) => {
      const t = track.current;
      if (!t) return;
      if (!wide) {
        t.style.transform = "";
        return;
      }
      t.style.transform = `translate3d(${-p * travel}px, 0, 0)`;
      if (cue.current) cue.current.style.opacity = String(1 - Math.min(1, (p * travel) / 240));
      if (reduce) return;
      const W = window.innerWidth, slid = p * travel;
      t.querySelectorAll<HTMLElement>("[data-drift]").forEach((el) => {
        const panel = el.parentElement!;
        // Its middle on screen from its place in the strip, so its own drift doesn't feed back.
        let left = 0, n: HTMLElement | null = panel;
        while (n && n !== t) {
          left += n.offsetLeft;
          n = n.offsetParent as HTMLElement | null;
        }
        const mid = left - slid + panel.offsetWidth / 2;
        if (mid < -W || mid > 2 * W) return;
        panel.style.transform = `translate3d(${(-(mid - W / 2) / W) * panel.offsetWidth * 0.04}px, 0, 0)`;
      });
    },
    [wide, travel, reduce],
  );
  // Read straight off the page, so a run that has just grown to its length is right at once.
  useEffect(() => {
    const update = () => {
      const r = run.current;
      if (r) slide(travel ? Math.min(1, Math.max(0, -r.getBoundingClientRect().top / travel)) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [slide, travel]);

  // Tabbing along the strip: scroll the page to where the focused thing is on screen.
  useEffect(() => {
    const t = track.current, r = run.current;
    if (!t || !r || !wide || !travel) return;
    const focus = (e: FocusEvent) => {
      let x = 0, n = e.target as HTMLElement | null;
      while (n && n !== t) {
        x += n.offsetLeft;
        n = n.offsetParent as HTMLElement | null;
      }
      const top = r.getBoundingClientRect().top + window.scrollY;
      const to = top + Math.min(travel, Math.max(0, x - window.innerWidth * 0.3));
      if (lenis) lenis.scrollTo(to, { immediate: true });
      else window.scrollTo(0, to);
    };
    t.addEventListener("focusin", focus);
    return () => t.removeEventListener("focusin", focus);
  }, [wide, travel, lenis]);

  return (
    <div ref={run} className="relative" style={wide && travel ? { height: `calc(100vh + ${travel}px)` } : undefined}>
      <div className="lg:sticky lg:top-0 lg:h-screen lg:overflow-clip">
        <div ref={track} className="relative flex flex-col gap-20 px-4 pt-28 md:px-8 lg:h-full lg:w-max lg:flex-row lg:items-center lg:gap-[5vw] lg:px-[5vw] lg:pb-[2.5rem] lg:pt-[6.5rem]">
          {children}
        </div>
        <div ref={cue} className="pointer-events-none absolute bottom-[3rem] right-[5vw] hidden lg:block">
          {hint}
        </div>
      </div>
    </div>
  );
}
