"use client";

import { useState, type CSSProperties } from "react";

// Every voice the site is set in, with its one job. Type anything, set the
// size, flip the italic. Has to match what layout.tsx actually loads.
const faces = [
  { name: "Archivo, run wide", role: "Headlines. Geometric all-caps, stretched on its width axis.", className: "font-wide uppercase font-semibold" },
  { name: "Bodoni Moda", role: "Statements and the odd word that needs a raised eyebrow.", className: "font-serif", italic: true },
  { name: "Geist", role: "Body copy. Neutral, precise, gets out of the way.", className: "font-sans" },
  { name: "Geist Mono", role: "Labels and numbers.", className: "font-mono uppercase" },
];

export function TypeSpecimen() {
  const [text, setText] = useState("Goated taste");
  const [size, setSize] = useState(48);
  const [italic, setItalic] = useState(true);

  return (
    <div className="rounded-[1.75rem] border border-rule bg-sheet p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="specimen" className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">
            Type anything
          </label>
          <input
            id="specimen"
            value={text}
            maxLength={48}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-w-0 rounded-xl border border-rule bg-paper px-4 py-2.5 text-base text-ink outline-none focus:border-accent sm:w-72"
          />
        </div>
        <div className="flex items-end gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="size" className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">
              Size {size}px
            </label>
            <input
              id="size"
              type="range"
              min={24}
              max={72}
              step={1}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-32 accent-[rgb(var(--ink))]"
            />
          </div>
          <button
            type="button"
            aria-pressed={italic}
            onClick={() => setItalic((v) => !v)}
            className={`h-9 rounded-full border px-3.5 font-serif text-base italic transition-colors ${
              italic ? "border-ink bg-ink text-paper" : "border-rule text-ink-2 hover:border-ink"
            }`}
          >
            Italic
          </button>
        </div>
      </div>

      <ul className="mt-6">
        {faces.map((f) => (
          <li key={f.name} className="border-t border-rule py-5">
            <p
              className={`${f.className} break-words leading-tight tracking-[-0.01em] text-ink ${f.italic && italic ? "italic" : ""}`}
              style={{ fontSize: `clamp(1.5rem, ${size / 16}rem, 12vw)` } as CSSProperties}
            >
              {text || "Aa"}
            </p>
            <p className="mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3">
              {f.name} <span className="text-ink-3/60">/</span> {f.role}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
