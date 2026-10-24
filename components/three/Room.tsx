"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import * as THREE from "three";
import { Box, Bulb, Glow, Label, M, Model, Seated, TOON, useFontsReady, useModel, type V3 } from "./kit";
import { useInView3D } from "./useInView3D";
import { dark, light } from "@/lib/theme";
import { Cat, COATS } from "./Cat";
import { StudioSkeleton } from "./StudioSkeleton";
import { PixelArt } from "./PixelArt";

// AFTER HOURS, the room. One corner of one room at 2am: the desk, the lamp as the
// only warm light, the city outside, the gym corner, and Cream on the desk. In
// light mode it is the same room at golden hour. See ART-DIRECTION.md.

export type Hotspot = "lamp" | "monitor" | "cream" | "simba";

// ---------- the two hours ----------
type Hour = {
  floor: string; floorLine: string; wall: string; wall2: string; trim: string; paper: string; ink: string; accent: string;
  screen: string; sky: [string, string]; city: string; cityLit: string[]; moon: string | null; niche: [string, string];
  amb: number; hemi: [string, string, number]; key: { color: string; i: number; p: V3 }; lamp: number;
};
const NIGHT: Hour = {
  floor: "#6B5442", floorLine: "#56432F", wall: "#232838", wall2: "#1C2030", trim: "#161925", paper: "#EDE6DA", ink: "#1A1612", accent: dark.hex("lamp"),
  screen: "#0B0F1C", sky: ["#070A18", "#1A2048"], city: "#0C0F1D", cityLit: ["#FFC37A", "#FFD9A0", "#9FB4FF"], moon: "#F4F1E6", niche: ["#FFC27A", "#6E4430"],
  amb: 0.55, hemi: ["#5A6AAA", "#1A1C28", 0.7], key: { color: "#9FB2FF", i: 1.5, p: [-4.5, 3.6, 0.8] }, lamp: 1.6,
};
const GOLDEN: Hour = {
  floor: "#C9A27E", floorLine: "#B08967", wall: "#EFE6D8", wall2: "#E4D9C8", trim: "#D6C9B4", paper: "#FBF7F0", ink: "#1A1612", accent: light.hex("accent"),
  screen: "#0B0F1C", sky: ["#F7C98F", "#E8875A"], city: "#7A4C42", cityLit: ["#FFE2A8"], moon: null, niche: ["#FFF0D2", "#D9B48A"],
  amb: 0.7, hemi: ["#FFE2B8", "#7A5A48", 0.8], key: { color: "#FFC896", i: 2.0, p: [-4.5, 2.6, 0.9] }, lamp: 0.3,
};

// 16-bit: the room is drawn this many pixels tall, then scaled up without smoothing.
const ROWS = 320;

// Blocky on purpose: no smoothing, no mipmaps.
function blocky(t: THREE.Texture) {
  t.magFilter = t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  return t;
}

const ROOM = 3;
const H = ROOM / 2;
const WALL_H = 1.7;
const DESK_Y = 0.38;
const CREAM_HOME: V3 = [-0.3, DESK_Y, -1.02];
// Simba climbs in over the front edge of the floor, the side nearest the contact card, and loafs on the rug.
const SIMBA_ENTRY: V3 = [-0.25, -0.18, 1.7];
const SIMBA_HOME: V3 = [-0.4, 0.013, 0.2];

// Where Simba's leap ended on screen, as a spot just outside the floor's front edge below it.
// Screen x tracks x - z (the camera looks down the diagonal), centred on the room, at FitZoom's scale.
function entryAt(clientX: number, el: HTMLElement | null): V3 {
  if (!el) return SIMBA_ENTRY;
  const r = el.getBoundingClientRect();
  const zoom = Math.min(r.width / 4.0, r.height / 3.45);
  const s = THREE.MathUtils.clamp(((clientX - r.left - r.width / 2) / zoom) * Math.SQRT2, -2.6, 2.6);
  // The left front edge is z = H, the right one x = H; both keep x - z = s.
  return s < 0 ? [s + H, -0.18, H + 0.2] : [H + 0.2, -0.18, H - s];
}
// The whole work corner (desk, chair, prints, clock, Cream) slides along the back wall by this much,
// so it sits in the middle of the room instead of crowding the plant.
const WORK_X = -0.35;

// ---------- textures drawn once, no image files ----------
function usePlanks(h: Hour) {
  const tex = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 512;
    const g = cv.getContext("2d")!;
    g.fillStyle = h.floor;
    g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 10; i++) {
      const y = (i * 512) / 10;
      g.fillStyle = `rgba(0,0,0,${0.03 + ((i * 37) % 5) * 0.012})`;
      g.fillRect(0, y, 512, 51.2);
      g.fillStyle = h.floorLine;
      g.fillRect(0, y, 512, 2);
      const off = ((i * 173) % 512) - 40;
      g.fillRect(off, y, 2, 51.2);
      g.fillRect((off + 260) % 512, y, 2, 51.2);
    }
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return blocky(t);
  }, [h]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

// The view out of the window: a city at night (or at sunset), on a fixed seed so
// every visitor sees the same skyline.
function useSkyline(h: Hour) {
  const tex = useMemo(() => {
    const W = 512, Ht = 448;
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = Ht;
    const g = cv.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, Ht);
    grad.addColorStop(0, h.sky[0]);
    grad.addColorStop(1, h.sky[1]);
    g.fillStyle = grad;
    g.fillRect(0, 0, W, Ht);
    if (h.moon) {
      g.fillStyle = h.moon;
      g.beginPath();
      g.arc(W * 0.74, Ht * 0.2, 22, 0, Math.PI * 2);
      g.fill();
    } else {
      g.fillStyle = "rgba(255,228,170,0.9)";
      g.beginPath();
      g.arc(W * 0.3, Ht * 0.62, 46, 0, Math.PI * 2);
      g.fill();
    }
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    let x = -10;
    while (x < W) {
      const bw = 34 + rnd() * 52;
      const bh = Ht * (0.28 + rnd() * 0.42);
      g.fillStyle = h.city;
      g.fillRect(x, Ht - bh, bw, bh);
      for (let wy = Ht - bh + 10; wy < Ht - 8; wy += 14)
        for (let wx = x + 6; wx < x + bw - 8; wx += 11)
          if (rnd() > 0.62) {
            g.fillStyle = h.cityLit[Math.floor(rnd() * h.cityLit.length)];
            g.fillRect(wx, wy, 5, 7);
          }
      x += bw + 4;
    }
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return blocky(t);
  }, [h]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

// ---------- the room ----------
function Shell({ h }: { h: Hour }) {
  const planks = usePlanks(h);
  const skyline = useSkyline(h);
  return (
    <>
      <mesh position={[0, -0.06, 0]} receiveShadow castShadow>
        <boxGeometry args={[ROOM, 0.12, ROOM]} />
        <meshToonMaterial attach="material-0" color={h.floorLine} gradientMap={TOON} />
        <meshToonMaterial attach="material-1" color={h.floorLine} gradientMap={TOON} />
        <meshToonMaterial attach="material-2" map={planks} gradientMap={TOON} />
        <meshToonMaterial attach="material-3" color={h.floorLine} gradientMap={TOON} />
        <meshToonMaterial attach="material-4" color={h.floorLine} gradientMap={TOON} />
        <meshToonMaterial attach="material-5" color={h.floorLine} gradientMap={TOON} />
      </mesh>
      <Box p={[0, WALL_H / 2, -H - 0.05]} s={[ROOM, WALL_H, 0.1]} c={h.wall} rough={0.95} cast={false} />
      <Box p={[-H - 0.05, WALL_H / 2, -0.05]} s={[0.1, WALL_H, ROOM + 0.1]} c={h.wall2} rough={0.95} cast={false} />
      <Box p={[0, 0.04, -H + 0.01]} s={[ROOM, 0.08, 0.02]} c={h.trim} />
      <Box p={[-H + 0.01, 0.04, 0]} s={[0.02, 0.08, ROOM]} c={h.trim} />

      {/* The window: the city, lit from inside, bright enough to bloom. */}
      <group position={[-H + 0.005, 0.98, 0.42]}>
        <Box p={[0, 0, 0]} s={[0.04, 0.86, 0.96]} c={h.trim} />
        <mesh position={[0.025, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.84, 0.74]} />
          <meshBasicMaterial map={skyline} toneMapped={false} color={new THREE.Color(1.25, 1.25, 1.25)} />
        </mesh>
        <Box p={[0.035, 0, 0]} s={[0.02, 0.76, 0.03]} c={h.trim} />
        <Box p={[0.035, 0, 0]} s={[0.02, 0.03, 0.86]} c={h.trim} />
        <Box p={[0.07, -0.44, 0]} s={[0.12, 0.03, 1.02]} c={h.trim} />
      </group>
    </>
  );
}

// Three prints taped above the desk, drawn once to canvas in the pixel font: homages to Interstellar, Cars and Game of Thrones (Q122, Q125-Q129),
// made for this room rather than copied from the real posters.
type Faces = { serif: string; sans: string; wide: string };
type Draw = (g: CanvasRenderingContext2D, w: number, h: number, f: Faces) => void;
const PW = 480, PH = 640;

const face = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

function text(g: CanvasRenderingContext2D, s: string, x: number, y: number, font: string, color: string, track = 0, stretch = false) {
  g.font = font;
  g.fillStyle = color;
  if ("letterSpacing" in g) (g as unknown as { letterSpacing: string }).letterSpacing = `${track}px`;
  if ("fontStretch" in g) (g as unknown as { fontStretch: string }).fontStretch = stretch ? "expanded" : "normal";
  g.fillText(s, x, y);
}

// A repeatable scatter, so the stars and the crowd land in the same place every load.
const seeded = (s: number) => () => ((s = (s * 16807) % 2147483647) / 2147483647);

// Interstellar: Gargantua, its disk crossing in front, the Endurance a speck beside it.
const drawInterstellar: Draw = (g, w, h, f) => {
  g.fillStyle = "#05060A";
  g.fillRect(0, 0, w, h);
  const rnd = seeded(11);
  for (let i = 0; i < 140; i++) {
    g.fillStyle = `rgba(235,238,245,${0.2 + rnd() * 0.6})`;
    g.fillRect(rnd() * w, rnd() * h * 0.72, rnd() < 0.9 ? 1.2 : 2.2, rnd() < 0.9 ? 1.2 : 2.2);
  }
  const cx = w / 2, cy = h * 0.4, R = w * 0.19;
  const band = (front: boolean) => {
    g.save();
    if (front) {
      g.beginPath();
      g.rect(0, cy, w, h);
      g.clip();
    }
    const grad = g.createLinearGradient(cx - w * 0.48, 0, cx + w * 0.48, 0);
    grad.addColorStop(0, "rgba(255,170,90,0)");
    grad.addColorStop(0.25, "#FFB061");
    grad.addColorStop(0.5, "#FFF3DC");
    grad.addColorStop(0.75, "#FFB061");
    grad.addColorStop(1, "rgba(255,170,90,0)");
    g.fillStyle = grad;
    g.shadowColor = "#FF9C4A";
    g.shadowBlur = 30;
    g.beginPath();
    g.ellipse(cx, cy, w * 0.48, R * 0.16, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  };
  // The light bent over the top and under the bottom of the hole.
  g.save();
  g.shadowColor = "#FFB061";
  g.shadowBlur = 40;
  g.strokeStyle = "#FFD9A0";
  g.lineWidth = 9;
  g.beginPath();
  g.arc(cx, cy, R * 1.12, 0, Math.PI * 2);
  g.stroke();
  g.shadowBlur = 0;
  g.strokeStyle = "#FFF6E6";
  g.lineWidth = 2.5;
  g.stroke();
  g.restore();
  band(false);
  g.fillStyle = "#000000";
  g.beginPath();
  g.arc(cx, cy, R, 0, Math.PI * 2);
  g.fill();
  band(true);
  // The Endurance: a ring of twelve modules, tiny against it.
  const ex = w * 0.76, ey = h * 0.6;
  g.fillStyle = "#C9CDD6";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    g.save();
    g.translate(ex + Math.cos(a) * 11, ey + Math.sin(a) * 11);
    g.rotate(a);
    g.fillRect(-2, -3.5, 4, 7);
    g.restore();
  }
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  text(g, "INTERSTELLAR", w / 2, h * 0.82, `700 ${w * 0.074}px ${f.wide}`, "#EDE6DA", 6, true);
  text(g, "DO NOT GO GENTLE", w / 2, h * 0.875, `500 ${w * 0.03}px ${f.sans}`, "#9A9EA6", 6);
  text(g, "2014", w / 2, h * 0.94, `600 ${w * 0.03}px ${f.sans}`, "#5C6070", 4);
};

// Cars: the Piston Cup, last lap under the lights, one red car breaking away.
const drawCars: Draw = (g, w, h, f) => {
  const sky = g.createLinearGradient(0, 0, 0, h * 0.55);
  sky.addColorStop(0, "#0B1030");
  sky.addColorStop(0.6, "#3A2050");
  sky.addColorStop(1, "#E8703A");
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);
  // The grandstand: a dark band full of camera flashes.
  g.fillStyle = "#15131C";
  g.fillRect(0, h * 0.4, w, h * 0.12);
  const rnd = seeded(7);
  for (let i = 0; i < 160; i++) {
    g.fillStyle = rnd() < 0.15 ? "#FFF3D6" : `rgba(255,${150 + rnd() * 80},${90 + rnd() * 60},${0.25 + rnd() * 0.4})`;
    g.fillRect(rnd() * w, h * 0.41 + rnd() * h * 0.1, 2, 2);
  }
  // The banked oval, sweeping through the frame.
  g.fillStyle = "#2A2B30";
  g.beginPath();
  g.moveTo(0, h * 0.56);
  g.quadraticCurveTo(w * 0.5, h * 0.48, w, h * 0.53);
  g.lineTo(w, h * 0.78);
  g.quadraticCurveTo(w * 0.5, h * 0.7, 0, h * 0.84);
  g.closePath();
  g.fill();
  g.fillStyle = "#121318";
  g.beginPath();
  g.moveTo(0, h * 0.84);
  g.quadraticCurveTo(w * 0.5, h * 0.7, w, h * 0.78);
  g.lineTo(w, h);
  g.lineTo(0, h);
  g.fill();
  g.strokeStyle = "rgba(237,230,218,0.55)";
  g.lineWidth = 3;
  g.setLineDash([22, 18]);
  g.beginPath();
  g.moveTo(0, h * 0.7);
  g.quadraticCurveTo(w * 0.5, h * 0.59, w, h * 0.655);
  g.stroke();
  g.setLineDash([]);
  // Speed: streaks trailing off the left edge.
  for (let i = 0; i < 26; i++) {
    const y = h * 0.56 + rnd() * h * 0.16, len = 60 + rnd() * 180, x = rnd() * w * 0.4;
    g.strokeStyle = `rgba(255,${200 + rnd() * 50},${170 + rnd() * 60},${0.08 + rnd() * 0.25})`;
    g.lineWidth = 1 + rnd() * 2;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + len, y - len * 0.04);
    g.stroke();
  }
  // A stock car in profile: no face, just the red, the stripe and the 95.
  const car = (alpha: number, dx: number) => {
    g.save();
    g.globalAlpha = alpha;
    g.translate(w * 0.32 + dx, h * 0.555);
    g.rotate(-0.06);
    g.scale(1.05, 1.05);
    g.fillStyle = "#D9261C";
    g.beginPath();
    g.moveTo(10, 62); g.lineTo(4, 40); g.lineTo(18, 30); g.lineTo(14, 16); g.lineTo(42, 16); g.lineTo(42, 28);
    g.lineTo(90, 26); g.quadraticCurveTo(110, 4, 150, 6); g.quadraticCurveTo(176, 8, 190, 28);
    g.lineTo(234, 36); g.quadraticCurveTo(252, 42, 248, 58); g.closePath();
    g.fill();
    if (alpha === 1) {
      g.fillStyle = "#15131C";
      g.beginPath();
      g.moveTo(116, 11); g.lineTo(150, 10); g.lineTo(178, 27); g.lineTo(118, 27); g.closePath();
      g.fill();
      g.fillStyle = "#F5C518";
      g.fillRect(20, 44, 216, 5);
      g.fillStyle = "#FFFFFF";
      g.beginPath();
      g.arc(128, 42, 14, 0, Math.PI * 2);
      g.fill();
      g.textAlign = "center";
      g.textBaseline = "middle";
      text(g, "95", 128, 43, `800 15px ${f.wide}`, "#D9261C", 0, true);
      for (const x of [56, 202]) {
        g.fillStyle = "#0E0E10";
        g.beginPath();
        g.arc(x, 62, 16, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#9A9EA6";
        g.beginPath();
        g.arc(x, 62, 6, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.restore();
  };
  car(0.12, -48);
  car(0.22, -26);
  car(1, 0);
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  text(g, "CARS", w / 2, h * 0.2, `800 ${w * 0.22}px ${f.wide}`, "#F5C518", 4, true);
  text(g, "PISTON CUP · FINAL LAP", w / 2, h * 0.265, `600 ${w * 0.034}px ${f.sans}`, "#EDE6DA", 5);
  text(g, "I am speed.", w / 2, h * 0.92, `italic 400 ${w * 0.075}px ${f.serif}`, "#EDE6DA");
};

// Game of Thrones: the Iron Throne in a shaft of cold light.
const drawThrone: Draw = (g, w, h, f) => {
  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#1C232C");
  bg.addColorStop(1, "#0A0C10");
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  const cx = w / 2;
  const beam = g.createLinearGradient(0, 0, 0, h * 0.86);
  beam.addColorStop(0, "rgba(200,220,255,0.24)");
  beam.addColorStop(1, "rgba(200,220,255,0)");
  g.fillStyle = beam;
  g.beginPath();
  g.moveTo(cx - w * 0.08, 0); g.lineTo(cx + w * 0.08, 0); g.lineTo(cx + w * 0.36, h * 0.86); g.lineTo(cx - w * 0.36, h * 0.86);
  g.fill();
  const rnd = seeded(5);
  for (let i = 0; i < 50; i++) {
    g.fillStyle = `rgba(220,232,255,${0.1 + rnd() * 0.3})`;
    g.fillRect(cx + (rnd() - 0.5) * w * 0.4, rnd() * h * 0.8, 1.5, 1.5);
  }
  // The back: a fan of blades, hilts down, longest in the middle.
  const oy = h * 0.62, n = 38;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const a = (t - 0.5) * 1.5 + (rnd() - 0.5) * 0.06;
    const len = h * (0.16 + 0.3 * (1 - Math.abs(t - 0.5) * 1.7)) + rnd() * 26;
    g.save();
    g.translate(cx + (t - 0.5) * w * 0.3, oy);
    g.rotate(a);
    const steel = g.createLinearGradient(-4, 0, 4, 0);
    steel.addColorStop(0, "#3A4048");
    steel.addColorStop(0.5, "#A8B2BE");
    steel.addColorStop(1, "#2A3038");
    g.fillStyle = steel;
    g.beginPath();
    g.moveTo(-3.5, -24); g.lineTo(0, -len); g.lineTo(3.5, -24); g.closePath();
    g.fill();
    g.fillStyle = "#4A525C";
    g.fillRect(-9, -26, 18, 4);
    g.fillStyle = "#23282F";
    g.fillRect(-2, -22, 4, 18);
    g.restore();
  }
  // The seat, the arms and three steps, lit from above.
  const block = (x: number, y: number, bw: number, bh: number, c: string) => {
    g.fillStyle = c;
    g.fillRect(x, y, bw, bh);
    g.fillStyle = "rgba(190,206,226,0.55)";
    g.fillRect(x, y, bw, 2);
  };
  block(cx - w * 0.18, h * 0.6, w * 0.36, h * 0.11, "#262C34");
  block(cx - w * 0.23, h * 0.56, w * 0.06, h * 0.15, "#1E232A");
  block(cx + w * 0.17, h * 0.56, w * 0.06, h * 0.15, "#1E232A");
  block(cx - w * 0.26, h * 0.71, w * 0.52, h * 0.035, "#1B1F25");
  block(cx - w * 0.31, h * 0.745, w * 0.62, h * 0.035, "#171A20");
  block(cx - w * 0.36, h * 0.78, w * 0.72, h * 0.04, "#13161B");
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  text(g, "WINTER IS COMING", w / 2, h * 0.08, `600 ${w * 0.03}px ${f.sans}`, "#8C9AAC", 7);
  text(g, "GAME OF THRONES", w / 2, h * 0.9, `700 ${w * 0.06}px ${f.wide}`, "#D6DEE8", 5, true);
};

function usePoster(draw: Draw) {
  const fonts = useFontsReady();
  const tex = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = PW;
    cv.height = PH;
    const g = cv.getContext("2d")!;
    const pixel = face("--font-pixel", "monospace");
    draw(g, PW, PH, { serif: pixel, sans: pixel, wide: pixel });
    // Averaged down, not point-sampled: the palette pass does the pixelating, so fine art doesn't sparkle.
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [draw, fonts]); // eslint-disable-line react-hooks/exhaustive-deps -- redraw once fonts load
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

// Paper, lit by the room, with a little light of its own so it still reads at 2am.
function Print({ draw, p, tilt, h }: { draw: Draw; p: V3; tilt: number; h: Hour }) {
  const tex = usePoster(draw);
  const w = 0.3, ht = 0.4;
  return (
    <group position={p} rotation={[0, 0, tilt]}>
      <mesh receiveShadow>
        <planeGeometry args={[w, ht]} />
        <meshToonMaterial map={tex} emissiveMap={tex} emissive="#FFFFFF" emissiveIntensity={h === NIGHT ? 0.32 : 0.08} gradientMap={TOON} />
      </mesh>
      <Box p={[-w / 2 + 0.03, ht / 2 - 0.004, 0.003]} s={[0.07, 0.022, 0.003]} c="#E8DFC8" r={[0, 0, 0.5]} cast={false} />
      <Box p={[w / 2 - 0.03, ht / 2 - 0.004, 0.003]} s={[0.07, 0.022, 0.003]} c="#E8DFC8" r={[0, 0, -0.5]} cast={false} />
    </group>
  );
}

function Posters({ h }: { h: Hour }) {
  const prints = [drawInterstellar, drawCars, drawThrone];
  return (
    <>
      {prints.map((draw, i) => (
        <Print key={i} draw={draw} p={[-0.34 + i * 0.4, 1.15, -H + 0.012]} tilt={(i - 1) * -0.03} h={h} />
      ))}
      {/* Learn it at 2am. */}
      <group position={[0.98, 1.2, -H + 0.012]}>
        <mesh>
          <circleGeometry args={[0.16, 40]} />
          <meshToonMaterial color={h.paper} gradientMap={TOON} />
        </mesh>
        <Label text="2:00" size={0.07} color={h.ink} p={[0, 0, 0.004]} />
      </group>
    </>
  );
}

// ---------- the gym corner ----------
// A bench, a loaded barbell on the floor, a pair of hex dumbbells and a
// kettlebell. Iron and steel catch the lamp; the plates carry the site's rust.
const IRON = "#2A2B30", STEEL = "#9A9EA6", RUBBER = "#18181B", PAD = "#6E2430";

function Cyl({ p, r = [0, 0, 0], rad, len, c, seg = 28 }: { p: V3; r?: V3; rad: number; len: number; c: string; metal?: number; rough?: number; seg?: number }) {
  return (
    <mesh position={p} rotation={r} castShadow receiveShadow>
      <cylinderGeometry args={[rad, rad, len, seg]} />
      <meshToonMaterial color={c} gradientMap={TOON} />
    </mesh>
  );
}

// Everything on a bar lies along x, so cylinders turn a quarter onto their side.
const SIDE: V3 = [0, 0, Math.PI / 2];

function Barbell({ p, r = 0, accent }: { p: V3; r?: number; accent: string }) {
  const R = 0.085;
  return (
    <group position={p} rotation={[0, r, 0]}>
      <Cyl p={[0, R, 0]} r={SIDE} rad={0.0065} len={0.94} c={STEEL} metal={0.85} rough={0.3} seg={12} />
      {[1, -1].map((side) => (
        <group key={side}>
          <Cyl p={[0.335 * side, R, 0]} r={SIDE} rad={R} len={0.03} c={accent} metal={0.05} rough={0.7} />
          <Cyl p={[0.335 * side, R, 0]} r={SIDE} rad={0.022} len={0.034} c={STEEL} metal={0.8} rough={0.35} />
          <Cyl p={[0.368 * side, R, 0]} r={SIDE} rad={0.062} len={0.024} c={RUBBER} metal={0} rough={0.85} />
          <Cyl p={[0.392 * side, R, 0]} r={SIDE} rad={0.013} len={0.016} c={STEEL} metal={0.85} rough={0.3} seg={12} />
        </group>
      ))}
    </group>
  );
}

function Dumbbell({ p, r = 0 }: { p: V3; r?: number }) {
  const R = 0.028;
  return (
    <group position={p} rotation={[0, r, 0]}>
      <Cyl p={[0, R * 0.87, 0]} r={SIDE} rad={0.0065} len={0.1} c={STEEL} metal={0.85} rough={0.3} seg={12} />
      {[1, -1].map((side) => (
        <Cyl key={side} p={[0.066 * side, R * 0.87, 0]} r={[Math.PI / 6, 0, Math.PI / 2]} rad={R} len={0.036} c={RUBBER} metal={0} rough={0.8} seg={6} />
      ))}
    </group>
  );
}

function Kettlebell({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <mesh position={[0, 0.045, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.048, 24, 16]} />
        <meshToonMaterial color={IRON} gradientMap={TOON} />
      </mesh>
      <mesh position={[0, 0.098, 0]} castShadow>
        <torusGeometry args={[0.028, 0.007, 10, 24, Math.PI]} />
        <meshToonMaterial color={IRON} gradientMap={TOON} />
      </mesh>
      <Box p={[0, 0.006, 0]} s={[0.06, 0.012, 0.06]} c={IRON} metal={0.6} rough={0.5} />
    </group>
  );
}

function Bench({ p, r = 0 }: { p: V3; r?: number }) {
  return (
    <group position={p} rotation={[0, r, 0]}>
      <Box p={[0, 0.19, 0]} s={[0.17, 0.045, 0.6]} c={PAD} rough={0.55} />
      <Box p={[0, 0.162, 0]} s={[0.05, 0.016, 0.54]} c={IRON} metal={0.5} rough={0.45} />
      {[0.23, -0.23].map((z) => (
        <group key={z}>
          <Box p={[0, 0.08, z]} s={[0.04, 0.15, 0.04]} c={IRON} metal={0.5} rough={0.45} />
          <Box p={[0, 0.012, z]} s={[0.2, 0.024, 0.045]} c={IRON} metal={0.5} rough={0.45} />
        </group>
      ))}
    </group>
  );
}

function Gym({ h }: { h: Hour }) {
  return (
    <>
      <Bench p={[1.18, 0, 0.42]} />
      <Barbell p={[0.72, 0, 1.22]} accent={h.accent} />
      <Dumbbell p={[1.26, 0, 0.94]} />
      <Dumbbell p={[1.26, 0, 1.08]} r={0.12} />
      <Kettlebell p={[1.24, 0, -0.52]} />
    </>
  );
}

// ---------- the shelves ----------
// Staggered cubes on the side wall, walnut and ebony, each lit warm from inside
// like modern cube shelving. Books in small groups, the odd vase or plant. The
// ebony cubes stand a little prouder of the wall than the walnut ones. Shallow,
// because the camera looks across them from high up and deep cubes hide their light.
const BOARD = 0.022;
const WALNUT = "#5A3D2B", EBONY = "#211C19";

// A cube's inside, lit by a strip under its top: the light falls off in bands
// down the back and sides, the way it reads at 16 bits, and pools on the floor.
// It's a box seen from within, so of its faces (+x, -x, +y, -y, +z, -z) only
// the back, the floor and the far side draw.
function useNiche(h: Hour) {
  const inside = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 1;
    cv.height = 8;
    const g = cv.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 8);
    grad.addColorStop(0, h.niche[0]);
    grad.addColorStop(1, h.niche[1]);
    g.fillStyle = grad;
    g.fillRect(0, 0, 1, 8);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    const glow = new THREE.MeshBasicMaterial({ map: blocky(t), side: THREE.BackSide, toneMapped: false });
    const floor = new THREE.MeshBasicMaterial({ color: h.niche[1], side: THREE.BackSide, toneMapped: false });
    return [glow, glow, glow, floor, glow, glow];
  }, [h]);
  useEffect(
    () => () => {
      inside[0].map?.dispose();
      inside[0].dispose();
      inside[3].dispose();
    },
    [inside]
  );
  return inside;
}

// One cube, open to the room: four boards round its lit inside, and what it
// holds standing on its floor. z and y are its edges on the wall.
function Cube({ z, y, dark, inside, children }: { z: [number, number]; y: [number, number]; dark?: boolean; inside: THREE.Material[]; children: React.ReactNode }) {
  const w = z[1] - z[0], ht = y[1] - y[0], d = dark ? 0.14 : 0.12, c = dark ? EBONY : WALNUT;
  return (
    <group position={[-H + d / 2, (y[0] + y[1]) / 2, (z[0] + z[1]) / 2]}>
      {[1, -1].map((side) => (
        <group key={side}>
          <Box p={[0, (side * (ht - BOARD)) / 2, 0]} s={[d, BOARD, w]} c={c} />
          <Box p={[0, 0, (side * (w - BOARD)) / 2]} s={[d, ht - BOARD * 2, BOARD]} c={c} />
        </group>
      ))}
      <mesh material={inside}>
        <boxGeometry args={[d - 0.004, ht - BOARD * 2 - 0.004, w - BOARD * 2 - 0.004]} />
      </mesh>
      <group position={[0, BOARD - ht / 2, 0]}>{children}</group>
    </group>
  );
}

// Upright books in a group, spines out, in the room's own colours.
function Books({ n, z = 0, h }: { n: number; z?: number; h: Hour }) {
  const spines = [h.paper, h.ink, h.accent, STEEL, PAD];
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const tall = 0.12 + ((i * 5 + n) % 4) * 0.014;
        return <Box key={i} p={[0, tall / 2, z + (i - (n - 1) / 2) * 0.024]} s={[0.08, tall, 0.022]} c={spines[(i + n) % spines.length]} cast={false} />;
      })}
    </>
  );
}

// A few books lying flat, each a little smaller up the pile.
function Stack({ n = 3, z = 0, h }: { n?: number; z?: number; h: Hour }) {
  const covers = [h.ink, h.paper, h.accent];
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <Box key={i} p={[0, 0.011 + i * 0.022, z]} s={[0.085 - i * 0.008, 0.022, 0.15 - i * 0.02]} c={covers[i % 3]} cast={false} />
      ))}
    </>
  );
}

// A round vase with a short neck.
function Vase({ z = 0, c }: { z?: number; c: string }) {
  return (
    <>
      <mesh position={[0, 0.035, z]}>
        <sphereGeometry args={[0.035, 16, 12]} />
        <meshToonMaterial color={c} gradientMap={TOON} />
      </mesh>
      <Cyl p={[0, 0.08, z]} rad={0.012} len={0.03} c={c} seg={12} />
    </>
  );
}

// Between the back corner and the window. Neighbours touch along an edge and
// alternate wood, so the wall reads as one interlocking piece.
function Shelves({ h }: { h: Hour }) {
  const inside = useNiche(h);
  return (
    <>
      <Cube z={[-1.42, -1.12]} y={[0.5, 0.76]} inside={inside}><Books n={5} z={-0.04} h={h} /><Vase z={0.075} c={h.ink} /></Cube>
      <Cube z={[-1.42, -1.18]} y={[0.76, 1.08]} inside={inside} dark><Model name="pottedPlant" s={0.3} /></Cube>
      <Cube z={[-1.42, -1.14]} y={[1.14, 1.36]} inside={inside} dark><Stack h={h} /></Cube>
      <Cube z={[-1.12, -0.8]} y={[0.6, 0.84]} inside={inside} dark><Books n={4} h={h} /></Cube>
      <Cube z={[-1.18, -0.88]} y={[0.84, 1.14]} inside={inside}><Books n={3} z={-0.08} h={h} /><Stack n={2} z={0.045} h={h} /></Cube>
      <Cube z={[-1.06, -0.74]} y={[1.14, 1.44]} inside={inside} dark><Model name="pottedPlant" s={0.3} p={[0, 0, 0.06]} /><Books n={3} z={-0.08} h={h} /></Cube>
      <Cube z={[-0.8, -0.52]} y={[0.44, 0.74]} inside={inside}><Books n={6} h={h} /></Cube>
      <Cube z={[-0.74, -0.46]} y={[0.74, 1.0]} inside={inside} dark><Vase c={h.paper} /></Cube>
      <Cube z={[-0.74, -0.42]} y={[1.0, 1.24]} inside={inside}><Stack h={h} /></Cube>
      <Cube z={[-0.46, -0.2]} y={[0.56, 0.82]} inside={inside}><Books n={4} h={h} /></Cube>
      <Cube z={[-0.42, -0.2]} y={[0.82, 1.06]} inside={inside} dark><Stack n={2} h={h} /></Cube>
    </>
  );
}

// The monitor, showing Polaris: dark UI, a headline, two cards.
function Monitor({ h, onPick, onHover }: { h: Hour; onPick: () => void; onHover: (v: Hotspot | null) => void }) {
  return (
    <group position={[0.2, DESK_Y, -1.3]} {...hover("monitor", onHover)} onClick={stop(onPick)}>
      <Model name="computerScreen" />
      <group position={[0, 0.185, 0.012]}>
        <Glow p={[0, 0, 0]} w={0.355} h={0.2} c={h.screen} />
        <Glow p={[-0.08, 0.04, 0.001]} w={0.14} h={0.03} c="#E9E6DF" />
        <Glow p={[-0.09, -0.005, 0.001]} w={0.12} h={0.016} c="#8D8A84" />
        <Glow p={[0.1, 0.02, 0.001]} w={0.11} h={0.07} c="#252833" />
        <Glow p={[0.1, -0.06, 0.001]} w={0.11} h={0.06} c="#252833" />
        <Glow p={[0.07, -0.072, 0.002]} w={0.05} h={0.012} c="#3FBF8A" />
        <pointLight position={[0, 0, 0.3]} intensity={0.45} distance={1.5} color="#8EA2FF" />
      </group>
    </group>
  );
}

// Pointer helpers: hover reports what's under the cursor; click must not fall through.
const stop = (fn: () => void) => (e: ThreeEvent<MouseEvent>) => {
  e.stopPropagation();
  fn();
};
const hover = (id: Hotspot, onHover: (v: Hotspot | null) => void) => ({
  onPointerOver: (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
    onHover(id);
  },
  onPointerOut: () => {
    document.body.style.cursor = "";
    onHover(null);
  },
});

// A desk built for this room rather than taken from a kit: walnut top, dark
// legs, a drawer unit on the right. Bevelled like everything else in here.
const DESK = { x: 0.15, z: -1.12, w: 1.3, d: 0.6 };
function Desk() {
  const top = "#6B4A33", leg = "#2A2420";
  const { x, z, w, d } = DESK;
  return (
    <group position={[x, 0, z]}>
      <Box p={[0, DESK_Y - 0.02, 0]} s={[w, 0.04, d]} c={top} rough={0.55} />
      <Box p={[-w / 2 + 0.05, (DESK_Y - 0.04) / 2, 0]} s={[0.04, DESK_Y - 0.04, d - 0.06]} c={leg} />
      <Box p={[w / 2 - 0.19, (DESK_Y - 0.04) / 2, 0]} s={[0.3, DESK_Y - 0.04, d - 0.06]} c={leg} />
      <Box p={[w / 2 - 0.19, 0.24, d / 2 - 0.025]} s={[0.26, 0.006, 0.01]} c="#4A4038" cast={false} />
      <Box p={[w / 2 - 0.19, 0.12, d / 2 - 0.025]} s={[0.26, 0.006, 0.01]} c="#4A4038" cast={false} />
      <Box p={[-0.1, DESK_Y - 0.12, -d / 2 + 0.06]} s={[w - 0.4, 0.16, 0.02]} c={leg} />
    </group>
  );
}

// A rug in the site's own colours: ivory with an editorial-blue border.
function Rug({ h }: { h: Hour }) {
  return (
    <group position={[-0.15, 0, -0.15]}>
      <Box p={[0, 0.006, 0]} s={[1.6, 0.012, 1.2]} c={h === NIGHT ? dark.hex("deep") : light.hex("lamp")} rough={1} cast={false} />
      <Box p={[0, 0.0125, 0]} s={[1.44, 0.004, 1.04]} c={h === NIGHT ? "#A8977C" : "#E2D3B8"} rough={1} cast={false} />
    </group>
  );
}

// The mug: on the desk's front corner by Cream, the edge she jumps off, until she
// happens to it. It lands clear of her laps.
function Mug({ knocked, still }: { knocked: boolean; still: boolean }) {
  const g = useRef<THREE.Group>(null);
  const t0 = useRef(0);
  const from = useMemo(() => new THREE.Vector3(-0.43, DESK_Y, -0.9), []);
  const to = useMemo(() => new THREE.Vector3(-0.66, 0.02, -0.76), []);
  useEffect(() => {
    t0.current = 0;
  }, [knocked]);
  useFrame((_, d) => {
    if (!g.current) return;
    if (!knocked) {
      g.current.position.copy(from);
      g.current.rotation.set(0, 0.4, 0);
      return;
    }
    t0.current = still ? 1 : Math.min(1, t0.current + d / 0.55);
    const k = t0.current;
    g.current.position.lerpVectors(from, to, k);
    g.current.position.y = THREE.MathUtils.lerp(from.y, to.y, k * k) + Math.sin(k * Math.PI) * 0.12;
    g.current.rotation.set(0, 0.4 + k * 2, k * (Math.PI / 2));
  });
  return (
    <group ref={g}>
      <Model name="food/mug" s={0.25} />
    </group>
  );
}

// The desk lamp: the key light for the whole room, and a switch. The bulb sits
// inside the shade, so the shade must not cast a shadow, or it swallows the
// light it is meant to throw across the desk.
function DeskLamp({ on, h, onPick, onHover }: { on: boolean; h: Hour; onPick: () => void; onHover: (v: Hotspot | null) => void }) {
  const lamp = useModel("lampRoundTable");
  useMemo(() => lamp.traverse((m) => (m.castShadow = false)), [lamp]);
  return (
    <group position={[-0.34, DESK_Y, -1.28]} {...hover("lamp", onHover)} onClick={stop(onPick)}>
      <primitive object={lamp} />
      <Bulb p={[0.03, 0.24, 0]} on={on} intensity={h.lamp} distance={1.3} size={0.024} color="#FFA860" />
    </group>
  );
}

function Lights({ h, on, still }: { h: Hour; on: boolean; still: boolean }) {
  const amb = useRef<THREE.AmbientLight>(null);
  const invalidate = useThree((s) => s.invalidate);
  useFrame((_, d) => {
    if (!amb.current) return;
    const target = h.amb * (on ? 1 : 0.55);
    amb.current.intensity += (target - amb.current.intensity) * (still ? 1 : 1 - Math.exp(-5 * d));
    if (Math.abs(target - amb.current.intensity) > 0.002) invalidate();
  });
  return (
    <>
      <ambientLight ref={amb} intensity={h.amb} />
      <hemisphereLight args={[h.hemi[0], h.hemi[1], h.hemi[2]]} />
      {/* Moonlight at night, low sun at golden hour, both through the window. */}
      <directionalLight
        position={h.key.p}
        intensity={h.key.i}
        color={h.key.color}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-2.3}
        shadow-camera-right={2.3}
        shadow-camera-top={2.3}
        shadow-camera-bottom={-2.3}
        shadow-camera-near={1}
        shadow-camera-far={14}
        shadow-bias={-0.0003}
        shadow-normalBias={0.015}
      />
    </>
  );
}

function Scene({
  h,
  lampOn,
  chaos,
  simba,
  simbaFuss,
  simbaFrom,
  still,
  onHover,
  onPick,
}: {
  h: Hour;
  lampOn: boolean;
  chaos: number;
  simba: boolean;
  simbaFuss: number;
  simbaFrom: V3;
  still: boolean;
  onHover: (v: Hotspot | null) => void;
  onPick: (v: Hotspot) => void;
}) {
  // Cream's chaos: she bolts round the room and the mug goes over, and stays where it fell.
  const [knocked, setKnocked] = useState(false);
  useEffect(() => {
    if (chaos) setKnocked(true);
  }, [chaos]);

  return (
    <group>
      <Shell h={h} />
      <Rug h={h} />
      <Gym h={h} />

      {/* The desk, at 2am. */}
      <group position={[WORK_X, 0, 0]}>
        <Posters h={h} />
        <Desk />
        <Monitor h={h} onPick={() => onPick("monitor")} onHover={onHover} />
        <Model name="computerKeyboard" p={[0.2, DESK_Y, -1.06]} />
        <Model name="computerMouse" p={[0.44, DESK_Y, -1.06]} />
        <DeskLamp on={lampOn} h={h} onPick={() => onPick("lamp")} onHover={onHover} />
        <Mug knocked={knocked} still={still} />
        {/* Swivelled a little toward the mouse, so the camera catches his profile and beard. */}
        <Seated name="chairDesk" p={[0.24, 0, -0.62]} r={Math.PI - 0.5} face={Math.PI - 0.5} still={still} />

        {/* Cream: loafed next to the lamp (Q45). Click her and she does laps. */}
        <group {...hover("cream", onHover)} onClick={stop(() => onPick("cream"))}>
          <Cat home={CREAM_HOME} homeYaw={0.7} scale={0.95} runs={chaos} still={still} />
        </group>
      </group>

      {/* Simba: comes in from the contact card. Click him and he complains about it. */}
      <group {...hover("simba", onHover)} onClick={stop(() => onPick("simba"))}>
        <Cat coat={COATS.simba} home={SIMBA_HOME} homeYaw={0.9} scale={1.15} fuss={simbaFuss} still={still} entry={simbaFrom} inside={simba} />
      </group>

      <Model name="pillowBlue" p={[-1.0, 0, 0.82]} r={0.5} />

      <Shelves h={h} />
      <Model name="pottedPlant" p={[1.15, 0, -1.2]} />
    </group>
  );
}

function FitZoom() {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.zoom = Math.min(size.width / 4.0, size.height / 3.45);
    camera.lookAt(0, 0.45, 0);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

// Mounts only once everything inside its Suspense boundary has loaded.
function Ready({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return null;
}

export default function Room({
  lampOn,
  chaos,
  simbaX,
  simbaFuss,
  onHover,
  onPick,
}: {
  lampOn: boolean;
  chaos: number;
  /** Where Simba's leap out of the contact card ended (clientX), once he's left it. */
  simbaX: number | null;
  simbaFuss: number;
  onHover: (v: Hotspot | null) => void;
  onPick: (v: Hotspot) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const inView = useInView3D(wrap, "0px");
  const simba = simbaX !== null;
  const simbaFrom = useMemo(() => (simbaX === null ? SIMBA_ENTRY : entryAt(simbaX, wrap.current)), [simbaX]);
  const still = !!useReducedMotion();
  const { resolvedTheme } = useTheme();
  const [h, setH] = useState<Hour>(NIGHT);
  useEffect(() => setH(resolvedTheme === "light" ? GOLDEN : NIGHT), [resolvedTheme]);
  const camera = useMemo(() => ({ position: [9, 7.5, 9] as V3, zoom: 120, near: 0.1, far: 100 }), []);
  const [ready, setReady] = useState(false);
  useEffect(() => () => void (document.body.style.cursor = ""), []);
  // Draw ROWS pixels tall whatever the box size; the browser scales it up without smoothing.
  const [dpr, setDpr] = useState(1);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setDpr(ROWS / Math.max(1, e.contentRect.height)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrap}
      className="relative h-full w-full [&_canvas]:[image-rendering:pixelated]"
      role="img"
      aria-label={`Sevith's room ${h === NIGHT ? "at 2am" : "at golden hour"}: at the desk with the lamp ${lampOn ? "on" : "off"}, Cream loafed by the lamp,${simba ? " Simba loafed on the rug," : ""} a cushion by the window, lit cube shelves on the side wall, and a bench, barbell and dumbbells in the corner.`}
    >
      <Canvas
        orthographic
        shadows="basic"
        dpr={dpr}
        frameloop={!inView ? "never" : still ? "demand" : "always"}
        camera={camera}
        gl={{ antialias: false, toneMapping: THREE.NoToneMapping }}
        onCreated={({ camera }) => camera.lookAt(0, 0.45, 0)}
        onPointerMissed={() => onHover(null)}
      >
        <color attach="background" args={[(h === NIGHT ? dark : light).hex("paper")]} />
        <Lights h={h} on={lampOn} still={still} />
        <FitZoom />
        <Suspense fallback={null}>
          <Scene h={h} lampOn={lampOn} chaos={chaos} simba={simba} simbaFuss={simbaFuss} simbaFrom={simbaFrom} still={still} onHover={onHover} onPick={onPick} />
          <Ready onReady={() => setReady(true)} />
        </Suspense>
        {/* The finish: the lamp and screens glow, then the pixel-art pass inks the outlines. */}
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur luminanceThreshold={1.2} luminanceSmoothing={0.1} intensity={0.7} />
          <PixelArt />
        </EffectComposer>
      </Canvas>
      {!ready && <StudioSkeleton />}
    </div>
  );
}

// Fetch every model up front so the room appears whole.
const MODELS = [
  "chairDesk", "computerScreen", "computerKeyboard", "computerMouse", "lampRoundTable",
  "pillowBlue", "pottedPlant", "food/mug",
];
if (typeof window !== "undefined") MODELS.forEach((m) => useGLTF.preload(`${M}${m}.glb`, false, false));
