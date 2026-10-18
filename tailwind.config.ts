import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import { channels, palette, tones, type Token } from "./lib/theme";

const fixed = Object.keys(palette) as Token[];
const relative = ["bg", "fg", "mute", "line"] as const;

const toneVars = (t: keyof typeof tones) =>
  Object.fromEntries(relative.map((r) => [`--${r}`, channels(tones[t][r])]));

const config = {
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Fixed colours (void, bone, blood...) and tone-relative ones (fg, bg, mute, line).
      colors: Object.fromEntries([
        ...fixed.map((t) => [t, `rgb(var(--${t}) / <alpha-value>)`]),
        ...relative.map((r) => [r, `rgb(var(--${r}) / <alpha-value>)`]),
      ]),
      fontFamily: {
        // Anton: the title card. Plex Mono: everything you read.
        display: ["var(--font-display)", "Impact", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        sans: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: { page: "1320px" },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        ":root": { ...Object.fromEntries(fixed.map((t) => [`--${t}`, channels(t)])), ...toneVars("void"), "color-scheme": "dark" },
        ".tone-void": toneVars("void"),
        ".tone-bone": toneVars("bone"),
      });
    }),
  ],
} satisfies Config;

export default config;
