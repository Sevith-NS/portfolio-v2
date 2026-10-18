import { cn } from "@/lib/utils";

// A torn paper edge where a black scene meets a bone one: a ragged strip in
// the colour of the scene it belongs to, overlapping the one before it.
// Deterministic points, so server and client draw the same tear.
function tear(seed: number, n = 48) {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const pts = ["0,100"];
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * 100;
    const y = 30 + rnd() * 55 + (i % 7 === 0 ? -20 : 0);
    pts.push(`${x.toFixed(2)},${y.toFixed(1)}`);
  }
  pts.push("100,100");
  return pts.join(" ");
}

export function Torn({ side = "top", tone, seed = 7, className }: { side?: "top" | "bottom"; tone: "void" | "bone"; seed?: number; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn(
        "pointer-events-none absolute inset-x-0 z-[1] h-6 w-full md:h-10",
        side === "top" ? "bottom-full -mb-px" : "top-full -mt-px rotate-180",
        tone === "bone" ? "text-bone" : "text-void",
        className
      )}
    >
      <polygon points={tear(seed)} fill="currentColor" />
    </svg>
  );
}
