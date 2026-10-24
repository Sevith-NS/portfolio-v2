import type { Block } from "@/data/work";

export const dev = process.env.NODE_ENV === "development";

// Prompts written to Sevith never ship: in production they're filtered out, and a
// section left with nothing but prompts doesn't render at all.
export const live = <T extends { todo?: boolean }>(blocks: T[]) => (dev ? blocks : blocks.filter((b) => !b.todo));

// A question the data can't answer, parked where the answer belongs. Dev only.
export const Prompt = ({ b, as: As = "li" }: { b: Block; as?: "li" | "div" }) => (
  <As className="rounded-2xl border border-dashed border-accent/60 bg-sheet/60 p-4">
    <p className="label text-accent">your turn</p>
    <p className="mt-1.5 text-[0.9375rem] italic leading-relaxed text-ink-2">{b.text}</p>
  </As>
);
