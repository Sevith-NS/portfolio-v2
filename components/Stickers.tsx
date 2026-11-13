"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { BEATS, span } from "./three/beats";

// The sticker burst round the end line, after Lusion's: die-cut vector stickers of his four
// cats, his main six tools and a mark for each project, bursting out from behind him one after
// another as he waves, then bobbing where they land. Positions are shares of the screen,
// kept clear of the end line and of him.

type Cat = { fur: string; dark: string; eye: string; nose: string; ear: string; marks: "tabby" | "smudge" | "none" };
const CATS: Record<string, Cat> = {
  simba: { fur: "#E3A86C", dark: "#B0703A", eye: "#C9862E", nose: "#E08C94", ear: "#F2B8BC", marks: "tabby" },
  ash: { fur: "#7E8590", dark: "#646A75", eye: "#E2AE22", nose: "#4F5056", ear: "#C29AA0", marks: "none" },
  pearl: { fur: "#F4F2EE", dark: "#A3A4A8", eye: "#D2B042", nose: "#EBA2A9", ear: "#F2B8BC", marks: "smudge" },
  cream: { fur: "#FAF8F4", dark: "#E6DED2", eye: "#3A3F4A", nose: "#F2A9B0", ear: "#F5BEC3", marks: "none" },
};

const HEAD = "M17 40 L21 8 L41 25 Q50 23 59 25 L79 8 L83 40 Q93 60 81 77 Q67 93 50 93 Q33 93 19 77 Q7 60 17 40 Z";

function CatFace({ c }: { c: Cat }) {
  return (
    <svg viewBox="-8 -8 116 116" className="h-full w-full">
      <path d={HEAD} fill="#FFF" stroke="#FFF" strokeWidth="14" strokeLinejoin="round" />
      <path d={HEAD} fill={c.fur} />
      <path d="M24 16 L39 28 L27 34 Z M76 16 L61 28 L73 34 Z" fill={c.ear} />
      {c.marks === "tabby" && <path d="M44 30 L45 42 M50 28 L50 41 M56 30 L55 42 M20 58 L32 60 M80 58 L68 60 M22 66 L33 66 M78 66 L67 66" stroke={c.dark} strokeWidth="3.4" strokeLinecap="round" />}
      {c.marks === "smudge" && <ellipse cx="50" cy="34" rx="12" ry="7" fill={c.dark} opacity="0.75" />}
      {[36, 64].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="55" rx="8.5" ry="9.5" fill={c.eye} />
          <ellipse cx={x} cy="55" rx="2.2" ry="7.5" fill="#111" />
          <circle cx={x + 2.6} cy="51.5" r="1.8" fill="#FFF" />
        </g>
      ))}
      <path d="M45.5 66 L54.5 66 L50 71 Z" fill={c.nose} />
      <path d="M50 71 Q46 77 42 74 M50 71 Q54 77 58 74" stroke="#5A4A48" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M38 70 L14 66 M38 73 L15 76 M62 70 L86 66 M62 73 L85 76" stroke="#FFF" strokeWidth="1.3" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

// A round die-cut sticker holding one of his tool icons.
function Tool({ src, label, dark = false }: { src: string; label: string; dark?: boolean }) {
  return (
    <div className="grid h-full w-full place-items-center rounded-full border-[0.35em] border-white bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" aria-label={label} className={`h-[62%] w-[62%] object-contain ${dark ? "invert" : ""}`} />
    </div>
  );
}

// three.js has no icon in public/, so its triangle mark is drawn here.
function Three() {
  return (
    <div className="grid h-full w-full place-items-center rounded-full border-[0.35em] border-white bg-white">
      <svg viewBox="0 0 100 100" className="h-[64%] w-[64%]" fill="none" stroke="#111" strokeWidth="3" strokeLinejoin="round">
        <path d="M14 86 L32 10 L88 66 Z M23 48 L60 38 L51 76 Z M18.5 67 L37 63 L32 82 Z M27.5 29 L46 24 L41 43 Z M55.5 57 L74 52 L69 71 Z" />
      </svg>
    </div>
  );
}

function Mark({ bg, fg, children, round = false }: { bg: string; fg: string; children: React.ReactNode; round?: boolean }) {
  return (
    <div
      className={`grid h-full w-full place-items-center border-[0.3em] border-white px-[0.6em] text-center font-wide font-semibold uppercase leading-none ${round ? "rounded-full" : "rounded-[0.9em]"}`}
      style={{ background: bg, color: fg }}
    >
      {children}
    </div>
  );
}

// x and y are shares of the screen (px and py on a tall phone screen, where they gather above the
// end line and down the edges); w and h in vmax; r the tilt it lands at.
const STICKERS: { key: string; x: number; y: number; px: number; py: number; w: number; h: number; r: number; art: React.ReactNode }[] = [
  { key: "simba", x: 13, y: 24, px: 14, py: 23, w: 9, h: 9, r: -12, art: <CatFace c={CATS.simba} /> },
  { key: "ash", x: 87, y: 23, px: 86, py: 22, w: 9, h: 9, r: 10, art: <CatFace c={CATS.ash} /> },
  { key: "pearl", x: 31, y: 13, px: 34, py: 13, w: 7, h: 7, r: 6, art: <CatFace c={CATS.pearl} /> },
  { key: "cream", x: 89, y: 80, px: 66, py: 12, w: 8, h: 8, r: -12, art: <CatFace c={CATS.cream} /> },
  { key: "react", x: 7, y: 54, px: 9, py: 35, w: 5.5, h: 5.5, r: 8, art: <Tool src="/re.svg" label="React" /> },
  { key: "ts", x: 93, y: 51, px: 91, py: 36, w: 5, h: 5, r: -10, art: <Tool src="/ts.svg" label="TypeScript" /> },
  { key: "next", x: 68, y: 12, px: 50, py: 25, w: 5.5, h: 5.5, r: -8, art: <Tool src="/next.svg" label="Next.js" dark /> },
  { key: "tailwind", x: 37, y: 88, px: 10, py: 84, w: 5, h: 5, r: 10, art: <Tool src="/tail.svg" label="Tailwind CSS" /> },
  { key: "python", x: 20, y: 43, px: 91, py: 68, w: 5, h: 5, r: -4, art: <Tool src="/python.svg" label="Python" /> },
  { key: "three", x: 76, y: 61, px: 30, py: 35, w: 5.5, h: 5.5, r: -6, art: <Three /> },
  {
    key: "polaris", x: 21, y: 80, px: 14, py: 71, w: 11, h: 4.2, r: -6,
    art: <Mark bg="#0E0F12" fg="#F4F4F2"><span className="text-[1.3vmax] tracking-[0.12em]">✦ Polaris</span></Mark>,
  },
  {
    key: "villas", x: 77, y: 84, px: 84, py: 94, w: 11, h: 4.4, r: 7,
    art: <Mark bg="#14206B" fg="#FFFFFF"><span className="font-serif text-[1.6vmax] normal-case tracking-normal">only villas</span></Mark>,
  },
  {
    key: "esdeekid", x: 8, y: 93, px: 16, py: 95, w: 10, h: 4.2, r: -14,
    art: <Mark bg="#0A0A0A" fg="#F2F2F2"><span className="text-[1.25vmax] tracking-[0.06em]">EsDee<span className="bg-[#E0242B] px-[0.2em] text-[#0A0A0A]">Kid</span></span></Mark>,
  },
  {
    key: "tesseract", x: 61, y: 91, px: 86, py: 82, w: 11, h: 4.2, r: -8,
    art: <Mark bg="#FFFFFF" fg="#16181C"><span className="text-[1.15vmax] tracking-[0.1em]"><span className="text-[#E4572E]">◆</span> Tesseract</span></Mark>,
  },
  {
    key: "vercel", x: 81, y: 39, px: 70, py: 36, w: 10, h: 4, r: 12,
    art: <Mark bg="#000000" fg="#FFFFFF"><span className="font-mono text-[1.05vmax] tracking-[0.08em]">Vercel clone</span></Mark>,
  },
  {
    key: "ochi", x: 27, y: 64, px: 50, py: 37, w: 6.5, h: 6.5, r: 10, art: <Mark round bg="#CDEA68" fg="#1A1A1A"><span className="text-[1.5vmax] normal-case">ochi</span></Mark>,
  },
];

// Overshoot a little and settle, like a sticker slapped down.
const slap = (t: number) => {
  const c = 1.9;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

export function Stickers({ flight }: { flight: MotionValue<number> }) {
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const place = useCallback((f: number) => {
    const u = span(BEATS.wave, f);
    const tall = window.innerWidth < window.innerHeight;
    els.current.forEach((el, i) => {
      if (!el) return;
      const s = STICKERS[i];
      const sx = tall ? s.px : s.x, sy = tall ? s.py : s.y;
      const t = Math.min(1, Math.max(0, (u - 0.04 - i * 0.022) / 0.3));
      const k = t > 0 ? slap(t) : 0;
      // From behind him (the middle, low) out to where it lands.
      const x = 50 + (sx - 50) * k, y = 66 + (sy - 66) * k;
      el.style.left = `${x}%`;
      el.style.top = `${y}%`;
      el.style.opacity = t > 0 ? "1" : "0";
      el.style.transform = `translate(-50%, -50%) rotate(${s.r * k - 30 * (1 - k)}deg) scale(${Math.max(0, k)})`;
    });
  }, []);
  useMotionValueEvent(flight, "change", place);
  useEffect(() => place(flight.get()), [place, flight]);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {STICKERS.map((s, i) => (
        <div
          key={s.key}
          ref={(el) => void (els.current[i] = el)}
          className="absolute opacity-0 [filter:drop-shadow(0_0.5vmax_0.8vmax_rgba(0,0,0,0.35))]"
          style={{ width: `${s.w}vmax`, height: `${s.h}vmax` }}
        >
          {/* Each bobs gently where it lands, at its own pace. */}
          <div className="h-full w-full animate-[bob_4s_ease-in-out_infinite]" style={{ animationDelay: `${-i * 0.7}s` }}>
            {s.art}
          </div>
        </div>
      ))}
    </div>
  );
}
