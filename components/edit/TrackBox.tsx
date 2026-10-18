import { cn } from "@/lib/utils";

// A motion-tracking box, the kind an editor leaves on a face in the esdee cut:
// corner ticks, a crosshair, coordinates. Decoration only. Takes the current
// text colour, so set it with a text-* class.
export function TrackBox({ x, y, label, className }: { x: number; y: number; label?: string; className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute text-bone", className)}>
      <div className="relative size-full">
        <span className="absolute left-0 top-0 size-3 border-l-2 border-t-2 border-current" />
        <span className="absolute right-0 top-0 size-3 border-r-2 border-t-2 border-current" />
        <span className="absolute bottom-0 left-0 size-3 border-b-2 border-l-2 border-current" />
        <span className="absolute bottom-0 right-0 size-3 border-b-2 border-r-2 border-current" />
        <span className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-current opacity-70" />
        <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 bg-current opacity-70" />
        <span className="absolute -top-5 left-0 whitespace-nowrap font-mono text-[0.625rem] tabular-nums">
          x: {x} y: {y}
        </span>
        {label && <span className="absolute -bottom-5 left-0 whitespace-nowrap bg-blood px-1 font-mono text-[0.625rem] text-bone">{label}</span>}
      </div>
    </div>
  );
}
