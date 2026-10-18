"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import type { CutDetail } from "@/lib/cut";

// The page is the timeline. A transport bar along the bottom of the frame:
// REC, the scene on screen, a scrubber with a tick at every scene (click one
// to cut to it), a blood playhead, and a timecode that runs with the scroll.

const PX_PER_FRAME = 6; // scroll distance per frame of timecode, at 30fps
const pad = (n: number) => String(n).padStart(2, "0");
function timecode(y: number) {
  const f = Math.floor(Math.max(0, y) / PX_PER_FRAME);
  return `${pad(Math.floor(f / 108000))}:${pad(Math.floor(f / 1800) % 60)}:${pad(Math.floor(f / 30) % 60)}:${pad(f % 30)}`;
}

type Mark = { name: string; at: number; el: HTMLElement };

export function Timeline() {
  const pathname = usePathname();
  const lenis = useLenis();
  const [marks, setMarks] = useState<Mark[]>([]);
  const [scene, setScene] = useState({ name: "", index: 0 });
  const head = useRef<HTMLSpanElement>(null);
  const tc = useRef<HTMLSpanElement>(null);

  // Where every scene starts, as a share of the page. Remeasured as the page grows.
  useEffect(() => {
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
      setMarks(els.map((el) => ({ name: el.dataset.scene ?? "", el, at: max > 0 ? Math.min(1, (el.getBoundingClientRect().top + window.scrollY) / max) : 0 })));
    };
    const t = window.setTimeout(measure, 120);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => {
      window.clearTimeout(t);
      ro.disconnect();
    };
  }, [pathname]);

  // The director names the scene on screen.
  useEffect(() => {
    const on = (e: Event) => {
      const { scene: name, index } = (e as CustomEvent<CutDetail>).detail;
      if (name !== undefined) setScene({ name, index: index ?? 0 });
    };
    window.addEventListener("cut", on);
    return () => window.removeEventListener("cut", on);
  }, []);

  // Playhead and timecode, straight to the DOM.
  useEffect(() => {
    let raf = 0;
    const write = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (head.current) head.current.style.left = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
      if (tc.current) tc.current.textContent = timecode(window.scrollY);
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(write);
    };
    write();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  const jump = (el: HTMLElement) => {
    if (lenis) lenis.scrollTo(el, { duration: 1.1 });
    else el.scrollIntoView();
  };

  return (
    <div className="tone-void hud fixed inset-x-0 bottom-0 z-[58] flex h-9 items-center gap-3 border-t border-soot px-4 md:gap-5 md:px-6">
      <span className="flex items-center gap-1.5 text-bone">
        <span aria-hidden className="rec size-2 rounded-full bg-blood" />
        rec
      </span>
      <span className="hidden w-36 truncate md:block" aria-live="polite">
        {scene.name ? `sc ${pad(scene.index + 1)} ${scene.name.toLowerCase()}` : ""}
      </span>
      <div className="relative h-full flex-1">
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-soot" />
        {marks.map((m, i) => (
          <button
            key={`${m.name}-${i}`}
            type="button"
            onClick={() => jump(m.el)}
            aria-label={`Jump to ${m.name}`}
            data-cursor={m.name.toLowerCase()}
            className="group absolute top-0 flex h-full w-4 -translate-x-1/2 items-center justify-center"
            style={{ left: `${m.at * 100}%` }}
          >
            <span className={i === scene.index ? "h-3.5 w-0.5 bg-bone" : "h-2 w-px bg-smoke group-hover:h-3.5 group-hover:bg-bone"} />
          </button>
        ))}
        <span ref={head} aria-hidden className="pointer-events-none absolute top-1 bottom-1 w-0.5 -translate-x-1/2 bg-blood" />
      </div>
      <span ref={tc} className="text-bone">
        00:00:00:00
      </span>
    </div>
  );
}
