import type { Config } from "tailwindcss";

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
      colors: {
        paper: "rgb(var(--paper) / <alpha-value>)",
        sheet: "rgb(var(--sheet) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        "ink-2": "rgb(var(--ink-2) / <alpha-value>)",
        "ink-3": "rgb(var(--ink-3) / <alpha-value>)",
        rule: "rgb(var(--rule) / <alpha-value>)",
        hl: "rgb(var(--hl) / <alpha-value>)",
        "on-hl": "rgb(var(--on-hl) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        tint: {
          sage: "rgb(var(--tint-sage) / <alpha-value>)",
          butter: "rgb(var(--tint-butter) / <alpha-value>)",
          blush: "rgb(var(--tint-blush) / <alpha-value>)",
          lapis: "rgb(var(--tint-lapis) / <alpha-value>)",
          stone: "rgb(var(--tint-stone) / <alpha-value>)",
          rose: "rgb(var(--tint-rose) / <alpha-value>)",
          mint: "rgb(var(--tint-mint) / <alpha-value>)",
          amber: "rgb(var(--tint-amber) / <alpha-value>)",
          garnet: "rgb(var(--tint-garnet) / <alpha-value>)",
          clover: "rgb(var(--tint-clover) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
      },
      maxWidth: {
        page: "1240px",
      },
    },
  },
} satisfies Config;

export default config;
