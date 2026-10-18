// The edit's cut bus. Anything can call cut() to throw frames at the full-screen
// flash layer (components/edit/CutLayer.tsx): a white frame, a black frame, a
// negative, a blood frame. One frame is one beat of a 30fps edit. The scene
// director also announces which scene is on screen, for the timeline bar.

export type Frame = "white" | "black" | "invert" | "blood" | "clear";

export const FRAME_MS = 34;

// Ready-made bursts, picked per scene so no two cuts in a row feel the same.
export const BURSTS: Frame[][] = [
  ["invert", "clear", "invert"],
  ["white", "clear"],
  ["black", "black", "invert"],
  ["blood", "black"],
  ["white", "invert", "clear", "white"],
];

export type CutDetail = { frames: Frame[]; scene?: string; index?: number };

export function cut(frames: Frame[], scene?: string, index?: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<CutDetail>("cut", { detail: { frames, scene, index } }));
}
