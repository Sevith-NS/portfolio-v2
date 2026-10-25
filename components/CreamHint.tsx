"use client";

import { useEffect, useState } from "react";

// The easter egg, spelled out: five keys that light up as you type C-R-E-A-M
// anywhere on the page. Each tap on them types the next letter, for phones.
export function CreamHint() {
  const [lit, setLit] = useState(0);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const on = (e: Event) => {
      const n = (e as CustomEvent<number>).detail;
      setLit(n);
      clearTimeout(t);
      // Let a finished word glow for a moment, and let a half-typed one fade.
      t = setTimeout(() => setLit(0), n === 5 ? 1400 : 2500);
    };
    window.addEventListener("cream-progress", on);
    return () => {
      window.removeEventListener("cream-progress", on);
      clearTimeout(t);
    };
  }, []);

  return (
    <p className="note inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <span>
        psst: <span className="[@media(hover:none)]:hidden">type</span>
        <span className="hidden [@media(hover:none)]:inline">tap</span>
      </span>
      <button
        type="button"
        // Typed from the body, so EasterEggs counts it like a real key.
        onClick={() => document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "cream"[lit % 5], bubbles: true }))}
        aria-label="Type the next letter of cream, the naughty cat's name. You can also type cream anywhere on the page."
        className="inline-flex gap-1"
      >
        {"CREAM".split("").map((ch, i) => (
          <kbd
            key={i}
            className={`grid size-6 place-items-center rounded-md border font-mono text-[0.6875rem] font-semibold shadow-[0_2px_0_rgb(var(--rule))] transition-colors duration-150 ${
              i < lit ? "border-lamp bg-lamp text-on-hl" : "border-rule bg-paper text-ink-2"
            }`}
          >
            {ch}
          </kbd>
        ))}
      </button>
      <span className="[@media(hover:none)]:hidden">on your keyboard, anywhere on the page. No box needed, just type.</span>
      <span className="hidden [@media(hover:none)]:inline">the keys, one letter at a time.</span>
    </p>
  );
}
