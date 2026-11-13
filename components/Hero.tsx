"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { dark, light } from "@/lib/theme";
import { Rise } from "./motion/Rise";
import { useInView3D } from "./three/useInView3D";
import type { Pointer } from "./three/Smear";

const HeroPieces = dynamic(() => import("./three/HeroPieces"), { ssr: false });

// The gallery line's Bodoni "actually". The hero no longer uses it: on 12 Nov Sevith
// asked for the title in one font and one colour.
export const ACTUALLY = "font-serif text-[1.08em] font-normal normal-case italic tracking-[-0.02em] text-warm";

const STATEMENT = ["I design it,", "then I actually", "build it."];

// After Lusion's first screen: the statement alone in the header row, and below it
// a card of connector pieces that the cursor pushes through (three/HeroPieces).
// "+" marks on the grid under the card.
const Hero = () => {
  const reduce = useReducedMotion() ?? false;
  const { resolvedTheme } = useTheme();
  const card = useRef<HTMLDivElement>(null);
  const active = useInView3D(card, "100px");
  const pointer = useRef<Pointer>({ x: 0.5, y: 0.5, dx: 0, dy: 0, inside: false });
  const [phone, setPhone] = useState(false);
  useEffect(() => setPhone(matchMedia("(max-width: 767px), (pointer: coarse)").matches), []);
  // Mounted once the card is first near, then kept, so scrolling back doesn't rebuild the scene.
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (active) setLoaded(true);
  }, [active]);

  // The cursor (or a finger) over the card, in the card's own UV, y up.
  const track = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    const p = pointer.current;
    const x = (e.clientX - r.left) / r.width;
    const y = 1 - (e.clientY - r.top) / r.height;
    if (p.inside) {
      p.dx += x - p.x;
      p.dy += y - p.y;
    }
    p.x = x;
    p.y = y;
    p.inside = true;
  };
  const leave = () => {
    pointer.current.inside = false;
  };

  return (
    <section id="top" className="relative flex flex-col px-4 pt-24 md:h-[100svh] md:min-h-[38rem] md:px-[5vw] md:pt-[3.15rem]">
      <h1 className="font-wide text-[clamp(1.6rem,8.2vw,2.1rem)] font-semibold uppercase leading-[1.02] tracking-[-0.01em] text-ink md:ml-[23vw] md:text-[clamp(1.75rem,2.5vw,3.1rem)]">
        <Rise lines={STATEMENT} delay={0.15} />
      </h1>

      <div
        ref={card}
        onPointerMove={track}
        onPointerDown={track}
        onPointerLeave={leave}
        onPointerCancel={leave}
        aria-hidden
        className="relative mt-8 h-[56svh] min-h-[18rem] overflow-hidden rounded-[1.25rem] bg-card [touch-action:pan-y] md:mt-[2.4rem] md:h-auto md:flex-1"
      >
        {/* Nothing in 3D until the card is near the screen; the card colour stands in. */}
        {loaded && (
          <HeroPieces
            pointer={pointer}
            active={active}
            still={reduce}
            phone={phone}
            background={(resolvedTheme === "light" ? light : dark).hex("card")}
            night={resolvedTheme !== "light"}
          />
        )}
      </div>

      {/* The grid marks: card edge, a third, two thirds, card edge. */}
      <div className="relative flex h-[3.2rem] items-center justify-center">
        {[0, 33.333, 66.667, 100].map((left) => (
          <span key={left} aria-hidden className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[1.1rem] font-light leading-none text-ink" style={{ left: `${left}%` }}>
            +
          </span>
        ))}
        <a href="#intro" className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-ink hover:text-accent">
          Scroll to explore
        </a>
      </div>
    </section>
  );
};

export default Hero;
