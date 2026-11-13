"use client";

import { motion } from "framer-motion";
import { setSound, useSound } from "@/lib/sound";

// Lusion's sound button: a flat line when off, a wave when on.
const FLAT = "M2 10 C 4.5 10, 6.5 10, 10 10 S 15.5 10, 18 10";
const WAVE = "M2 10 C 4.5 4, 6.5 4, 10 10 S 15.5 16, 18 10";

export function SoundToggle() {
  const on = useSound();
  return (
    <button
      type="button"
      onClick={() => setSound(!on)}
      aria-pressed={on}
      aria-label={on ? "Turn sound off" : "Turn sound on"}
      className="grid size-10 place-items-center rounded-full bg-ink/[0.07] text-ink transition-[background-color,transform] duration-300 hover:bg-ink/[0.13] active:scale-95"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <motion.path d={on ? WAVE : FLAT} animate={{ d: on ? WAVE : FLAT }} transition={{ duration: 0.45, ease: [0.35, 0, 0, 1] }} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </button>
  );
}
