"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { projects } from "@/data";
import { stack, webp } from "@/lib/work";
import { TransitionLink } from "./transition/TransitionLink";
import { Reveal } from "./motion/Reveal";
import { BrowserFrame } from "./ui/BrowserFrame";

// One project: a screenshot dressed in a browser frame (Q97), and the only light
// on the plate is its own screen spilling onto the surface (Q123). It leans
// toward the cursor. Plates
// scroll past one after another, so each one's outcome and stack stay readable.
function Plate({ p, index, total }: { p: (typeof projects)[number]; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [3, -3]), { stiffness: 160, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), { stiffness: 160, damping: 20 });
  const img = webp(p.img);

  return (
    <article>
      <div className="relative mx-auto w-full max-w-[58rem]">
        <TransitionLink href={`/work/${p.slug}`} label={p.title} className="group block" data-cursor="View case">
          <div
            ref={ref}
            onPointerMove={(e) => {
              const r = ref.current!.getBoundingClientRect();
              mx.set((e.clientX - r.left) / r.width - 0.5);
              my.set((e.clientY - r.top) / r.height - 0.5);
            }}
            onPointerLeave={() => {
              mx.set(0);
              my.set(0);
            }}
            className="liquid overflow-hidden px-5 pt-10 [perspective:1200px] sm:px-12 sm:pt-14"
          >
            {img && (
              // The plate's background is its own screenshot, blurred under the glass, so every project gets its own colour.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img}
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 h-full w-full scale-125 object-cover opacity-70 blur-2xl saturate-150 transition-opacity duration-700 group-hover:opacity-90"
              />
            )}

            <motion.div
              style={{ rotateX: rx, rotateY: ry }}
              className="relative mx-auto transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [transform-style:preserve-3d] group-hover:-translate-y-2"
            >
              <BrowserFrame url={p.link}>
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={`${p.title} screenshot`}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="block h-auto w-full"
                  />
                ) : (
                  <div className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-5 px-6">
                    <p className="font-wide text-4xl font-semibold uppercase tracking-[-0.01em] text-ink md:text-6xl">{p.title}</p>
                    <div className="flex max-w-[36rem] flex-wrap justify-center gap-2">
                      {(p.parts ?? []).map((part) => (
                        <span key={part} className="rounded-full border border-rule px-3 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-2">
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </BrowserFrame>
            </motion.div>

            <span aria-hidden className="absolute left-5 top-4 font-mono text-[0.6875rem] tracking-[0.14em] text-ink-3 sm:left-7 sm:top-5">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>

          <p className="mt-7 max-w-[36ch] text-[1.45rem] font-medium leading-[1.2] tracking-[-0.025em] text-ink [text-wrap:pretty] md:text-[1.85rem]">
            {p.outcome}
          </p>
          <ul className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[0.75rem] uppercase tracking-[0.1em] text-ink-3">
            {[p.title, ...(p.year ? [p.year] : []), ...stack(p.iconLists).slice(0, 3)].map((t, k) => (
              <li key={t} className="flex items-center gap-2.5">
                {k > 0 && <span aria-hidden className="text-ink-3/60">/</span>}
                {t}
              </li>
            ))}
          </ul>
        </TransitionLink>
      </div>
    </article>
  );
}

const Projects = () => {
  return (
    <section id="projects" className="mx-auto max-w-page px-4 pb-24 pt-16 md:px-8 md:pt-8">
      <Reveal className="mx-auto mb-16 max-w-[48rem] text-center md:mb-24">
        <p className="font-mono text-[0.75rem] uppercase tracking-[0.18em] text-accent">The work</p>
        <h2 className="mt-5 font-wide text-[clamp(2rem,5vw,4rem)] font-semibold uppercase leading-[1] tracking-[-0.01em] text-ink">
          <span className="block">Designed it.</span>
          <span className="block">Built it.</span>
          <span className="block text-warm">Shipped it.</span>
        </h2>
      </Reveal>
      <div className="flex flex-col gap-24 md:gap-16">
        {projects.map((p, i) => (
          <Plate key={p.slug} p={p} index={i} total={projects.length} />
        ))}
      </div>
    </section>
  );
};

export default Projects;
