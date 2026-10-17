// AFTER HOURS, lapis. The single source of truth for every colour on the
// site. Tailwind turns these into the CSS variables and utility classes
// (tailwind.config.ts); canvas, WebGL and metadata code reads the same
// Palette objects directly. Nothing else in the codebase writes a colour.
//
// Lapis is the only accent, in both modes. Light: oat page, black text, lapis
// #002DB4. Dark: a navy page with off-white text; lapis #2F5BFF fills carry off-white text and #809BFF is
// the small-text accent.

export type Side = "light" | "dark";

type Rgb = readonly [number, number, number];

const TOKENS = [
  "paper", // page
  "sheet", // raised surfaces: cards, footer, menus
  "ink", // body text
  "ink-2", // secondary text
  "ink-3", // tertiary text, still 4.5:1 on paper
  "ink-vader",
  "ink-potter",
  "rule", // hairlines, borders
  "hl", // highlight fills: selection, marker
  "on-hl", // text on hl and lamp fills
  "accent", // accent text: links, kickers, keywords
  "lamp", // accent fills: nav pill, cursor, active states
  "warm", // the lamp's big moments: "actually", the footer wordmark
  "deep", // deep accent tone
  "shade", // shadow colour
  "danger", // form errors
  "tint-sage",
  "tint-butter",
  "tint-blush",
  "tint-lapis",
  "tint-stone",
  "tint-rose",
  "tint-mint",
  "tint-amber",
  "tint-garnet",
  "tint-clover",
] as const;

export type Token = (typeof TOKENS)[number];

export class Palette {
  static readonly tokens = TOKENS;

  constructor(
    readonly side: Side,
    private readonly values: Record<Token, Rgb>,
  ) {}

  /** "r g b", the form the CSS variables hold. */
  channels(t: Token) {
    return this.values[t].join(" ");
  }

  /** "#RRGGBB", for canvas, WebGL and metadata. */
  hex(t: Token) {
    return "#" + this.values[t].map((c) => c.toString(16).padStart(2, "0")).join("").toUpperCase();
  }

  /** Every token as a CSS custom property, ready for a selector. */
  vars() {
    const out: Record<string, string> = { "color-scheme": this.side };
    for (const t of TOKENS) out[`--${t}`] = this.channels(t);
    return out;
  }
}

export const light = new Palette("light", {
  paper: [239, 233, 222], // #EFE9DE oat
  sheet: [247, 243, 236],
  ink: [26, 22, 18], // #1A1612
  "ink-2": [78, 70, 61],
  "ink-3": [112, 103, 92],
  "ink-vader": [217, 0, 0],
  "ink-potter": [116, 0, 1],
  rule: [221, 212, 198],
  hl: [0, 45, 180], // #002DB4 lapis
  "on-hl": [252, 250, 246],
  accent: [0, 45, 180],
  lamp: [0, 45, 180],
  warm: [0, 45, 180],
  deep: [20, 34, 100],
  shade: [0, 0, 0],
  danger: [178, 58, 12],
  "tint-sage": [213, 227, 218],
  "tint-butter": [234, 241, 198],
  "tint-blush": [245, 225, 218],
  "tint-lapis": [221, 227, 246],
  "tint-stone": [236, 236, 234],
  "tint-rose": [244, 222, 228],
  "tint-mint": [214, 238, 229],
  "tint-amber": [246, 230, 204],
  "tint-garnet": [248, 217, 212],
  "tint-clover": [200, 236, 208],
});

export const dark = new Palette("dark", {
  paper: [8, 16, 40], // #081028 navy
  sheet: [19, 21, 27],
  ink: [242, 238, 230],
  "ink-2": [176, 172, 164],
  "ink-3": [125, 123, 119],
  "ink-vader": [217, 0, 0],
  "ink-potter": [116, 0, 1],
  rule: [38, 41, 50],
  hl: [47, 91, 255], // #2F5BFF lapis, lifted for the dark
  "on-hl": [252, 250, 246],
  accent: [128, 155, 255], // #809BFF small-text lapis
  lamp: [47, 91, 255],
  warm: [128, 155, 255],
  deep: [26, 40, 120],
  shade: [0, 0, 0],
  danger: [255, 138, 91],
  "tint-sage": [24, 34, 32],
  "tint-butter": [36, 34, 24],
  "tint-blush": [44, 30, 30],
  "tint-lapis": [22, 28, 56],
  "tint-stone": [26, 28, 34],
  "tint-rose": [42, 26, 34],
  "tint-mint": [18, 36, 36],
  "tint-amber": [44, 30, 20],
  "tint-garnet": [48, 24, 26],
  "tint-clover": [16, 36, 26],
});

export const themes: Record<Side, Palette> = { light, dark };
