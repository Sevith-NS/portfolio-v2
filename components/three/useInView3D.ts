"use client";

import { useEffect, useState } from "react";

// Pause WebGL work while a canvas is off screen.
export function useInView3D(ref: React.RefObject<Element>, margin = "200px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return inView;
}

// Read a token from :root so the scene follows the active theme.
export function cssColor(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? `rgb(${v.split(" ").join(",")})` : fallback;
}
