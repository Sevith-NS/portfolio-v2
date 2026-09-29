"use client";

import { useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { interests, nowLine } from "@/data";
import { SectionHeader } from "./SectionHeader";
import { TransitionLink } from "./transition/TransitionLink";
import { Scribble } from "./ui/Scribble";

const faces = [
  { name: "Libre Caslon Text", role: "Statements. A classic Caslon, warm in italic.", className: "font-serif", italic: true },
  { name: "Geist", role: "Body and labels. Neutral, precise, gets out of the way.", className: "font-sans" },
  { name: "Geist Mono", role: "Notes and numbers.", className: "font-mono" },
  { name: "Nothing You Could Do", role: "Margin scribbles.", className: "font-script" },
];

const OffTheClock = () => {
  const [text, setText] = useState("Curious, precise, warm.");
  const [size, setSize] = useState(48);
  const [italic, setItalic] = useState(true);
  const now = nowLine.filter((n) => n.value.trim());

  return (
    <section id="off-the-clock" className="mx-auto max-w-page px-4 py-20 md:px-8 md:py-24">
      <SectionHeader
        title="Off the clock."
        note="The things that make me a better builder, mostly by accident."
      />

      <div className="mt-12 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <ul className="flex flex-wrap gap-2.5" aria-label="Interests">
            {interests.map((t) => (
              <li
                key={t}
                className="rounded-full border border-rule bg-paper px-4 py-2 text-[0.9375rem] text-ink transition-colors hover:border-accent hover:text-accent"
              >
                {t}
              </li>
            ))}
          </ul>

          {now.length > 0 && (
            <dl className="mt-10 space-y-3 border-t border-rule pt-6">
              {now.map((n) => (
                <div key={n.label} className="flex items-baseline gap-4">
                  <dt className="note w-28 shrink-0">{n.label}</dt>
                  <dd className="text-ink">{n.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {/* A door into the 3D studio. */}
          <TransitionLink
            href="/studio"
            label="Studio"
            className="group mt-10 flex items-center justify-between gap-6 rounded-[1.75rem] bg-accent p-6 text-on-hl md:p-8"
          >
            <div>
              <p className="font-serif text-3xl font-normal tracking-[-0.02em]">Visit the studio</p>
              <p className="mt-1.5 max-w-[34ch] text-on-hl/80">A little 3D room of what I&apos;m up to. It changes every five minutes.</p>
            </div>
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-on-hl text-accent transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight size={20} />
            </span>
          </TransitionLink>
        </div>

        {/* Type specimen: type anything, set the size, flip the italic. */}
        <div className="rounded-[1.75rem] border border-rule bg-sheet p-5 md:p-8 lg:col-span-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="specimen" className="text-sm font-medium text-ink">
                Type specimen
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
                <label htmlFor="size" className="text-sm font-medium text-ink">
                  Size <span className="note">{size}px</span>
                </label>
                <input
                  id="size"
                  type="range"
                  min={24}
                  max={72}
                  step={1}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-32 accent-[rgb(var(--accent))]"
                />
              </div>
              <button
                type="button"
                aria-pressed={italic}
                onClick={() => setItalic((v) => !v)}
                className={`h-9 rounded-full border px-3.5 font-serif text-[0.9375rem] italic transition-colors ${
                  italic ? "border-accent bg-accent text-on-hl" : "border-rule text-ink-2 hover:border-ink"
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
                  style={{ fontSize: `clamp(1.5rem, ${size / 16}rem, 12vw)` }}
                >
                  {text || "Aa"}
                </p>
                <p className="note mt-2">
                  {f.name} · {f.role}
                </p>
              </li>
            ))}
          </ul>
          <Scribble className="mt-2 -rotate-2 text-2xl">certified type nerd</Scribble>
        </div>
      </div>
    </section>
  );
};

export default OffTheClock;
