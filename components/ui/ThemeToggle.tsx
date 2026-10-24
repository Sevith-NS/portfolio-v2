"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "framer-motion";
import { Moon, Sun } from "@phosphor-icons/react";
import { themes, type Side } from "@/lib/theme";
import { FLASH, maskFor, pixelGrid } from "@/lib/pixels";

// Switching sides is a moment, not a colour swap: the other side shows through
// the page one pixel at a time, spreading out from the button you pressed and
// slowing as it goes. The old page stays frozen as a snapshot (a view
// transition); a ragged front of pixels cuts through it to the new theme
// underneath. The new page gathers out of dust the size of the landing
// headline's: specks of it drift in toward the button from the old side,
// fading up and slowing as they land, and flash the new side's accent for a
// beat: lapis into the light, light blue into the dark.
const REVEAL_MS = 4200;
const FLY = 0.09; // share of the sweep a speck spends in the air, about the headline's 330ms
const DRIFT = 110; // px a speck travels, at most, as in the headline
const LEAD = 0.012; // a cell's specks land up to this much before it opens; under FLASH, so no gap

function pixelReveal(origin: { x: number; y: number }, target: Side, flip: () => void) {
  const root = document.documentElement;
  const { span, cols, rows, due } = pixelGrid(window.innerWidth, window.innerHeight, origin);
  // The front eases out like the landing headline's dust settling, 1 - (1 - t)²:
  // each cell opens when the front reaches it, and every flash stays as short.
  due.forEach((d, i) => (due[i] = 1 - Math.sqrt(1 - d)));
  // Four specks to a cell, each half its size (the headline's 7px, 5 on phones),
  // setting off beyond the cell on the side away from the button, scattered.
  const s = span / 2, n = due.length * 4;
  const sx = new Float32Array(n), sy = new Float32Array(n), fx = new Float32Array(n), fy = new Float32Array(n), sd = new Float32Array(n);
  for (let k = 0; k < n; k++) {
    const i = k >> 2;
    sx[k] = (i % cols) * span + (k & 1) * s;
    sy[k] = Math.floor(i / cols) * span + ((k >> 1) & 1) * s;
    const a = Math.atan2(sy[k] - origin.y, sx[k] - origin.x) + (Math.random() - 0.5) * Math.PI * 0.5;
    const away = DRIFT * (0.35 + Math.random() * 0.65);
    fx[k] = Math.cos(a) * away;
    fy[k] = Math.sin(a) * away;
    sd[k] = due[i] - Math.random() * LEAD;
  }

  // The new page is masked to the open cells; the old snapshot sits under it
  // untouched. The hold animation keeps the transition alive for the sweep.
  const style = document.createElement("style");
  style.textContent = `
    ::view-transition-old(root) { animation: none; }
    ::view-transition-new(root) {
      animation: theme-reveal-hold ${Math.round(REVEAL_MS * (1 + FLASH)) + 80}ms linear;
      mix-blend-mode: normal;
      -webkit-mask: var(--reveal) 0 0 / ${cols * span}px ${rows * span}px no-repeat;
      mask: var(--reveal) 0 0 / ${cols * span}px ${rows * span}px no-repeat;
    }
    ::view-transition-new(theme-dust) { animation: none; }
    @keyframes theme-reveal-hold { to { opacity: 1; } }
  `;
  document.head.appendChild(style);
  root.style.setProperty("--reveal", maskFor(due, cols, rows, () => false));

  // The specks and flashes. Anything on the new page is masked to the open
  // cells, so this gets a view transition layer of its own, above both sides.
  const cv = document.createElement("canvas");
  cv.width = cols * span;
  cv.height = rows * span;
  cv.setAttribute("aria-hidden", "true");
  Object.assign(cv.style, {
    position: "fixed", left: "0", top: "0", zIndex: "300", pointerEvents: "none",
    width: `${cols * span}px`, height: `${rows * span}px`, imageRendering: "pixelated", viewTransitionName: "theme-dust",
  });
  const ctx = cv.getContext("2d");
  const paper = themes[target].hex("paper"), flash = themes[target].hex("warm");

  const vt = document.startViewTransition(() => {
    // Flip the class directly so the new snapshot is ready at once; next-themes
    // catches up and stores the choice.
    root.classList.toggle("dark", target === "dark");
    root.style.colorScheme = target;
    // Added on the new side only, so it is captured as its own layer.
    document.body.appendChild(cv);
    flip();
  });

  let raf = 0;
  vt.ready.then(() => {
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = ((now - t0) / REVEAL_MS) * (1 + FLY + FLASH) - FLY;
      root.style.setProperty("--reveal", maskFor(due, cols, rows, (d) => p >= d));
      if (ctx) {
        ctx.clearRect(0, 0, cv.width, cv.height);
        // Two passes, so the colour is set twice a frame rather than per speck.
        ctx.fillStyle = paper;
        for (let k = 0; k < n; k++) {
          const d = sd[k];
          if (p >= d || d - p >= FLY) continue;
          const q = (d - p) / FLY, e = q * q; // slows as it lands
          ctx.globalAlpha = 1 - q;
          ctx.fillRect(Math.round(sx[k] + fx[k] * e), Math.round(sy[k] + fy[k] * e), s, s);
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = flash;
        for (let k = 0; k < n; k++) if (p >= sd[k] && p < sd[k] + FLASH) ctx.fillRect(sx[k], sy[k], s, s);
      }
      if (p < 1 + FLASH) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  });

  return vt.finished.finally(() => {
    cancelAnimationFrame(raf);
    cv.remove();
    style.remove();
    root.style.removeProperty("--reveal");
  });
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const busy = useRef(false);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  const dark = mounted && resolvedTheme === "dark";

  const cross = useCallback(() => {
    const target: Side = dark ? "light" : "dark";
    // No view transitions, or reduced motion: just switch.
    if (reduce || !document.startViewTransition) {
      setTheme(target);
      return;
    }
    // One crossing at a time: clicks while the pixels are moving are ignored.
    if (busy.current) return;
    busy.current = true;
    // The reveal starts from the centre of the button that was pressed.
    const r = button.current?.getBoundingClientRect();
    const origin = r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: 0, y: 0 };
    pixelReveal(origin, target, () => setTheme(target)).finally(() => {
      busy.current = false;
    });
  }, [dark, reduce, setTheme]);

  return (
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
  );
}
