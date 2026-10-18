"use client";

import { useEffect, useRef } from "react";

// The pointer is a tracker. A small blood crosshair follows the mouse; over
// anything you can press, a tracking box snaps (no easing, it cuts) around it
// with a label from data-cursor, or its coordinates. Fine pointers only; text
// fields keep the normal caret.
const HIT = "a, button, [data-cursor], summary, label";
const PAD = 6;

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const tag = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");
    let x = -100, y = -100, raf = 0;
    let target: HTMLElement | null = null;
    let typing = false;

    const paint = () => {
      raf = 0;
      const d = dot.current, b = box.current, t = tag.current;
      if (!d || !b || !t) return;
      d.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      d.style.opacity = typing ? "0" : "1";
      if (target && !typing && target.isConnected) {
        const r = target.getBoundingClientRect();
        b.style.transform = `translate3d(${r.left - PAD}px, ${r.top - PAD}px, 0)`;
        b.style.width = `${r.width + PAD * 2}px`;
        b.style.height = `${r.height + PAD * 2}px`;
        b.style.opacity = "1";
        t.textContent = target.dataset.cursor ?? `x: ${Math.round(r.left)} y: ${Math.round(r.top)}`;
      } else {
        b.style.opacity = "0";
      }
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const el = e.target as HTMLElement;
      typing = !!el.closest?.("input, textarea, select");
      target = (el.closest?.(HIT) as HTMLElement | null) ?? null;
      queue();
    };
    const leave = () => {
      x = y = -100;
      target = null;
      queue();
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", queue, { passive: true });
    root.addEventListener("pointerleave", leave);
    return () => {
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", queue);
      root.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[150] hidden [@media(hover:hover)_and_(pointer:fine)]:block">
      <div ref={box} className="absolute left-0 top-0 text-blood opacity-0">
        <span className="absolute left-0 top-0 size-2.5 border-l-2 border-t-2 border-current" />
        <span className="absolute right-0 top-0 size-2.5 border-r-2 border-t-2 border-current" />
        <span className="absolute bottom-0 left-0 size-2.5 border-b-2 border-l-2 border-current" />
        <span className="absolute bottom-0 right-0 size-2.5 border-b-2 border-r-2 border-current" />
        <span ref={tag} className="absolute -top-[1.15rem] left-0 whitespace-nowrap bg-blood px-1 font-mono text-[0.625rem] leading-4 text-bone" />
      </div>
      <div ref={dot} className="absolute -left-2 -top-2 size-4 text-blood">
        <span className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-current" />
        <span className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-current" />
      </div>
    </div>
  );
}
