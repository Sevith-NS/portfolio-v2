"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { gridItems, heroNotes, ledger, selfPortrait } from "@/data";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./motion/Reveal";
import { TransitionLink } from "./transition/TransitionLink";
import { Scribble } from "./ui/Scribble";

const item = (id: number) => gridItems.find((g) => g.id === id)!;
const ease = [0.16, 1, 0.3, 1] as const;

const About = () => {
  const begin = item(6);
  const [active, setActive] = useState(0);
  const current = selfPortrait[active];

  return (
    <section id="about" className="mx-auto max-w-page px-4 py-20 md:px-8 md:py-28">
      <SectionHeader
        title="Product judgment, backed by shipping."
        note="Technical writer by title, product person by habit. Pick a facet."
      />

      <Reveal>
        {/* Facet nav: click a label, the headline below swaps. */}
        <div role="tablist" aria-label="About facets" className="mt-14 flex flex-wrap gap-x-7 gap-y-3  md:border-b border-rule pb-4">
          {selfPortrait.map((tab, i) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActive(i)}
              className="label relative pb-3"
            >
              <span className={i === active ? "text-accent" : "text-ink-3 transition-colors hover:text-ink"}>{tab.label}</span>
              {i === active && (
                <motion.span
                  layoutId="facet-underline"
                  className="absolute inset-x-0 -bottom-[0px] md:-bottom-[12px] lg:-bottom-[17px] h-[2px] bg-accent"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="relative mt-10 min-h-[14rem] md:mt-12 md:min-h-[16rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              id={`panel-${current.id}`}
              role="tabpanel"
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
              transition={{ duration: 0.5, ease }}
              className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
            >
              <div>
                <p className="max-w-[32ch] font-serif text-[1.9rem] leading-[1.18] tracking-[-0.015em] text-ink md:text-[2.75rem]">
                  {current.headline}
                </p>
                <p className="mt-5 max-w-[58ch] text-lg leading-relaxed text-ink-2">{current.body}</p>
              </div>
              <Scribble className="pointer-events-none shrink-0 -rotate-2 text-[2.75rem] sm:text-[3.5rem] lg:pr-4 lg:text-[4.5rem]">
                {current.tag}
              </Scribble>
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>

      {/* The timeline, oldest first, ending at what's next. */}
      <Reveal delay={0.05}>
        <ol aria-label="Timeline" className="mt-14 grid grid-cols-2 gap-x-4 gap-y-6 border-t border-rule pt-6 sm:grid-cols-3 lg:grid-cols-5">
          {heroNotes.map((n) => (
            <li key={n.when + n.what} className="flex gap-2.5">
              <span
                aria-hidden
                className={`mt-[7px] size-[7px] shrink-0 rounded-full ${n.highlight ? "bg-accent ring-4 ring-accent/15" : "border border-ink-3"}`}
              />
              <div>
                <p className="note">{n.when}</p>
                <p className={`mt-0.5 text-[0.9375rem] leading-snug ${n.highlight ? "font-semibold text-accent" : "text-ink"}`}>{n.what}</p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>

      {/* The ledger: resume numbers, nothing rounded up. */}
      <Reveal delay={0.08}>
        <dl className="mt-10 grid grid-cols-2 border-t border-rule md:grid-cols-4">
          {ledger.map((l, i) => (
            <div
              key={l.label}
              className={`flex flex-col gap-1 border-rule py-6 pr-4 ${i % 2 === 1 ? "border-l pl-4" : ""} ${
                i > 1 ? "border-t md:border-t-0" : ""
              } ${i === 2 ? "md:border-l md:pl-4" : ""}`}
            >
              <dt className="order-2 text-sm leading-snug text-ink-2">{l.label}</dt>
              <dd className="order-1 font-serif text-5xl tracking-[-0.02em] text-ink tabular">{l.value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-12 flex flex-col gap-5 rounded-[1.75rem] bg-sheet p-7 md:flex-row md:items-center md:justify-between md:p-10">
          <p className="font-serif text-2xl italic text-ink md:text-3xl">{begin.title}</p>
          <TransitionLink href="#contact" className="btn btn-primary self-start md:self-auto">
            Send a note <ArrowRight size={16} />
          </TransitionLink>
        </div>
      </Reveal>
    </section>
  );
};

export default About;
