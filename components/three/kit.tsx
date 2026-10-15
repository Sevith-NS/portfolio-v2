"use client";

// The studio's building blocks: model loading, bevelled boxes, self-lit planes,
// text in the site's own fonts and the minifig of Sevith. Lifted
// out of the original multi-scene studio so the one-room version can reuse them.

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, useGLTF } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

export type V3 = [number, number, number];

// Kenney CC0 kits (see public/models/LICENSE-kenney.txt). Plain GLB only: no
// Draco or Meshopt decoders, which would need WASM and the CSP forbids it.
export const M = "/models/";

// ---------- models ----------
export const shadowAll = (o: THREE.Object3D) =>
  o.traverse((m) => {
    if ((m as THREE.Mesh).isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });

// A model re-anchored to its bottom centre, so props place by where they stand, not by the kit's corner pivot.
export function useModel(name: string) {
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

export function Model({ name, p = [0, 0, 0], r = 0, s = 1 }: { name: string; p?: V3; r?: number; s?: number }) {
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
export function Seated({ name, ...rest }: { name: string; p?: V3; r?: number; s?: number; still: boolean; face?: number }) {
  return <SeatedOn obj={useModel(name)} {...rest} />;
}

export function SeatedOn({ obj, p = [0, 0, 0], r = 0, s = 1, still, face }: { obj: THREE.Object3D; p?: V3; r?: number; s?: number; still: boolean; face?: number }) {
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
export const Box = ({ p, s, c, r = [0, 0, 0], rough = 0.8, metal = 0, cast = true }: { p: V3; s: V3; c: string; r?: V3; rough?: number; metal?: number; cast?: boolean }) => (
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
export const Glow = ({ p, w, h, c, r = [0, 0, 0] }: { p: V3; w: number; h: number; c: string; r?: V3 }) => (
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

export function useFontsReady() {
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
export function Label({ text, size, color, p = [0, 0, 0], r = [0, 0, 0], maxWidth, face = "sans" }: { text: string; size: number; color: string; p?: V3; r?: V3; maxWidth?: number; face?: "sans" | "serif" }) {
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
// atlas in the way. Drawn from photos: big messy black hair, full beard, no
// glasses, black tee, indigo jeans, a tattoo on the right forearm.
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
  sole: "#BDB6AA",
  belt: "#2A211B",
  buckle: "#B9B3A6",
  lip: "#7A4A3E",
};

// Joint heights, measured with the feet at y = 0.
const HIP_Y = 0.225, SHOULDER_X = 0.115, THIGH_L = 0.095, SHIN_L = 0.095, UPPER_L = 0.085, FORE_L = 0.075;
// Everything above the hips lives in a group pivoted at the hips, so leaning bends the back.
const T_SHOULDER = 0.195, T_NECK = 0.212, T_HEAD = 0.222;
// One kick cycle, and the moment inside it when boot meets ball.
const KICK_T = 3.4, KICK_HIT = 0.72, BALL_R = 0.055;

type Pose = "idle" | "sit" | "walk" | "run" | "reach" | "play" | "kick";

export function Minifig({
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

  const leg = (side: 1 | -1, hip: React.RefObject<THREE.Group | null>, knee: React.RefObject<THREE.Group | null>) => (
    <group ref={hip} position={[0.045 * side, HIP_Y, 0]}>
      <Box p={[0, -THIGH_L / 2, 0]} s={[0.07, THIGH_L, 0.078]} c={ME.jeans} />
      <group ref={knee} position={[0, -THIGH_L, 0]}>
        <Box p={[0, -SHIN_L / 2, 0]} s={[0.064, SHIN_L, 0.07]} c={ME.jeans} />
        <Box p={[0, -SHIN_L - 0.016, 0.016]} s={[0.075, 0.032, 0.11]} c={ME.shoe} rough={0.6} />
        <Box p={[0, -SHIN_L - 0.034, 0.016]} s={[0.078, 0.01, 0.114]} c={ME.sole} rough={0.9} cast={false} />
      </group>
    </group>
  );

  // Short sleeve, then bare arm: the right forearm carries the tattoo.
  const arm = (side: 1 | -1, sho: React.RefObject<THREE.Group | null>, elb: React.RefObject<THREE.Group | null>, hand?: React.ReactNode, tattoo = false) => (
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
        <Box p={[0, 0.066, 0]} s={[0.174, 0.014, 0.104]} c={ME.belt} cast={false} />
        <Box p={[0, 0.066, 0.053]} s={[0.026, 0.016, 0.004]} c={ME.buckle} metal={0.6} rough={0.35} cast={false} />
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
          {/* ears, poking out between the sideburns and the hair */}
          <Box p={[0.086, 0.1, -0.008]} s={[0.014, 0.032, 0.028]} c={ME.skin} cast={false} />
          <Box p={[-0.086, 0.1, -0.008]} s={[0.014, 0.032, 0.028]} c={ME.skin} cast={false} />
          {/* a mouth inside the beard, so the face isn't a mask */}
          <Box p={[0, 0.058, 0.081]} s={[0.04, 0.008, 0.004]} c={ME.lip} cast={false} />
          {/* nose, eyes and brows */}
          <Box p={[0, 0.096, 0.082]} s={[0.024, 0.03, 0.016]} c={ME.skin} cast={false} />
          <Box p={[0.034, 0.109, 0.074]} s={[0.018, 0.016, 0.01]} c={ME.eye} cast={false} />
          <Box p={[-0.034, 0.109, 0.074]} s={[0.018, 0.016, 0.01]} c={ME.eye} cast={false} />
          <Box p={[0.038, 0.113, 0.0795]} s={[0.005, 0.005, 0.002]} c="#FFFFFF" cast={false} />
          <Box p={[-0.03, 0.113, 0.0795]} s={[0.005, 0.005, 0.002]} c="#FFFFFF" cast={false} />
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

// ---------- lights ----------
// Every light eases toward its target; under reduced motion it snaps.
export function useEase(still: boolean) {
  const invalidate = useThree((s) => s.invalidate);
  return (cur: number, target: number, d: number, rate = 5) => {
    const k = still ? 1 : 1 - Math.exp(-rate * d);
    const v = cur + (target - cur) * k;
    if (Math.abs(target - v) > 0.002) invalidate();
    return v;
  };
}

// A warm bulb that eases on and off: the floor lamp indoors, a desk lamp, a street light outside.
export function Bulb({ p, on, intensity, distance = 4, color = "#FFD6A0", size = 0.05, shadow = false }: { p: V3; on: boolean; intensity: number; distance?: number; color?: string; size?: number; shadow?: boolean }) {
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
