"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { SoftShadows, useGLTF } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, Vignette } from "@react-three/postprocessing";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import * as THREE from "three";
import { Box, Bulb, Glow, Label, M, Model, Seated, useFontsReady, useModel, type V3 } from "./kit";
import { useInView3D } from "./useInView3D";
import { Cream } from "./Cream";
import { StudioSkeleton } from "./StudioSkeleton";

// AFTER HOURS, the room. One corner of one room at 2am: the desk, the lamp as the
// only warm light, the city outside, the gym corner, and Cream on the desk. In
// light mode it is the same room at golden hour. See ART-DIRECTION.md.

export type Hotspot = "lamp" | "monitor" | "cream";

// ---------- the two hours ----------
type Hour = {
  floor: string; floorLine: string; wall: string; wall2: string; trim: string; paper: string; ink: string; accent: string;
  screen: string; sky: [string, string]; city: string; cityLit: string[]; moon: string | null;
  amb: number; hemi: [string, string, number]; key: { color: string; i: number; p: V3 }; lamp: number; exposure: number;
};
const NIGHT: Hour = {
  floor: "#6B5442", floorLine: "#56432F", wall: "#232838", wall2: "#1C2030", trim: "#161925", paper: "#EDE6DA", ink: "#1A1612", accent: "#D9693A",
  screen: "#0B0F1C", sky: ["#070A18", "#1A2048"], city: "#0C0F1D", cityLit: ["#FFC37A", "#FFD9A0", "#9FB4FF"], moon: "#F4F1E6",
  amb: 0.1, hemi: ["#3A4A8A", "#0B0C12", 0.45], key: { color: "#8EA6FF", i: 0.8, p: [-4.5, 3.6, 0.8] }, lamp: 9, exposure: 1.08,
};
const GOLDEN: Hour = {
  floor: "#C9A27E", floorLine: "#B08967", wall: "#EFE6D8", wall2: "#E4D9C8", trim: "#D6C9B4", paper: "#FBF7F0", ink: "#1A1612", accent: "#B8491F",
  screen: "#0B0F1C", sky: ["#F7C98F", "#E8875A"], city: "#7A4C42", cityLit: ["#FFE2A8"], moon: null,
  amb: 0.32, hemi: ["#FFE2B8", "#7A5A48", 0.75], key: { color: "#FFB27A", i: 2.1, p: [-4.5, 2.2, 0.9] }, lamp: 2.4, exposure: 1.0,
};

const ROOM = 3;
const H = ROOM / 2;
const WALL_H = 1.7;
const DESK_Y = 0.38;
const CREAM_HOME: V3 = [-0.3, DESK_Y, -1.02];

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
    t.anisotropy = 8;
    return t;
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
    return t;
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
        <meshStandardMaterial attach="material-0" color={h.floorLine} />
        <meshStandardMaterial attach="material-1" color={h.floorLine} />
        <meshStandardMaterial attach="material-2" map={planks} roughness={0.72} />
        <meshStandardMaterial attach="material-3" color={h.floorLine} />
        <meshStandardMaterial attach="material-4" color={h.floorLine} />
        <meshStandardMaterial attach="material-5" color={h.floorLine} />
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

// Three prints taped above the desk, drawn once to canvas in the site's own
// fonts: the film this room would be, a wanted notice for the cat who knocks
// mugs over, and the only gym advice anyone needs.
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

const drawFilm: Draw = (g, w, h, f) => {
  g.fillStyle = "#0B2C9E";
  g.fillRect(0, 0, w, h);
  // The lamp, as a low sun over the city.
  g.fillStyle = "#E8501A";
  g.beginPath();
  g.arc(w / 2, h * 0.4, w * 0.3, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#0A0B0E";
  let seed = 3;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let x = 0; x < w; ) {
    const bw = 26 + rnd() * 40, bh = h * (0.06 + rnd() * 0.14);
    g.fillRect(x, h * 0.6 - bh, bw, bh + 4);
    x += bw + 3;
  }
  g.fillRect(0, h * 0.6, w, 6);
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  text(g, "AFTER", w / 2, h * 0.76, `800 ${w * 0.17}px ${f.wide}`, "#EDE6DA", 2, true);
  text(g, "HOURS", w / 2, h * 0.88, `800 ${w * 0.17}px ${f.wide}`, "#EDE6DA", 2, true);
  text(g, "A SEVITH SADASHIVA PRODUCTION · 2AM", w / 2, h * 0.95, `600 ${w * 0.03}px ${f.sans}`, "#CFE0EE", 3);
};

const drawWanted: Draw = (g, w, h, f) => {
  g.fillStyle = "#EADFC6";
  g.fillRect(0, 0, w, h);
  g.strokeStyle = "#3A2A1E";
  g.lineWidth = 6;
  g.strokeRect(18, 18, w - 36, h - 36);
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  text(g, "WANTED", w / 2, h * 0.165, `700 ${w * 0.16}px ${f.serif}`, "#3A2A1E", 4);
  // The mugshot: a white cat, blue eyes, no remorse.
  const cx = w / 2, cy = h * 0.42;
  g.fillStyle = "#E8501A";
  g.fillRect(w * 0.18, h * 0.2, w * 0.64, h * 0.42);
  g.fillStyle = "#F8F6F1";
  g.beginPath();
  g.moveTo(cx - 118, cy - 40); g.lineTo(cx - 92, cy - 132); g.lineTo(cx - 34, cy - 74);
  g.moveTo(cx + 118, cy - 40); g.lineTo(cx + 92, cy - 132); g.lineTo(cx + 34, cy - 74);
  g.fill();
  g.beginPath();
  g.ellipse(cx, cy, 120, 96, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#F3C7C7";
  g.beginPath();
  g.moveTo(cx - 104, cy - 52); g.lineTo(cx - 92, cy - 110); g.lineTo(cx - 54, cy - 72);
  g.moveTo(cx + 104, cy - 52); g.lineTo(cx + 92, cy - 110); g.lineTo(cx + 54, cy - 72);
  g.fill();
  for (const side of [-1, 1]) {
    g.fillStyle = "#7FC0EC";
    g.beginPath();
    g.ellipse(cx + side * 44, cy - 6, 20, 22, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#15110E";
    g.beginPath();
    g.ellipse(cx + side * 44, cy - 6, 6, 18, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#8D867C";
    g.lineWidth = 3;
    for (const dy of [-8, 8]) {
      g.beginPath();
      g.moveTo(cx + side * 40, cy + 40 + dy / 2);
      g.lineTo(cx + side * 150, cy + 30 + dy * 2);
      g.stroke();
    }
  }
  g.fillStyle = "#EFA0A6";
  g.beginPath();
  g.moveTo(cx - 12, cy + 26); g.lineTo(cx + 12, cy + 26); g.lineTo(cx, cy + 40);
  g.fill();
  text(g, "CREAM", w / 2, h * 0.73, `800 ${w * 0.13}px ${f.wide}`, "#3A2A1E", 3, true);
  text(g, "for crimes against mugs", w / 2, h * 0.81, `italic 400 ${w * 0.065}px ${f.serif}`, "#3A2A1E");
  text(g, "REWARD: ONE (1) TREAT", w / 2, h * 0.9, `600 ${w * 0.042}px ${f.sans}`, "#0B2C9E", 4);
};

const drawGym: Draw = (g, w, h, f) => {
  g.fillStyle = "#16161A";
  g.fillRect(0, 0, w, h);
  // A barbell, loaded.
  const y = h * 0.2;
  g.fillStyle = "#9A9EA6";
  g.fillRect(w * 0.08, y - 5, w * 0.84, 10);
  g.fillStyle = "#E8501A";
  for (const x of [w * 0.2, w * 0.74]) g.fillRect(x, y - 62, 26, 124);
  g.fillStyle = "#EDE6DA";
  for (const x of [w * 0.15, w * 0.83]) g.fillRect(x, y - 40, 18, 80);
  g.textAlign = "left";
  g.textBaseline = "alphabetic";
  const x0 = w * 0.1;
  text(g, "LIGHT", x0, h * 0.5, `800 ${w * 0.145}px ${f.wide}`, "#EDE6DA", 1, true);
  text(g, "WEIGHT,", x0, h * 0.65, `800 ${w * 0.145}px ${f.wide}`, "#EDE6DA", 1, true);
  text(g, "BABY!", x0, h * 0.8, `800 ${w * 0.145}px ${f.wide}`, "#E8501A", 1, true);
  g.fillStyle = "#E8501A";
  g.fillRect(x0, h * 0.86, w * 0.18, 4);
  text(g, "LEG DAY IS TOMORROW. ALWAYS.", x0, h * 0.92, `600 ${w * 0.034}px ${f.sans}`, "#9A9EA6", 3);
};

function usePoster(draw: Draw) {
  const fonts = useFontsReady();
  const tex = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = PW;
    cv.height = PH;
    const g = cv.getContext("2d")!;
    draw(g, PW, PH, {
      serif: face("--font-serif", "Georgia, serif"),
      sans: face("--font-geist-sans", "system-ui, sans-serif"),
      wide: face("--font-display", "system-ui, sans-serif"),
    });
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
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
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#FFFFFF" emissiveIntensity={h === NIGHT ? 0.32 : 0.08} roughness={0.85} />
      </mesh>
      <Box p={[-w / 2 + 0.03, ht / 2 - 0.004, 0.003]} s={[0.07, 0.022, 0.003]} c="#E8DFC8" r={[0, 0, 0.5]} cast={false} />
      <Box p={[w / 2 - 0.03, ht / 2 - 0.004, 0.003]} s={[0.07, 0.022, 0.003]} c="#E8DFC8" r={[0, 0, -0.5]} cast={false} />
    </group>
  );
}

function Posters({ h }: { h: Hour }) {
  const prints = [drawFilm, drawWanted, drawGym];
  return (
    <>
      {prints.map((draw, i) => (
        <Print key={i} draw={draw} p={[-0.34 + i * 0.4, 1.15, -H + 0.012]} tilt={(i - 1) * -0.03} h={h} />
      ))}
      {/* Learn it at 2am. */}
      <group position={[0.98, 1.2, -H + 0.012]}>
        <mesh>
          <circleGeometry args={[0.16, 40]} />
          <meshStandardMaterial color={h.paper} roughness={0.6} />
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

function Cyl({ p, r = [0, 0, 0], rad, len, c, metal = 0.5, rough = 0.45, seg = 28 }: { p: V3; r?: V3; rad: number; len: number; c: string; metal?: number; rough?: number; seg?: number }) {
  return (
    <mesh position={p} rotation={r} castShadow receiveShadow>
      <cylinderGeometry args={[rad, rad, len, seg]} />
      <meshStandardMaterial color={c} metalness={metal} roughness={rough} />
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
        <meshStandardMaterial color={IRON} metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.098, 0]} castShadow>
        <torusGeometry args={[0.028, 0.007, 10, 24, Math.PI]} />
        <meshStandardMaterial color={IRON} metalness={0.6} roughness={0.5} />
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
      <Barbell p={[0.72, 0, 1.22]} accent={h === NIGHT ? "#D9744A" : "#E8501A"} />
      <Dumbbell p={[1.26, 0, 0.94]} />
      <Dumbbell p={[1.26, 0, 1.08]} r={0.12} />
      <Kettlebell p={[1.24, 0, -0.52]} />
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
    <group position={[0.15, 0, -0.3]}>
      <Box p={[0, 0.006, 0]} s={[1.6, 0.012, 1.2]} c={h === NIGHT ? "#1B2A66" : "#0B2C9E"} rough={1} cast={false} />
      <Box p={[0, 0.0125, 0]} s={[1.44, 0.004, 1.04]} c={h === NIGHT ? "#A8977C" : "#E2D3B8"} rough={1} cast={false} />
    </group>
  );
}

// The mug: on the desk, until Cream happens to it.
function Mug({ knocked, still }: { knocked: boolean; still: boolean }) {
  const g = useRef<THREE.Group>(null);
  const t0 = useRef(0);
  const from = useMemo(() => new THREE.Vector3(0.6, DESK_Y, -1.24), []);
  const to = useMemo(() => new THREE.Vector3(0.95, 0.02, -0.66), []);
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
      <Bulb p={[0.03, 0.24, 0]} on={on} intensity={h.lamp} distance={4.4} size={0.024} color="#FFA860" shadow />
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
  still,
  onHover,
  onPick,
}: {
  h: Hour;
  lampOn: boolean;
  chaos: number;
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
      <Posters h={h} />
      <Rug h={h} />
      <Gym h={h} />

      {/* The desk, at 2am. */}
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
        <Cream home={CREAM_HOME} homeYaw={0.7} scale={0.95} runs={chaos} still={still} />
      </group>

      <Model name="pillowBlue" p={[-1.0, 0, 0.82]} r={0.5} />

      <Model name="bookcaseOpen" p={[-1.3, 0, -0.75]} r={Math.PI / 2} />
      <Model name="books" p={[-1.3, 0.46, -0.8]} r={Math.PI / 2} />
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
  onHover,
  onPick,
}: {
  lampOn: boolean;
  chaos: number;
  onHover: (v: Hotspot | null) => void;
  onPick: (v: Hotspot) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const inView = useInView3D(wrap, "0px");
  const still = !!useReducedMotion();
  const { resolvedTheme } = useTheme();
  const [h, setH] = useState<Hour>(NIGHT);
  useEffect(() => setH(resolvedTheme === "light" ? GOLDEN : NIGHT), [resolvedTheme]);
  const camera = useMemo(() => ({ position: [9, 7.5, 9] as V3, zoom: 120, near: 0.1, far: 100 }), []);
  const [ready, setReady] = useState(false);
  useEffect(() => () => void (document.body.style.cursor = ""), []);

  return (
    <div
      ref={wrap}
      className="relative h-full w-full"
      role="img"
      aria-label={`Sevith's room ${h === NIGHT ? "at 2am" : "at golden hour"}: at the desk with the lamp ${lampOn ? "on" : "off"}, Cream loafed by the lamp, a cushion by the window, and a bench, barbell and dumbbells in the corner.`}
    >
      <Canvas
        orthographic
        shadows
        dpr={[1, 2]}
        frameloop={!inView ? "never" : still ? "demand" : "always"}
        camera={camera}
        gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: h.exposure }}
        onCreated={({ camera }) => camera.lookAt(0, 0.45, 0)}
        onPointerMissed={() => onHover(null)}
      >
        <color attach="background" args={[h === NIGHT ? "#0A0B0E" : "#EAE6DE"]} />
        <Lights h={h} on={lampOn} still={still} />
        <FitZoom />
        <SoftShadows size={16} samples={10} focus={0.6} />
        <Suspense fallback={null}>
          <Scene h={h} lampOn={lampOn} chaos={chaos} still={still} onHover={onHover} onPick={onPick} />
          <Ready onReady={() => setReady(true)} />
        </Suspense>
        {/* The finish: soft contact darkness, the lamp and screens glowing, and the
            edges of the frame falling away, like the rest of the site. */}
        <EffectComposer multisampling={4}>
          <N8AO aoRadius={0.35} intensity={2.2} distanceFalloff={0.6} halfRes />
          <Bloom mipmapBlur luminanceThreshold={0.95} luminanceSmoothing={0.2} intensity={0.9} />
          <Vignette offset={0.32} darkness={0.55} />
        </EffectComposer>
      </Canvas>
      {!ready && <StudioSkeleton />}
    </div>
  );
}

// Fetch every model up front so the room appears whole.
const MODELS = [
  "chairDesk", "computerScreen", "computerKeyboard", "computerMouse", "lampRoundTable",
  "pillowBlue", "bookcaseOpen", "books", "pottedPlant", "food/mug",
];
if (typeof window !== "undefined") MODELS.forEach((m) => useGLTF.preload(`${M}${m}.glb`, false, false));
