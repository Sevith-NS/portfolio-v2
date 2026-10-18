"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { approach } from "@/data";
import { cut } from "@/lib/cut";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";
import { Copy } from "@/components/ui/Copy";

type Step = (typeof approach)[number];

// One phase as a sheet of bone paper: what it is, where it happened, and the
// working document it produced (real rows from my own products).
function Panel({ s, i, slam }: { s: Step; i: number; slam?: boolean }) {
  return (
    <article
      data-cut={slam ? "in" : undefined}
      data-cut-v="slam"
      className={cn("tone-bone flex h-full flex-col p-6 shadow-[0_30px_50px_-30px_rgb(var(--void))] md:p-7", ["md:-rotate-1", "md:rotate-[0.6deg]", "md:-rotate-[0.4deg]"][i])}
    >
      <p className="hud">phase {i + 1} of 3</p>
      <h3 className="title mt-3 text-[clamp(2.1rem,3.2vw,3.2rem)]">{s.title}</h3>
      <p className="mt-4 text-[0.875rem] leading-relaxed">
        <Copy text={s.des} />
      </p>
      <p className="mt-4 text-[0.8125rem]">
        <span className="font-semibold">In practice: </span>
        {s.proof}
      </p>
      <div className="mt-auto pt-6">
        <p className="hud border-b-2 border-fg pb-2 text-fg">{s.artifact.heading.toLowerCase()}</p>
        <ul>
          {s.artifact.rows.map((row, k) => (
            <li key={row.text} className="flex items-start gap-3 border-b border-line py-2.5 text-[0.8125rem] leading-snug">
              <span className={cn("mt-px shrink-0 px-1.5 text-[0.6875rem] font-semibold", k === 0 ? "bg-blood text-bone" : "border border-fg")}>{row.tag.toLowerCase()}</span>
              {row.text}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

// How I build, as a triptych: three panels pop in one by one as you scroll,
// like the three frames slammed side by side in the esdee cut. Phones get the
// panels stacked.
export default function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(1);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => setShown(Math.min(3, Math.floor(p * 3.4) + 1)));

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    cut(["invert", "clear"]);
  }, [shown]);

  return (
    <section id="process" data-scene="Process" className="tone-void relative">
      <div className="px-4 pt-28 md:px-6 md:pt-40">
        <Reveal className="mx-auto max-w-page">
          <h2 className="title cut-stagger text-[clamp(3.2rem,9vw,9rem)]">
            <span className="inline-block">Problem.</span> <span className="inline-block">Design.</span> <span className="inline-block">Build.</span>
          </h2>
          <p className="mt-6 max-w-[44ch] text-smoke">Same three steps every time, shown on my own products.</p>
        </Reveal>
      </div>

      <div ref={ref} className="relative hidden md:block" style={{ height: "240vh" }}>
        <div className="sticky top-0 flex h-[100svh] items-center px-6 pb-12 pt-20">
          <div className="mx-auto grid h-full max-h-[44rem] w-full max-w-page grid-cols-3 gap-6">
            {approach.map((s, i) =>
              i < shown ? (
                <Panel key={s.title} s={s} i={i} slam />
              ) : (
                <div key={s.title} className="hud grid place-items-center border border-dashed border-soot">
                  take {i + 1} loading
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <ol className="space-y-8 px-4 pb-24 pt-14 md:hidden">
        {approach.map((s, i) => (
          <Reveal as="li" key={s.title}>
            <Panel s={s} i={i} />
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
