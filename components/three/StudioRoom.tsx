"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, RoundedBox, SoftShadows, useGLTF } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import * as THREE from "three";
import { useInView3D } from "./useInView3D";
import { ideas, OUTDOOR } from "@/data/studio";
import { StudioSkeleton } from "./StudioSkeleton";

export type SceneId =
  | "design" | "editing" | "trading" | "sports" | "gym" | "run" | "cinema" | "cooking" | "panic" | "ideas" | "cats";


type V3 = [number, number, number];

// Models are Kenney CC0 kits (furniture, nature, roads, food, mini characters). See public/models/LICENSE-kenney.txt.
const M = "/models/";
const MODELS = [
  "desk", "chairDesk", "computerScreen", "computerKeyboard", "computerMouse", "laptop", "lampSquareFloor", "lampRoundTable",
  "pottedPlant", "plantSmall1", "bookcaseOpen", "books", "rugRectangle", "rugRound", "loungeSofa", "televisionModern",
  "cabinetTelevision", "tableCoffee", "kitchenCabinet", "kitchenStove", "kitchenFridge", "kitchenCabinetUpper", "kitchenSink",
  "kitchenCoffeeMachine", "sideTable", "speaker", "cardboardBoxOpen", "trashcan", "chair", "radio", "pillowBlue",
  "tree_oak", "tree_default", "tree_detailed", "plant_bush", "plant_bushLarge", "flower_redA", "flower_yellowA",
  "flower_purpleA", "rock_smallA", "grass", "grass_large", "fence_simple",
  "roads/light-curved", "food/frying-pan", "food/pot-stew", "food/mug", "food/cutting-board", "food/plate",
] as const;
type ModelName = (typeof MODELS)[number];

// ---------- palette ----------
type Palette = {
  floor: string; floorLine: string; wall: string; wall2: string; trim: string; ink: string; lapis: string; paper: string;
  screen: string; red: string; green: string; grass: string; soil: string; path: string; white: string; rubber: string;
  sage: string; butter: string; blush: string; mist: string;
};
const LIGHT: Palette = {
  floor: "#C9A27E", floorLine: "#B08967", wall: "#F1EEE8", wall2: "#E6E2DA", trim: "#D9D3C8", ink: "#1C1F2B", lapis: "#1F44C8",
  paper: "#FBFAF7", screen: "#0B1026", red: "#D9534F", green: "#3FA372", grass: "#7DB35A", soil: "#8B6748", path: "#D9C9A5",
  white: "#F7F7F4", rubber: "#3A3B40", sage: "#CDD6C4", butter: "#E8DFBA", blush: "#EAD4C8", mist: "#CBD2EC",
};
const DARK: Palette = {
  ...LIGHT, floor: "#7A6250", floorLine: "#6A5444", wall: "#2A3152", wall2: "#232A48", trim: "#1D2340", grass: "#4F7A44", soil: "#5A4332", path: "#9E9278",
};

// ---------- sky ----------
type Sky = { name: string; window: string; sun: string; sunI: number; amb: number; hemiTop: string; hemiBottom: string; hemiI: number; beam: number };
const SKIES = {
  dawn: { name: "dawn", window: "#F2B8A0", sun: "#FFB38A", sunI: 1.6, amb: 0.35, hemiTop: "#FFD7C2", hemiBottom: "#5B4A6B", hemiI: 0.9, beam: 0.35 },
  day: { name: "day", window: "#9CC3F5", sun: "#FFF6E8", sunI: 2.6, amb: 0.45, hemiTop: "#DCEBFF", hemiBottom: "#C8B89A", hemiI: 1.1, beam: 0.22 },
  golden: { name: "golden", window: "#F5C27A", sun: "#FFC27A", sunI: 2.0, amb: 0.35, hemiTop: "#FFE2B8", hemiBottom: "#7A5A48", hemiI: 0.9, beam: 0.4 },
  dusk: { name: "dusk", window: "#8796C9", sun: "#FFB98F", sunI: 1.1, amb: 0.38, hemiTop: "#9AA8D8", hemiBottom: "#3C3A44", hemiI: 0.95, beam: 0.22 },
  night: { name: "night", window: "#1A2350", sun: "#9DB4FF", sunI: 0.55, amb: 0.3, hemiTop: "#4A5DB0", hemiBottom: "#141A36", hemiI: 1.0, beam: 0.1 },
} satisfies Record<string, Sky>;
const SKY_CYCLE: Sky[] = [SKIES.dawn, SKIES.day, SKIES.golden, SKIES.dusk, SKIES.night];

// Outdoor scenes pick the hour that suits them; the street light matters most once the sun is down.
const SCENE_SKY: Partial<Record<SceneId, Sky>> = { sports: SKIES.golden, run: SKIES.dusk, cats: SKIES.night };

// ---------- models ----------
const shadowAll = (o: THREE.Object3D) =>
  o.traverse((m) => {
    if ((m as THREE.Mesh).isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });

// A model re-anchored to its bottom centre, so props place by where they stand, not by the kit's corner pivot.
function useModel(name: ModelName) {
  const { scene } = useGLTF(`${M}${name}.glb`, false, false);
  return useMemo(() => {
    const o = scene.clone(true);
    const box = new THREE.Box3().setFromObject(o);
    const c = box.getCenter(new THREE.Vector3());
    o.position.set(-c.x, -box.min.y, -c.z);
    shadowAll(o);
    const g = new THREE.Group();
    g.add(o);
    g.updateMatrixWorld(true);
    return g;
  }, [scene]);
}

function Model({ name, p = [0, 0, 0], r = 0, s = 1 }: { name: ModelName; p?: V3; r?: number; s?: number }) {
  const obj = useModel(name);
  return <primitive object={obj} position={p} rotation={[0, r, 0]} scale={s} />;
}

// Find where you'd actually sit: rain rays down a grid over the model. The lowest surface above the
// legs is the seat; anything well above it is a backrest or arm, and the seat's front faces away from it.
type SeatInfo = { y: number; x: number; z: number; front: number | null };
function findSeat(obj: THREE.Object3D): SeatInfo {
  const box = new THREE.Box3().setFromObject(obj);
  const H = box.max.y - box.min.y;
  const ray = new THREE.Raycaster();
  const down = new THREE.Vector3(0, -1, 0);
  const hits: { x: number; y: number; z: number }[] = [];
  const n = 9;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const x = THREE.MathUtils.lerp(box.min.x, box.max.x, 0.06 + (0.88 * i) / (n - 1));
      const z = THREE.MathUtils.lerp(box.min.z, box.max.z, 0.06 + (0.88 * j) / (n - 1));
      ray.set(new THREE.Vector3(x, box.max.y + 1, z), down);
      const h = ray.intersectObject(obj, true)[0];
      if (h && h.point.y > box.min.y + H * 0.2) hits.push({ x, y: h.point.y, z });
    }
  const y = Math.min(...hits.map((h) => h.y));
  const seat = hits.filter((h) => h.y < y + H * 0.06);
  const back = hits.filter((h) => h.y > y + H * 0.25);
  const avg = (a: typeof hits) => ({ x: a.reduce((t, h) => t + h.x, 0) / a.length, z: a.reduce((t, h) => t + h.z, 0) / a.length });
  const c = avg(seat);
  const b = back.length ? avg(back) : null;
  return { y, x: c.x, z: c.z, front: b ? Math.atan2(c.x - b.x, c.z - b.z) : null };
}

// A seat and its sitter, placed from the seat's measured surface, so nobody sinks into the furniture.
function Seated({ name, ...rest }: { name: ModelName; p?: V3; r?: number; s?: number; still: boolean; face?: number }) {
  return <SeatedOn obj={useModel(name)} {...rest} />;
}

function SeatedOn({ obj, p = [0, 0, 0], r = 0, s = 1, still, face }: { obj: THREE.Object3D; p?: V3; r?: number; s?: number; still: boolean; face?: number }) {
  const seat = useMemo(() => findSeat(obj), [obj]);
  const cos = Math.cos(r), sin = Math.sin(r);
  const at: V3 = [p[0] + (seat.x * cos + seat.z * sin) * s, p[1] + seat.y * s, p[2] + (-seat.x * sin + seat.z * cos) * s];
  const facing = face ?? r + (seat.front ?? 0);
  return (
    <>
      <primitive object={obj} position={p} rotation={[0, r, 0]} scale={s} />
      <Minifig pose="sit" seat={at} r={facing} still={still} />
    </>
  );
}

// Every block in the diorama is bevelled rather than a raw cube: the soft edge
// catches a highlight and stops the whole thing reading as programmer art. The
// radius is clamped to the thinnest side so slivers don't collapse.
const Box = ({ p, s, c, r = [0, 0, 0], rough = 0.8, metal = 0, cast = true }: { p: V3; s: V3; c: string; r?: V3; rough?: number; metal?: number; cast?: boolean }) => (
  <RoundedBox
    args={s}
    radius={Math.min(0.013, Math.min(s[0], s[1], s[2]) * 0.34)}
    smoothness={3}
    creaseAngle={0.5}
    position={p}
    rotation={r}
    castShadow={cast}
    receiveShadow
  >
    <meshStandardMaterial color={c} roughness={rough} metalness={metal} />
  </RoundedBox>
);

// A flat, self-lit rectangle: screen contents, sticky notes, posters.
const Glow = ({ p, w, h, c, r = [0, 0, 0] }: { p: V3; w: number; h: number; c: string; r?: V3 }) => (
  <mesh position={p} rotation={r}>
    <planeGeometry args={[w, h]} />
    <meshBasicMaterial color={c} toneMapped={false} />
  </mesh>
);

// ---------- text ----------
function fontVar(name: string, fallback: string) {
  const v = typeof window === "undefined" ? "" : getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    document.fonts.ready.then(() => live && setReady(true));
    return () => {
      live = false;
    };
  }, []);
  return ready;
}

// Text drawn to a canvas in the site's own faces, crisp at 4x.
function Label({ text, size, color, p = [0, 0, 0], r = [0, 0, 0], maxWidth, face = "sans" }: { text: string; size: number; color: string; p?: V3; r?: V3; maxWidth?: number; face?: "sans" | "serif" }) {
  const fonts = useFontsReady();
  const tex = useMemo(() => {
    const lines = text.split("\n");
    const px = 96;
    const lh = px * 1.12;
    const family = face === "serif" ? fontVar("--font-serif", "Georgia, serif") : fontVar("--font-sans", "system-ui, sans-serif");
    const font = `${face === "serif" ? 400 : 600} ${px}px ${family}`;
    const c = document.createElement("canvas");
    const g = c.getContext("2d")!;
    g.font = font;
    const w = Math.ceil(Math.max(...lines.map((l) => g.measureText(l).width))) + 12;
    c.width = w;
    c.height = Math.ceil(lh * lines.length) + 8;
    g.font = font;
    g.fillStyle = color;
    g.textAlign = "center";
    g.textBaseline = "middle";
    lines.forEach((l, i) => g.fillText(l, w / 2, 4 + lh * (i + 0.5)));
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return { t, aspect: w / c.height, lines: lines.length };
  }, [text, color, face, fonts]); // eslint-disable-line react-hooks/exhaustive-deps -- redraw once fonts load
  useEffect(() => () => tex.t.dispose(), [tex]);
  let h = size * 1.12 * tex.lines;
  let w = h * tex.aspect;
  if (maxWidth && w > maxWidth) {
    h *= maxWidth / w;
    w = maxWidth;
  }
  return (
    <mesh position={p} rotation={r}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={tex.t} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

// ---------- the person ----------
// A mini-figure built out of boxes instead of a kit model: every colour is set
// right here and every joint is posed in code, so there's no rig or texture
// atlas in the way. Drawn from a photo: messy black hair, full beard, thick
// black rectangular frames, light blue shirt.
const ME = {
  skin: "#E9BD98",
  hair: "#17130F",
  beard: "#241C16",
  tee: "#1B1B1F",
  teeTrim: "#2C2C32",
  jeans: "#3B4B7A",
  shoe: "#F2F2EE",
  ink: "#2A2740",
  eye: "#241E1A",
};

// Joint heights, measured with the feet at y = 0.
const HIP_Y = 0.225, SHOULDER_X = 0.115, THIGH_L = 0.095, SHIN_L = 0.095, UPPER_L = 0.085, FORE_L = 0.075;
// Everything above the hips lives in a group pivoted at the hips, so leaning bends the back.
const T_SHOULDER = 0.195, T_NECK = 0.212, T_HEAD = 0.222;
// One kick cycle, and the moment inside it when boot meets ball.
const KICK_T = 3.4, KICK_HIT = 0.72, BALL_R = 0.055;

type Pose = "idle" | "sit" | "walk" | "run" | "reach" | "play" | "kick";

function Minifig({
  pose = "idle",
  p = [0, 0, 0],
  r = 0,
  seat,
  still,
  path,
  speed = 1,
  holds,
}: {
  pose?: Pose;
  p?: V3;
  r?: number;
  seat?: V3;
  still: boolean;
  path?: "loop" | "pace";
  speed?: number;
  holds?: "wand";
}) {
  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const hipL = useRef<THREE.Group>(null), hipR = useRef<THREE.Group>(null);
  const kneeL = useRef<THREE.Group>(null), kneeR = useRef<THREE.Group>(null);
  const shoL = useRef<THREE.Group>(null), shoR = useRef<THREE.Group>(null);
  const elbL = useRef<THREE.Group>(null), elbR = useRef<THREE.Group>(null);

  // Sitting rests the hips just above the seat; otherwise the feet stand on the mark.
  const base: V3 = seat
    ? [seat[0] - Math.sin(r) * 0.03, seat[1] + 0.02 - HIP_Y, seat[2] - Math.cos(r) * 0.03]
    : p;

  useFrame(({ clock }) => {
    const t = still ? 0 : clock.elapsedTime * speed;
    // Every angle reads "forward is positive"; the signs are flipped when applied.
    let hl = 0, hr = 0, kl = 0.04, kr = 0.04, sl = 0, sr = 0, el = 0.12, er = 0.12;
    let spread = 0.09, lean = 0, lift = 0, nod = 0, turn = 0;

    switch (pose) {
      case "sit": {
        hl = hr = 1.45;
        kl = kr = 1.35;
        sl = sr = 0.22;
        el = er = 0.45;
        spread = 0.13;
        lean = -0.05;
        nod = 0.05;
        lift = Math.sin(t * 1.5) * 0.004;
        turn = Math.sin(t * 0.5) * 0.08;
        break;
      }
      case "walk": {
        const w = Math.sin(t * 3.4);
        hl = w * 0.42; hr = -w * 0.42;
        kl = 0.06 + Math.max(0, -w) * 0.55;
        kr = 0.06 + Math.max(0, w) * 0.55;
        sl = -w * 0.3; sr = w * 0.3;
        el = er = 0.26;
        lift = Math.abs(Math.cos(t * 3.4)) * 0.01;
        break;
      }
      case "run": {
        const w = Math.sin(t * 7.2);
        hl = w * 0.78; hr = -w * 0.78;
        kl = 0.3 + Math.max(0, -w) * 0.95;
        kr = 0.3 + Math.max(0, w) * 0.95;
        sl = -w * 0.62; sr = w * 0.62;
        el = er = 1.0;
        lean = 0.2;
        lift = Math.abs(Math.cos(t * 7.2)) * 0.02;
        break;
      }
      case "reach": {
        sr = 1.1 + Math.sin(t * 1.8) * 0.13;
        er = 0.5;
        sl = 0.16; el = 0.32;
        spread = 0.11;
        lean = 0.07;
        nod = 0.12;
        break;
      }
      case "play": {
        // Sitting on the bed, trailing the wand so the cats have something to chase.
        hl = hr = 1.4;
        kl = 1.3; kr = 1.18;
        sr = 0.64 + Math.sin(t * 2.6) * 0.2;
        er = 0.16 + Math.sin(t * 2.6 + 0.7) * 0.1;
        sl = 0.3; el = 0.55;
        spread = 0.14;
        lean = 0.05;
        nod = 0.17;
        turn = Math.sin(t * 1.1) * 0.13;
        break;
      }
      case "kick": {
        // The strike runs on the wall clock, so the ball can follow the same timeline.
        const c = still ? KICK_HIT : clock.elapsedTime % KICK_T;
        const wind = 0.5, strike = KICK_HIT + 0.06;
        if (c < wind) hr = -0.45 * Math.sin((c / wind) * Math.PI * 0.5);
        else if (c < strike) hr = -0.45 + 1.07 * ((c - wind) / (strike - wind));
        else if (c < 1.15) hr = 0.62 - 0.42 * ((c - strike) / (1.15 - strike));
        else hr = 0.2 * Math.max(0, 1 - (c - 1.15) / 0.6);
        kr = Math.max(0.03, -hr * 0.5);
        hl = -hr * 0.12; kl = 0.12;
        sl = hr * 0.5; sr = -hr * 0.35;
        el = 0.35; er = 0.25;
        spread = 0.15;
        lean = -hr * 0.12;
        break;
      }
      default: {
        lift = Math.sin(t * 1.5) * 0.006;
        turn = Math.sin(t * 0.6) * 0.1;
      }
    }

    const g = root.current;
    if (g) {
      if (path === "loop") {
        const a = t * 0.9, R = 0.92;
        g.position.set(R * Math.cos(a), base[1] + lift, R * Math.sin(a));
        g.rotation.y = Math.atan2(-Math.sin(a), Math.cos(a));
      } else if (path === "pace") {
        g.position.set(base[0] + Math.sin(t * 0.7) * 0.75, base[1] + lift, base[2]);
        g.rotation.y = Math.cos(t * 0.7) > 0 ? Math.PI / 2 : -Math.PI / 2;
      } else {
        g.position.set(base[0], base[1] + lift, base[2]);
        g.rotation.y = r;
      }
    }
    if (hipL.current) hipL.current.rotation.x = -hl;
    if (hipR.current) hipR.current.rotation.x = -hr;
    if (kneeL.current) kneeL.current.rotation.x = kl;
    if (kneeR.current) kneeR.current.rotation.x = kr;
    if (shoL.current) { shoL.current.rotation.x = -sl; shoL.current.rotation.z = -spread; }
    if (shoR.current) { shoR.current.rotation.x = -sr; shoR.current.rotation.z = spread; }
    if (elbL.current) elbL.current.rotation.x = -el;
    if (elbR.current) elbR.current.rotation.x = -er;
    if (torso.current) torso.current.rotation.x = -lean;
    if (head.current) { head.current.rotation.x = -nod; head.current.rotation.y = turn; }
  });

  const leg = (side: 1 | -1, hip: React.RefObject<THREE.Group>, knee: React.RefObject<THREE.Group>) => (
    <group ref={hip} position={[0.045 * side, HIP_Y, 0]}>
      <Box p={[0, -THIGH_L / 2, 0]} s={[0.07, THIGH_L, 0.078]} c={ME.jeans} />
      <group ref={knee} position={[0, -THIGH_L, 0]}>
        <Box p={[0, -SHIN_L / 2, 0]} s={[0.064, SHIN_L, 0.07]} c={ME.jeans} />
        <Box p={[0, -SHIN_L - 0.018, 0.016]} s={[0.075, 0.036, 0.11]} c={ME.shoe} rough={0.6} />
      </group>
    </group>
  );

  // Short sleeve, then bare arm: the right forearm carries the tattoo.
  const arm = (side: 1 | -1, sho: React.RefObject<THREE.Group>, elb: React.RefObject<THREE.Group>, hand?: React.ReactNode, tattoo = false) => (
    <group ref={sho} position={[SHOULDER_X * side, T_SHOULDER, 0]}>
      <Box p={[0, -0.021, 0]} s={[0.058, 0.046, 0.064]} c={ME.tee} />
      <Box p={[0, -0.064, 0]} s={[0.048, 0.044, 0.054]} c={ME.skin} />
      <group ref={elb} position={[0, -UPPER_L, 0]}>
        <Box p={[0, -FORE_L / 2, 0]} s={[0.046, FORE_L, 0.05]} c={ME.skin} />
        {tattoo && (
          <>
            <Box p={[0, -0.027, 0]} s={[0.049, 0.022, 0.053]} c={ME.ink} cast={false} />
            <Box p={[0, -0.051, 0]} s={[0.049, 0.011, 0.053]} c={ME.ink} cast={false} />
          </>
        )}
        <Box p={[0, -FORE_L - 0.023, 0.004]} s={[0.05, 0.046, 0.055]} c={ME.skin} />
        {hand}
      </group>
    </group>
  );

  const wand = holds === "wand" && (
    <group position={[0, -0.105, 0.016]} rotation={[0.8, 0, 0]}>
      <Box p={[0, 0, 0.15]} s={[0.008, 0.008, 0.3]} c="#6B4A2E" />
      <Box p={[0, 0, 0.318]} s={[0.03, 0.03, 0.055]} c="#E8705E" />
    </group>
  );

  return (
    <group ref={root} position={base} rotation={[0, r, 0]}>
      {leg(-1, hipL, kneeL)}
      {leg(1, hipR, kneeR)}
      <group ref={torso} position={[0, HIP_Y, 0]}>
        <Box p={[0, 0.03, 0]} s={[0.17, 0.08, 0.1]} c={ME.jeans} />
        <Box p={[0, 0.115, 0]} s={[0.19, 0.1, 0.11]} c={ME.tee} />
        <Box p={[0, 0.172, 0]} s={[0.205, 0.062, 0.115]} c={ME.tee} />
        <Box p={[0, 0.2, 0]} s={[0.105, 0.022, 0.095]} c={ME.teeTrim} />
        <Box p={[0, T_NECK, 0]} s={[0.055, 0.042, 0.055]} c={ME.skin} />
        {arm(-1, shoL, elbL)}
        {arm(1, shoR, elbR, wand, true)}

        <group ref={head} position={[0, T_HEAD, 0]}>
          <Box p={[0, 0.093, 0]} s={[0.16, 0.17, 0.152]} c={ME.skin} />
          {/* full beard: under the chin, round the jaw and up the cheeks to the sideburns */}
          <Box p={[0, 0.032, 0.0]} s={[0.158, 0.034, 0.15]} c={ME.beard} />
          <Box p={[0, 0.05, 0.064]} s={[0.128, 0.062, 0.032]} c={ME.beard} />
          <Box p={[0.073, 0.082, 0.012]} s={[0.024, 0.105, 0.128]} c={ME.beard} />
          <Box p={[-0.073, 0.082, 0.012]} s={[0.024, 0.105, 0.128]} c={ME.beard} />
          <Box p={[0.058, 0.064, 0.062]} s={[0.046, 0.042, 0.03]} c={ME.beard} />
          <Box p={[-0.058, 0.064, 0.062]} s={[0.046, 0.042, 0.03]} c={ME.beard} />
          {/* nose, eyes and brows */}
          <Box p={[0, 0.096, 0.082]} s={[0.024, 0.03, 0.016]} c={ME.skin} cast={false} />
          <Box p={[0.034, 0.109, 0.074]} s={[0.018, 0.016, 0.01]} c={ME.eye} cast={false} />
          <Box p={[-0.034, 0.109, 0.074]} s={[0.018, 0.016, 0.01]} c={ME.eye} cast={false} />
          <Box p={[0.035, 0.129, 0.073]} s={[0.044, 0.011, 0.014]} c={ME.hair} cast={false} />
          <Box p={[-0.035, 0.129, 0.073]} s={[0.044, 0.011, 0.014]} c={ME.hair} cast={false} />
          {/* a lot of messy hair: top, fringe, sides, and all the way round the back */}
          <Box p={[0, 0.19, -0.004]} s={[0.188, 0.08, 0.172]} c={ME.hair} />
          <Box p={[0, 0.172, 0.072]} s={[0.176, 0.046, 0.034]} c={ME.hair} />
          <Box p={[0.084, 0.142, -0.012]} s={[0.02, 0.072, 0.146]} c={ME.hair} />
          <Box p={[-0.084, 0.142, -0.012]} s={[0.02, 0.072, 0.146]} c={ME.hair} />
          <Box p={[0, 0.118, -0.082]} s={[0.174, 0.126, 0.028]} c={ME.hair} />
          <Box p={[0, 0.056, -0.074]} s={[0.152, 0.058, 0.024]} c={ME.hair} />
          <Box p={[0.052, 0.218, 0.022]} s={[0.078, 0.052, 0.086]} c={ME.hair} r={[0.22, 0.32, 0.26]} />
          <Box p={[-0.048, 0.221, -0.018]} s={[0.082, 0.05, 0.082]} c={ME.hair} r={[-0.16, -0.28, -0.22]} />
          <Box p={[0.004, 0.208, -0.062]} s={[0.092, 0.048, 0.07]} c={ME.hair} r={[0.26, 0.08, 0.06]} />
        </group>
      </group>
    </group>
  );
}

// ---------- the cats ----------
// Four of them, each with its own temperament wired straight into the frame loop.
type CatKind = "orange" | "grey" | "patch" | "white";
const CATS: Record<CatKind, { fur: string; belly: string; mark: string; ear: string }> = {
  orange: { fur: "#E0A063", belly: "#F7EEE2", mark: "#C27F42", ear: "#E9B295" },
  grey: { fur: "#9BA2AB", belly: "#C8CDD3", mark: "#858C95", ear: "#C7A3A3" },
  patch: { fur: "#F4F1EA", belly: "#FFFFFF", mark: "#99A0A9", ear: "#EDC0C0" },
  white: { fur: "#F8F6F1", belly: "#FFFFFF", mark: "#E7E3DB", ear: "#F3C7C7" },
};

function Cat({ kind, p, r = 0, s = 1, still }: { kind: CatKind; p: V3; r?: number; s?: number; still: boolean }) {
  const c = CATS[kind];
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const earL = useRef<THREE.Group>(null);
  const earR = useRef<THREE.Group>(null);
  const legs = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = still ? 0 : clock.elapsedTime;
    let adv = 0, dx = 0, dy = 0, yaw = 0, crouch = 0, breathe = 1;
    let swish = 0, tailLift = 0, earBack = 0, tuck = 1, blink = 1, nod = 0, absYaw: number | null = null;

    switch (kind) {
      case "orange": {
        // Rowdy: winds up, wiggles, pounces, trots back and does it again.
        const T = 3.4, u = (t % T) / T;
        if (u < 0.52) {
          crouch = -0.026;
          yaw = Math.sin(t * 13) * 0.07;
        } else if (u < 0.68) {
          const f = (u - 0.52) / 0.16;
          adv = f * 0.26;
          dy = Math.sin(f * Math.PI) * 0.085;
          crouch = -0.006;
        } else {
          const f = (u - 0.68) / 0.32;
          adv = 0.26 * (1 - f);
          dy = Math.abs(Math.sin(f * 9)) * 0.012;
        }
        swish = Math.sin(t * 7) * 0.65;
        tailLift = 0.4;
        break;
      }
      case "grey": {
        // Cowardly: flattened, trembling, and flinching backwards every few seconds.
        crouch = -0.036 + Math.sin(t * 17) * 0.0013;
        earBack = -1.15;
        tailLift = -0.9;
        swish = Math.sin(t * 1.4) * 0.08;
        yaw = Math.sin(t * 0.8) * 0.13;
        const T = 5.5, u = (t % T) / T;
        if (u < 0.1) {
          const f = u / 0.1;
          adv = -Math.sin(f * Math.PI) * 0.07;
          dy = Math.sin(f * Math.PI) * 0.01;
        }
        break;
      }
      case "patch": {
        // The girl: loafed, breathing slowly, with the occasional slow blink.
        crouch = -0.046;
        tuck = 0.16;
        breathe = 1 + Math.sin(t * 1.3) * 0.045;
        swish = Math.sin(t * 0.55) * 0.24;
        tailLift = 0.12;
        nod = Math.sin(t * 0.7) * 0.06;
        const b = (t % 4.2) / 4.2;
        blink = b > 0.96 ? 0.12 : 1;
        break;
      }
      case "white": {
        // The daughter: zoomies in a figure of eight, tail straight up.
        const a = t * 1.5;
        dx = Math.sin(a) * 0.3;
        adv = Math.sin(a * 2) * 0.18;
        dy = Math.abs(Math.sin(t * 8)) * 0.018;
        absYaw = Math.atan2(Math.cos(a) * 0.3, Math.cos(a * 2) * 0.36);
        tailLift = 1.42;
        swish = Math.sin(t * 6) * 0.14;
        break;
      }
    }

    const g = root.current;
    if (g) {
      // "adv" is forward along the way the cat is pointed; dx is sideways.
      const cos = Math.cos(r), sin = Math.sin(r);
      g.position.set(p[0] + sin * adv + cos * dx, p[1] + dy, p[2] + cos * adv - sin * dx);
      g.rotation.y = absYaw ?? r + yaw;
    }
    if (body.current) {
      body.current.position.y = crouch;
      body.current.scale.y = breathe;
    }
    if (head.current) head.current.rotation.x = nod;
    if (tail.current) { tail.current.rotation.x = tailLift; tail.current.rotation.y = swish; }
    if (earL.current) earL.current.rotation.x = earBack;
    if (earR.current) earR.current.rotation.x = earBack;
    if (legs.current) legs.current.scale.y = tuck;
    if (eyes.current) eyes.current.scale.y = blink;
  });

  return (
    <group ref={root} position={p} rotation={[0, r, 0]} scale={s}>
      {/* legs sit outside the body group so crouching lowers the cat, not its feet */}
      <group ref={legs}>
        {([[-0.027, 0.052], [0.027, 0.052], [-0.03, -0.058], [0.03, -0.058]] as const).map(([x, z], i) => (
          <Box key={i} p={[x, 0.029, z]} s={[0.022, 0.058, 0.025]} c={c.fur} rough={0.95} />
        ))}
      </group>
      <group ref={body}>
        <Box p={[0, 0.095, -0.03]} s={[0.086, 0.072, 0.1]} c={c.fur} rough={0.95} />
        <Box p={[0, 0.093, 0.045]} s={[0.076, 0.066, 0.072]} c={c.fur} rough={0.95} />
        <Box p={[0, 0.066, 0.064]} s={[0.058, 0.038, 0.05]} c={c.belly} rough={0.95} />
        {kind === "orange" &&
          [0.012, -0.028, -0.068].map((z, i) => (
            <Box key={i} p={[0, 0.129, z]} s={[0.074, 0.012, 0.016]} c={c.mark} rough={0.95} cast={false} />
          ))}
        <group ref={tail} position={[0, 0.112, -0.079]}>
          <Box p={[0, 0, -0.047]} s={[0.016, 0.016, 0.094]} c={c.fur} rough={0.95} />
          <Box p={[0, 0, -0.1]} s={[0.014, 0.014, 0.032]} c={kind === "orange" ? c.mark : c.fur} rough={0.95} />
        </group>
        <group ref={head} position={[0, 0.152, 0.086]}>
          <Box p={[0, 0, 0]} s={[0.07, 0.064, 0.062]} c={c.fur} rough={0.95} />
          {kind === "patch" && <Box p={[0, 0.034, -0.004]} s={[0.054, 0.014, 0.052]} c={c.mark} rough={0.95} cast={false} />}
          <Box p={[0, -0.015, 0.036]} s={[0.036, 0.026, 0.018]} c={c.belly} rough={0.95} cast={false} />
          <Box p={[0, -0.008, 0.047]} s={[0.012, 0.009, 0.006]} c={c.ear} rough={0.7} cast={false} />
          <group ref={earR} position={[0.023, 0.036, -0.006]}>
            <Box p={[0, 0.016, 0]} s={[0.024, 0.034, 0.012]} c={c.fur} rough={0.95} />
          </group>
          <group ref={earL} position={[-0.023, 0.036, -0.006]}>
            <Box p={[0, 0.016, 0]} s={[0.024, 0.034, 0.012]} c={c.fur} rough={0.95} />
          </group>
          <group ref={eyes}>
            <Box p={[0.017, 0.008, 0.032]} s={[0.01, 0.013, 0.005]} c="#2A2622" cast={false} />
            <Box p={[-0.017, 0.008, 0.032]} s={[0.01, 0.013, 0.005]} c="#2A2622" cast={false} />
          </group>
        </group>
      </group>
    </group>
  );
}

// ---------- lights ----------
// Every light eases toward its target; under reduced motion it snaps.
function useEase(still: boolean) {
  const invalidate = useThree((s) => s.invalidate);
  return (cur: number, target: number, d: number, rate = 5) => {
    const k = still ? 1 : 1 - Math.exp(-rate * d);
    const v = cur + (target - cur) * k;
    if (Math.abs(target - v) > 0.002) invalidate();
    return v;
  };
}

function SkyLights({ sky, on, outdoor, still }: { sky: Sky; on: boolean; outdoor: boolean; still: boolean }) {
  const amb = useRef<THREE.AmbientLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const ease = useEase(still);
  const target = useMemo(
    () => ({ sun: new THREE.Color(sky.sun), top: new THREE.Color(sky.hemiTop), bottom: new THREE.Color(sky.hemiBottom) }),
    [sky]
  );
  useFrame((_, d) => {
    if (!amb.current || !hemi.current || !sun.current) return;
    // Indoors, switching the lights off leaves the window and the screens to do the work.
    const dim = outdoor || on ? 1 : 0.35;
    amb.current.intensity = ease(amb.current.intensity, sky.amb * dim, d);
    hemi.current.intensity = ease(hemi.current.intensity, sky.hemiI * dim, d);
    sun.current.intensity = ease(sun.current.intensity, sky.sunI, d);
    const k = still ? 1 : 1 - Math.exp(-4 * d);
    sun.current.color.lerp(target.sun, k);
    hemi.current.color.lerp(target.top, k);
    hemi.current.groundColor.lerp(target.bottom, k);
  });
  return (
    <>
      <ambientLight ref={amb} intensity={sky.amb} />
      <hemisphereLight ref={hemi} args={[sky.hemiTop, sky.hemiBottom, sky.hemiI]} />
      <directionalLight
        ref={sun}
        position={outdoor ? [-2.5, 7, 3] : [-3.5, 7, 1.8]}
        intensity={sky.sunI}
        color={sky.sun}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-2.3}
        shadow-camera-right={2.3}
        shadow-camera-top={2.3}
        shadow-camera-bottom={-2.3}
        shadow-camera-near={2}
        shadow-camera-far={14}
        shadow-bias={-0.0003}
        shadow-normalBias={0.015}
      />
    </>
  );
}

// A warm bulb that eases on and off: the floor lamp indoors, a desk lamp, a street light outside.
function Bulb({ p, on, intensity, distance = 4, color = "#FFD6A0", size = 0.05, shadow = false }: { p: V3; on: boolean; intensity: number; distance?: number; color?: string; size?: number; shadow?: boolean }) {
  const light = useRef<THREE.PointLight>(null);
  const glow = useRef<THREE.MeshBasicMaterial>(null);
  const still = !!useReducedMotion();
  const ease = useEase(still);
  const off = useMemo(() => new THREE.Color("#4A4238"), []);
  const lit = useMemo(() => new THREE.Color(color).multiplyScalar(1.6), [color]);
  useFrame((_, d) => {
    if (!light.current || !glow.current) return;
    light.current.intensity = ease(light.current.intensity, on ? intensity : 0, d, 6);
    glow.current.color.lerp(on ? lit : off, still ? 1 : 1 - Math.exp(-6 * d));
  });
  return (
    <group position={p}>
      <pointLight
        ref={light}
        intensity={on ? intensity : 0}
        distance={distance}
        decay={1.6}
        color={color}
        castShadow={shadow}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.02}
        shadow-bias={-0.002}
        shadow-radius={6}
      />
      <mesh>
        <sphereGeometry args={[size, 16, 12]} />
        <meshBasicMaterial ref={glow} color={on ? lit : off} toneMapped={false} />
      </mesh>
    </group>
  );
}

// Kenney's curved street light, scaled up, with its bulb under the hood.
function StreetLight({ p, r = 0, on }: { p: V3; r?: number; on: boolean }) {
  const S = 2.3;
  return (
    <group position={p} rotation={[0, r, 0]}>
      <Model name="roads/light-curved" s={S} />
      <Bulb p={[0, 0.6 * S, -0.105 * S]} on={on} intensity={16} distance={6} color="#FFC98A" size={0.045} />
    </group>
  );
}

function FloorLamp({ p, on }: { p: V3; on: boolean }) {
  return (
    <group position={p}>
      <Model name="lampSquareFloor" />
      <Bulb p={[0, 0.74, 0]} on={on} intensity={9} distance={5} size={0.035} />
    </group>
  );
}

// ---------- the room ----------
// Planks drawn once to a canvas: a texture with no image file to fetch.
function usePlanks(c: Palette) {
  const tex = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 512;
    cv.height = 512;
    const g = cv.getContext("2d")!;
    g.fillStyle = c.floor;
    g.fillRect(0, 0, 512, 512);
    const rows = 10;
    for (let i = 0; i < rows; i++) {
      const y = (i * 512) / rows;
      g.fillStyle = `rgba(0,0,0,${0.03 + ((i * 37) % 5) * 0.012})`;
      g.fillRect(0, y, 512, 512 / rows);
      g.fillStyle = c.floorLine;
      g.fillRect(0, y, 512, 2);
      const off = ((i * 173) % 512) - 40;
      g.fillRect(off, y, 2, 512 / rows);
      g.fillRect((off + 260) % 512, y, 2, 512 / rows);
    }
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [c]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

const ROOM = 3; // the floor is ROOM x ROOM, walls on the back (-z) and left (-x)
const H = ROOM / 2;
const WALL_H = 1.7;

function Shell({ c, sky }: { c: Palette; sky: Sky }) {
  const planks = usePlanks(c);
  return (
    <>
      {/* floor slab */}
      <mesh position={[0, -0.06, 0]} receiveShadow castShadow>
        <boxGeometry args={[ROOM, 0.12, ROOM]} />
        <meshStandardMaterial attach="material-0" color={c.floorLine} />
        <meshStandardMaterial attach="material-1" color={c.floorLine} />
        <meshStandardMaterial attach="material-2" map={planks} roughness={0.7} />
        <meshStandardMaterial attach="material-3" color={c.floorLine} />
        <meshStandardMaterial attach="material-4" color={c.floorLine} />
        <meshStandardMaterial attach="material-5" color={c.floorLine} />
      </mesh>
      {/* walls with a baseboard */}
      <Box p={[0, WALL_H / 2, -H - 0.05]} s={[ROOM, WALL_H, 0.1]} c={c.wall} rough={0.95} cast={false} />
      <Box p={[-H - 0.05, WALL_H / 2, -0.05]} s={[0.1, WALL_H, ROOM + 0.1]} c={c.wall2} rough={0.95} cast={false} />
      <Box p={[0, 0.04, -H + 0.01]} s={[ROOM, 0.08, 0.02]} c={c.trim} />
      <Box p={[-H + 0.01, 0.04, 0]} s={[0.02, 0.08, ROOM]} c={c.trim} />
      <Window c={c} sky={sky} />
    </>
  );
}

// The window shows the sky; its glass eases when the sky changes, and the sun falls through it.
function Window({ c, sky }: { c: Palette; sky: Sky }) {
  const pane = useRef<THREE.MeshBasicMaterial>(null);
  const target = useMemo(() => new THREE.Color(sky.window), [sky]);
  const invalidate = useThree((s) => s.invalidate);
  useFrame((_, d) => {
    if (!pane.current) return;
    pane.current.color.lerp(target, 1 - Math.exp(-3 * d));
    if (!pane.current.color.equals(target)) invalidate();
  });
  return (
    <group position={[-H + 0.005, 0.95, 0.35]}>
      <Box p={[0, 0, 0]} s={[0.04, 0.82, 0.92]} c={c.paper} />
      <mesh position={[0.025, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.8, 0.7]} />
        <meshBasicMaterial ref={pane} color={sky.window} toneMapped={false} />
      </mesh>
      <Box p={[0.035, 0, 0]} s={[0.02, 0.72, 0.03]} c={c.paper} />
      <Box p={[0.035, 0, 0]} s={[0.02, 0.03, 0.82]} c={c.paper} />
      <Box p={[0.07, -0.42, 0]} s={[0.12, 0.03, 0.98]} c={c.paper} />
    </group>
  );
}

// ---------- the outdoors ----------
function Ground({ c, children }: { c: Palette; children?: React.ReactNode }) {
  return (
    <>
      <mesh position={[0, -0.12, 0]} receiveShadow castShadow>
        <boxGeometry args={[ROOM, 0.22, ROOM]} />
        <meshStandardMaterial color={c.soil} roughness={1} />
      </mesh>
      <mesh position={[0, 0.0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM, ROOM]} />
        <meshStandardMaterial color={c.grass} roughness={1} />
      </mesh>
      <Box p={[0, -0.005, 0]} s={[ROOM + 0.02, 0.02, ROOM + 0.02]} c={c.grass} rough={1} />
      {children}
    </>
  );
}

// Grass tufts and flowers, scattered on a fixed seed so the park looks the same for everyone.
function Scatter({ seed, count, avoid }: { seed: number; count: number; avoid?: (x: number, z: number) => boolean }) {
  const items = useMemo(() => {
    const r = rng(seed);
    const kinds: ModelName[] = ["grass", "grass_large", "grass", "flower_redA", "flower_yellowA", "flower_purpleA", "rock_smallA"];
    const out: { name: ModelName; p: V3; r: number; s: number }[] = [];
    for (let i = 0; out.length < count && i < count * 6; i++) {
      const x = (r() - 0.5) * (ROOM - 0.3);
      const z = (r() - 0.5) * (ROOM - 0.3);
      if (avoid?.(x, z)) continue;
      out.push({ name: kinds[Math.floor(r() * kinds.length)], p: [x, 0, z], r: r() * 6.28, s: 0.6 + r() * 0.5 });
    }
    return out;
  }, [seed, count, avoid]);
  return (
    <>
      {items.map((it, i) => (
        <Model key={i} name={it.name} p={it.p} r={it.r} s={it.s} />
      ))}
    </>
  );
}

// ---------- props built in code ----------
function Dumbbell({ p, r = 0 }: { p: V3; r?: number }) {
  return (
    <group position={p} rotation={[0, r, 0]}>
      <Box p={[0, 0, 0]} s={[0.2, 0.025, 0.025]} c="#9A9CA4" metal={0.6} rough={0.35} />
      <Box p={[-0.085, 0, 0]} s={[0.04, 0.09, 0.09]} c="#26272D" />
      <Box p={[0.085, 0, 0]} s={[0.04, 0.09, 0.09]} c="#26272D" />
    </group>
  );
}

// Phone on a tripod, recording: the red light blinks.
function Tripod({ p, r }: { p: V3; r: number }) {
  const rec = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (rec.current) rec.current.visible = Math.floor(clock.elapsedTime * 1.5) % 2 === 0;
  });
  return (
    <group position={p} rotation={[0, r, 0]}>
      {[0, 1, 2].map((i) => (
        <group key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]}>
          <Box p={[0, 0.27, 0.08]} s={[0.015, 0.56, 0.015]} c="#1C1F2B" r={[-0.3, 0, 0]} />
        </group>
      ))}
      <Box p={[0, 0.6, 0]} s={[0.025, 0.1, 0.025]} c="#1C1F2B" />
      <group position={[0, 0.68, 0]}>
        <Box p={[0, 0, 0]} s={[0.17, 0.09, 0.012]} c="#1C1F2B" />
        <Glow p={[0, 0, -0.007]} w={0.15} h={0.07} c="#1F44C8" r={[0, Math.PI, 0]} />
        <mesh ref={rec} position={[-0.055, 0.025, -0.008]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[0.008, 12]} />
          <meshBasicMaterial color="#FF3B30" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

// The kick, in sync: the leg and the ball run off the same clock, so the ball
// leaves on the frame the boot reaches it, flies into the net, and rolls back
// while he resets for the next one.
function Kicker({ p, r, still }: { p: V3; r: number; still: boolean }) {
  const ball = useRef<THREE.Mesh>(null);
  // Where the boot arrives at full extension, measured from the hips.
  const REST = (THIGH_L + SHIN_L) * Math.sin(0.62) + 0.1;

  useFrame(({ clock }, d) => {
    const b = ball.current;
    if (!b) return;
    const c = still ? KICK_HIT : clock.elapsedTime % KICK_T;
    const dist = 1.25, flight = 0.55, settle = 0.3;
    if (c < KICK_HIT) b.position.set(0, BALL_R, REST);
    else if (c < KICK_HIT + flight) {
      const f = (c - KICK_HIT) / flight;
      b.position.set(0, BALL_R + Math.sin(f * Math.PI) * 0.28, REST + f * dist);
      if (!still) b.rotation.x += d * 14;
    } else if (c < KICK_HIT + flight + settle) b.position.set(0, BALL_R, REST + dist);
    else {
      const f = Math.min(1, (c - KICK_HIT - flight - settle) / (KICK_T - 0.45 - KICK_HIT - flight - settle));
      const e = 1 - Math.pow(1 - f, 3);
      b.position.set(0, BALL_R, REST + dist * (1 - e));
      if (!still && f < 1) b.rotation.x -= d * 8;
    }
  });

  return (
    <group position={p} rotation={[0, r, 0]}>
      <Minifig pose="kick" still={still} />
      <mesh ref={ball} castShadow>
        <icosahedronGeometry args={[BALL_R, 1]} />
        <meshStandardMaterial color="#F7F7F4" roughness={0.5} flatShading />
      </mesh>
    </group>
  );
}

function Goal({ c, p }: { c: Palette; p: V3 }) {
  return (
    <group position={p}>
      <Box p={[-0.55, 0.3, 0]} s={[0.035, 0.6, 0.035]} c={c.white} />
      <Box p={[0.55, 0.3, 0]} s={[0.035, 0.6, 0.035]} c={c.white} />
      <Box p={[0, 0.6, 0]} s={[1.135, 0.035, 0.035]} c={c.white} />
      <Box p={[-0.55, 0.3, -0.25]} s={[0.02, 0.6, 0.02]} c={c.white} />
      <Box p={[0.55, 0.3, -0.25]} s={[0.02, 0.6, 0.02]} c={c.white} />
      <mesh position={[0, 0.3, -0.25]}>
        <planeGeometry args={[1.1, 0.6, 10, 6]} />
        <meshBasicMaterial color={c.white} wireframe transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// The screen of a Kenney monitor: a self-lit plane fitted to its bezel.
function Screen({ p, r = 0, children, c }: { p: V3; r?: number; children?: React.ReactNode; c: Palette }) {
  return (
    <group position={p} rotation={[0, r, 0]}>
      <Model name="computerScreen" />
      <group position={[0, 0.185, 0.012]}>
        <Glow p={[0, 0, 0]} w={0.355} h={0.2} c={c.screen} />
        <group position={[0, 0, 0.002]}>{children}</group>
        <pointLight position={[0, 0, 0.3]} intensity={0.35} distance={1.4} color="#8EA2FF" />
      </group>
    </group>
  );
}

const Candles = ({ c }: { c: Palette }) => (
  <>
    {[0.07, 0.1, 0.06, 0.11, 0.13, 0.09, 0.14, 0.12].map((h, i) => (
      <Glow key={i} p={[-0.14 + i * 0.04, -0.05 + h / 2 + (i % 3) * 0.01, 0]} w={0.018} h={h} c={i % 3 === 2 ? c.red : c.green} />
    ))}
  </>
);

const Timeline = ({ c }: { c: Palette }) => (
  <>
    <Glow p={[0, 0.045, 0]} w={0.33} h={0.08} c={c.lapis} />
    {[0, 1, 2].map((r) => (
      <Glow key={r} p={[-0.03 + r * 0.04, -0.04 - r * 0.025, 0.001]} w={0.18 - r * 0.035} h={0.018} c={[c.paper, c.green, c.red][r]} />
    ))}
    <Glow p={[0.02, -0.05, 0.002]} w={0.004} h={0.1} c={c.paper} />
  </>
);

const UIMock = ({ c }: { c: Palette }) => (
  <>
    <Glow p={[-0.13, 0, 0]} w={0.07} h={0.18} c={c.lapis} />
    <Glow p={[0.04, 0.06, 0]} w={0.22} h={0.035} c={c.paper} />
    <Glow p={[0.0, -0.02, 0]} w={0.13} h={0.08} c={c.paper} />
    <Glow p={[0.11, -0.02, 0]} w={0.06} h={0.08} c={c.green} />
  </>
);

// A desk you can sit at: the desk faces +z, the chair and the sitter face the screen.
function Workstation({ c, still, screens }: { c: Palette; still: boolean; screens: React.ReactNode }) {
  return (
    <>
      <Model name="desk" p={[0.15, 0, -1.12]} />
      {screens}
      <Model name="computerKeyboard" p={[0.15, 0.38, -1.0]} />
      <Model name="computerMouse" p={[0.38, 0.38, -1.0]} />
      <Seated name="chairDesk" p={[0.15, 0, -0.62]} r={Math.PI} face={Math.PI} still={still} />
    </>
  );
}

// ---------- scenes ----------
function rng(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The brainstorming room rearranges itself every minute: new notes on the board.
function IdeasRoom({ c, minute, still }: { c: Palette; minute: number; still: boolean }) {
  const v = useMemo(() => {
    const r = rng(minute * 9973 + 17);
    const pool = [...ideas];
    return {
      notes: [0, 1, 2].map(() => ({
        text: pool.splice(Math.floor(r() * pool.length), 1)[0],
        color: [c.sage, c.butter, c.blush, c.mist][Math.floor(r() * 4)],
        tilt: (r() - 0.5) * 0.12,
        dy: (r() - 0.5) * 0.08,
      })),
      mug: r() > 0.35,
    };
  }, [minute, c]);
  return (
    <>
      <group position={[-0.2, 0.95, -H + 0.03]}>
        <Box p={[0, 0, 0]} s={[1.9, 0.95, 0.03]} c="#3A3D48" />
        <Box p={[0, 0, 0.018]} s={[1.84, 0.89, 0.01]} c={c.white} rough={0.3} />
        <Label text="Ideas" size={0.06} color={c.lapis} p={[-0.78, 0.36, 0.03]} face="serif" />
        {v.notes.map((n, i) => (
          <group key={i} position={[-0.6 + i * 0.6, 0.02 + n.dy, 0.028]} rotation={[0, 0, n.tilt]}>
            <Glow p={[0, 0, 0]} w={0.5} h={0.4} c={n.color} />
            <Label text={n.text} size={0.055} color={c.ink} p={[0, 0, 0.004]} maxWidth={0.44} />
          </group>
        ))}
        <Box p={[-0.3, -0.3, 0.03]} s={[0.28, 0.012, 0.004]} c={c.lapis} />
        <Box p={[0.3, -0.3, 0.03]} s={[0.28, 0.012, 0.004]} c={c.lapis} />
        <Box p={[0, -0.47, 0.04]} s={[0.7, 0.025, 0.06]} c="#3A3D48" />
      </group>
      <Minifig pose="reach" p={[0.75, 0, -0.95]} r={Math.PI + 0.5} still={still} />
      <Model name="chair" p={[-0.6, 0, 0.35]} r={0.6} />
      <Model name="sideTable" p={[0.95, 0, 0.75]} r={-Math.PI / 2} />
      {v.mug && <Model name="food/mug" p={[0.92, 0.38, 0.7]} s={0.25} />}
      <Model name="books" p={[1.0, 0.38, 0.85]} r={0.4} />
      <Model name="pottedPlant" p={[-1.2, 0, -1.2]} />
    </>
  );
}

function SceneContent({ id, c, minute, on, still }: { id: SceneId; c: Palette; minute: number; on: boolean; still: boolean }) {
  switch (id) {
    case "design":
      return (
        <>
          <Model name="rugRectangle" p={[0.1, 0, -0.35]} />
          <Workstation c={c} still={still} screens={<Screen c={c} p={[0.15, 0.38, -1.25]}><UIMock c={c} /></Screen>} />
          <Model name="pottedPlant" p={[1.15, 0, -1.2]} />
          <Model name="bookcaseOpen" p={[-1.3, 0, -0.55]} r={Math.PI / 2} />
          <Model name="books" p={[-1.3, 0.46, -0.6]} r={Math.PI / 2} />
          {/* type specimens pinned above the desk */}
          {["Aa", "Rg", "&"].map((g, i) => (
            <group key={g} position={[-0.35 + i * 0.4, 1.12, -H + 0.012]}>
              <Glow p={[0, 0, 0]} w={0.3} h={0.38} c={i === 1 ? c.lapis : c.paper} />
              <Label text={g} size={0.16} color={i === 1 ? c.paper : c.ink} p={[0, 0, 0.004]} face="serif" />
            </group>
          ))}
        </>
      );
    case "editing":
      return (
        <>
          <Model name="rugRound" p={[0.15, 0, -0.45]} />
          <Workstation
            c={c}
            still={still}
            screens={
              <>
                <Screen c={c} p={[-0.05, 0.38, -1.25]} r={0.18}><Timeline c={c} /></Screen>
                <Screen c={c} p={[0.37, 0.38, -1.25]} r={-0.18}><Glow p={[0, 0, 0]} w={0.33} h={0.18} c={c.lapis} /></Screen>
              </>
            }
          />
          <Model name="speaker" p={[-0.45, 0, -1.25]} />
          <Model name="speaker" p={[0.8, 0, -1.25]} />
          {/* clapperboard on the wall shelf */}
          <group position={[1.0, 1.0, -H + 0.03]}>
            <Box p={[0, 0, 0]} s={[0.26, 0.19, 0.02]} c={c.ink} />
            <Box p={[0, 0.12, 0]} s={[0.26, 0.04, 0.02]} c={c.paper} r={[0, 0, 0.16]} />
          </group>
        </>
      );
    case "trading":
      return (
        <>
          <Workstation
            c={c}
            still={still}
            screens={
              <>
                <Screen c={c} p={[0.15, 0.38, -1.25]}><Candles c={c} /></Screen>
                <Model name="laptop" p={[-0.08, 0.38, -1.05]} r={0.35} />
              </>
            }
          />
          <Model name="food/mug" p={[0.42, 0.38, -0.98]} s={0.22} />
          <group position={[-0.12, 0.38, -1.3]}>
            <Model name="lampRoundTable" />
            <Bulb p={[0.03, 0.24, 0]} on={on} intensity={1.2} distance={1.8} size={0.02} />
          </group>
          <Model name="trashcan" p={[0.85, 0, -1.2]} />
          <Model name="plantSmall1" p={[1.0, 0, 0.9]} s={2.2} />
        </>
      );
    case "cooking":
      return (
        <>
          <Model name="kitchenFridge" p={[-1.22, 0, -1.2]} />
          <Model name="kitchenCabinet" p={[-0.78, 0, -1.25]} />
          <Model name="kitchenStove" p={[-0.35, 0, -1.25]} />
          <Model name="kitchenSink" p={[0.08, 0, -1.25]} />
          <Model name="kitchenCabinet" p={[0.51, 0, -1.25]} />
          <Model name="kitchenCabinetUpper" p={[0.08, 0.95, -1.37]} />
          <Model name="kitchenCabinetUpper" p={[0.51, 0.95, -1.37]} />
          <Model name="kitchenCoffeeMachine" p={[0.55, 0.45, -1.3]} />
          <Model name="food/frying-pan" p={[-0.33, 0.45, -1.18]} s={0.28} r={0.6} />
          <Model name="food/pot-stew" p={[-0.4, 0.45, -1.36]} s={0.26} />
          <Model name="food/cutting-board" p={[0.5, 0.45, -1.14]} s={0.24} r={Math.PI / 2} />
          <Minifig pose="reach" p={[-0.3, 0, -0.78]} r={Math.PI} still={still} />
          <Model name="pottedPlant" p={[1.15, 0, 0.9]} />
          <Model name="rugRound" p={[0, 0, 0]} />
        </>
      );
    case "cinema":
      return (
        <>
          <Model name="rugRectangle" p={[0, 0, 0]} />
          <Model name="cabinetTelevision" p={[0, 0, -1.3]} />
          <Model name="televisionModern" p={[0, 0.31, -1.32]} s={1.6} />
          <Glow p={[0, 0.31 + 0.39, -1.32 + 0.06 * 1.6 + 0.004]} w={0.98} h={0.55} c={c.screen} />
          <Label text="Now showing" size={0.07} color={c.paper} p={[0, 0.7, -1.32 + 0.1 + 0.006]} face="serif" />
          <pointLight position={[0, 0.7, -0.8]} intensity={1.6} distance={3} color="#9DB2FF" />
          <Model name="tableCoffee" p={[0, 0, -0.2]} />
          <Seated name="loungeSofa" p={[0, 0, 0.75]} r={Math.PI} face={Math.PI} still={still} />
          <Model name="speaker" p={[-0.6, 0, -1.3]} />
          <Model name="speaker" p={[0.6, 0, -1.3]} />
        </>
      );
    case "panic":
      return (
        <>
          <Model name="desk" p={[-0.7, 0, -1.12]} />
          <Screen c={c} p={[-0.7, 0.38, -1.25]}>
            <Glow p={[0, 0, 0]} w={0.33} h={0.18} c={c.red} />
          </Screen>
          <Model name="chairDesk" p={[-0.95, 0, -0.55]} r={Math.PI + 0.7} />
          <Minifig pose="walk" p={[0.2, 0, 0.3]} path="pace" still={still} />
          <Thoughts c={c} still={still} />
          {[[0.9, 0.9], [0.5, -0.2], [-0.4, 0.9], [1.1, -0.6], [-0.1, 1.15]].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.035, z]} rotation={[i, i * 0.7, 0]} castShadow>
              <icosahedronGeometry args={[0.04, 0]} />
              <meshStandardMaterial color={c.paper} flatShading />
            </mesh>
          ))}
          <Model name="cardboardBoxOpen" p={[1.1, 0, -1.15]} />
        </>
      );
    case "ideas":
      return <IdeasRoom c={c} minute={minute} still={still} />;
    case "gym":
      return (
        <>
          <mesh position={[0.2, 0.003, 0.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[1.5, 1.3]} />
            <meshStandardMaterial color="#5A5D68" roughness={0.95} />
          </mesh>
          {/* wall mirror */}
          <Box p={[0.2, 0.95, -H + 0.02]} s={[1.6, 1.0, 0.02]} c="#2A2C33" />
          <mesh position={[0.2, 0.95, -H + 0.035]}>
            <planeGeometry args={[1.52, 0.92]} />
            <meshStandardMaterial color="#E4ECF8" roughness={0.15} metalness={0.1} />
          </mesh>
          {/* bench */}
          <group position={[0.75, 0, -0.85]}>
            <Box p={[0, 0.22, 0]} s={[0.75, 0.07, 0.22]} c={c.lapis} rough={0.6} />
            <Box p={[-0.28, 0.1, 0]} s={[0.05, 0.2, 0.18]} c="#26272D" />
            <Box p={[0.28, 0.1, 0]} s={[0.05, 0.2, 0.18]} c="#26272D" />
          </group>
          {/* rack */}
          <group position={[-1.25, 0, 0.3]}>
            <Box p={[0, 0.18, 0]} s={[0.26, 0.03, 0.9]} c="#26272D" />
            <Box p={[0, 0.38, 0]} s={[0.26, 0.03, 0.9]} c="#26272D" />
            <Box p={[0, 0.2, -0.43]} s={[0.26, 0.4, 0.03]} c="#26272D" />
            <Box p={[0, 0.2, 0.43]} s={[0.26, 0.4, 0.03]} c="#26272D" />
            {[-0.3, -0.05, 0.2].map((z, i) => (
              <Dumbbell key={i} p={[0, i % 2 ? 0.44 : 0.24, z]} r={Math.PI / 2} />
            ))}
          </group>
          <Dumbbell p={[0.1, 0.045, 0.45]} r={0.4} />
          {/* on the bench, facing the tripod that's filming: the same seat-anchored sit pose used everywhere else */}
          <Minifig pose="sit" seat={[0.75, 0.255, -0.85]} r={Math.atan2(1.3 - 0.75, -0.3 - -0.85)} still={still} />
          <Dumbbell p={[0.95, 0.285, -0.78]} r={0.3} />
          <Tripod p={[1.3, 0, -0.3]} r={Math.atan2(0.75 - 1.3, -0.85 - -0.3)} />
          <Model name="pottedPlant" p={[1.2, 0, -1.2]} />
        </>
      );
    case "sports":
      return (
        <Ground c={c}>
          {/* pitch markings: the box in front of the goal */}
          <Glow p={[0.72, 0.004, 0.1]} w={0.02} h={1.5} c={c.white} r={[-Math.PI / 2, 0, 0]} />
          <Glow p={[-0.5, 0.004, 0.1]} w={0.02} h={1.5} c={c.white} r={[-Math.PI / 2, 0, 0]} />
          <group position={[1.1, 0, 0.1]} rotation={[0, -Math.PI / 2, 0]}>
            <Goal c={c} p={[0, 0, 0]} />
          </group>
          <Kicker p={[-0.35, 0, 0.1]} r={Math.PI / 2} still={still} />
          <Model name="tree_oak" p={[-1.15, 0, -1.15]} s={1.15} />
          <Model name="tree_default" p={[1.2, 0, -1.2]} s={0.9} />
          <StreetLight p={[-1.25, 0, 1.1]} r={-Math.PI / 4} on={on} />
          {[-1, 0, 1].map((i) => (
            <Model key={i} name="fence_simple" p={[i, 0, -1.47]} />
          ))}
          <Scatter seed={7} count={14} avoid={(x, z) => x > -0.9 && x < 1.4 && Math.abs(z - 0.1) < 0.75} />
        </Ground>
      );
    case "run":
      return (
        <Ground c={c}>
          <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <ringGeometry args={[0.8, 1.05, 64]} />
            <meshStandardMaterial color={c.path} roughness={1} />
          </mesh>
          <Minifig pose="run" path="loop" still={still} />
          <Model name="plant_bushLarge" p={[0, 0, 0]} s={1.6} />
          <Model name="plant_bush" p={[0.25, 0, 0.2]} s={1.2} />
          <Model name="flower_redA" p={[-0.25, 0, 0.15]} />
          <Model name="flower_yellowA" p={[0.1, 0, -0.3]} />
          <Model name="tree_oak" p={[-1.25, 0, -1.25]} />
          <Model name="tree_default" p={[1.25, 0, -1.25]} s={0.8} />
          <StreetLight p={[1.25, 0, 0.3]} r={Math.PI / 2} on={on} />
          <StreetLight p={[-0.3, 0, -1.3]} on={on} />
          <Scatter seed={11} count={16} avoid={(x, z) => { const d = Math.hypot(x, z); return d > 0.65 && d < 1.2; }} />
        </Ground>
      );
    case "cats":
      return (
        <>
          {/* the bed: frame, mattress, duvet over the foot, pillows at the head */}
          <group position={[0.1, 0, -0.62]}>
            <Box p={[0, 0.135, 0]} s={[1.3, 0.13, 1.6]} c="#8A6A4E" />
            {([[-0.58, 0.72], [0.58, 0.72], [-0.58, -0.72], [0.58, -0.72]] as const).map(([x, z], i) => (
              <Box key={i} p={[x, 0.035, z]} s={[0.075, 0.07, 0.075]} c="#6E543D" />
            ))}
            <Box p={[0, 0.235, 0]} s={[1.26, 0.078, 1.56]} c="#F3EFE6" rough={0.95} />
            <Box p={[0, 0.3, 0.28]} s={[1.28, 0.058, 0.96]} c="#2742A6" rough={0.95} />
            <Box p={[0, 0.302, -0.19]} s={[1.28, 0.05, 0.08]} c="#1B3080" rough={0.95} cast={false} />
            <Box p={[0, 0.41, -0.84]} s={[1.3, 0.56, 0.07]} c="#8A6A4E" />
            <Box p={[-0.31, 0.308, -0.62]} s={[0.52, 0.09, 0.3]} c="#FBFAF7" rough={0.95} />
            <Box p={[0.33, 0.308, -0.62]} s={[0.52, 0.09, 0.3]} c="#FBFAF7" rough={0.95} />
          </group>

          {/* him, sitting back against the pillows, trailing the wand */}
          <Minifig pose="play" holds="wand" seat={[-0.05, 0.274, -1.0]} r={0.32} still={still} />

          {/* the orange one starts it, the daughter does laps, the girl loafs, the grey one hides */}
          <Cat kind="orange" p={[0.42, 0.33, -0.42]} r={-2.2} s={0.95} still={still} />
          <Cat kind="white" p={[0.16, 0.33, -0.26]} s={0.88} still={still} />
          <Cat kind="patch" p={[-0.2, 0.274, -0.92]} r={1.35} s={0.95} still={still} />
          <Cat kind="grey" p={[0.58, 0.33, -0.04]} r={0.5} s={0.95} still={still} />

          {/* a nightstand that keeps the room warm after dark */}
          <Model name="sideTable" p={[-0.95, 0, -1.2]} r={Math.PI / 2} />
          <group position={[-0.95, 0.38, -1.2]}>
            <Model name="lampRoundTable" />
            <Bulb p={[0.03, 0.24, 0]} on={on} intensity={1.6} distance={2.2} size={0.022} />
          </group>
          <Model name="books" p={[-0.9, 0.38, -0.98]} r={0.3} />
          <Model name="rugRound" p={[0.65, 0, 0.75]} />
          <Model name="pottedPlant" p={[1.2, 0, -1.2]} />
          <Model name="pillowBlue" p={[-1.05, 0, 0.25]} r={0.6} />
        </>
      );
  }
}

function Thoughts({ c, still }: { c: Palette; still: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (g.current && !still) g.current.position.y = 1.2 + Math.sin(clock.elapsedTime * 1.4) * 0.03;
  });
  return (
    <group ref={g} position={[0.25, 1.2, 0.4]}>
      <Label text="2027 ?!" size={0.14} color={c.lapis} face="serif" />
    </group>
  );
}

// Fit the diorama to the canvas, whatever its size.
function FitZoom() {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.zoom = Math.min(size.width / 4.7, size.height / 4.0);
    camera.lookAt(0, 0.45, 0);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

function Diorama({ id, c, sky, on, minute, still }: { id: SceneId; c: Palette; sky: Sky; on: boolean; minute: number; still: boolean }) {
  const g = useRef<THREE.Group>(null);
  const outdoor = OUTDOOR.includes(id);
  // Each new scene settles in from slightly below: a small, weighted entrance.
  useEffect(() => {
    if (g.current && !still) {
      g.current.position.y = -0.35;
      g.current.scale.setScalar(0.94);
    }
  }, [id, still]);
  useFrame((_, d) => {
    if (!g.current) return;
    g.current.position.y = THREE.MathUtils.damp(g.current.position.y, 0, 5, d);
    g.current.scale.setScalar(THREE.MathUtils.damp(g.current.scale.x, 1, 5, d));
  });
  return (
    <group ref={g}>
      {!outdoor && (
        <>
          <Shell c={c} sky={sky} />
          <FloorLamp p={id === "design" || id === "editing" ? [-1.22, 0, -1.22] : [-1.25, 0, 1.2]} on={on} />
        </>
      )}
      <SceneContent id={id} c={c} minute={minute} on={on} still={still} />
    </group>
  );
}

function useMinute() {
  const [m, setM] = useState(() => Math.floor(Date.now() / 60000));
  useEffect(() => {
    const t = setInterval(() => setM(Math.floor(Date.now() / 60000)), 5000);
    return () => clearInterval(t);
  }, []);
  return m;
}

export default function StudioRoom({ id, lightsOn = true }: { id: SceneId; lightsOn?: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const inView = useInView3D(wrap, "0px");
  const still = !!useReducedMotion();
  const { resolvedTheme } = useTheme();
  const [c, setC] = useState<Palette>(LIGHT);
  useEffect(() => setC(resolvedTheme === "dark" ? DARK : LIGHT), [resolvedTheme]);
  const camera = useMemo(() => ({ position: [9, 7.5, 9] as V3, zoom: 120, near: 0.1, far: 100 }), []);
  const minute = useMinute();
  const outdoor = OUTDOOR.includes(id);
  const sky = SCENE_SKY[id] ?? (id === "ideas" ? SKY_CYCLE[minute % SKY_CYCLE.length] : SKIES.day);
  const [ready, setReady] = useState(false);

  return (
    <div
      ref={wrap}
      className="relative h-full w-full"
      role="img"
      aria-label={`A 3D diorama of Sevith in the current scene, with the ${outdoor ? "street light" : "lights"} ${lightsOn ? "on" : "off"}`}
    >
      <Canvas
        orthographic
        shadows
        dpr={[1, 2]}
        frameloop={!inView ? "never" : still ? "demand" : "always"}
        camera={camera}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        onCreated={({ camera }) => camera.lookAt(0, 0.45, 0)}
      >
        <SkyLights sky={sky} on={lightsOn} outdoor={outdoor} still={still} />
        <FitZoom />
        <SoftShadows size={18} samples={12} focus={0.6} />
        <Suspense fallback={null}>
          <Diorama id={id} c={c} sky={sky} on={lightsOn} minute={minute} still={still} />
          <ContactShadows position={[0, 0.012, 0]} opacity={0.4} scale={ROOM} blur={2.2} far={0.7} resolution={1024} />
          <Ready onReady={() => setReady(true)} />
        </Suspense>
      </Canvas>
      {!ready && <StudioSkeleton />}
    </div>
  );
}

// Mounts only once everything inside its Suspense boundary has loaded.
function Ready({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return null;
}

// Fetch every model up front: switching scenes should never wait on the network.
// Plain GLB only: no Draco or Meshopt decoders, which would need WASM and the CSP forbids it.
if (typeof window !== "undefined") {
  MODELS.forEach((m) => useGLTF.preload(`${M}${m}.glb`, false, false));
}
