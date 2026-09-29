"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";

// New pages start at the top (or at their #hash), with no smooth glide from the old position.
function RouteReset() {
  const lenis = useLenis();
  const pathname = usePathname();
  useEffect(() => {
    if (!lenis) return;
    const hash = window.location.hash;
    if (hash) {
      const el = document.querySelector(hash);
      if (el) lenis.scrollTo(el as HTMLElement, { offset: -88, immediate: true });
    } else {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname, lenis]);
  return null;
}

// Momentum scrolling, like a well-oiled trackpad. Off entirely for reduced motion.
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "auto";
  }, []);
  if (reduce) return <>{children}</>;
  return (
    <ReactLenis root options={{ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true, anchors: { offset: -88 } }}>
      <RouteReset />
      {children}
    </ReactLenis>
  );
}
