"use client";

import { useRef } from "react";
import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity, type MotionValue } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { projects } from "@/data";
import { webp } from "@/lib/work";
import { EASE } from "@/lib/utils";
import { TransitionLink } from "./transition/TransitionLink";
import { Reveal } from "./motion/Reveal";
import { Rise } from "./motion/Rise";

const GLIDE = { stiffness: 90, damping: 20, mass: 0.7 };

// One project, after Lusion's featured work: the project's own screenshot in a frame
// that holds still. Under the cursor the picture drifts inside the frame, pushes in a
// touch, and drops out of focus while the cursor moves fast, then pulls sharp. The
// frame only gives with the scroll, like a sheet of card, and lies flat when the page
// rests. On hover an arrow slides in and nudges the name along. `data-zoom` marks the
// frame the page pushes into when the project is opened (TransitionProvider), and
// `data-quiet` what lets go first.
type Shot = { w: number; h: number };

function Plate({ p, index, shot, bend, lean }: { p: (typeof projects)[number]; index: number; shot?: Shot; bend: MotionValue<number>; lean: MotionValue<number> }) {
  const still = useReducedMotion();
  const img = webp(p.img);
  // The two columns lean opposite ways, so a row bows like one sheet.
  const skewY = useTransform(lean, (v) => (index % 2 ? -v : v));

  const mx = useMotionValue(0), my = useMotionValue(0), on = useMotionValue(0), blur = useMotionValue(0);
  const sx = useSpring(mx, GLIDE), sy = useSpring(my, GLIDE), hover = useSpring(on, GLIDE);
  // At rest the picture fits its frame exactly, nothing cut off. Under the cursor it pushes in
  // a touch, which is the room it drifts in, so the drift never shows an edge.
  const drift = useTransform(hover, [0, 1], [0, 5]);
  const x = useTransform([sx, drift], ([v, d]: number[]) => `${-v * d}%`);
  const y = useTransform([sy, drift], ([v, d]: number[]) => `${-v * d}%`);
  const scale = useTransform(hover, [0, 1], [1, 1.06]);
  const filter = useMotionTemplate`blur(${blur}px)`;
  const last = useRef({ x: 0, y: 0, t: 0 });

  return (
    <article>
      <TransitionLink href={`/work/${p.slug}`} className="group block" data-cursor="View case">
        <motion.div
          data-zoom
          // The frame is cut to the screenshot's own size (read on the server, lib/size.ts).
          style={{ aspectRatio: shot ? `${shot.w} / ${shot.h}` : "2 / 1", ...(still ? {} : { rotateX: bend, skewY, transformPerspective: 1400 }) }}
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse" || still) return;
            const r = e.currentTarget.getBoundingClientRect(), l = last.current;
            mx.set((e.clientX - r.left) / r.width - 0.5);
            my.set((e.clientY - r.top) / r.height - 0.5);
            on.set(1);
            // The faster the cursor, the softer the picture; it pulls sharp as soon as you slow.
            const speed = Math.hypot(e.clientX - l.x, e.clientY - l.y) / Math.max(8, e.timeStamp - l.t);
            if (l.t) blur.set(Math.min(7, Math.max(blur.get(), speed * 1.7)));
            animate(blur, 0, { duration: 0.7, ease: EASE });
            last.current = { x: e.clientX, y: e.clientY, t: e.timeStamp };
          }}
          onPointerLeave={() => {
            mx.set(0);
            my.set(0);
            on.set(0);
            last.current.t = 0;
          }}
          className="relative overflow-hidden rounded-[1.25rem] bg-sheet"
        >
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <motion.img
              src={img}
              alt={`${p.title} screenshot`}
              loading={index < 2 ? "eager" : "lazy"}
              style={still ? undefined : { x, y, scale, filter }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <p className="absolute inset-0 grid place-items-center font-wide text-4xl font-semibold uppercase text-ink">{p.title}</p>
          )}
        </motion.div>

        {/* Like Lusion's: the role tags, then the title. */}
        <div data-quiet>
          <ul className="mt-5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.8125rem] uppercase text-ink">
            {p.tags.map((t, k) => (
              <li key={t} className="flex items-center gap-1.5">
                {k > 0 && <span aria-hidden>•</span>}
                {t}
              </li>
            ))}
          </ul>
          <h3 className="mt-2 flex items-center overflow-hidden font-wide text-[1.75rem] font-semibold uppercase leading-[1.15] tracking-[-0.01em] text-ink md:text-[clamp(2rem,3.2vw,3.25rem)]">
            <ArrowRight
              aria-hidden
              weight="bold"
              className="-ml-[1.05em] mr-[0.25em] size-[0.8em] shrink-0 text-warm opacity-0 transition-[margin,opacity] duration-500 ease-[cubic-bezier(0.35,0,0,1)] group-hover:ml-0 group-hover:opacity-100 group-focus-visible:ml-0 group-focus-visible:opacity-100"
            />
            {p.title}
          </h3>
        </div>
      </TransitionLink>
    </article>
  );
}

const Projects = ({ shots }: { shots: Record<string, Shot> }) => {
  // How fast the page is moving, smoothed: the cards bend with it and settle after.
  const { scrollY } = useScroll();
  const speed = useSpring(useVelocity(scrollY), { stiffness: 110, damping: 22, mass: 0.6 });
  const bend = useTransform(speed, [-3000, 3000], [9, -9]);
  const lean = useTransform(speed, [-3000, 3000], [-1.8, 1.8]);

  return (
    <section id="projects" className="px-4 pb-24 md:px-[5vw]">
      {/* Lusion's grid marks along the top edge, in quarters. */}
      <div className="relative h-[3.2rem]">
        {[0, 25, 50, 75, 100].map((left) => (
          <span key={left} aria-hidden className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[1.1rem] font-light leading-none text-ink" style={{ left: `${left}%` }}>
            +
          </span>
        ))}
      </div>
      {/* Lusion's "Featured Work": the heading on the left, the small caps label on the grid's last quarter. */}
      <div data-quiet className="mb-12 mt-[10vh] flex flex-col gap-5 md:mb-16 md:mt-[18vh] md:flex-row md:items-start md:justify-between">
        <h2 className="font-wide text-[clamp(2.4rem,7vw,9rem)] font-semibold uppercase leading-[0.98] tracking-[-0.01em] text-ink">
          <Rise lines={["Designed it.", "Built it.", "*Shipped it.*"]} />
        </h2>
        <Reveal className="order-first md:order-none md:mt-[2.6vw] md:w-1/4">
          <p className="text-[0.8125rem] uppercase text-ink">The work</p>
        </Reveal>
      </div>
      <div className="grid gap-x-6 gap-y-14 md:grid-cols-2 md:gap-x-8 md:gap-y-20">
        {projects.map((p, i) => (
          <Plate key={p.slug} p={p} index={i} shot={shots[p.slug]} bend={bend} lean={lean} />
        ))}
      </div>
    </section>
  );
};

export default Projects;
