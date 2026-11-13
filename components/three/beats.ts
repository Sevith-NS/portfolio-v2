// The closing flight's timetable, beat for beat after Lusion's (C:/Users/asus/Desktop/astro.mp4,
// timed there in seconds; one second there is about 0.43 screens of scroll here), stored as
// shares of the pinned run. Kept apart from the scene so the page can read it without three.js.
// Before the run, the tablet zooms and tilts until it fills the screen (`grow` in Space.tsx).
export const RUN = 12.5;
const at = (a: number, b: number) => [a / RUN, b / RUN] as const;

export const BEATS = {
  gesture: at(0, 0.7), // full screen: he floats close to you, gesturing
  stars: at(0.3, 1.4), // the stars thin out
  words: at(0.68, 2.98), // the line: fades in, holds, spreads, then the camera zooms through 2AM.
  turn: at(1.02, 1.74), // behind the line he turns his back and sinks away
  fall: at(1.02, 2.98), // away into the dark, tiny by the end of the zoom
  ring: at(1.28, 3.7), // the double ring, gone as the lattice opens
  lattice: at(3.66, 7.17), // white glass, then pink and teal, then green, twisting into triangles at the end
  split: at(4.6, 8.4), // faint copies of him and the cats appear about the tunnels
  cages: at(7.17, 8.66), // a hard cut to the pink geodesic tunnel, brighter until it blows out
  flash: at(8.4, 8.95), // white
  room: at(8.7, 9.74), // the spin round the glass cube, smeared with speed, then into it
  corridor: at(9.74, 9.92), // the paw corridor, him walking toward you
  screen: at(9.92, 10.08), // it pulls back into a screen in the dark
  shatter: at(10.2, 11.0), // the glass cracks, he pushes through, it flies past
  lift: at(10.81, 11.11), // the screen slides up out of frame
  land: at(10.95, 11.4), // he lands in a crouch
  wave: at(11.45, 12.4), // he stands and waves; the stickers and the glitter burst round him
  end: at(11.6, 12.4), // the end line
} as const;

// 0 before `a`, 1 after `b`, eased in between.
export const ramp = ([a, b]: readonly [number, number], p: number) => {
  const t = Math.min(1, Math.max(0, (p - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// The same share, unshaped.
export const span = ([a, b]: readonly [number, number], p: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));

// 1 inside [a, b], easing in and out over `edge` at each end.
export const within = ([a, b]: readonly [number, number], p: number, edge = 0.02) => ramp([a - edge, a + edge], p) * (1 - ramp([b - edge, b + edge], p));
