import { cn } from "@/lib/utils";

export type Fx = "raw" | "mono" | "neg" | "duo" | "split";

// A still with an edit treatment: photocopy (mono), negative, blood duotone,
// or a mono plate with a red copy slipped a frame sideways (split). Fills its
// positioned parent.
export function Xerox({ src, fx, alt = "", className, pos = "50% 30%", eager }: { src: string; fx: Fx; alt?: string; className?: string; pos?: string; eager?: boolean }) {
  const img = (cls: string, hidden = false) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={hidden ? "" : alt}
      aria-hidden={hidden || undefined}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      style={{ objectPosition: pos }}
      className={cn("absolute inset-0 size-full object-cover", cls)}
    />
  );
  return (
    <div className={cn("absolute inset-0 isolate overflow-hidden", fx === "duo" && "bg-blood", className)}>
      {fx === "raw" && img("")}
      {fx === "mono" && img("fx-mono")}
      {fx === "neg" && img("fx-neg")}
      {fx === "duo" && img("fx-duo")}
      {fx === "split" && (
        <>
          {img("fx-mono")}
          <div className="absolute inset-0 translate-x-[1.6%] bg-blood opacity-70 mix-blend-screen">{img("fx-duo", true)}</div>
        </>
      )}
      {(fx === "mono" || fx === "split") && <div className="fx-dots absolute inset-0" />}
    </div>
  );
}
