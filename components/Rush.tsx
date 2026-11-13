"use client";

import { useEffect, useRef } from "react";
import { useVelocity, type MotionValue } from "framer-motion";
import { useSound } from "@/lib/sound";
import { BEATS, within } from "./three/beats";

// A low rush of air under the tunnels of the closing flight, louder the faster you scroll
// through them, quiet when you stop. Plays only when sound is on (header button), and only
// from the lattice to the shatter. The file is /audio/rush.mp3, picked by Sevith; until it
// is there this stays silent.
const MAX = 0.55;
const BED = 0.12; // a whisper of it even when you pause in a tunnel

export function Rush({ flight }: { flight: MotionValue<number> }) {
  const on = useSound();
  const audio = useRef<HTMLAudioElement>(null);
  const speed = useVelocity(flight);
  const broken = useRef(false);

  useEffect(() => {
    const a = audio.current;
    if (!a || !on) {
      if (a && !a.paused) a.pause();
      return;
    }
    let raf = 0, level = 0, asking = false;
    // A remembered "on" can't start sound before the visitor touches the page: wait for one.
    const touched = () => (asking = false);
    const tick = () => {
      const f = flight.get();
      const zone = within([BEATS.lattice[0], BEATS.shatter[1]], f, 0.02);
      // flight moves about 0.1 a second at an easy scroll; a fast flick is several times that
      const want = zone * Math.min(MAX, BED + Math.abs(speed.get()) * 1.6);
      level += (want - level) * 0.08;
      if (level > 0.01 && a.paused && !broken.current && !asking) {
        asking = true;
        a.play().then(
          () => (asking = false),
          (e: DOMException) => {
            if (e.name === "NotAllowedError") window.addEventListener("pointerdown", touched, { once: true });
            else broken.current = true; // no file yet
          },
        );
      }
      a.volume = Math.min(1, level);
      if (level < 0.005 && !a.paused) a.pause();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerdown", touched);
      a.pause();
    };
  }, [on, flight, speed]);

  return <audio ref={audio} src="/audio/rush.mp3" loop preload="none" aria-hidden onError={() => (broken.current = true)} />;
}
