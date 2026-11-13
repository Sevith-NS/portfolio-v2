"use client";

import { useEffect, useRef } from "react";
import { useSound } from "@/lib/sound";

// The calm track under the site ("Futuristic Minimal Ambient" by BerryDeep, Pixabay
// Content License). Silent until the visitor turns sound on in the header; it fades
// rather than cuts, and steps aside while the reel plays with its own music.
const VOLUME = 0.35;
const FADE_MS = 900;

export function Ambient() {
  const on = useSound();
  const audio = useRef<HTMLAudioElement>(null);
  const ducked = useRef(false);

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    let raf = 0;
    const fade = (to: number, then?: () => void) => {
      cancelAnimationFrame(raf);
      const from = a.volume, t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / FADE_MS);
        a.volume = from + (to - from) * k;
        if (k < 1) raf = requestAnimationFrame(step);
        else then?.();
      };
      raf = requestAnimationFrame(step);
    };
    // A remembered "on" can't start sound before the visitor touches the page, so wait for one.
    const retry = () => play();
    const play = () => {
      a.play().then(() => fade(VOLUME), () => window.addEventListener("pointerdown", retry, { once: true }));
    };
    const sync = () => {
      if (on && !ducked.current) {
        if (a.paused) a.volume = 0;
        play();
      } else if (!a.paused) fade(0, () => a.pause());
    };
    const duck = (e: Event) => {
      ducked.current = e.type === "reel:open";
      sync();
    };
    sync();
    window.addEventListener("reel:open", duck);
    window.addEventListener("reel:close", duck);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerdown", retry);
      window.removeEventListener("reel:open", duck);
      window.removeEventListener("reel:close", duck);
    };
  }, [on]);

  return <audio ref={audio} src="/audio/ambient.mp3" loop preload="none" aria-hidden />;
}
