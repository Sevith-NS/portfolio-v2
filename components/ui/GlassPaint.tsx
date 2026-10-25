"use client";

import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

// A solid layer that only shows through a circle of "clear glass" that follows
// the cursor or a finger, like wiping condensation off a window. Sideways
// drags wipe; vertical ones still scroll the page.
export function GlassPaint({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [active, setActive] = useState(false);

  const handleMove = (e: PointerEvent<HTMLSpanElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  return (
    <span
      ref={ref}
      onPointerMove={handleMove}
      onPointerDown={handleMove}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      data-on={active}
      style={{ "--gx": `${pos.x}%`, "--gy": `${pos.y}%` } as CSSProperties}
      className={cn("glass-paint touch-pan-y", className)}
    >
      {children}
    </span>
  );
}
