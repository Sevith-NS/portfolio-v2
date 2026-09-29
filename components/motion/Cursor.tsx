"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

type Mode = "idle" | "link" | "view" | "text";

// A lapis dot that trails the pointer on a spring. Over links it swells into a ring;
// over anything marked data-cursor it becomes a labelled pill. Fine pointers only.
export function Cursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [label, setLabel] = useState("");
  const [down, setDown] = useState(false);
  const [shown, setShown] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 });

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(fine.matches);
    update();
    fine.addEventListener("change", update);
    return () => fine.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("has-cursor");

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setShown(true);
      const t = e.target as Element | null;
      const labelled = t?.closest<HTMLElement>("[data-cursor]");
      if (labelled) {
        setMode("view");
        setLabel(labelled.dataset.cursor || "View");
        return;
      }
      if (t?.closest("input, textarea, [contenteditable]")) setMode("text");
      else if (t?.closest("a, button, [role='button'], label, summary")) setMode("link");
      else setMode("idle");
    };
    const leave = () => setShown(false);
    const press = () => setDown(true);
    const release = () => setDown(false);

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const size = mode === "view" ? 88 : mode === "link" ? 40 : mode === "text" ? 4 : 12;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[150]"
      style={{ x: reduce ? x : sx, y: reduce ? y : sy }}
    >
      <motion.div
        className={
          mode === "link"
            ? "flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/70"
            : "flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-on-hl"
        }
        animate={{
          width: size,
          height: mode === "text" ? 26 : size,
          opacity: shown ? 1 : 0,
          scale: down ? 0.85 : 1,
          borderRadius: mode === "text" ? 2 : 999,
        }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
      >
        <AnimatePresence>
          {mode === "view" && (
            <motion.span
              key={label}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.18 }}
              className="whitespace-nowrap text-[0.8125rem] font-medium"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
