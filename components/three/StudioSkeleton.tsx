// Shown while the studio's code and models load: the room's silhouette, so the space never jumps.
export function StudioSkeleton({ label = "Loading the studio" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="absolute inset-0 grid place-items-center bg-sheet">
      <svg viewBox="0 0 200 150" className="h-[70%] max-h-[26rem] w-auto motion-safe:animate-pulse" aria-hidden>
        {/* back walls */}
        <path d="M100 20 L170 55 L170 95 L100 60 Z" fill="rgb(var(--rule))" opacity="0.7" />
        <path d="M100 20 L30 55 L30 95 L100 60 Z" fill="rgb(var(--rule))" opacity="0.45" />
        {/* floor */}
        <path d="M100 60 L170 95 L100 130 L30 95 Z" fill="rgb(var(--rule))" />
        {/* a desk and a figure, as blocks */}
        <path d="M108 78 L132 90 L120 96 L96 84 Z" fill="rgb(var(--paper))" />
        <rect x="104" y="92" width="10" height="16" fill="rgb(var(--paper))" />
      </svg>
      <p className="label absolute bottom-5 left-5 text-ink-3">{label}</p>
    </div>
  );
}
