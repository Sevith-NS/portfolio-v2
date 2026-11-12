// The closing scene's timetable, as shares of the scroll down the section. Kept apart
// from the scene itself so the page can read it without loading three.js.
export const BEATS = {
  open: [0, 0.14], // the card opens out to the whole screen
  words: [0.12, 0.4], // the line of type, then it spreads and flies past
  away: [0.2, 0.44], // the astronaut falls back into the distance
  tunnel: [0.36, 0.76], // the flight down the tunnel
  back: [0.72, 0.92], // the astronaut returns, close, and waves
} as const;

// 0 before `a`, 1 after `b`, eased in between.
export const ramp = ([a, b]: readonly [number, number], p: number) => {
  const t = Math.min(1, Math.max(0, (p - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
