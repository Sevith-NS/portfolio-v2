"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { X } from "@phosphor-icons/react";

type Photo = { src: string; thumb: string; alt: string; w: number; h: number };
type View = { w: number; h: number; tw: number; cw: number; ch: number };
type Tile = { el: HTMLElement; x: number; y: number; w: number; h: number };

// One endless plane of photos, like Pamidor's Art Lab: drag it any way (mouse,
// touch, trackpad, arrow keys) and the set repeats forever. Each photo keeps its
// own shape and lands loosely around its spot, every other column half a spot
// lower, with a size and an offset of its own, so neighbours overlap now and
// then. The plane bends away toward the edges, a lens rather than a sheet. Only
// the spots on screen exist, and their places are written straight to the DOM
// each frame, so React re-renders only when a row or column comes in.
const BEND = 20; // degrees a tile turns at the edge of the screen
const SINK = 160; // px it sits back there
const EASE = 0.14; // share of the way to the target the plane covers each frame
const DECAY = 0.92; // share of a flick's speed kept each frame
const SCATTER = 0.25; // share of a spot a photo can land off its centre, either way

const mod = (a: number, n: number) => ((a % n) + n) % n;

// A steady random number in [0, 1) for spot (c, r); k picks which one.
function noise(c: number, r: number, k: number) {
  let h = Math.imul(c, 374761393) ^ Math.imul(r, 668265263) ^ Math.imul(k + 1, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  return ((h ^ (h >>> 16)) >>> 0) / 2 ** 32;
}

function measure(): View {
  const w = window.innerWidth, h = window.innerHeight;
  const tw = Math.round(Math.min(300, Math.max(150, w * 0.21)));
  const spot = Math.round(tw * 1.1);
  return { w, h, tw, cw: spot, ch: spot };
}

export default function Gallery({ photos }: { photos: Photo[] }) {
  const n = photos.length;
  const reduce = useReducedMotion();
  const [view, setView] = useState<View | null>(null);
  const [first, setFirst] = useState({ c: 0, r: 0 });
  const [open, setOpen] = useState<number | null>(null);
  const plane = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const tiles = useRef(new Map<string, Tile>());
  // Where the plane is and where it is heading, for the frame loop; never rendered.
  const at = useRef({ x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, drag: false, moved: false, raf: 0, c: NaN, r: NaN, view: null as View | null });

  // Every tile's place on the bent plane, and a re-render when new cells come in.
  const place = useCallback(() => {
    const a = at.current, v = a.view;
    if (!v) return;
    const R = Math.max(v.w, v.h) / 2;
    tiles.current.forEach((t) => {
      const left = t.x + a.x, top = t.y + a.y;
      const nx = (left + t.w / 2 - v.w / 2) / R, ny = (top + t.h / 2 - v.h / 2) / R;
      t.el.style.transform =`translate3d(${left}px,${top}px,${-SINK * (nx * nx + ny * ny)}px) rotateY(${nx * BEND}deg) rotateX(${-ny * BEND}deg)`;
    });
    const c = Math.floor(-a.x / v.cw) - 1, r = Math.floor(-a.y / v.ch) - 2;
    if (c !== a.c || r !== a.r) {
      a.c = c;
      a.r = r;
      setFirst({ c, r });
    }
  }, []);

  // The plane eases toward its target, and a flick glides on after letting go.
  const kick = useCallback(() => {
    const a = at.current;
    if (a.raf) return;
    const tick = () => {
      if (!a.drag) {
        a.tx += a.vx;
        a.ty += a.vy;
        a.vx *= DECAY;
        a.vy *= DECAY;
      }
      const k = reduce ? 1 : EASE;
      a.x += (a.tx - a.x) * k;
      a.y += (a.ty - a.y) * k;
      place();
      const left = Math.abs(a.tx - a.x) + Math.abs(a.ty - a.y) + Math.abs(a.vx) + Math.abs(a.vy);
      a.raf = a.drag || left > 0.1 ? requestAnimationFrame(tick) : 0;
    };
    a.raf = requestAnimationFrame(tick);
  }, [place, reduce]);

  useLayoutEffect(() => place(), [view, first, place]);

  useEffect(() => {
    const el = plane.current;
    if (!el) return;
    const a = at.current;
    if (!a.view) {
      // Start with the first photo in the middle of the screen.
      a.view = measure();
      a.x = a.tx = (a.view.w - a.view.cw) / 2;
      a.y = a.ty = (a.view.h - a.view.ch) / 2;
      setView(a.view);
    }

    let start = { x: 0, y: 0 }, last = { x: 0, y: 0, t: 0 };
    const move = (e: PointerEvent) => {
      a.vx = e.clientX - last.x;
      a.vy = e.clientY - last.y;
      a.tx += a.vx;
      a.ty += a.vy;
      last = { x: e.clientX, y: e.clientY, t: e.timeStamp };
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) a.moved = true;
    };
    const up = (e: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      a.drag = false;
      // A drag that came to rest before letting go stays put.
      if (reduce || e.timeStamp - last.t > 80) a.vx = a.vy = 0;
      kick();
    };
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      a.drag = true;
      a.moved = false;
      a.vx = a.vy = 0;
      start = { x: e.clientX, y: e.clientY };
      last = { ...start, t: e.timeStamp };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
      kick();
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const k = e.deltaMode === 1 ? 16 : 1; // Firefox scrolls by lines
      a.tx -= e.deltaX * k;
      a.ty -= e.deltaY * k;
      kick();
    };
    const steps: Record<string, [number, number]> = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
    const key = (e: KeyboardEvent) => {
      const s = steps[e.key];
      if (!s || !a.view || dialog.current?.open || e.altKey || e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      a.tx += s[0] * a.view.cw;
      a.ty += s[1] * a.view.ch;
      kick();
    };
    const resize = () => {
      a.view = measure();
      setView(a.view);
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", key);
    window.addEventListener("resize", resize);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(a.raf);
      a.raf = 0;
    };
  }, [kick, reduce, n]);

  useEffect(() => {
    if (open !== null) dialog.current?.showModal();
  }, [open]);

  if (!n)
    return <p className="grid h-[100dvh] place-items-center font-mono text-[0.75rem] uppercase tracking-[0.18em] text-ink-3">No photos yet</p>;

  const cells: ReactNode[] = [];
  if (view) {
    // The set runs along each row and carries on C photos further in the next,
    // C fitted to the screen's shape so a photo's repeats land far apart.
    const C = Math.max(1, Math.min(n - 1, Math.round(Math.sqrt((n * view.w * view.ch) / (view.h * view.cw)))));
    const seen = new Set<number>();
    for (let r = first.r; r < first.r + Math.ceil(view.h / view.ch) + 4; r++)
      for (let c = first.c; c < first.c + Math.ceil(view.w / view.cw) + 3; c++) {
        const k = `${c}:${r}`, i = mod(c + r * C, n), p = photos[i];
        // Every shape gets about the same area, a little bigger or smaller by spot.
        const side = view.tw * (0.75 + 0.45 * noise(c, r, 0)), stretch = Math.sqrt(p.w / p.h);
        const w = Math.round(side * stretch), h = Math.round(side / stretch);
        const x = (c + 0.5 + (noise(c, r, 1) - 0.5) * 2 * SCATTER) * view.cw - w / 2;
        const y = (r + 0.5 + (c & 1) / 2 + (noise(c, r, 2) - 0.5) * 2 * SCATTER) * view.ch - h / 2;
        // Each photo is tabbable and announced once; its repeats are only seen.
        const again = seen.has(i);
        seen.add(i);
        cells.push(
          <button
            key={k}
            ref={(el) => {
              tiles.current.set(k, { el: el!, x, y, w, h });
              return () => void tiles.current.delete(k);
            }}
            type="button"
            data-cursor="Open"
            tabIndex={again ? -1 : undefined}
            aria-hidden={again || undefined}
            aria-label={`Open ${p.alt}`}
            onClick={(e) => {
              // A drag that ends on a tile is not a click; Enter and Space always are.
              if (e.detail === 0 || !at.current.moved) setOpen(i);
            }}
            // Overlaps stack in a different order from spot to spot.
            style={{ width: w, height: h, zIndex: Math.floor(noise(c, r, 3) * 40) }}
            className="absolute left-0 top-0 overflow-hidden rounded-md bg-sheet shadow-[0_12px_32px_-14px_rgb(var(--shade)/0.5)] will-change-transform"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumb} alt="" draggable={false} decoding="async" className="size-full object-cover" />
          </button>,
        );
      }
  }

  return (
    <>
      <section
        ref={plane}
        aria-label="Photos. Drag, swipe or use the arrow keys to look around."
        data-cursor="Drag"
        data-lenis-prevent
        className="fixed inset-0 touch-none select-none overflow-clip [perspective:1100px]"
      >
        {cells}
      </section>
      
      {/* A photo opened full size, in a native <dialog> like ZoomImage's. */}
      <dialog
        ref={dialog}
        data-lenis-prevent
        aria-label={open === null ? undefined : photos[open].alt}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto max-w-none overflow-visible bg-transparent p-0 backdrop:bg-shade/85 backdrop:backdrop-blur-sm"
      >
        {open !== null && (
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[open].src} alt={photos[open].alt} className="block max-h-[84dvh] max-w-[94vw] rounded-md" />
            
          </figure>
        )}
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          aria-label="Close"
          className="fixed right-4 top-4 grid size-10 place-items-center rounded-full border border-rule bg-paper/90 text-ink shadow-[0_8px_24px_-8px_rgb(var(--shade)/0.5)] backdrop-blur-sm hover:border-ink md:right-8 md:top-8"
        >
          <X size={18} />
        </button>
      </dialog>
    </>
  );
}
