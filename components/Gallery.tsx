"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useMotionValue, useReducedMotion } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { usePageTransition } from "@/components/transition/TransitionProvider";
import { useDust } from "@/components/motion/PixelDissolve";
import { ACTUALLY } from "@/components/Hero";

type Photo = { src: string; thumb: string; alt: string; w: number; h: number };
type View = { w: number; h: number; tw: number; cw: number; ch: number };
type Tile = {
  el: HTMLElement; x: number; y: number; w: number; h: number;
  z: number; // stacking at rest: cards dealt later lie on top
  delay: number; deck: number; spin: number; rest: number; jx: number; jy: number;
  down: boolean; // lands face down, showing the card back
};

// One endless plane of photos, like Pamidor's Art Lab: drag it any way (mouse,
// touch, trackpad, arrow keys) and the set repeats forever. Each photo keeps its
// own shape and lands loosely around its spot, every other column half a spot
// lower, with a size and an offset of its own, so neighbours overlap now and
// then. The plane bends away toward the edges, a lens rather than a sheet. Only
// the spots on screen exist, and their places are written straight to the DOM
// each frame, so React re-renders only when a row or column comes in.
const BEND = 20; // degrees a tile turns at the edge of the screen
const SINK = 160; // px it sits back there
const EASE = 0.14; // share of the way to the target the plane covers each frame
const DECAY = 0.92; // share of a flick's speed kept each frame
const SCATTER = 0.33; // share of a spot a photo can land off its centre, either way
// The photos are cards. On arrival they're a face-down deck in the middle, dealt from
// the top in a random order: each is thrown up, turns face up in the air, drops onto the
// table with a little give and slides to a stop at a slight tilt. Now and then one lands
// face down on its card back; a click turns it over.
const DEAL = 900; // ms over which the throws start
const THROW = 950; // ms one card takes from the deck to rest
const AIR = 0.6; // share of a throw spent in the air
const LIFT = 0.18; // how much bigger a card is at the top of its arc
const SPIN = 26; // most degrees of spin a throw puts on a card
const TILT = 11; // most degrees a card rests at, either way; spread evenly, so most visibly lean
const DOWN = 0.07; // share of cards that land face down
const DEALT = 0.2; // share of the screen past each edge where cards are still dealt
const FACE = "perspective(1000px) rotateY(0deg)", BACK = "perspective(1000px) rotateY(180deg)";
// The page's one line, the landing headline's other half in its type. Once the deck is out it
// gathers from dust in a clearing left for it in the middle of the table, and drags with the photos.
const SAY = 1100; // ms the line takes to gather

const mod = (a: number, n: number) => ((a % n) + n) % n;

// The landing headline's type at a size that sits among the photos.
const SMALL = "px-[0.1em] font-wide text-[clamp(1.5rem,3.6vw,3.25rem)] font-semibold uppercase leading-[0.98] tracking-[-0.01em]";
const WIDE = { fontVariationSettings: '"wdth" 115' };
// Typed in capitals, not just styled so: the dust is cut from the letters as written.
const GRASS = (
  <>
    <span className="block">BUILT ALL WEEK.</span>
    <span className="block">
      THEN I <span className={ACTUALLY}>actually</span>
    </span>
    <span className="block">TOUCHED GRASS.</span>
  </>
);

// The line, gathering from dust once, on mount. `out` stays 0, so it never crumbles.
function Line() {
  const text = useRef<HTMLParagraphElement>(null);
  const dust = useRef<HTMLCanvasElement>(null);
  const out = useMotionValue(0);
  useDust(text, null, dust, out, SAY);
  return (
    <div className="relative">
      <p ref={text} style={WIDE} className={`${SMALL} text-ink [clip-path:inset(50%)] motion-reduce:[clip-path:none]`}>
        <span className="sr-only">Built all week. Then I actually touched grass.</span>
        <span aria-hidden>{GRASS}</span>
      </p>
      <canvas ref={dust} aria-hidden className="pointer-events-none absolute z-10" />
    </div>
  );
}

// A steady random number in [0, 1) for spot (c, r); k picks which one.
function noise(c: number, r: number, k: number) {
  let h = Math.imul(c, 374761393) ^ Math.imul(r, 668265263) ^ Math.imul(k + 1, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  return ((h ^ (h >>> 16)) >>> 0) / 2 ** 32;
}

function measure(): View {
  const w = window.innerWidth, h = window.innerHeight;
  const tw = Math.round(Math.min(300, Math.max(150, w * 0.21)));
  const spot = Math.round(tw * 1.1);
  return { w, h, tw, cw: spot, ch: spot };
}

// While the table moves it blurs along the way it is going, its colours parting a little at
// the edges, like glass; at rest it is sharp.
export default function Gallery({ photos }: { photos: Photo[] }) {
  const n = photos.length;
  const reduce = useReducedMotion();
  const { covered } = usePageTransition();
  const [view, setView] = useState<View | null>(null);
  const [first, setFirst] = useState({ c: 0, r: 0 });
  const [open, setOpen] = useState<number | null>(null);
  const [turned, setTurned] = useState(() => new Set<string>()); // face-down cards already turned over
  // Once the deal has landed, only face-down cards keep a back. Safari's view transition
  // (the theme switch) flattens 3D and ignores backface-visibility, so a back would cover the photo.
  const [dealt, setDealt] = useState(false);
  const plane = useRef<HTMLElement>(null);
  const line = useRef<HTMLDivElement>(null); // the line on the table
  const [hole, setHole] = useState<{ w: number; h: number } | null>(null); // its size, kept clear of photos
  const blur = useRef<SVGFEGaussianBlurElement>(null), red = useRef<SVGFEOffsetElement>(null), blue = useRef<SVGFEOffsetElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const tiles = useRef(new Map<string, Tile>());
  // Where the plane is and where it is heading, for the frame loop; never rendered.
  // `deal`: -1 while the photos wait in the pile, the start time while they fly, 0 once landed.
  // `px`, `py`: where it was last frame, for the glass.
  const at = useRef({ x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, px: 0, py: 0, drag: false, moved: false, raf: 0, c: NaN, r: NaN, view: null as View | null, deal: -1, hole: null as { w: number; h: number } | null });

  // Every tile's place on the bent plane, and a re-render when new cells come in.
  const place = useCallback(() => {
    const a = at.current, v = a.view;
    if (!v) return;
    const R = Math.max(v.w, v.h) / 2;
    const now = performance.now();
    tiles.current.forEach((t) => {
      let left = t.x + a.x, top = t.y + a.y, turn = t.rest, lift = 1;
      // Only cards that land on screen are dealt (on a phone about 20 of 60); the rest wait where
      // they lie, off screen. The margin covers the bend pulling edge cards in.
      // shortcut: decided each frame, so a drag during the deal can pop a card; decide once per tile if that shows.
      const mx = v.w * DEALT, my = v.h * DEALT;
      if (a.deal && left + t.w > -mx && left < v.w + mx && top + t.h > -my && top < v.h + my) {
        const p = a.deal < 0 ? 0 : Math.min(1, Math.max(0, (now - a.deal - t.delay) / THROW));
        // Friction: most of the way is covered in the air, the rest is a slide along the table.
        const e = 1 - (1 - p) ** 3, fromX = (v.w - t.w) / 2 + t.jx, fromY = (v.h - t.h) / 2 + t.jy;
        left = fromX + (left - fromX) * e;
        top = fromY + (top - fromY) * e;
        turn = t.deck + (t.rest - t.deck) * e + t.spin * Math.sin(Math.PI * e);
        // Up and down in an arc, then a little give as it hits the table.
        const air = p < AIR ? Math.sin((Math.PI * p) / AIR) : 0;
        const land = p < AIR ? 0 : (p - AIR) / (1 - AIR);
        lift = 1 + LIFT * air - 0.03 * Math.sin(Math.PI * land) * (1 - land);
        // Face down in the deck; a face-up card turns over on the way up.
        const over = t.down ? 0 : Math.min(1, Math.max(0, (p - 0.08) / (AIR * 0.75)));
        (t.el.firstElementChild as HTMLElement).style.transform = `perspective(1000px) rotateY(${180 * (1 - over * over * (3 - 2 * over))}deg)`;
        // The deck stacks top card first, a card in the air is above everything, then it rests in deal order.
        t.el.style.zIndex = String(p >= AIR ? t.z : p > 0 ? 400 : 100 + Math.round((1 - t.delay / DEAL) * 99));
      }
      const nx = (left + t.w / 2 - v.w / 2) / R, ny = (top + t.h / 2 - v.h / 2) / R;
      t.el.style.transform = `translate3d(${left}px,${top}px,${-SINK * (nx * nx + ny * ny)}px) rotateY(${nx * BEND}deg) rotateX(${-ny * BEND}deg) rotate(${turn}deg) scale(${lift})`;
    });
    // The line sits where the middle of the screen was at the start, flat on the table.
    if (line.current && a.hole) line.current.style.transform = `translate3d(${v.cw / 2 + a.x - a.hole.w / 2}px,${v.ch / 2 + a.y - a.hole.h / 2}px,0)`;
    if (a.deal > 0 && now - a.deal > DEAL + THROW) {
      a.deal = 0;
      setDealt(true);
    }
    const c = Math.floor(-a.x / v.cw) - 1, r = Math.floor(-a.y / v.ch) - 2;
    if (c !== a.c || r !== a.r) {
      a.c = c;
      a.r = r;
      setFirst({ c, r });
    }
  }, []);

  // The plane eases toward its target, and a flick glides on after letting go.
  const kick = useCallback(() => {
    const a = at.current;
    if (a.raf) return;
    const tick = () => {
      if (!a.drag) {
        a.tx += a.vx;
        a.ty += a.vy;
        a.vx *= DECAY;
        a.vy *= DECAY;
      }
      const k = reduce ? 1 : EASE;
      a.x += (a.tx - a.x) * k;
      a.y += (a.ty - a.y) * k;
      if (plane.current && blur.current && red.current && blue.current) {
        const sx = a.x - a.px, sy = a.y - a.py, on = Math.hypot(sx, sy) > 0.5;
        const part = (d: number) => String(Math.max(-8, Math.min(8, d * 0.2)));
        a.px = a.x;
        a.py = a.y;
        if (on) {
          blur.current.setAttribute("stdDeviation", `${Math.min(14, Math.abs(sx) * 0.35)} ${Math.min(14, Math.abs(sy) * 0.35)}`);
          red.current.setAttribute("dx", part(-sx));
          red.current.setAttribute("dy", part(-sy));
          blue.current.setAttribute("dx", part(sx));
          blue.current.setAttribute("dy", part(sy));
        }
        plane.current.style.filter = on ? "url(#gallery-glass)" : "";
      }
      place();
      const left = Math.abs(a.tx - a.x) + Math.abs(a.ty - a.y) + Math.abs(a.vx) + Math.abs(a.vy);
      a.raf = a.drag || left > 0.1 ? requestAnimationFrame(tick) : 0;
    };
    a.raf = requestAnimationFrame(tick);
  }, [place, reduce]);

  useLayoutEffect(() => place(), [view, first, place, hole]);

  // The line's size, re-read when its font arrives or the screen changes.
  useEffect(() => {
    const el = line.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      at.current.hole = { w: el.offsetWidth, h: el.offsetHeight };
      setHole(at.current.hole);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Deal once the photos are on screen and the page curtain has lifted off them.
  useEffect(() => {
    const a = at.current;
    if (!view || covered || a.deal !== -1) return;
    if (reduce) {
      a.deal = 0;
      setDealt(true);
      place();
      return;
    }
    // The deck waits for its photos, so no card turns over blank; never longer than 1.5 s.
    let live = true;
    const imgs = [...(plane.current?.querySelectorAll("img") ?? [])];
    Promise.race([Promise.allSettled(imgs.map((im) => im.decode())), new Promise((r) => setTimeout(r, 1500))]).then(() => {
      if (!live || a.deal !== -1) return;
      a.deal = performance.now() + 150;
      const run = () => {
        place();
        if (a.deal) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
    });
    return () => void (live = false);
  }, [view, covered, reduce, place]);

  useEffect(() => {
    const el = plane.current;
    if (!el) return;
    const a = at.current;
    if (!a.view) {
      // Start with the first photo in the middle of the screen.
      a.view = measure();
      a.x = a.tx = a.px = (a.view.w - a.view.cw) / 2;
      a.y = a.ty = a.py = (a.view.h - a.view.ch) / 2;
      setView(a.view);
    }

    let start = { x: 0, y: 0 }, last = { x: 0, y: 0, t: 0 };
    const move = (e: PointerEvent) => {
      a.vx = e.clientX - last.x;
      a.vy = e.clientY - last.y;
      a.tx += a.vx;
      a.ty += a.vy;
      last = { x: e.clientX, y: e.clientY, t: e.timeStamp };
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) a.moved = true;
    };
    const up = (e: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      a.drag = false;
      // A drag that came to rest before letting go stays put.
      if (reduce || e.timeStamp - last.t > 80) a.vx = a.vy = 0;
      kick();
    };
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      a.drag = true;
      a.moved = false;
      a.vx = a.vy = 0;
      start = { x: e.clientX, y: e.clientY };
      last = { ...start, t: e.timeStamp };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
      kick();
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const k = e.deltaMode === 1 ? 16 : 1; // Firefox scrolls by lines
      a.tx -= e.deltaX * k;
      a.ty -= e.deltaY * k;
      kick();
    };
    const steps: Record<string, [number, number]> = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
    const key = (e: KeyboardEvent) => {
      const s = steps[e.key];
      if (!s || !a.view || dialog.current?.open || e.altKey || e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      a.tx += s[0] * a.view.cw;
      a.ty += s[1] * a.view.ch;
      kick();
    };
    const resize = () => {
      a.view = measure();
      setView(a.view);
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", key);
    window.addEventListener("resize", resize);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(a.raf);
      a.raf = 0;
    };
  }, [kick, reduce, n]);

  useEffect(() => {
    if (open !== null) dialog.current?.showModal();
  }, [open]);

  if (!n)
    return <p className="grid h-[100dvh] place-items-center font-mono text-[0.75rem] uppercase tracking-[0.18em] text-ink-3">No photos yet</p>;

  const cells: ReactNode[] = [];
  if (view) {
    // The set runs along each row and carries on C photos further in the next,
    // C fitted to the screen's shape so a photo's repeats land far apart.
    const C = Math.max(1, Math.min(n - 1, Math.round(Math.sqrt((n * view.w * view.ch) / (view.h * view.cw)))));
    const seen = new Set<number>();
    for (let r = first.r; r < first.r + Math.ceil(view.h / view.ch) + 4; r++)
      for (let c = first.c; c < first.c + Math.ceil(view.w / view.cw) + 3; c++) {
        const k = `${c}:${r}`, i = mod(c + r * C, n), p = photos[i];
        // Every shape gets about the same area, a little bigger or smaller by spot.
        const side = view.tw * (0.68 + 0.6 * noise(c, r, 0)), stretch = Math.sqrt(p.w / p.h);
        const w = Math.round(side * stretch), h = Math.round(side / stretch);
        const x = (c + 0.5 + (noise(c, r, 1) - 0.5) * 2 * SCATTER) * view.cw - w / 2;
        const y = (r + 0.5 + (c & 1) / 2 + (noise(c, r, 2) - 0.5) * 2 * SCATTER) * view.ch - h / 2;
        // No photo in the line's clearing, with a margin for the cards' lean.
        if (hole && Math.abs(x + w / 2 - view.cw / 2) < (w + hole.w) / 2 + 28 && Math.abs(y + h / 2 - view.ch / 2) < (h + hole.h) / 2 + 28) continue;
        // Each photo is tabbable and announced once; its repeats are only seen.
        const again = seen.has(i);
        seen.add(i);
        // Cards dealt later lie on top, each resting at its own lean.
        const delay = noise(c, r, 4) * DEAL, z = 200 + Math.round((delay / DEAL) * 99);
        const rest = TILT * (noise(c, r, 9) - 0.5) * 2;
        const down = noise(c, r, 8) < DOWN && !turned.has(k);
        cells.push(
          <button
            key={k}
            ref={(el) => {
              tiles.current.set(k, {
                el: el!, x, y, w, h, z, delay, rest, down,
                deck: (noise(c, r, 5) - 0.5) * 8,
                spin: (noise(c, r, 10) - 0.5) * 2 * SPIN,
                jx: (noise(c, r, 6) - 0.5) * 10,
                jy: (noise(c, r, 7) - 0.5) * 10,
              });
              return () => void tiles.current.delete(k);
            }}
            type="button"
            data-cursor={down ? "Flip" : "Open"}
            tabIndex={again ? -1 : undefined}
            aria-hidden={again || undefined}
            aria-label={down ? "Turn over a face-down photo" : `Open ${p.alt}`}
            onClick={(e) => {
              // A drag that ends on a tile is not a click; Enter and Space always are.
              if (e.detail !== 0 && at.current.moved) return;
              if (!down) return setOpen(i);
              // A face-down card turns over first, lifting off the table as it goes.
              const el = e.currentTarget, card = el.firstElementChild as HTMLElement;
              if (card.getAnimations().length) return; // already turning
              el.style.zIndex = "500";
              card.animate(
                [{ transform: `${BACK} scale(1)` }, { transform: "perspective(1000px) rotateY(90deg) scale(1.12)", offset: 0.45 }, { transform: `${FACE} scale(1)` }],
                { duration: reduce ? 0 : 650, easing: "cubic-bezier(0.3, 0.6, 0.3, 1)" },
              ).onfinish = () => {
                // Turned only once it lands, so its back stays for the turn. FACE now, or it shows BACK until React renders.
                el.style.zIndex = String(z);
                card.style.transform = FACE;
                setTurned((s) => new Set(s).add(k));
              };
            }}
            style={{ width: w, height: h, zIndex: z }}
            className="absolute left-0 top-0 rounded-md shadow-[0_12px_32px_-14px_rgb(var(--shade)/0.5)] will-change-transform"
          >
            <span className="relative block size-full [transform-style:preserve-3d]" style={{ transform: down ? BACK : FACE }}>
              <span className="absolute inset-0 overflow-hidden rounded-md bg-sheet [backface-visibility:hidden]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumb} alt="" draggable={false} decoding="async" className="size-full object-cover" />
              </span>
              {/* The card back: an aurora of lapis and light blue under film grain, the favicon in the corner.
                  Sized off the card's short side; only a card lying face down drifts, the rest never show it. */}
              {(down || !dealt) && (
                <span className="grain absolute inset-0 overflow-hidden rounded-md bg-deck [backface-visibility:hidden] [container-type:size] [transform:rotateY(180deg)]">
                  <span className={`absolute -left-[30cqmin] -top-[25cqmin] size-[90cqmin] rounded-full bg-deck-glow/85 blur-[14cqmin] ${down ? "deck-drift-a" : ""}`} />
                  <span className={`absolute -bottom-[30cqmin] -right-[35cqmin] size-[80cqmin] rounded-full bg-deck-deep blur-[14cqmin] ${down ? "deck-drift-b" : ""}`} />
                  <span className={`absolute left-[30cqmin] top-[45cqmin] size-[55cqmin] rounded-full bg-on-hl/30 blur-[14cqmin] dark:bg-on-hl/15 ${down ? "deck-drift-c" : ""}`} />
                  <span className="absolute left-[8cqmin] top-[8cqmin] size-[16cqmin] bg-on-hl [mask:url('/1.svg')_center/contain_no-repeat]" />
                </span>
              )}
            </span>
          </button>,
        );
      }
  }

  return (
    <>
      <section
        ref={plane}
        aria-label="Photos. Drag, swipe or use the arrow keys to look around."
        data-cursor="Drag"
        data-lenis-prevent
        className="fixed inset-0 touch-none select-none overflow-clip [perspective:1100px]"
      >
        {cells}
        <div ref={line} className="pointer-events-none absolute left-0 top-0 z-[150] text-center">
          {/* Holds the line's room from the start; the line itself gathers once the deck is out. */}
          <p aria-hidden style={WIDE} className={`${SMALL} invisible`}>
            {GRASS}
          </p>
          {dealt && (
            <div className="absolute inset-0">
              <Line />
            </div>
          )}
        </div>
      </section>
      {/* The glass: the table blurred along its way, its red and blue parted to either side. */}
      <svg aria-hidden className="absolute size-0">
        <filter id="gallery-glass" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feGaussianBlur ref={blur} in="SourceGraphic" stdDeviation="0" result="b" />
          <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset ref={red} in="r" result="r2" />
          <feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
          <feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bl" />
          <feOffset ref={blue} in="bl" result="b2" />
          <feBlend in="r2" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="b2" mode="screen" />
        </filter>
      </svg>

      {/* A photo opened full size, in a native <dialog> like ZoomImage's. */}
      <dialog
        ref={dialog}
        data-lenis-prevent
        aria-label={open === null ? undefined : photos[open].alt}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto max-w-none overflow-visible bg-transparent p-0 backdrop:bg-shade/85 backdrop:backdrop-blur-sm"
      >
        {open !== null && (
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[open].src} alt={photos[open].alt} className="block max-h-[84dvh] max-w-[94vw] rounded-md" />
            
          </figure>
        )}
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          aria-label="Close"
          className="fixed right-4 top-4 grid size-10 place-items-center rounded-full border border-rule bg-paper/90 text-ink shadow-[0_8px_24px_-8px_rgb(var(--shade)/0.5)] backdrop-blur-sm hover:border-ink md:right-8 md:top-8"
        >
          <X size={18} />
        </button>
      </dialog>
    </>
  );
}
