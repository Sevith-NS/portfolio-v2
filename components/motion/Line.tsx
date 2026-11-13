"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { motion, useScroll } from "framer-motion";

// Lusion's thick lapis line, drawn as you scroll. Each section gives its own route through
// its heading and card (measured, so it wraps them at any size), and puts the line first in
// the section with no z-index so the heading, the text and the card all sit on top of it.

export type Box = { l: number; t: number; r: number; b: number; w: number; h: number };
export type Route = (m: { W: number; vh: number; t: Box; c: Box }) => [number, number][];

// Centripetal Catmull-Rom through the points, as cubic Beziers: unlike the plain kind it
// never kinks or overshoots where the points are unevenly spaced, so the line stays clean.
function smooth(p: [number, number][]) {
  const dist = (a: [number, number], b: [number, number]) => Math.max(1e-4, Math.sqrt(Math.hypot(a[0] - b[0], a[1] - b[1])));
  let d = `M ${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[Math.max(0, i - 1)], b = p[i], c = p[i + 1], e = p[Math.min(p.length - 1, i + 2)];
    const d1 = dist(a, b), d2 = dist(b, c), d3 = dist(c, e);
    const c1 = i === 0 ? [b[0] + (c[0] - b[0]) / 3, b[1] + (c[1] - b[1]) / 3] : [0, 1].map((k) => (d1 * d1 * c[k] - d2 * d2 * a[k] + (2 * d1 * d1 + 3 * d1 * d2 + d2 * d2) * b[k]) / (3 * d1 * (d1 + d2)));
    const c2 = i === p.length - 2 ? [c[0] + (b[0] - c[0]) / 3, c[1] + (b[1] - c[1]) / 3] : [0, 1].map((k) => (d3 * d3 * b[k] - d2 * d2 * e[k] + (2 * d3 * d3 + 3 * d3 * d2 + d2 * d2) * c[k]) / (3 * d3 * (d3 + d2)));
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${c[0]} ${c[1]}`;
  }
  return d;
}

export function Line({ section, heading, slot, route }: { section: RefObject<HTMLElement | null>; heading: RefObject<HTMLElement | null>; slot: RefObject<HTMLElement | null>; route: Route }) {
  const box = useRef<HTMLDivElement>(null);
  // `top` is where the box starts in the section: above it when a route begins in the section before.
  const [geo, setGeo] = useState<{ w: number; h: number; top: number; d: string } | null>(null);
  useEffect(() => {
    const s = section.current, hd = heading.current, sl = slot.current;
    if (!s || !hd || !sl) return;
    const measure = () => {
      const o = s.getBoundingClientRect();
      const rect = (el: HTMLElement): Box => {
        const b = el.getBoundingClientRect();
        return { l: b.left - o.left, t: b.top - o.top, r: b.right - o.left, b: b.bottom - o.top, w: b.width, h: b.height };
      };
      const W = o.width, vh = window.innerHeight;
      const pts = route({ W, vh, t: rect(hd), c: rect(sl) });
      const top = Math.min(0, ...pts.map((p) => p[1])) - W * 0.02;
      const bottom = Math.max(...pts.map((p) => p[1])) + W * 0.02;
      setGeo({ w: W, h: bottom - top, top, d: smooth(pts.map(([x, y]) => [x, y - top])) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(s);
    return () => ro.disconnect();
  }, [section, heading, slot, route]);
  const { scrollYProgress } = useScroll({ target: box, offset: ["start 0.8", "end 0.95"] });
  return (
    <div ref={box} aria-hidden className="pointer-events-none absolute left-0" style={{ top: geo?.top ?? 0, width: geo?.w, height: geo?.h }}>
      {geo && (
        <svg width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} className="overflow-visible">
          <motion.path d={geo.d} fill="none" stroke="rgb(var(--lamp))" strokeWidth={geo.w * 0.016} strokeLinecap="round" style={{ pathLength: scrollYProgress }} />
        </svg>
      )}
    </div>
  );
}
