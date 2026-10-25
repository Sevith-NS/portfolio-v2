"use client";

import { useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { useMotionValue, useReducedMotion, type MotionValue } from "framer-motion";
import { clipFor, pixelGrid } from "@/lib/pixels";

// Pixel motion for type, cutting it in or out cell by cell. Ink outside the
// cells is clipped, so type has to fit its box.

type Grid = ReturnType<typeof pixelGrid>;

// Show only the cells `open` keeps.
function applyClip(el: HTMLElement, grid: Grid, open: (d: number) => boolean) {
  el.style.clipPath = clipFor(grid.due, grid.cols, grid.rows, grid.span, open);
}

// The landing headline as dust. On load it assembles one letter at a time from
// the top left to the bottom right, the snap run backwards as in Endgame; as you
// scroll past it crumbles away in the same order, the specks blowing off to the
// right and speeding up, and scrolling back rebuilds it. Only the letters' ink
// turns to dust, never the box around them: each letter is drawn once to a
// canvas to find its ink, and the live type is covered and uncovered cell by cell
// under the specks, so at rest it's just the text. Each speck is its letter's
// own colour in the current theme, and like the curtain each bit of letter shows
// blue for a beat as it lands and before it breaks off (a blue copy, masked).
const ASSEMBLE = 1800; // ms from the first speck setting off to the last landing
const LETTER = 0.3; // share of a sweep one letter takes
const FLY = 0.25; // share of a sweep a speck spends in the air
const BLUE = 0.1; // share of a sweep a bit of letter stays blue
const DRIFT = 110; // px a speck travels, at most
const OUT = [0.06, 0.55]; // the hero's scroll progress over which it crumbles

type Speck = { x: number; y: number; d: number; ix: number; iy: number; ox: number; oy: number; src: number };

export function useDust(
  text: RefObject<HTMLElement | null>,
  blue: RefObject<HTMLElement | null>,
  dust: RefObject<HTMLCanvasElement | null>,
  scroll: MotionValue<number>,
  assemble = ASSEMBLE,
) {
  const reduce = useReducedMotion();

  useLayoutEffect(() => {
    const el = text.current, lit = blue.current, cv = dust.current;
    const ctx = cv?.getContext("2d");
    if (!el || !lit || !cv || !ctx) return;
    if (reduce) {
      el.style.clipPath = "none";
      return;
    }
    let raf = 0, dead = false, q = -FLY, w = 0, h = 0, B = 0;
    let grid: Grid = { span: 1, cols: 0, rows: 0, due: new Float32Array(0) };
    let specks: Speck[] = [];
    // The elements the letters take their colour from, and those colours for
    // the theme they were read in.
    let sources: Element[] = [], colors: string[] = [], readFor: boolean | null = null;

    const build = () => {
      const box = el.getBoundingClientRect();
      w = Math.ceil(box.width);
      h = Math.ceil(box.height);
      const span = window.innerWidth < 640 ? 5 : 7; // half the theme switch's cells

      // Every letter's box, with its ink drawn into one raster. The
      // canvas can't set the wdth axis, so each glyph is stretched to its box.
      const ras = document.createElement("canvas");
      ras.width = w;
      ras.height = h;
      const pen = ras.getContext("2d", { willReadFrequently: true })!;
      const letters: { x: number; y: number; w: number; h: number; src: number }[] = [];
      sources = [];
      readFor = null;
      const range = document.createRange();
      const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        if (n.parentElement!.closest(".sr-only")) continue;
        const src = sources.push(n.parentElement!) - 1;
        const cs = getComputedStyle(n.parentElement!);
        pen.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const s = n.textContent ?? "";
        for (let i = 0; i < s.length; i++) {
          if (!s[i].trim()) continue;
          range.setStart(n, i);
          range.setEnd(n, i + 1);
          const r = range.getBoundingClientRect();
          const m = pen.measureText(s[i]);
          const x = r.left - box.left, y = r.top - box.top;
          pen.setTransform(r.width / m.width, 0, 0, 1, x, y + m.fontBoundingBoxAscent);
          pen.fillText(s[i], 0, 0);
          letters.push({ x, y, w: r.width, h: r.height, src });
        }
      }
      const ink = pen.getImageData(0, 0, w, h).data;

      // When each letter starts: its place on the diagonal, top left first.
      const key = letters.map((l) => l.x + l.y);
      const lo = Math.min(...key), hi = Math.max(...key);
      const start = key.map((k) => ((k - lo) / (hi - lo || 1)) * (1 - LETTER));

      // Each cell belongs to its nearest letter (so overhanging ink goes with
      // it) and moves at a point in that letter's window. Cells with ink get a speck.
      const cols = Math.ceil(w / span), rows = Math.ceil(h / span);
      const due = new Float32Array(cols * rows);
      specks = [];
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const cx = (c + 0.5) * span, cy = (r + 0.5) * span;
          let near = 0, best = Infinity;
          letters.forEach((l, i) => {
            const d = Math.hypot(Math.max(l.x - cx, 0, cx - l.x - l.w), Math.max(l.y - cy, 0, cy - l.y - l.h));
            if (d < best) { best = d; near = i; }
          });
          const l = letters[near];
          const local = Math.min(1, Math.max(0, ((cx - l.x) / l.w + (cy - l.y) / l.h) / 2));
          const d = Math.min(1, start[near] + LETTER * (0.7 * local + 0.3 * Math.random()));
          due[r * cols + c] = d;
          let a = 0;
          for (let y = r * span; y < Math.min(h, (r + 1) * span); y++)
            for (let x = c * span; x < Math.min(w, (c + 1) * span); x++) a = Math.max(a, ink[(y * w + x) * 4 + 3]);
          if (a < 96) continue;
          const away = DRIFT * (0.35 + Math.random() * 0.65);
          const inA = Math.PI * (1.25 + (Math.random() - 0.5) * 0.5); // in from the top left
          const outA = Math.PI * (-0.1 + (Math.random() - 0.5) * 0.5); // off to the right, lifting
          specks.push({
            x: c * span, y: r * span, d, src: l.src,
            ix: Math.cos(inA) * away, iy: Math.sin(inA) * away,
            ox: Math.cos(outA) * away * 1.5, oy: Math.sin(outA) * away * 1.5,
          });
        }
      grid = { span, cols, rows, due };

      B = DRIFT * 1.5 + span;
      const dpr = window.devicePixelRatio || 1;
      cv.width = (w + B * 2) * dpr;
      cv.height = (h + B * 2) * dpr;
      cv.style.width = `${w + B * 2}px`;
      cv.style.height = `${h + B * 2}px`;
      cv.style.left = `${el.offsetLeft - B}px`;
      cv.style.top = `${el.offsetTop - B}px`;
      ctx.setTransform(dpr, 0, 0, dpr, B * dpr, B * dpr);
    };

    const draw = () => {
      const raw = Math.min(1, Math.max(0, (scroll.get() - OUT[0]) / (OUT[1] - OUT[0])));
      const p = raw * (1 + BLUE + FLY) - BLUE; // a bit turns blue at d - BLUE, flies off at d
      ctx.clearRect(-B, -B, w + B * 2, h + B * 2);
      if (q >= 1 + BLUE && raw <= 0) {
        el.style.clipPath = "none"; // beats the class that hides it until the first landing
        lit.style.clipPath = ""; // back to the class: the blue copy hidden
        return;
      }
      // A bit of letter is blue from its landing for a beat, and for a beat
      // before it breaks off; its own colour in between.
      const own = (d: number) => q >= d + BLUE && p < d - BLUE;
      applyClip(el, grid, own);
      applyClip(lit, grid, (d) => q >= d && p < d && !own(d));
      // Re-read the letters' colours when the theme flips, not every frame.
      const dark = document.documentElement.classList.contains("dark");
      if (dark !== readFor) {
        readFor = dark;
        colors = sources.map((e) => getComputedStyle(e).color);
      }
      let fill = "";
      for (const s of specks) {
        const landing = s.d > q;
        const k = landing ? (s.d - q) / FLY : (p - s.d) / FLY; // 0 at rest, 1 at the far end
        if (k <= 0 || k > 1) continue;
        if (colors[s.src] !== fill) ctx.fillStyle = fill = colors[s.src];
        ctx.globalAlpha = 1 - k;
        const e = k * k; // speeds up as it blows away, so slows as it lands
        ctx.fillRect(s.x + (landing ? s.ix : s.ox) * e, s.y + (landing ? s.iy : s.oy) * e, grid.span, grid.span);
      }
      ctx.globalAlpha = 1;
    };

    let off = () => {};
    const onResize = () => {
      build();
      draw();
    };
    document.fonts.ready.then(() => {
      if (dead) return;
      build();
      const t0 = performance.now();
      const tick = (now: number) => {
        q = ((now - t0) / assemble) * (1 + FLY + BLUE) - FLY;
        draw();
        if (q < 1 + BLUE) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      off = scroll.on("change", () => {
        if (q >= 1 + BLUE) draw();
      });
      window.addEventListener("resize", onResize);
    });
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      off();
      window.removeEventListener("resize", onResize);
    };
  }, [text, blue, dust, scroll, reduce, assemble]);
}

// The curtain's page name, assembled from dust like the landing headline. Move
// `out` past 0.55 to crumble it again; the curtain never does, it lifts off it.
/** Type that assembles itself from dust once, on mount. */
export function DustReveal({ children, duration, out }: { children: ReactNode; duration?: number; out?: MotionValue<number> }) {
  const text = useRef<HTMLDivElement>(null);
  const blue = useRef<HTMLDivElement>(null);
  const dust = useRef<HTMLCanvasElement>(null);
  const still = useMotionValue(0);
  useDust(text, blue, dust, out ?? still, duration);

  return (
    <div className="relative">
      <div ref={text} className="[clip-path:inset(50%)] motion-reduce:[clip-path:none]">
        {children}
      </div>
      <div ref={blue} aria-hidden className="pointer-events-none absolute inset-0 select-none text-warm [clip-path:inset(50%)] [&_*]:!text-warm">
        {children}
      </div>
      <canvas ref={dust} aria-hidden className="pointer-events-none absolute z-10" />
    </div>
  );
}
