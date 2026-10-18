"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

// The cut of the reel, looping silently under the title card: photocopied,
// half-toned, sunk into the black. Reduced motion gets the still.
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (reduce) v.pause();
    else v.play().catch(() => {});
  }, [reduce]);

  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      <video
        ref={ref}
        src="/reel/reel.mp4"
        poster="/reel/reel-poster.jpg"
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        className="size-full object-cover opacity-40 [filter:grayscale(1)_contrast(1.5)]"
      />
      <div className="fx-dots absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/70 to-void/10" />
    </div>
  );
}
