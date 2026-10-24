"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { catNote } from "./EasterEggs";

// Simba and Cream, in pixels, on the top edge of the contact card. They don't
// follow the cursor: they have their own lives. A loop of five short scenes in
// which Cream irritates Simba (his tail, zoomies over his head, boops, sitting
// on him while he sleeps) and Simba keeps his calm, right up until he grabs her
// for a love bite and grooms her into submission. Click either one and it
// flops onto its back, paws paddling at the air, then carries on.
//
// Every sprite is drawn in code on a 21x16 grid (no image files): a silhouette
// in fur colours, then a one-pixel outline traced round it, scaled up with
// nearest-neighbour sampling so it stays crisp.

type CatName = "simba" | "cream";
const CATS: CatName[] = ["simba", "cream"]; // Cream drawn last, so she can sit on him
// Simba is the bigger cat; Cream is Pearl's small daughter.
const SIZE: Record<CatName, number> = { simba: 1.2, cream: 1 };
type Pose = "walk" | "run" | "sit" | "groom" | "yawn" | "stretch" | "loaf" | "sleep" | "crouch" | "jump" | "belly";
type Tail = "up" | "mid" | "low";
type Key = "f" | "d" | "l" | "p" | "e" | "o";

const W = 21, H = 16;

type Coat = { f: string; d: string; l: string; p: string; paw: Key; tip: Key; stripes?: boolean };
const COATS: Record<CatName, Coat> = {
  simba: { f: "#E39A4F", d: "#B5682A", l: "#FBEBD6", p: "#EE9C98", paw: "l", tip: "d", stripes: true },
  cream: { f: "#FBF8F2", d: "#E6DED1", l: "#FFFFFF", p: "#F4AFB5", paw: "l", tip: "f" },
};
const OUTLINE = "#2B2420", EYE = "#1C1814";
const LABEL: Record<CatName, string> = { simba: "Pet Simba", cream: "Pet Cream" };
const NOTE: Record<CatName, string> = {
  simba: "Simba is belly up. Touch it and lose a hand.",
  cream: "Cream is belly up. It's a trap. It's always a trap.",
};

// ---------- drawing ----------
type Grid = (Key | null)[];
type Look = { pose: Pose; frame: number; tail: Tail; blink: boolean; ears: boolean };

function draw(c: Coat, { pose, frame, tail, blink, ears }: Look): Grid {
  const g: Grid = new Array(W * H).fill(null);
  const put = (x: number, y: number, k: Key) => {
    if (x >= 0 && x < W && y >= 0 && y < H) g[y * W + x] = k;
  };
  const rect = (x0: number, y0: number, x1: number, y1: number, k: Key) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, k);
  };
  const eye: Key = blink ? "d" : "e";
  const wag = frame % 2;
  // Ears: a two-pixel point with a pink inside, at the head's top corners.
  const earPair = (lx: number, rx: number, y: number) => {
    put(lx, y, "f"); put(lx, y - 1, "f"); put(lx + 1, y, "p");
    put(rx, y, "f"); put(rx, y - 1, "f"); put(rx - 1, y, "p");
  };
  // The sitting cat, shared by sit, groom and yawn.
  const sitting = (closed: boolean) => {
    rect(2, 14, 7, 14, "f"); put(1, 13, "f"); put(wag ? 1 : 0, 12, c.tip);
    rect(8, 9, 14, 14, "f");
    rect(7, 11, 7, 14, "f");
    rect(11, 9, 13, 12, "l");
    put(11, 14, c.paw); put(13, 14, c.paw);
    rect(9, 3, 15, 8, "f");
    if (ears) earPair(9, 15, 2);
    put(10, 5, closed ? "d" : eye); put(14, 5, closed ? "d" : eye);
    put(12, 6, "p");
    rect(11, 7, 13, 7, "l");
    if (c.stripes) { put(11, 3, "d"); put(13, 3, "d"); put(8, 10, "d"); put(8, 12, "d"); }
  };

  if (pose === "walk" || pose === "run") {
    const b = pose === "run" && wag ? -1 : 0;
    if (tail === "up") { [[3, 9], [3, 8], [2, 7], [2, 6], [2, 5]].forEach(([x, y]) => put(x, y + b, "f")); put(wag ? 3 : 1, 4 + b, c.tip); }
    else if (tail === "mid") { [[3, 9], [2, 8], [1, 7], [1, 6]].forEach(([x, y]) => put(x, y + b, "f")); put(wag ? 2 : 0, 5 + b, c.tip); }
    else { [[3, 10], [2, 11], [1, 12]].forEach(([x, y]) => put(x, y + b, "f")); put(1, 13 + b, c.tip); }
    rect(5, 8 + b, 13, 12 + b, "f");
    rect(4, 9 + b, 4, 11 + b, "f");
    rect(7, 12 + b, 12, 12 + b, "l");
    rect(12, 4 + b, 17, 9 + b, "f");
    put(18, 7 + b, "p"); put(18, 8 + b, "f");
    rect(16, 9 + b, 17, 9 + b, "l"); put(17, 8 + b, "l");
    if (ears) earPair(12, 17, 3 + b);
    put(14, 6 + b, eye); put(16, 6 + b, eye);
    if (c.stripes) { [7, 9, 11].forEach((x) => { put(x, 8 + b, "d"); put(x, 9 + b, "d"); }); put(14, 4 + b, "d"); put(16, 4 + b, "d"); }
    // Legs: two pairs that swing in opposition across a four-frame cycle.
    const step = frame === 1 ? 1 : frame === 3 ? -1 : 0;
    const swing = pose === "run" ? (wag ? 1 : -1) : step;
    const leg = (x: number, dir: number) => {
      for (let y = 13 + b; y <= 13; y++) put(x, y, "f");
      put(x + dir, 14, c.paw);
      if (dir !== 0) put(x, 13, "f");
    };
    leg(13, swing); leg(7, swing); leg(11, -swing); leg(5, -swing);
  } else if (pose === "sit") {
    sitting(blink);
  } else if (pose === "groom") {
    // Paw up to the mouth, licking: the paw bobs, the eyes close, the tongue shows.
    sitting(true);
    const y = wag ? 7 : 8;
    put(14, y, c.paw); put(14, y + 1, "f"); put(14, y + 2, "f");
    if (wag) put(13, 8, "p");
  } else if (pose === "yawn") {
    sitting(true);
    rect(11, 7, 13, 8, "p");
    put(12, 6, "p");
  } else if (pose === "stretch") {
    // Front low, back end up, paws reaching out along the floor.
    put(3, 6, "f"); put(2, 5, "f"); put(2, 4, c.tip);
    rect(4, 7, 9, 10, "f");
    rect(10, 9, 14, 12, "f");
    rect(9, 11, 13, 12, "l");
    rect(5, 11, 5, 14, "f"); rect(8, 11, 8, 14, "f");
    put(5, 14, c.paw); put(8, 14, c.paw);
    rect(14, 13, 17, 13, "f"); put(18, 14, c.paw); put(17, 14, c.paw);
    rect(14, 8, 19, 12, "f");
    if (ears) earPair(14, 19, 7);
    put(16, 10, "d"); put(18, 10, "d");
    put(19, 11, "p");
    if (c.stripes) { [5, 7].forEach((x) => put(x, 7, "d")); put(16, 8, "d"); put(18, 8, "d"); }
  } else if (pose === "loaf" || pose === "sleep") {
    const breath = frame % 2;
    put(3, 13, "f"); put(3, 14, "f"); put(2, 14, "f"); put(1, 14, c.tip); put(1, 13, c.tip);
    rect(4, 11, 15, 14, "f");
    if (breath) rect(5, 10, 13, 10, "f");
    put(16, 13, "f"); put(16, 14, c.paw);
    rect(11, 7, 16, 12, "f");
    if (ears) earPair(11, 16, 6);
    if (pose === "sleep") { put(12, 9, "o"); put(15, 9, "o"); }
    else { put(12, 9, eye); put(15, 9, eye); }
    put(13, 10, "p"); put(14, 10, "p");
    rect(13, 11, 14, 11, "l");
    if (c.stripes) [6, 8, 10].forEach((x) => put(x, 11, "d"));
  } else if (pose === "crouch") {
    put(3, 11, "f"); put(2, 11, "f"); put(1, wag ? 10 : 11, c.tip);
    rect(4, 10, 13, 13, "f");
    rect(3, 11, 3, 12, "f");
    rect(7, 13, 12, 13, "l");
    rect(12, 7, 17, 12, "f");
    put(18, 10, "p"); put(18, 11, "f");
    rect(16, 12, 17, 12, "l");
    if (ears) earPair(12, 17, 6);
    put(14, 9, eye); put(16, 9, eye);
    if (c.stripes) { [7, 9, 11].forEach((x) => put(x, 10, "d")); put(14, 7, "d"); put(16, 7, "d"); }
    [5, 7, 11, 13].forEach((x) => put(x, 14, c.paw));
  } else if (pose === "belly") {
    // On its back: belly to the sky, all four paws paddling at the air.
    put(3, 14, "f"); put(2, 14, "f"); put(1, wag ? 13 : 14, c.tip);
    rect(4, 11, 14, 14, "f");
    rect(6, 11, 12, 12, "l");
    // The head, upside down: chin on top, ears flopped onto the floor.
    rect(14, 10, 19, 14, "f");
    rect(16, 10, 17, 10, "l");
    put(16, 11, "p"); put(17, 11, "p");
    put(15, 12, eye); put(18, 12, eye);
    if (ears) { put(15, 15, "f"); put(18, 15, "f"); }
    if (c.stripes) { [6, 8, 10].forEach((x) => put(x, 14, "d")); put(16, 14, "d"); put(18, 14, "d"); }
    // Four legs out of step, each kicking up and bending back.
    const reach = [2, 4, 4, 3], lean = [0, 1, 0, -1];
    const leg = (x: number, phase: number) => {
      const f = (frame + phase) % 4;
      for (let y = 10; y > 10 - reach[f]; y--) put(x, y, "f");
      put(x + lean[f], 10 - reach[f], c.paw);
    };
    leg(5, 0); leg(8, 2); leg(10, 1); leg(13, 3);
  } else {
    // jump: stretched out mid-air, legs reaching
    put(3, 6, "f"); put(2, 5, "f"); put(1, 4, c.tip);
    rect(4, 6, 14, 9, "f");
    rect(6, 9, 12, 9, "l");
    rect(13, 3, 18, 8, "f");
    put(19, 6, "p"); put(19, 7, "f");
    if (ears) earPair(13, 18, 2);
    put(15, 5, eye); put(17, 5, eye);
    if (c.stripes) [6, 8, 10].forEach((x) => put(x, 6, "d"));
    put(14, 10, "f"); put(15, 11, "f"); put(16, 12, c.paw);
    put(5, 10, "f"); put(4, 11, "f"); put(3, 12, c.paw);
  }

  // Trace a one-pixel outline round everything drawn.
  const out = g.slice();
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (g[y * W + x]) continue;
      const near = (dx: number, dy: number) => {
        const nx = x + dx, ny = y + dy;
        return nx >= 0 && nx < W && ny >= 0 && ny < H && g[ny * W + nx] !== null;
      };
      if (near(1, 0) || near(-1, 0) || near(0, 1) || near(0, -1)) out[y * W + x] = "o";
    }
  return out;
}

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

function paint(cv: HTMLCanvasElement, coat: Coat, look: Look) {
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const grid = draw(coat, look);
  const img = ctx.createImageData(W, H);
  const pal: Record<Key, number[]> = { f: rgb(coat.f), d: rgb(coat.d), l: rgb(coat.l), p: rgb(coat.p), e: rgb(EYE), o: rgb(OUTLINE) };
  grid.forEach((k, i) => {
    if (!k) return;
    img.data.set([...pal[k], 255], i * 4);
  });
  ctx.putImageData(img, 0, 0);
}

// ---------- the scenes ----------
// Each scene is a pure function of time: given seconds since it started, it
// says where each cat is (px from Simba's spot, + is right, y + is up), how
// it's posed, which way it faces, and what's floating over its head. Every
// scene starts and ends with Simba sitting at 0 and Cream sitting at REST.

type Beat = { x: number; y?: number; pose: Pose; face: 1 | -1; tail?: Tail; blink?: boolean; ears?: boolean; shake?: number; spin?: number; fx?: string };
type Scene = { name: string; s: number; at: (t: number) => { simba: Beat; cream: Beat } };

const REST = 240;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
const arc = (k: number, h: number) => Math.sin(k * Math.PI) * h;
const wiggle = (t: number) => Math.sin(t * 34) * 1.4;
const blinkAt = (t: number, ...at: number[]) => at.some((a) => t > a && t < a + 0.35);
// A run or walk from a to b between t0 and t1, facing the way it goes.
const go = (t: number, t0: number, t1: number, a: number, b: number, pose: Pose = "run"): Beat => ({
  x: lerp(a, b, seg(t, t0, t1)), pose, face: b > a ? 1 : -1, tail: "up",
});
const hop = (t: number, t0: number, t1: number, a: number, b: number, h: number, y0 = 0, y1 = 0): Beat => {
  const k = seg(t, t0, t1);
  return { x: lerp(a, b, k), y: lerp(y0, y1, k) + arc(k, h), pose: "jump", face: b > a ? 1 : -1 };
};
const sit = (x: number, face: 1 | -1, extra: Partial<Beat> = {}): Beat => ({ x, pose: "sit", face, ...extra });

const SCENES: Scene[] = [
  {
    // 1. The tail. Cream sneaks round behind him, wiggles, pounces on his tail,
    // then vaults over him and leaves. Simba looks back once, slow-blinks, stretches.
    name: "tail",
    s: 8.5,
    at: (t) => {
      let cream: Beat;
      if (t < 1.5) cream = go(t, 0, 1.5, REST, -95);
      else if (t < 2.7) cream = { x: -95, pose: "crouch", face: 1, shake: wiggle(t) };
      else if (t < 3.05) cream = hop(t, 2.7, 3.05, -95, -42, 16);
      else if (t < 4.3) cream = sit(-42, 1, { tail: "up" });
      else if (t < 4.95) cream = hop(t, 4.3, 4.95, -42, 110, 42);
      else if (t < 6) cream = go(t, 4.95, 6, 110, REST);
      else cream = sit(REST, -1, { pose: t < 7.4 ? "groom" : "sit" });
      const looking = t > 3.05 && t < 4.4;
      const simba: Beat = t > 6.4 && t < 7.8
        ? { x: 0, pose: "stretch", face: 1 }
        : sit(0, looking ? -1 : 1, { fx: t > 3.05 && t < 3.6 ? "?" : undefined, blink: blinkAt(t, 3.7, 5.2) });
      return { simba, cream };
    },
  },
  {
    // 2. Zoomies. Back and forth past him, over the top of him twice. He follows
    // her with his eyes, never his feet, and yawns at the end.
    name: "zoomies",
    s: 7.5,
    at: (t) => {
      let cream: Beat;
      if (t < 1) cream = go(t, 0, 1, REST, -170);
      else if (t < 2) cream = go(t, 1, 2, -170, REST);
      else if (t < 2.7) cream = go(t, 2, 2.7, REST, 55);
      else if (t < 3.3) cream = hop(t, 2.7, 3.3, 55, -80, 46);
      else if (t < 3.8) cream = go(t, 3.3, 3.8, -80, -150);
      else if (t < 4.4) cream = sit(-150, 1, { tail: "up" });
      else if (t < 4.9) cream = go(t, 4.4, 4.9, -150, -55);
      else if (t < 5.5) cream = hop(t, 4.9, 5.5, -55, 80, 46);
      else if (t < 6.3) cream = go(t, 5.5, 6.3, 80, REST);
      else cream = sit(REST, -1);
      const simba: Beat = t > 6.5 && t < 7.3
        ? { x: 0, pose: "yawn", face: 1 }
        : sit(0, cream.x < 0 ? -1 : 1, { blink: blinkAt(t, 3, 5.2) });
      return { simba, cream };
    },
  },
  {
    // 3. Boop. She walks up, sits nose to nose, boops him three times and swats
    // once. He takes every boop with a blink, then grooms himself at her.
    name: "boop",
    s: 8.5,
    at: (t) => {
      const boops = [2.4, 3.1, 3.8];
      const booping = boops.some((b) => t > b && t < b + 0.25);
      let cream: Beat;
      if (t < 2) cream = go(t, 0, 2, REST, 58, "walk");
      else if (t < 4.6) cream = { x: booping ? 50 : 58, pose: booping ? "crouch" : "sit", face: -1, tail: "up" };
      else if (t < 5.4) cream = { x: 56, pose: "crouch", face: -1, shake: wiggle(t), fx: "!" };
      else if (t < 6.2) cream = sit(58, -1);
      else if (t < 8) cream = go(t, 6.2, 8, 58, REST, "walk");
      else cream = sit(REST, -1);
      const simba: Beat = t > 5.6 && t < 7.8
        ? { x: 0, pose: "groom", face: 1 }
        : sit(0, 1, { blink: booping || blinkAt(t, 4.7) });
      return { simba, cream };
    },
  },
  {
    // 4. The nap. He falls asleep. She climbs on top of him and kneads. He stays asleep.
    name: "nap",
    s: 9.5,
    at: (t) => {
      let cream: Beat;
      if (t < 2.5) cream = sit(REST, -1, { pose: t < 2 ? "groom" : "sit" });
      else if (t < 4) cream = go(t, 2.5, 4, REST, 42, "walk");
      else if (t < 4.5) cream = hop(t, 4, 4.5, 42, 2, 22, 0, 24);
      else if (t < 7.2) cream = { x: 2, y: 24, pose: "crouch", face: -1, shake: Math.sin(t * 9) * 1.2 };
      else if (t < 7.7) cream = hop(t, 7.2, 7.7, 2, 90, 20, 24, 0);
      else if (t < 9) cream = go(t, 7.7, 9, 90, REST);
      else cream = sit(REST, -1);
      const simba: Beat = t < 1.4 ? { x: 0, pose: "loaf", face: 1 } : t < 9 ? { x: 0, pose: "sleep", face: 1, fx: "z" } : sit(0, 1, { blink: true });
      return { simba, cream };
    },
  },
  {
    // 5. The love bite. One pounce too many: he grabs her, they roll over in a
    // ball, and he grooms her until she gives up. Then they nap, together.
    name: "love",
    s: 11,
    at: (t) => {
      let cream: Beat, simba: Beat;
      if (t < 3.3) {
        if (t < 1.6) cream = go(t, 0, 1.6, REST, 72);
        else if (t < 3) cream = { x: 72, pose: "crouch", face: -1, shake: wiggle(t) };
        else cream = hop(t, 3, 3.3, 72, 22, 18);
        simba = sit(0, 1, { blink: blinkAt(t, 2) });
      } else if (t < 4.7) {
        // the wrestle: two cats, one ball
        const k = seg(t, 3.3, 4.7);
        cream = { x: lerp(22, 52, k), pose: "loaf", face: -1, spin: -ease(k) * 720 };
        simba = { x: lerp(0, 18, k), pose: "loaf", face: 1, spin: ease(k) * 720, fx: t < 3.8 ? "!" : undefined };
      } else if (t < 7.6) {
        cream = { x: 52, pose: "loaf", face: -1, blink: true };
        simba = { x: 18, pose: "groom", face: 1, fx: "♥" };
      } else if (t < 9.6) {
        cream = { x: 52, pose: "sleep", face: -1 };
        simba = { x: 18, pose: "sleep", face: 1, fx: "z" };
      } else {
        cream = go(t, 9.6, 11, 52, REST, "walk");
        simba = go(t, 9.6, 10.2, 18, 0, "walk");
        if (t > 10.2) simba = sit(0, 1);
      }
      return { simba, cream };
    },
  },
];
const LOOP = SCENES.reduce((s, c) => s + c.s, 0);

// The studio page: Cream is already in the room, so Simba goes to join her. He
// sits, wanders over, crouches and leaps up and forward out of the card, into the
// studio above. Where the arc ends on screen is where he climbs into the room.
const OUT = 3.9;
const walkOut = (t: number) => ({
  simba: t < 1.2 ? sit(0, 1, { blink: blinkAt(t, 0.6) })
    : t < 2.6 ? go(t, 1.2, 2.6, 0, 70, "walk")
    : t < 3.2 ? { x: 70, pose: "crouch" as const, face: 1 as const, shake: wiggle(t), fx: t > 2.8 ? "!" : undefined }
    : { ...hop(t, 3.2, OUT, 70, 300, 90, 0, 280), face: 1 as const },
  cream: sit(REST, -1),
});

function beatAt(time: number) {
  let t = time % LOOP;
  for (const sc of SCENES) {
    if (t < sc.s) return sc.at(t);
    t -= sc.s;
  }
  return SCENES[0].at(0);
}

const BELLY_S = 2.4;
const CATCH_UP = 320; // scene px a second, running back to the scene after a belly-up
const frameMs = (pose: Pose) =>
  pose === "run" ? 70 : pose === "walk" ? 125 : pose === "belly" ? 150 : pose === "groom" ? 250 : 600;

// One cat, on its own, looping one pose. For cameos outside the footer.
export function PixelSprite({ name, pose, className = "" }: { name: CatName; pose: Pose; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    let raf = 0, last = -1;
    const tick = (now: number) => {
      const frame = Math.floor(now / frameMs(pose)) % 4;
      if (frame !== last) {
        paint(cv, COATS[name], { pose, frame, tail: "up", blink: false, ears: true });
        last = frame;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [name, pose]);
  return <canvas ref={ref} width={W} height={H} className={`block [image-rendering:pixelated] ${className}`} />;
}

export function PixelCats({ scale = 3, className = "" }: { scale?: number; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const cvs = useRef<(HTMLCanvasElement | null)[]>([]);
  const fxs = useRef<(HTMLSpanElement | null)[]>([]);
  const reduce = useReducedMotion();
  const studio = usePathname() === "/studio";
  const cats: CatName[] = studio ? ["simba"] : CATS;
  const sw = W * scale, sh = H * scale;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const drawn = ["", ""];
    const bellies: Record<CatName, number> = { simba: -1, cream: -1 };
    // Where each cat flopped: the scene keeps running underneath, so hold it there.
    const pins: Record<CatName, number | null> = { simba: null, cream: null };
    // After getting up, how far the cat still is from where the scene wants it.
    // It runs that gap down instead of jumping.
    const gaps: Record<CatName, number> = { simba: 0, cream: 0 };
    let last = 0;

    const render = (beats: { simba: Beat; cream: Beat }, now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      const w = el.clientWidth;
      // Simba's spot, and how far the scenes may spread: everything squeezes
      // to fit on a phone.
      const span = Math.min(1, (w - sw) / (REST + 200 + sw));
      const anchor = Math.min(w - (REST * span + sw / 2), Math.max(sw / 2 + 180 * span, w * 0.1));
      cats.forEach((name, i) => {
        const b = { ...beats[name] };
        const wrap = els.current[i], cv = cvs.current[i], fx = fxs.current[i];
        const cw = sw * SIZE[name], ch = sh * SIZE[name];
        if (!wrap || !cv) return;
        // A click flops the cat onto its back, over whatever the scene is doing.
        if (bellies[name] >= 0) {
          const k = (now - bellies[name]) / 1000 / BELLY_S;
          if (k >= 1) {
            gaps[name] = (pins[name] ?? b.x) - b.x;
            bellies[name] = -1;
            pins[name] = null;
          } else {
            pins[name] ??= b.x;
            Object.assign(b, { x: pins[name], pose: "belly", y: 0, spin: 0, shake: 0, fx: undefined });
          }
        }
        if (bellies[name] < 0 && gaps[name] !== 0) {
          const g = gaps[name];
          gaps[name] = Math.sign(g) * Math.max(0, Math.abs(g) - CATCH_UP * dt);
          Object.assign(b, { x: b.x + gaps[name], pose: "run", face: g > 0 ? -1 : 1, tail: "up", y: 0, spin: 0, shake: 0, fx: undefined });
        }
        const frame = Math.floor(now / frameMs(b.pose)) % 4;
        const x = anchor + b.x * span + (b.shake ?? 0);
        const y = -(b.y ?? 0);
        wrap.style.transform = `translate3d(${Math.round(x - cw / 2)}px, ${Math.round(y - ch)}px, 0)`;
        cv.style.transform = `scaleX(${b.face}) rotate(${b.spin ?? 0}deg)`;
        if (fx) {
          fx.textContent = b.fx ?? "";
          fx.style.opacity = b.fx ? "1" : "0";
        }
        const look: Look = { pose: b.pose, frame, tail: b.tail ?? "mid", blink: !!b.blink, ears: b.ears ?? true };
        const key = `${look.pose}${look.frame}${look.tail}${look.blink}${look.ears}`;
        if (key !== drawn[i]) {
          paint(cv, COATS[name], look);
          drawn[i] = key;
        }
      });
    };

    const onBelly = (e: Event) => {
      const name = (e as CustomEvent<CatName>).detail;
      if (bellies[name] >= 0) return;
      bellies[name] = performance.now();
      catNote(NOTE[name]);
    };
    window.addEventListener("cat-belly", onBelly);

    // Simba has left the card for the room: hide him and tell the studio, once.
    let gone = false;
    const leave = () => {
      if (gone) return;
      gone = true;
      const r = els.current[0]?.getBoundingClientRect();
      if (els.current[0]) els.current[0].style.visibility = "hidden";
      window.dispatchEvent(new CustomEvent("simba-in", { detail: r ? r.left + r.width / 2 : innerWidth / 2 }));
    };
    if (studio && reduce) {
      render(walkOut(0), performance.now());
      leave();
      return () => window.removeEventListener("cat-belly", onBelly);
    }

    // Reduced motion: the last scene's ending, held. Groomed, together, done.
    if (reduce) {
      render({ simba: { x: 18, pose: "loaf", face: 1, fx: "♥" }, cream: { x: 52, pose: "loaf", face: -1 } }, 0);
      return () => window.removeEventListener("cat-belly", onBelly);
    }

    // Only animate while the footer is on screen; the story picks up where it left off.
    let raf = 0, visible = false, clock = 0, prev = 0;
    const tick = (now: number) => {
      clock += Math.min(0.05, (now - prev) / 1000);
      prev = now;
      if (studio) {
        if (clock >= OUT) return leave();
        render(walkOut(clock), now);
      } else render(beatAt(clock), now);
      if (visible) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) { prev = performance.now(); raf = requestAnimationFrame(tick); }
    });
    io.observe(el);
    render(studio ? walkOut(0) : beatAt(0), performance.now());

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("cat-belly", onBelly);
    };
  }, [reduce, sh, sw, studio]); // eslint-disable-line react-hooks/exhaustive-deps -- cats follows studio

  return (
    <div ref={box} aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      {cats.map((name, i) => (
        <div
          key={name}
          ref={(n) => void (els.current[i] = n)}
          className="pointer-events-auto absolute left-0 top-0 cursor-pointer will-change-transform"
          style={{ width: sw * SIZE[name], height: sh * SIZE[name] }}
          data-cursor={LABEL[name]}
          onClick={(e) => {
            e.stopPropagation();
            window.dispatchEvent(new CustomEvent("cat-belly", { detail: name }));
          }}
        >
          <canvas
            ref={(n) => void (cvs.current[i] = n)}
            width={W}
            height={H}
            className="block size-full [image-rendering:pixelated]"
          />
          <span
            ref={(n) => void (fxs.current[i] = n)}
            className="pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-[0.875rem] font-bold text-lamp opacity-0 transition-opacity duration-200"
          />
        </div>
      ))}
    </div>
  );
}
