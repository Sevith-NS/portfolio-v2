// DRILL COVER. Every colour on the site lives here. Tailwind turns these into
// CSS variables and utilities (tailwind.config.ts); metadata and canvas code
// read the hex values directly. Nothing else in the codebase writes a colour.
//
// Black is true black, the colour an edit cuts to. Bone is the xerox paper
// and the white flash frame. Blood is for hits only: stamps, the REC dot, the
// playhead, marker strokes. Never small text on black (contrast).

type Rgb = readonly [number, number, number];

export const palette = {
  void: [0, 0, 0], // #000000 the page
  bone: [237, 234, 227], // #EDEAE3 xerox paper, text on black
  smoke: [140, 137, 132], // #8C8984 secondary text on black (5.9:1)
  soot: [28, 28, 28], // #1C1C1C rules and raised surfaces on black
  grit: [87, 83, 77], // #57534D secondary text on bone (6.4:1)
  dust: [207, 203, 194], // #CFCBC2 rules on bone
  blood: [208, 2, 27], // #D0021B the red marker
} as const satisfies Record<string, Rgb>;

export type Token = keyof typeof palette;

export const hex = (t: Token) => "#" + palette[t].map((c) => c.toString(16).padStart(2, "0")).join("").toUpperCase();
export const channels = (t: Token) => palette[t].join(" ");

// A scene is either a black page or a bone page (a negative). Components use
// the tone-relative colours (fg, bg, mute, line) so they read on either.
export const tones = {
  void: { bg: "void", fg: "bone", mute: "smoke", line: "soot" },
  bone: { bg: "bone", fg: "void", mute: "grit", line: "dust" },
} as const satisfies Record<string, Record<string, Token>>;
