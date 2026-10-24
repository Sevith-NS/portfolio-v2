"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PixelSprite } from "./PixelCats";

// The cats (Q89, Q34). Cream is chaos: type "cream" anywhere (the footer says so,
// and lights up a key per letter) or tap the footer's keys, and she does
// zoomies across the screen and knocks the page crooked. Simba lives in the footer as a pixel cat (see PixelCats) and sends notes
// through here. Reduced motion skips the animation and keeps the note.

const TOAST_MS = 3600;

// Anyone can post a note: window.dispatchEvent(new CustomEvent("cat-note", { detail: "..." }))
export const catNote = (text: string) => window.dispatchEvent(new CustomEvent("cat-note", { detail: text }));

// Knock everything visible a little crooked, then let it wobble back.
function knockThingsOver() {
  const vh = window.innerHeight;
  const targets = Array.from(document.querySelectorAll<HTMLElement>("main h1, main h2, main .btn, main figure, header nav"))
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < vh;
    })
    .slice(0, 14);
  targets.forEach((el, i) => {
    const turn = (Math.random() * 6 - 3).toFixed(2);
    const dx = (Math.random() * 16 - 8).toFixed(1);
    const dy = (Math.random() * 10 - 5).toFixed(1);
    el.animate(
      [
        { transform: "none" },
        { transform: `translate(${dx}px, ${dy}px) rotate(${turn}deg)`, offset: 0.25 },
        { transform: `translate(${-Number(dx) / 3}px, 0) rotate(${-Number(turn) / 3}deg)`, offset: 0.6 },
        { transform: "none" },
      ],
      { duration: 1400, delay: 350 + i * 45, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
    );
  });
}

export function EasterEggs() {
  const reduce = useReducedMotion();
  const [note, setNote] = useState<string | null>(null);
  const [zoomies, setZoomies] = useState(0);
  const typed = useRef("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const say = useCallback((text: string) => {
    setNote(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNote(null), TOAST_MS);
  }, []);

  const cream = useCallback(() => {
    if (!reduce) {
      setZoomies((n) => n + 1);
      knockThingsOver();
    }
    // The studio's Cream listens for this and goes after the mug.
    window.dispatchEvent(new Event("cream"));
    say("Cream was here. Sorry about your page.");
  }, [reduce, say]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, [contenteditable='true']") || e.key.length !== 1) return;
      typed.current = (typed.current + e.key.toLowerCase()).slice(-5);
      // How much of "cream" the last few keys spell, so the footer's key hint can light up as you go.
      let n = 0;
      for (let k = Math.min(5, typed.current.length); k > 0; k--)
        if ("cream".startsWith(typed.current.slice(-k))) { n = k; break; }
      window.dispatchEvent(new CustomEvent("cream-progress", { detail: n }));
      if (n === 5) {
        typed.current = "";
        cream();
      }
    };
    // The footer's key hint is a button too, for anyone without a keyboard.
    const onSummon = () => cream();
    const onNote = (e: Event) => say((e as CustomEvent<string>).detail);
    window.addEventListener("keydown", onKey);
    window.addEventListener("cat-note", onNote);
    window.addEventListener("cream-summon", onSummon);
    return () => {
      window.removeEventListener("cream-summon", onSummon);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("cat-note", onNote);
      clearTimeout(timer.current);
    };
  }, [cream, say]);

  return (
    <>
      {/* Zoomies: pixel Cream sprints in from the left, hops, doubles back, and
          bolts out the right. */}
      <AnimatePresence>
        {zoomies > 0 && (
          <motion.div
            key={zoomies}
            aria-hidden
            className="pointer-events-none fixed bottom-6 left-0 z-[140] aspect-[21/16] w-24 md:w-32"
            initial={{ x: "-20vw", y: 0, scaleX: 1 }}
            animate={{
              x: ["-20vw", "55vw", "38vw", "70vw", "120vw"],
              y: [0, -60, 0, -36, 0],
              // Face the way she runs: turn round for the double-back, then again.
              scaleX: [1, 1, -1, -1, 1, 1],
            }}
            transition={{
              duration: 2.6,
              ease: "easeInOut",
              times: [0, 0.35, 0.5, 0.75, 1],
              scaleX: { duration: 2.6, ease: "linear", times: [0, 0.35, 0.36, 0.5, 0.51, 1] },
            }}
            onAnimationComplete={() => setZoomies(0)}
          >
            <PixelSprite name="cream" pose="run" className="size-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* The note, under the nav where it covers nothing you'd click. Announced
          politely to screen readers. */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-20 z-[140] flex justify-center px-4 md:top-24">
        <AnimatePresence>
          {note && (
            <motion.p
              key={note}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-full border border-rule bg-sheet/95 px-5 py-2.5 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-ink shadow-[0_16px_40px_-20px_rgb(var(--shade)/0.6)] backdrop-blur-md"
            >
              {note}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
