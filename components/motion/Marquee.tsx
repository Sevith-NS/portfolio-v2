"use client";

import { Children, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "framer-motion";
import { cn } from "@/lib/utils";

// A band that drifts on its own and takes the scroll's speed and direction with it:
// flick down and it runs faster, scroll up and it turns around.
export function Marquee({
  children,
  speed = 2,
  reverse = false,
  className,
  label,
}: {
  children: React.ReactNode;
  speed?: number;
  reverse?: boolean;
  className?: string;
  label?: string;
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  // Four copies, so one copy is 25% of the track: wrapping over that span is seamless.
  const x = useTransform(baseX, (v) => `${wrap(-50, -25, v)}%`);
  const direction = useRef(reverse ? -1 : 1);
  const still = useReducedMotion();

  useAnimationFrame((_, delta) => {
    if (still) return;
    let move = direction.current * speed * (delta / 1000);
    const f = factor.get();
    if (f < 0) direction.current = reverse ? 1 : -1;
    else if (f > 0) direction.current = reverse ? -1 : 1;
    move += direction.current * move * f;
    baseX.set(baseX.get() + move);
  });

  // Four copies so the band never runs out; only the first one is read aloud.
  const copies = [0, 1, 2, 3];
  return (
    <div className={cn("relative flex overflow-hidden", className)} role={label ? "group" : undefined} aria-label={label}>
      <motion.div style={{ x }} className="flex shrink-0 will-change-transform">
        {copies.map((c) => (
          <div key={c} aria-hidden={c > 0} className="flex shrink-0 items-center">
            {Children.toArray(children)}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
