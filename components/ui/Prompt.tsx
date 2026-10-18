import type { Block } from "@/data/work";

export const dev = process.env.NODE_ENV === "development";

// Prompts written to Sevith never ship: in production they're filtered out, and a
// section left with nothing but prompts doesn't render at all.
export const live = <T extends { todo?: boolean }>(blocks: T[]) => (dev ? blocks : blocks.filter((b) => !b.todo));

// A question the data can't answer, parked where the answer belongs. Dev only.
export const Prompt = ({ b, as: As = "li" }: { b: Block; as?: "li" | "div" }) => (
  <As className="border-2 border-dashed border-blood p-4">
    <p className="hud text-fg">your turn</p>
    <p className="mt-1.5 text-[0.875rem] italic leading-relaxed text-mute">{b.text}</p>
  </As>
);
