import { cn } from "@/lib/utils";

// Red marker, the hits on the fast-cut hyena: a loose loop, an underline
// swipe, or a cross. Drawn on in held frames when its Reveal cuts in (or when
// `on` is set). Paths use pathLength=1, see .marker in globals.css.
const PATHS = {
  circle: "M12 52 C 10 22, 60 6, 120 8 C 180 10, 198 34, 190 58 C 182 84, 120 96, 70 92 C 26 88, 6 70, 14 46 C 20 30, 44 20, 70 16",
  underline: "M4 18 C 50 8, 120 22, 196 10",
  cross: "M20 14 L 180 86 M 176 10 L 24 90",
};

export function Marker({ shape, className, on, delay }: { shape: keyof typeof PATHS; className?: string; on?: boolean; delay?: number }) {
  return (
    <svg
      aria-hidden
      viewBox={shape === "underline" ? "0 0 200 28" : "0 0 200 100"}
      preserveAspectRatio="none"
      data-on={on ? "" : undefined}
      style={delay !== undefined ? ({ "--marker-delay": `${delay}ms` } as React.CSSProperties) : undefined}
      className={cn("marker pointer-events-none absolute overflow-visible text-blood", className)}
    >
      <path d={PATHS[shape]} pathLength={1} fill="none" stroke="currentColor" strokeWidth={shape === "underline" ? 5 : 4} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
