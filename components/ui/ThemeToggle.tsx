"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "framer-motion";
import { Moon, Sun } from "@phosphor-icons/react";
import { themes, type Side } from "@/lib/theme";
import { FLASH, maskFor, paintFlash, pixelGrid } from "@/lib/pixels";

// Switching sides is a moment, not a colour swap: the other side shows through
// the page one pixel at a time, spreading out slowly from the button you
// pressed. The old page stays frozen as a snapshot (a view transition); a
// ragged front of pixels cuts through it to the new theme underneath, and each
// cell flashes the lamp colour as the front passes it.
const REVEAL_MS = 4200;

function pixelReveal(origin: { x: number; y: number }, target: Side, flip: () => void) {
  const root = document.documentElement;
  const { span, cols, rows, due } = pixelGrid(window.innerWidth, window.innerHeight, origin);

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
    @keyframes theme-reveal-hold { to { opacity: 1; } }
  `;
  document.head.appendChild(style);
  root.style.setProperty("--reveal", maskFor(due, cols, rows, () => false));

  // The lamp flash rides on the new page, so it only shows where cells are open.
  const cv = document.createElement("canvas");
  cv.width = cols;
  cv.height = rows;
  cv.setAttribute("aria-hidden", "true");
  Object.assign(cv.style, {
    position: "fixed", left: "0", top: "0", zIndex: "300", pointerEvents: "none",
    width: `${cols * span}px`, height: `${rows * span}px`, imageRendering: "pixelated",
  });
  document.body.appendChild(cv);
  const ctx = cv.getContext("2d");
  const img = ctx?.createImageData(cols, rows);
  const lamp = themes[target].hex("lamp");
  const hot = [1, 3, 5].map((i) => parseInt(lamp.slice(i, i + 2), 16));

  const vt = document.startViewTransition(() => {
    // Flip the class directly so the new snapshot is ready at once; next-themes
    // catches up and stores the choice.
    root.classList.toggle("dark", target === "dark");
    root.style.colorScheme = target;
    flip();
  });

  let raf = 0;
  vt.ready.then(() => {
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / REVEAL_MS) * (1 + FLASH);
      root.style.setProperty("--reveal", maskFor(due, cols, rows, (d) => p >= d));
      if (ctx && img) {
        paintFlash(img, due, hot, (d) => p >= d && p < d + FLASH);
        ctx.putImageData(img, 0, 0);
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
