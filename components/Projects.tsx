"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { projects } from "@/data";
import { cn } from "@/lib/utils";
import { stack, webp } from "@/lib/work";
import { TransitionLink } from "./transition/TransitionLink";
import { Reveal } from "./motion/Reveal";
import { Scribble } from "./ui/Scribble";

// Soft pastel fields, fading to the page colour at the bottom.
const field: Record<string, string> = {
  lapis: "from-tint-lapis", sage: "from-tint-sage", stone: "from-tint-stone", butter: "from-tint-butter",
  blush: "from-tint-blush", mint: "from-tint-mint", rose: "from-tint-rose",
};

// A plate: the product rises out of a tinted field behind frosted glass, and leans toward the cursor.
function Plate({ p, index }: { p: (typeof projects)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 160, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), { stiffness: 160, damping: 20 });
  const img = webp(p.img);

  return (
    <Reveal as="article" className="mx-auto w-full max-w-[56rem]">
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
          className={cn(
            "relative aspect-[16/10] overflow-hidden rounded-[1.75rem] bg-gradient-to-b to-paper [perspective:1200px] sm:aspect-[16/9]",
            field[p.tint]
          )}
        >
          <motion.div style={{ rotateX: rx, rotateY: ry }} className="absolute inset-0 [transform-style:preserve-3d]">
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img}
                alt={`${p.title} screenshot`}
                loading={index === 0 ? "eager" : "lazy"}
                className="absolute left-1/2 top-[14%] w-[78%] -translate-x-1/2 rounded-xl object-cover object-top shadow-[0_30px_60px_-30px_rgb(0_0_0/0.45)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-4"
              />
            ) : (
              <div className="absolute inset-x-0 top-[12%] flex flex-col items-center gap-6 px-8 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-4">
                <p className="font-serif text-6xl tracking-[-0.03em] text-accent md:text-8xl">{p.title}</p>
                <div className="flex max-w-[40rem] flex-wrap justify-center gap-2">
                {(p.parts ?? []).map((part, k) => (
                  <span
                    key={part}
                    className="rounded-full bg-paper px-4 py-2 text-sm font-medium text-ink shadow-[0_10px_30px_-18px_rgb(0_0_0/0.4)]"
                    style={{ transform: `rotate(${(k % 3) - 1}deg)` }}
                  >
                    {part}
                  </span>
                ))}
                </div>
              </div>
            )}
          </motion.div>
          {/* Frosted glass over the lower half: the product fades into it. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] rounded-t-[1.75rem] border-t border-white/40 bg-paper/30 backdrop-blur-xl [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.55),#000_60%)] transition-opacity duration-500 group-hover:opacity-80" />
        </div>

        <p className="mt-7 max-w-[34ch] font-serif text-[1.65rem] italic leading-[1.2] tracking-[-0.01em] text-ink md:text-[2.15rem]">
          {p.outcome}
        </p>
        <ul className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.9375rem] font-medium text-ink-2">
          {[p.title, ...(p.year ? [p.year] : []), ...stack(p.iconLists).slice(0, 3)].map((t, k) => (
            <li key={t} className="flex items-center gap-2.5">
              {k > 0 && <span aria-hidden className="text-ink-3">·</span>}
              {t}
            </li>
          ))}
        </ul>
      </TransitionLink>
    </Reveal>
  );
}

const Projects = () => {
  const [first, ...rest] = projects;
  return (
    <section id="projects" className="mx-auto max-w-page px-4 pb-24 pt-10 md:px-8">
      <div className="flex flex-col gap-28 md:gap-40">
        <Plate p={first} index={0} />
        {rest.slice(0, 2).map((p, i) => (
          <Plate key={p.slug} p={p} index={i + 1} />
        ))}
        <Reveal className="mx-auto max-w-[40rem] text-center">
          <Scribble className="text-[2.2rem] leading-snug md:text-[3rem]">
            more builds below, each one taught me something
          </Scribble>
        </Reveal>
        {rest.slice(2).map((p, i) => (
          <Plate key={p.slug} p={p} index={i + 3} />
        ))}
      </div>
    </section>
  );
};

export default Projects;
