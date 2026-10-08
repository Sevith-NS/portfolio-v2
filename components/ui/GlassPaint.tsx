"use client";

import { useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

// A solid layer that only shows through a circle of "clear glass" that follows
// the cursor, like wiping condensation off a window. Hover-only, no scroll tie-in.
export function GlassPaint({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [active, setActive] = useState(false);

  const handleMove = (e: MouseEvent<HTMLSpanElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  return (
    <span
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      data-on={active}
      style={{ "--gx": `${pos.x}%`, "--gy": `${pos.y}%` } as CSSProperties}
      className={cn("glass-paint", className)}
    >
      {children}
    </span>
  );
}
