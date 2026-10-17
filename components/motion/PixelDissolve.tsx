"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { useReducedMotion, useScroll } from "framer-motion";
import { themes } from "@/lib/theme";
import { FLASH, maskFor, paintFlash, pixelGrid } from "@/lib/pixels";
import { cn } from "@/lib/utils";

// Pixel motion for blocks of type: the same ragged lapis front as the theme
// switch, cutting a block in or out cell by cell.

// How far the grid reaches past the block, for type that overhangs it.
const BLEED = 96;

type Grid = ReturnType<typeof pixelGrid>;

// Show only the cells `open` keeps. The grid starts `bleed` px up and left of the box.
function applyMask(el: HTMLElement, grid: Grid, open: (d: number) => boolean, bleed: number) {
  const { span, cols, rows, due } = grid;
  el.style.maskImage = el.style.webkitMaskImage = maskFor(due, cols, rows, open);
  el.style.maskSize = el.style.webkitMaskSize = `${cols * span}px ${rows * span}px`;
  el.style.maskRepeat = el.style.webkitMaskRepeat = "no-repeat";
  el.style.maskPosition = el.style.webkitMaskPosition = `${-bleed}px ${-bleed}px`;
  // Masks clip to the box by default; overhanging type should still paint.
  el.style.maskClip = el.style.webkitMaskClip = "no-clip";
}

function clearMask(el: HTMLElement) {
  el.style.maskImage = el.style.webkitMaskImage = "";
}

/** The flash layer; goes first inside the pixelated block, which must be `relative`. */
export function PixelFlash({ ref }: { ref: RefObject<HTMLCanvasElement | null> }) {
  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute z-10 [image-rendering:pixelated]"
      style={{ left: -BLEED, top: -BLEED }}
    />
  );
}

// The landing hero breaks up into pixels as you scroll past it, running down
// from the top of the block. Scrubbed, so scrolling back rebuilds it. Starts
// after a short scroll and finishes once most of the block has gone by.
const START = 0.06; // of the viewport height scrolled before it starts
const GONE = 0.6; // share of the block scrolled past when the last pixel goes

export function usePixelDissolve(block: RefObject<HTMLElement | null>, flash: RefObject<HTMLCanvasElement | null>) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  useEffect(() => {
    const el = block.current, cv = flash.current;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx || reduce) return;
    let grid = pixelGrid(1, 1, { x: 0, y: 0 });
    let img = ctx.createImageData(1, 1);
    let from = 0, to = 1;
    const build = () => {
      const w = el.offsetWidth + BLEED * 2, h = el.offsetHeight + BLEED * 2;
      grid = pixelGrid(w, h, { x: w / 2, y: BLEED });
      cv.width = grid.cols;
      cv.height = grid.rows;
      cv.style.width = `${grid.cols * grid.span}px`;
      cv.style.height = `${grid.rows * grid.span}px`;
      img = ctx.createImageData(grid.cols, grid.rows);
      // Measured from the block's place on the page, without the mask applied.
      const top = el.getBoundingClientRect().top + window.scrollY;
      from = window.innerHeight * START;
      to = Math.max(from + 200, top + el.offsetHeight * GONE);
    };
    const apply = (y: number) => {
      const p = Math.min(1, Math.max(0, (y - from) / (to - from))) * (1 + FLASH);
      if (p <= 0) {
        clearMask(el);
        ctx.clearRect(0, 0, grid.cols, grid.rows);
        return;
      }
      // A cell is gone once the front has passed it; it glows just before.
      applyMask(el, grid, (d) => p < d, BLEED);
      const lamp = themes[document.documentElement.classList.contains("dark") ? "dark" : "light"].hex("lamp");
      paintFlash(img, grid.due, [1, 3, 5].map((i) => parseInt(lamp.slice(i, i + 2), 16)), (d) => p >= d - FLASH && p < d);
      ctx.putImageData(img, 0, 0);
    };
    build();
    apply(scrollY.get());
    const off = scrollY.on("change", apply);
    const onResize = () => { build(); apply(scrollY.get()); };
    window.addEventListener("resize", onResize);
    return () => {
      off();
      window.removeEventListener("resize", onResize);
      clearMask(el);
    };
  }, [block, flash, reduce, scrollY]);
}

// The curtain's page name builds itself out of pixels of the letters: the type
// is shown cell by cell, left to right, and a lapis copy of the same type shows
// only in the cells the front is crossing, so the glow is the letters, never
// the box around them. Cells scale with the type, so it always reads as pixels.
const GLOW = 0.1; // how long a cell stays lapis as the front crosses it
const PAD = 8; // a little room for the type's edges

/** Type that builds itself in pixel by pixel once, left to right, on mount. */
export function PixelReveal({ children, className, delay = 0, duration = 1100 }: { children: ReactNode; className?: string; delay?: number; duration?: number }) {
  const base = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Before paint, so the type never shows whole first.
  useLayoutEffect(() => {
    const el = base.current, lit = glow.current;
    if (!el || !lit) return;
    if (reduce) { lit.style.display = "none"; return; }
    const w = el.offsetWidth + PAD * 2, h = el.offsetHeight + PAD * 2;
    const grid = pixelGrid(w, h, { x: PAD, y: h / 2 }, Math.max(4, Math.round(el.offsetHeight / 14)));
    applyMask(el, grid, () => false, PAD);
    applyMask(lit, grid, () => false, PAD);
    const t0 = performance.now() + delay;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - t0) / duration)) * (1 + GLOW);
      if (p >= 1 + GLOW) {
        clearMask(el);
        lit.style.display = "none";
        return;
      }
      applyMask(el, grid, (d) => p >= d + GLOW, PAD);
      applyMask(lit, grid, (d) => p >= d && p < d + GLOW, PAD);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [delay, duration, reduce]);

  return (
    <div className={cn("relative", className)}>
      <div ref={base}>{children}</div>
      <div ref={glow} aria-hidden className="pointer-events-none absolute inset-0 text-lamp">
        {children}
      </div>
    </div>
  );
}
