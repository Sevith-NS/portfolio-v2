import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import { Palette, band, dark, light } from "./lib/theme";

const config = {
  darkMode: ["class"],
  content: [
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Every colour comes from lib/theme.ts as an rgb(var(--token)) utility.
      colors: Object.fromEntries(
        Palette.tokens.map((t) => [t, `rgb(var(--${t}) / <alpha-value>)`]),
      ),
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        // Archivo on its width axis: the wide geometric caps voice.
        wide: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        // Neue Montreal, subset to "sevith.": the footer wordmark and nothing else.
        mark: ["var(--font-mark)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: {
        page: "1240px",
      },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({ ":root": light.vars(), ".dark": dark.vars(), ".band": band.light.vars(), ".dark .band": band.dark.vars() });
    }),
  ],
} satisfies Config;

export default config;
