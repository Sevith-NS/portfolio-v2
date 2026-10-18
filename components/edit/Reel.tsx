"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { projects } from "@/data";
import { webp } from "@/lib/work";
import { cut, type Frame } from "@/lib/cut";
import { cn } from "@/lib/utils";
import { TrackBox } from "./TrackBox";
import { Xerox as Still, type Fx } from "./Xerox";

// THE REEL. The home page's trailer, cut like the esdee / fast-cut edits:
// scroll is the playhead, every shot is a hard cut (no tweening between
// shots), bursts of short shots fly past, and the holds land on a word.
// Same content as the rest of the site, edited. Decorative: hidden from
// screen readers, since everything here is said properly further down.

type Pic = { src: string; label: string };

type Shot = { w: number; flash?: Frame[] } & (
  | { kind: "cold" }
  | { kind: "stamp"; word: string; sub: string; src: string; fx: Fx }
  | { kind: "frame"; src: string; fx: Fx; title: string; n: number; box: readonly [number, number, number, number]; xy: [number, number] }
  | { kind: "shards"; src: string }
  | { kind: "trip"; panels: Pic[] }
  | { kind: "split"; top: Pic; bottom: Pic }
  | { kind: "strobe"; srcs: string[] }
  | { kind: "sign" }
);

const BURST_FX: Fx[] = ["mono", "neg", "duo", "raw", "split", "mono", "neg"];
// Where the tracker lands on each screenshot: left, top, width, height (%).
const BOXES = [
  [14, 24, 30, 38],
  [52, 30, 26, 34],
  [30, 18, 40, 44],
  [58, 44, 24, 30],
  [12, 42, 34, 30],
  [44, 22, 28, 42],
  [24, 36, 36, 28],
] as const;

const burst: Shot[] = projects.map((p, i) => ({
  kind: "frame",
  w: 0.38,
  src: webp(p.img),
  fx: BURST_FX[i % BURST_FX.length],
  title: p.title,
  n: i + 1,
  box: BOXES[i % BOXES.length],
  xy: [(402 + i * 137) % 960, (254 + i * 89) % 540],
  flash: i % 2 ? ["invert"] : undefined,
}));

const SHOTS: Shot[] = [
  { kind: "cold", w: 1.1 },
  { kind: "stamp", w: 1.4, word: "Design", sub: "take 01, the interface", src: "/reel/ochi.webp", fx: "mono", flash: ["white", "clear"] },
  ...burst,
  { kind: "stamp", w: 1.3, word: "Build", sub: "take 02, the code", src: "/reel/tesseract.webp", fx: "neg", flash: ["black", "invert"] },
  { kind: "shards", w: 1.8, src: "/cats/simba.webp", flash: ["white"] },
  {
    kind: "trip",
    w: 1.7,
    panels: [
      { src: "/story/pool-table.webp", label: "Self-taught" },
      { src: "/story/rainy-hike.webp", label: "Learns at 2am" },
      { src: "/story/climbing.webp", label: "Ships by morning" },
    ],
    flash: ["invert", "clear"],
  },
  {
    kind: "split",
    w: 1.3,
    top: { src: "/reel/polaris.webp", label: "I design it," },
    bottom: { src: "/reel/vercel.webp", label: "then I actually build it." },
    flash: ["blood", "black"],
  },
  { kind: "strobe", w: 0.9, srcs: ["/cats/me-and-simba.webp", "/story/goa.webp", "/story/beach.webp", "/story/touching-grass.webp"] },
  { kind: "stamp", w: 1.3, word: "Ship", sub: "take 03, the whole thing", src: "/reel/polaris.webp", fx: "neg", flash: ["white", "invert", "clear", "white"] },
  { kind: "sign", w: 1.5, flash: ["black", "black"] },
];

const TOTAL = SHOTS.reduce((s, x) => s + x.w, 0);
const STARTS = SHOTS.map((_, i) => SHOTS.slice(0, i).reduce((s, x) => s + x.w, 0));
// Scroll per unit of shot weight.
const VH_PER_W = 22;
// Inside a shot, progress moves in this many steps: stepped, never smooth.
const STEPS = 24;

function Stamp({ s, l }: { s: Extract<Shot, { kind: "stamp" }>; l: number }) {
  // Letters land one per step, like the word being slammed on frame by frame.
  const shown = Math.min(s.word.length, Math.floor(l * s.word.length * 2.2) + 1);
  return (
    <>
      <Still src={s.src} fx={s.fx} className="origin-center" />
      <div className="absolute inset-x-0 top-[18%] px-5 md:px-12">
        <p className={cn("title text-[clamp(6rem,30vw,30rem)]", s.fx === "duo" ? "text-bone" : "text-blood")}>
          {[...s.word].map((c, i) => (
            <span key={i} className={i < shown ? "" : "invisible"}>
              {c}
            </span>
          ))}
        </p>
        <p className="mt-4 inline-block bg-void px-2 py-1 hud text-bone">{s.sub}</p>
      </div>
    </>
  );
}

function FrameShot({ s }: { s: Extract<Shot, { kind: "frame" }> }) {
  const [x, y, w, h] = s.box;
  return (
    <>
      <Still src={s.src} fx={s.fx} pos="50% 0%" />
      <div className="absolute" style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}>
        <TrackBox x={s.xy[0]} y={s.xy[1]} label={s.title} className="inset-0" />
      </div>
      <p className="numeral absolute bottom-[6%] mix-blend-difference right-5 text-[clamp(8rem,26vw,24rem)] [-webkit-text-stroke-color:rgb(var(--bone))] md:right-12">
        {String(s.n).padStart(2, "0")}
      </p>
    </>
  );
}

// The esdee eye strips: the same face, cut into angled bands that stack up
// one per step, then the whole collage flips to negative on black.
const SHARDS = 8;
function Shards({ s, l }: { s: Extract<Shot, { kind: "shards" }>; l: number }) {
  const count = Math.min(SHARDS, Math.floor(l * SHARDS * 1.5) + 1);
  const dark = l > 0.82;
  return (
    <div className={cn("absolute inset-0 grid place-items-center", dark ? "bg-void" : "bg-bone")}>
      <div className="relative aspect-[16/9] w-[min(82vw,64rem)]">
        {Array.from({ length: count }, (_, i) => {
          const top = 14 + ((i * 11) % 26);
          const h = 12 + (i % 3) * 6;
          return (
            <div
              key={i}
              className="absolute inset-0 overflow-hidden shadow-[0_20px_40px_-20px_rgb(var(--void)/0.8)]"
              style={{
                clipPath: `polygon(${2 + (i % 4)}% ${top + 3}%, 100% ${top - 3}%, ${96 - (i % 3) * 3}% ${top + h}%, 0% ${top + h + 4}%)`,
                transform: `translate(${i % 2 ? -4 + i : 5 - i}%, ${(i - 3) * 2.2}%) rotate(${((i % 3) - 1) * 3.5}deg) scale(${1 + i * 0.025})`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.src}
                alt=""
                loading="lazy"
                decoding="async"
                className={cn("size-full origin-[66%_31%] scale-[1.7] object-cover", dark || i % 3 === 2 ? "fx-neg" : i % 2 ? "fx-mono" : "")}
                style={{ objectPosition: "60% 30%" }}
              />
            </div>
          );
        })}
      </div>
      <p className={cn("absolute bottom-[12%] hud", dark ? "text-bone" : "text-void")}>
        simba, head of quality assurance
      </p>
    </div>
  );
}

function Trip({ s, l }: { s: Extract<Shot, { kind: "trip" }>; l: number }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-bone bg-[radial-gradient(90%_80%_at_50%_45%,transparent_40%,rgb(var(--void)/0.4))]">
      <div className="flex items-end gap-3 md:gap-6">
        {s.panels.map((p, i) =>
          l >= 0.06 + i * 0.28 ? (
            <figure key={p.src} data-cut="in" data-cut-v="slam" className="w-[28vw] max-w-[19rem]">
              <div className="relative aspect-[3/4] overflow-hidden shadow-[0_30px_60px_-30px_rgb(var(--void)/0.9)]">
                <Still src={p.src} fx={i === 1 ? "neg" : "mono"} pos="50% 35%" />
              </div>
              <figcaption className="mt-3 title text-[clamp(0.9rem,2vw,1.6rem)] leading-none text-void">{p.label}</figcaption>
            </figure>
          ) : (
            <div key={p.src} className="w-[28vw] max-w-[19rem]" />
          )
        )}
      </div>
    </div>
  );
}

function Split({ s, l }: { s: Extract<Shot, { kind: "split" }>; l: number }) {
  const line = "absolute left-5 bottom-5 bg-void px-3 py-1 title text-[clamp(1.8rem,6vw,5rem)] text-bone md:left-12 md:bottom-8";
  return (
    <div className="absolute inset-0 grid grid-rows-2 bg-void">
      <div className="relative overflow-hidden border-b-2 border-void">
        <Still src={s.top.src} fx="duo" pos="50% 0%" />
        <p className={line}>{s.top.label}</p>
      </div>
      <div className="relative overflow-hidden">
        {l > 0.3 && (
          <div data-cut="in" data-cut-v="slice" className="absolute inset-0">
            <Still src={s.bottom.src} fx="mono" pos="50% 0%" />
            <p className={line}>{s.bottom.label}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Three frames on, one frame black: the fast-cut strobe, played by the scroll.
function Strobe({ s, l }: { s: Extract<Shot, { kind: "strobe" }>; l: number }) {
  const k = Math.floor(l * 12);
  const black = k % 4 === 3;
  return (
    <div className="absolute inset-0 bg-void">
      {!black &&
        s.srcs.map((src, i) => (
          <div key={src} className={i === k % s.srcs.length ? "" : "invisible"}>
            <Still src={src} fx={k % 3 === 1 ? "neg" : k % 3 === 2 ? "mono" : "raw"} pos="50% 35%" />
          </div>
        ))}
      <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center title text-[clamp(2.2rem,7vw,6rem)] text-bone">
        <span className="bg-void px-3">Has a life. Allegedly.</span>
      </p>
    </div>
  );
}

function Sign() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-void text-bone">
      <div className="text-center">
        <p className="title text-[clamp(4rem,14vw,12rem)]">Sevith.</p>
        <p className="mt-8 hud text-bone/60">end of reel, keep scrolling</p>
      </div>
    </div>
  );
}

function Cold() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-void text-bone">
      <div className="text-center">
        <p className="hud text-bone/70">a sevith sadashiva edit</p>
        <p className="mt-5 title text-[clamp(4rem,16vw,15rem)]">The reel</p>
        <p className="mt-8 hud text-bone/50">scroll to play</p>
      </div>
    </div>
  );
}

export function Reel() {
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ i: 0, l: 0 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const t = Math.min(TOTAL - 1e-6, Math.max(0, p * TOTAL));
    let i = SHOTS.length - 1;
    while (i > 0 && STARTS[i] > t) i--;
    const l = Math.floor(((t - STARTS[i]) / SHOTS[i].w) * STEPS) / STEPS;
    setPos((cur) => (cur.i === i && cur.l === l ? cur : { i, l }));
  });

  // Every cut: the shot's own flash, and the frame punches in.
  useEffect(() => {
    if (pos.i === 0) return;
    const s = SHOTS[pos.i];
    if (s.flash) cut(s.flash);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    stage.current?.animate([{ transform: "scale(1.08)" }, { transform: "scale(1)" }], { duration: 140, easing: "steps(3, jump-start)" });
  }, [pos.i]);

  return (
    <section ref={ref} id="reel" aria-hidden data-scene="Reel" className="relative bg-void" style={{ height: `${100 + TOTAL * VH_PER_W}vh` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div ref={stage} className="absolute inset-0">
          {SHOTS.map((s, i) => {
            const on = i === pos.i;
            const l = on ? pos.l : 0;
            return (
              <div key={i} className={cn("absolute inset-0", !on && "invisible")}>
                {s.kind === "cold" && <Cold />}
                {s.kind === "stamp" && <Stamp s={s} l={l} />}
                {s.kind === "frame" && <FrameShot s={s} />}
                {s.kind === "shards" && <Shards s={s} l={l} />}
                {s.kind === "trip" && <Trip s={s} l={l} />}
                {s.kind === "split" && <Split s={s} l={l} />}
                {s.kind === "strobe" && <Strobe s={s} l={l} />}
                {s.kind === "sign" && <Sign />}
              </div>
            );
          })}
        </div>

        {/* The editor's chrome, over every shot. */}
        <div className="pointer-events-none absolute inset-x-0 top-20 flex justify-between px-4 hud text-bone mix-blend-difference md:top-24 md:px-8">
          <span>sevith_reel_final_v7.mp4</span>
          <span>
            shot {String(pos.i + 1).padStart(2, "0")} / {SHOTS.length}
          </span>
        </div>
        <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center hud text-bone/70 mix-blend-difference">
          © {new Date().getFullYear()} sevith sadashiva. all rights reserved
        </p>
      </div>
    </section>
  );
}
