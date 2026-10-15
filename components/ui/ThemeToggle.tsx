"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import { useReducedMotion } from "framer-motion";
import { Moon, Sun } from "@phosphor-icons/react";

// Switching sides is a moment, not a colour swap: a pixel scan sweeps the
// screen from the top-left corner, slowly. The theme flips behind it, a line of
// the creed lands, and a second scan from the same corner clears the way onto
// the other side.
const COVER_MS = 3600; // every pixel has landed: screen is opaque
const HOLD_MS = 1400; // the line stays up
const CLEAR_MS = 4200;

type Side = "light" | "dark";

// Both quotes are the lines as spoken, with the mouth they came out of.
const SIDES: Record<Side, {
  welcome: string;
  quote: string;
  said: string;
  base: [string, string];
  ember: string;
  ink: string;
  dim: string;
}> = {
  dark: {
    welcome: "Welcome to the dark side",
    quote: "If you only knew the power of the dark side.",
    said: "Darth Vader · The Empire Strikes Back",
    base: ["#090D1E", "#111730"],
    ember: "#2F5BFF",
    ink: "#F2F2F0",
    dim: "#969AAA",
  },
  light: {
    welcome: "Welcome to the light side",
    quote: "Happiness can be found, even in the darkest of times, if one only remembers to turn on the light.",
    said: "Albus Dumbledore · Harry Potter and the Prisoner of Azkaban",
    base: ["#EFE9DE", "#E7E0D3"],
    ember: "#002DB4",
    ink: "#1A1612",
    dim: "#6E675E",
  },
};

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));

// One canvas pixel per screen cell, scaled up with nearest-neighbour sampling,
// so ten thousand cells cost one putImageData a frame.
// A pixel scan, like a digital logo wipe: a ragged front of pixels spreads out
// from the theme button you just pressed, until it reaches the far corner.
// Each cell lands when the front reaches it (give or take some jitter, so the
// edge breaks up into blocks), flashes the accent colour for a moment as the
// scan passes, then settles into the page colour. The clear spreads out from
// the same button.
const BAND = 0.22; // how ragged the front is, as a share of the sweep
const FLASH = 0.018; // how long a cell glows as the scan passes it

function PixelVeil({ side, phase, origin }: { side: Side; phase: "cover" | "clear"; origin: { x: number; y: number } }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const state = useRef<{ img: ImageData; ctx: CanvasRenderingContext2D; tone: Uint8Array; cols: number; rows: number } | null>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    if (!state.current) {
      const span = window.innerWidth < 640 ? 10 : 14;
      const cols = Math.ceil(window.innerWidth / span);
      const rows = Math.ceil(window.innerHeight / span);
      cv.width = cols;
      cv.height = rows;
      cv.style.width = `${cols * span}px`;
      cv.style.height = `${rows * span}px`;
      // Two page tones, picked per cell once, so the settled screen has texture.
      const tone = new Uint8Array(cols * rows).map(() => (Math.random() < 0.3 ? 1 : 0));
      state.current = { img: ctx.createImageData(cols, rows), ctx, tone, cols, rows };
    }
    const st = state.current;
    const { cols, rows, img, tone } = st;
    const n = cols * rows;
    const { base, ember } = SIDES[side];
    const tones = [hex(base[0]), hex(base[1])];
    const hot = hex(ember);
    // When each cell's moment comes: its distance from the top-left corner,
    // pushed about by jitter. Small 2x2 blocks share their jitter, so the front
    // breaks into chunky steps rather than noise.
    const due = new Float32Array(n);
    const jit = new Float32Array(Math.ceil(cols / 2) * Math.ceil(rows / 2)).map(() => Math.random());
    // Distance from the button, measured in cells, over the farthest corner's.
    const span = window.innerWidth < 640 ? 10 : 14;
    const ox = origin.x / span, oy = origin.y / span;
    const far = Math.max(...[[0, 0], [cols, 0], [0, rows], [cols, rows]].map(([x, y]) => Math.hypot(x - ox, y - oy)));
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const reach = Math.hypot(c + 0.5 - ox, r + 0.5 - oy) / far;
        const j = (jit[(r >> 1) * Math.ceil(cols / 2) + (c >> 1)] + Math.random() * 0.35) / 1.35;
        due[r * cols + c] = reach * (1 - BAND) + j * BAND;
      }
    const covering = phase === "cover";
    const ms = covering ? COVER_MS : CLEAR_MS;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms) * (1 + FLASH);
      const d = img.data;
      for (let i = 0; i < n; i++) {
        const k = p - due[i];
        const o = i * 4;
        if (covering) {
          if (k < 0) { d[o + 3] = 0; continue; }
          const [cr, cg, cb] = k < FLASH ? hot : tones[tone[i]];
          d[o] = cr; d[o + 1] = cg; d[o + 2] = cb; d[o + 3] = 255;
        } else {
          // On the way out the scan glows just ahead of the cells it removes.
          if (k >= FLASH) { d[o + 3] = 0; continue; }
          const [cr, cg, cb] = k >= 0 ? hot : tones[tone[i]];
          d[o] = cr; d[o + 1] = cg; d[o + 2] = cb; d[o + 3] = 255;
        }
      }
      st.ctx.putImageData(img, 0, 0);
      if (p < 1 + FLASH) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [side, phase, origin]);

  return <canvas ref={ref} className="absolute left-0 top-0 [image-rendering:pixelated]" />;
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"cover" | "clear" | null>(null);
  const [side, setSide] = useState<Side>("dark");
  const busy = useRef(false);
  const button = useRef<HTMLButtonElement>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const timers = useRef<number[]>([]);

  useEffect(() => setMounted(true), []);
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const dark = mounted && resolvedTheme === "dark";

  const cross = useCallback(() => {
    const target: Side = dark ? "light" : "dark";
    if (reduce) {
      setTheme(target);
      return;
    }
    // One crossing at a time: clicks while the pixels are moving are ignored.
    if (busy.current) return;
    busy.current = true;

    // The scan starts from the centre of the button that was pressed.
    const r = button.current?.getBoundingClientRect();
    setOrigin(r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: 0, y: 0 });
    setSide(target);
    setPhase("cover");

    timers.current = [
      // The flip happens unseen, under a screen with no gaps left in it.
      window.setTimeout(() => setTheme(target), COVER_MS),
      window.setTimeout(() => setPhase("clear"), COVER_MS + HOLD_MS),
      window.setTimeout(() => {
        setPhase(null);
        busy.current = false;
      }, COVER_MS + HOLD_MS + CLEAR_MS),
    ];
  }, [dark, reduce, setTheme]);

  const creed = SIDES[side];

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={cross}
        aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
        className="grid size-9 place-items-center rounded-full text-ink-2 transition-colors hover:bg-ink/[0.06] hover:text-ink active:scale-95"
      >
        {mounted ? (
          dark ? <Sun size={18} weight="regular" /> : <Moon size={18} weight="regular" />
        ) : (
          <span className="size-[18px]" />
        )}
      </button>

      {mounted && phase
        ? createPortal(
            <div
              aria-hidden
              data-mosaic={phase === "cover" ? "in" : "out"}
              className="pointer-events-auto fixed inset-0 z-[150] overflow-hidden"
            >
              <PixelVeil side={side} phase={phase} origin={origin} />

              <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                <div className="max-w-2xl">
                  <p
                    className="mosaic-say wordmark text-[1.75rem] leading-[1.05] md:text-[3.25rem]"
                    style={{ color: creed.ink, "--say-delay": "0ms" } as React.CSSProperties}
                  >
                    {creed.welcome}
                  </p>
                  <p
                    className="mosaic-say mt-5 font-serif text-xl italic leading-snug md:mt-7 md:text-3xl"
                    style={{ color: creed.ink, "--say-delay": "70ms" } as React.CSSProperties}
                  >
                    &ldquo;{creed.quote}&rdquo;
                  </p>
                  <p
                    className="mosaic-say label mt-4 md:mt-5"
                    style={{ color: creed.dim, "--say-delay": "130ms" } as React.CSSProperties}
                  >
                    {creed.said}
                  </p>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
