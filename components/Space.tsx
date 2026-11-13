"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { useLenis } from "lenis/react";
import { ArrowDown } from "@phosphor-icons/react";
import { EASE } from "@/lib/utils";
import { Rise } from "./motion/Rise";
import { Line, type Route } from "./motion/Line";
import { useInView3D } from "./three/useInView3D";
import { BEATS, RUN, ramp, span, within } from "./three/beats";
import { Stickers } from "./Stickers";
import { Rush } from "./Rush";

const SpaceScene = dynamic(() => import("./three/SpaceScene"), { ssr: false });

// The close of the home page, after Lusion's "Where Creative Ideas Become Immersive
// Experiences": the heading, his motto beside a small tablet of the astronaut over Earth,
// and the lapis line looping behind them. Scroll on and the tablet's bezel drops away as it
// grows to fill the screen. The screen holds while the flight plays out (three/SpaceScene,
// timetable in three/beats): the line flies past word by word, he falls away inside a faint
// halo and the glass tunnel opens round him. The contact sheet (children) rises over the end.

const MOTTO = "I don't chase money. I chase a Porsche 911 GT3 RS. The money just has to keep up.";
// The line by row, like Lusion's: it spreads until each row spans the screen, then the camera
// zooms through the middle word, 2AM., which sits alone on the middle row.
const ROWS = [["Learn", "it", "at"], ["2am."], ["Ship", "it", "by", "morning."]];
const HERO = 3; // 2AM., counted across the rows

// Where an element sits in the viewport with no transform on it, from its layout.
function rest(el: HTMLElement, section: HTMLElement) {
  let x = 0, y = 0, n: HTMLElement | null = el;
  while (n && n !== section) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  const o = section.getBoundingClientRect();
  return { left: o.left + x, top: o.top + y };
}

// Like Lusion's: one wide sweep in from the left under the last work cards, a single round
// loop behind the heading's right end, then a long easy curve down past the motto and off
// the right edge beside the tablet. The loop is a true circle, so it stays round.
const ROUTE: Route = ({ W, vh, t, c }) => {
  const r = Math.max(0.1 * W, 64), cx = 0.76 * W, cy = t.t + t.h * 0.5;
  const loop: [number, number][] = Array.from({ length: 13 }, (_, k) => [cx + r * Math.sin((k / 12) * Math.PI * 2), cy + r * Math.cos((k / 12) * Math.PI * 2)]);
  return [
    [-0.05 * W, -0.05 * vh],
    [0.2 * W, 0.02 * vh],
    [0.44 * W, (0.02 * vh + cy + r) / 2],
    [cx - 0.12 * W, cy + r],
    ...loop,
    [cx + 0.13 * W, cy + r + 0.04 * vh],
    [0.97 * W, c.t + c.h * 0.2],
    [1.08 * W, c.t + c.h * 0.55],
  ];
};

function EndLine({ said, still = false }: { said: boolean; still?: boolean }) {
  return (
    <>
      <motion.p
        initial={false}
        animate={said ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 1.1, ease: EASE }}
        className="font-mono text-[0.75rem] uppercase tracking-[0.18em] text-ink-2"
      >
        Got a product that needs building?
      </motion.p>
      <h2 className="mt-5 font-wide text-[clamp(2.4rem,8vw,7rem)] font-semibold uppercase leading-[0.95] tracking-[-0.01em] text-ink">
        {said ? (
          <Rise lines={["Let's build", "something."]} delay={still ? 0 : 0.1} />
        ) : (
          <>
            <span className="sr-only">Let&apos;s build something.</span>
            <span aria-hidden className="invisible">
              <span className="block">Let&apos;s build</span>
              <span className="block">something.</span>
            </span>
          </>
        )}
      </h2>
    </>
  );
}

export default function Space({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion() ?? false;
  const section = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const slot = useRef<HTMLDivElement>(null);
  const run = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);
  const words = useRef<(HTMLSpanElement | null)[]>([]);
  const offs = useRef<number[]>([]); // how far each word moves to spread its row edge to edge, in px
  const line = useRef<HTMLParagraphElement>(null);
  const motto = useRef<HTMLParagraphElement>(null);
  const flash = useRef<HTMLDivElement>(null);

  const near = useInView3D(section, "400px");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (near) setLoaded(true);
  }, [near]);
  const [phone, setPhone] = useState(false);
  useEffect(() => setPhone(matchMedia("(max-width: 767px), (pointer: coarse)").matches), []);
  const [shown, setShown] = useState(false); // the card is on screen, so the scene draws
  const [said, setSaid] = useState(false);

  // 0 while the tablet sits in its slot, 1 once it fills the screen. Then the flight, 0 to 1 down the run.
  const { scrollYProgress: grow } = useScroll({ target: run, offset: ["start end", "start start"] });
  const { scrollYProgress: flight } = useScroll({ target: run, offset: ["start start", "end end"] });

  // The tablet lives in a fixed layer over its slot. Like Lusion's, the whole section (tablet,
  // heading, motto and line) then zooms toward the tablet as one plane, tilting a few degrees
  // in 3D, and straightens as the tablet's glass fills the screen. The scene renders at
  // full-screen size, scaled to cover the glass, so the tablet shows the same shot throughout.
  const place = useCallback(() => {
    const s = slot.current, c = card.current, sc = screen.current, v = view.current, l = layer.current, rn = run.current, sec = section.current;
    if (!s || !c || !sc || !v || !l || !rn || !sec) return;
    const W = window.innerWidth, H = window.innerHeight;
    const r = s.getBoundingClientRect();
    const bezel = r.width * 0.022, radius = r.width * 0.045;
    c.style.left = `${r.left}px`;
    c.style.top = `${r.top}px`;
    c.style.width = `${r.width}px`;
    c.style.height = `${r.height}px`;
    c.style.padding = `${bezel}px`;
    c.style.borderRadius = `${radius}px`;
    sc.style.borderRadius = `${Math.max(0, radius - bezel)}px`;
    const iw = r.width - 2 * bezel, ih = r.height - 2 * bezel;
    // The zoom: about the tablet's centre, to the scale where its glass covers the screen.
    const g = grow.get(), e = g * g * (3 - 2 * g), lean = Math.sin(Math.PI * e);
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const full = Math.max(W / iw, H / ih) * 1.03, z = 1 + (full - 1) * Math.pow(e, 1.7);
    const zoom = `translate3d(${(W / 2 - cx) * e}px, ${(H / 2 - cy) * e}px, 0) perspective(1400px) rotateX(${4 * lean}deg) rotateY(${-7 * lean}deg) rotateZ(${3 * lean}deg) scale(${z})`;
    // Like Lusion's, the shot grows with the glass only until it fills the screen, then sits 1:1:
    // the scene covers just the part of the glass that's on screen (a little over, for the
    // tilt), so at full zoom it's drawn at its own size, not magnified and soft.
    const gx = cx + (W / 2 - cx) * e, gy = cy + (H / 2 - cy) * e; // the glass's centre on screen
    const sx = Math.max(gx - Math.max(0, gx - (iw * z) / 2), Math.min(W, gx + (iw * z) / 2) - gx);
    const sy = Math.max(gy - Math.max(0, gy - (ih * z) / 2), Math.min(H, gy + (ih * z) / 2) - gy);
    const k = Math.min(Math.max(iw / W, ih / H), (Math.max((2 * sx) / W, (2 * sy) / H) / z) * (1.02 + 0.06 * lean));
    v.style.width = `${W}px`;
    v.style.height = `${H}px`;
    v.style.transform = `translate3d(${(iw - W * k) / 2}px, ${(ih - H * k) / 2}px, 0) scale(${k})`;
    const moved = [c, heading.current, motto.current, sec.firstElementChild as HTMLElement | null];
    moved.forEach((el, i) => {
      if (!el) return;
      const at = i === 0 ? { left: r.left, top: r.top } : rest(el, sec);
      el.style.transformOrigin = `${cx - at.left}px ${cy - at.top}px`;
      el.style.transform = g > 0 ? zoom : "";
    });
    // Off screen, or once the contact sheet covers it, the layer goes.
    const on = g > 0.001 ? rn.getBoundingClientRect().bottom > -120 : r.top < H && r.bottom > 0;
    l.style.visibility = on ? "visible" : "hidden";
    if (e > 0.92) l.setAttribute("data-header", "dark");
    else l.removeAttribute("data-header");
    setShown(on);
  }, [grow]);
  useLenis(place);
  useMotionValueEvent(grow, "change", place);
  useEffect(() => {
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [place, loaded]);

  // The line, the ring, the flash and the end line follow the flight. The line fades in over
  // him, its rows spread edge to edge, then the camera zooms through 2AM. as one plane.
  const fly = useCallback((f: number) => {
    const u = span(BEATS.words, f);
    const shown = ramp([0, 0.15], u), spread = ramp([0.46, 0.61], u), z = span([0.61, 1], u);
    const grey = 255 - 120 * ramp([0.7, 0.95], z);
    words.current.forEach((el, i) => {
      if (!el) return;
      el.style.transform = `translateX(${(offs.current[i] ?? 0) * spread}px)`;
      // The word you fly through greys and thins out as it passes the camera.
      el.style.opacity = String(i === HERO ? shown * (1 - ramp([0.82, 1], z)) : shown);
      if (i === HERO) el.style.color = `rgb(${grey} ${grey} ${grey})`;
    });
    if (line.current) {
      line.current.style.transform = `scale(${1 + 44 * Math.pow(z, 2.4)})`;
      line.current.style.visibility = u > 0 && u < 1 ? "visible" : "hidden";
    }
    if (halo.current) halo.current.style.opacity = String(within(BEATS.ring, f, 0.03));
    if (flash.current) {
      const [a, b] = BEATS.flash, mid = (a + b) / 2;
      flash.current.style.opacity = String(ramp([a, mid], f) * (1 - ramp([mid, b], f)));
    }
    setSaid(f > BEATS.end[0]);
  }, []);
  useMotionValueEvent(flight, "change", fly);
  useEffect(() => fly(flight.get()), [fly, flight]);
  // How far each word moves to spread its row edge to edge (justified across 92% of the
  // screen), and the zoom's centre on 2AM. Layout sizes, so the tablet's scale doesn't skew them.
  useEffect(() => {
    const measure = () => {
      const W = window.innerWidth * 0.92;
      offs.current = words.current.map((el) => {
        const row = el?.parentElement;
        if (!el || !row) return 0;
        const all = Array.from(row.children) as HTMLElement[];
        if (all.length < 2) return 0;
        const widths = all.map((w) => w.offsetWidth), gap = (W - widths.reduce((a, b) => a + b, 0)) / (all.length - 1);
        const i = all.indexOf(el);
        const target = -W / 2 + widths.slice(0, i).reduce((a, b) => a + b + gap, 0) + widths[i] / 2;
        return target - (el.offsetLeft + el.offsetWidth / 2 - (row.offsetLeft + row.offsetWidth / 2));
      });
      const hero = words.current[HERO];
      if (hero && line.current) line.current.style.transformOrigin = `${hero.offsetLeft + hero.offsetWidth / 2}px ${hero.offsetTop + hero.offsetHeight / 2}px`;
      fly(flight.get());
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [fly, flight, loaded]);

  let n = 0;
  return (
    <section ref={section} id="space" className="relative">
      <Line section={section} heading={heading} slot={slot} route={ROUTE} />
      <div className="relative px-4 pb-[8vh] pt-[24vh] md:px-[5vw]">
        <h2 ref={heading} className="relative z-20 font-wide text-[clamp(1.8rem,7vw,9rem)] font-semibold uppercase leading-[0.98] tracking-[-0.01em] text-ink">
          <Rise lines={["Most ideas die", "in the notes app.", "*Mine ship.*"]} />
        </h2>
        <div className="relative z-20 mt-10 grid gap-8 md:mt-14 md:grid-cols-12">
          {/* The tablet's slot: the fixed layer below draws it here, then grows it from here. */}
          <div ref={slot} className="aspect-[4/5] w-full md:col-span-6 md:aspect-[7/5]">
            {reduce && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/space/poster.webp" alt="" className="h-full w-full rounded-[1.25rem] object-cover" />
            )}
          </div>
          <motion.p
            ref={motto}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -15% 0px" }}
            transition={{ duration: 1, ease: EASE }}
            // On phones the motto sits above the tablet, so the tablet doesn't grow over it unread.
            className="order-first text-[1.0625rem] leading-relaxed text-ink-2 md:order-none md:col-span-3 md:col-start-9"
          >
            {MOTTO}
          </motion.p>
        </div>
      </div>

      {reduce ? (
        // Reduced motion: no flight, just the end line on a night card.
        <div className="dark mx-4 rounded-[1.25rem] bg-paper px-6 py-24 text-center md:mx-[5vw]">
          <EndLine said still />
        </div>
      ) : (
        <>
          {/* The length of the flight, plus the screen it holds on. */}
          <div ref={run} style={{ height: `${(RUN + 1) * 100}dvh` }} />
          <Rush flight={flight} />
          <div ref={layer} className="dark pointer-events-none fixed inset-0 z-30" style={{ visibility: "hidden" }}>
            <div ref={card} className="absolute left-0 top-0 overflow-hidden bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.09)]">
              <div ref={screen} className="relative h-full w-full overflow-hidden bg-[#020309] bg-[url('/space/earth.webp')] bg-cover bg-center">
                <div ref={view} className="absolute left-0 top-0 origin-top-left">
                  {loaded && <SpaceScene flight={flight} grow={grow} active={near && shown} still={false} phone={phone} />}

                  {/* A faint double halo as he falls away, like Lusion's lens rings, so soft you can barely tell it's a rainbow. */}
                  <div ref={halo} aria-hidden className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen">
                    {[-1, 1].map((side) => (
                      <div
                        key={side}
                        className="absolute left-1/2 top-1/2 size-[100vmin] -translate-y-1/2 rounded-full blur-[10px]"
                        style={{
                          transform: `translate(calc(-50% + ${side * 9}vmin), -50%)`,
                          background:
                            "radial-gradient(circle, transparent 60%, rgba(255,120,120,0.13) 63%, rgba(255,214,140,0.15) 65%, rgba(150,255,190,0.13) 67%, rgba(140,180,255,0.15) 69%, rgba(200,150,255,0.11) 71%, transparent 74%)",
                        }}
                      />
                    ))}
                  </div>

                  {/* The line: fades in over him, spreads edge to edge, then the camera zooms through 2AM. */}
                  <p
                    ref={line}
                    aria-label="Learn it at 2am. Ship it by morning."
                    className="pointer-events-none invisible absolute inset-0 grid place-content-center text-center font-wide text-[clamp(1.6rem,4.6vw,4.25rem)] font-semibold uppercase leading-[1.08] text-ink will-change-transform"
                  >
                    {ROWS.map((row, r) => (
                      <span key={r} aria-hidden className="block whitespace-nowrap">
                        {row.map((w) => {
                          const i = n++;
                          return (
                            <span key={w + i} ref={(el) => void (words.current[i] = el)} className="mx-[0.14em] inline-block opacity-0">
                              {w}
                            </span>
                          );
                        })}
                      </span>
                    ))}
                  </p>

                  {/* His cats, tools and projects as stickers, bursting out round him as he waves. */}
                  <Stickers flight={flight} />

                  {/* The white flash between the cages and the paw-print room. */}
                  <div ref={flash} aria-hidden className="pointer-events-none absolute inset-0 bg-white opacity-0" />

                  <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                    <EndLine said={said} />
                    <motion.a
                      href="#contact"
                      initial={false}
                      animate={said ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                      transition={{ duration: 1.1, delay: said ? 0.5 : 0, ease: EASE }}
                      className={`absolute bottom-10 inline-flex h-12 items-center gap-3 rounded-full bg-ink px-6 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-paper ${said ? "pointer-events-auto" : ""}`}
                    >
                      <ArrowDown size={14} /> Keep scrolling <ArrowDown size={14} />
                    </motion.a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <div className="relative z-40">{children}</div>
    </section>
  );
}
