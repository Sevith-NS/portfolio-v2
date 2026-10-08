"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import { useReducedMotion } from "framer-motion";
import { Moon, Sun } from "@phosphor-icons/react";

// Switching sides is a moment, not a colour swap: a pixel mosaic eats the
// screen, the theme flips behind it, a line of the creed lands, and the mosaic
// clears tile by tile onto the other side.
const SPREAD_MS = 800; // diagonal sweep from one corner to the other
const JITTER_MS = 420; // per-tile scatter, so the advancing edge is never a straight line
const TILE_MS = 350; // one tile's own snap-in
const COVER_MS = SPREAD_MS + JITTER_MS + TILE_MS + 30; // the last tile has landed: screen is opaque
const HOLD_MS = 1240; // the line stays up
const CLEAR_MS = SPREAD_MS + JITTER_MS + 200;

type Side = "light" | "dark";
type Tile = { delay: number; fill: string };

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
    ember: "#2c6fcd",
    ink: "#F2F2F0",
    dim: "#969AAA",
  },
  light: {
    welcome: "Welcome to the light side",
    quote: "Happiness can be found, even in the darkest of times, if one only remembers to turn on the light.",
    said: "Albus Dumbledore · Harry Potter and the Prisoner of Azkaban",
    base: ["#F3EEE4", "#EDE5D8"],
    ember: "#002DB4",
    ink: "#111111",
    dim: "#6E6E6E",
  },
};

// A tile per cell, each carrying its own delay and one of three fills.
function buildTiles(side: Side, cols: number, rows: number): Tile[] {
  const { base, ember } = SIDES[side];
  const tiles: Tile[] = [];
  const lastCol = Math.max(cols - 1, 1);
  const lastRow = Math.max(rows - 1, 1);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const reach = (col / lastCol + row / lastRow) / 2;
      const tone = Math.random();
      // The creed sits dead centre, so no ember lands under it: the two base
      // tones still vary there, they just never fight the text for contrast.
      const quiet = Math.abs(row / lastRow - 0.5) < 0.2;
      tiles.push({
        delay: Math.round(reach * SPREAD_MS + Math.random() * JITTER_MS),
        fill: tone < 0.05 && !quiet ? ember : tone < 0.32 ? base[1] : base[0],
      });
    }
  }
  return tiles;
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"cover" | "clear" | null>(null);
  const [side, setSide] = useState<Side>("dark");
  const [grid, setGrid] = useState({ cols: 0, rows: 0 });
  const [tiles, setTiles] = useState<Tile[]>([]);
  const busy = useRef(false);
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
    // One crossing at a time: clicks while the mosaic is moving are ignored.
    if (busy.current) return;
    busy.current = true;

    const span = window.innerWidth < 640 ? 44 : 64;
    const cols = Math.ceil(window.innerWidth / span);
    const rows = Math.ceil(window.innerHeight / span);
    setSide(target);
    setGrid({ cols, rows });
    setTiles(buildTiles(target, cols, rows));
    setPhase("cover");

    timers.current = [
      // The flip happens unseen, under a screen with no gaps left in it.
      window.setTimeout(() => setTheme(target), COVER_MS),
      window.setTimeout(() => setPhase("clear"), COVER_MS + HOLD_MS),
      window.setTimeout(() => {
        setPhase(null);
        setTiles([]);
        busy.current = false;
      }, COVER_MS + HOLD_MS + CLEAR_MS),
    ];
  }, [dark, reduce, setTheme]);

  const creed = SIDES[side];

  return (
    <>
      <button
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
              <div
                className="absolute inset-0 grid"
                style={{
                  gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
                  gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
                }}
              >
                {tiles.map((tile, i) => (
                  <span
                    key={i}
                    className="mosaic-tile"
                    style={{ backgroundColor: tile.fill, animationDelay: `${tile.delay}ms` }}
                  />
                ))}
              </div>

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
