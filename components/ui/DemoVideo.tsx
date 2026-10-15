"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

// A silent product clip. Plays only while it is actually on screen, so a page
// of clips never runs them all at once. With reduced motion it does not play
// on its own: the poster shows, with ordinary controls to start it.
export function DemoVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const v = ref.current;
    if (!v || reduce) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.4 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      aria-label={label}
      muted
      loop
      playsInline
      preload="metadata"
      controls={!!reduce}
      className="block h-auto w-full"
    />
  );
}
