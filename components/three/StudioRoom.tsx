"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, SoftShadows, useAnimations, useGLTF } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { useInView3D } from "./useInView3D";
import { ideas, OUTDOOR } from "@/data/studio";
import { StudioSkeleton } from "./StudioSkeleton";

export type SceneId =
  | "design" | "editing" | "trading" | "sports" | "gym" | "run" | "cinema" | "cooking" | "panic" | "ideas" | "bench";


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
const CHARACTER = `${M}chars/character-male-a.glb`;

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
const SCENE_SKY: Partial<Record<SceneId, Sky>> = { sports: SKIES.golden, run: SKIES.dusk, bench: SKIES.night };

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
      <Person clip="sit" seat={at} r={facing} still={still} />
    </>
  );
}

const Box = ({ p, s, c, r = [0, 0, 0], rough = 0.8, metal = 0, cast = true }: { p: V3; s: V3; c: string; r?: V3; rough?: number; metal?: number; cast?: boolean }) => (
  <mesh position={p} rotation={r} castShadow={cast} receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} roughness={rough} metalness={metal} />
  </mesh>
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
type Clip =
  | "idle" | "sit" | "sprint" | "walk" | "attack-kick-right" | "interact-right" | "pick-up" | "holding-both" | "emote-no" | "crouch";

// Kenney's Mini Character A, skinned and animated by its own clips.
// `path` moves the whole body: a running loop or pacing back and forth.
function useCharacter() {
  const { scene, animations } = useGLTF(CHARACTER, false, false);
  const model = useMemo(() => {
    const o = cloneSkinned(scene);
    shadowAll(o);
    // The colormap is a flat palette atlas: mipmapped trilinear filtering blends
    // each tiny swatch into its neighbours once the model is small on screen.
    // Nearest, no mips, keeps every swatch exact at any distance.
    o.traverse((m) => {
      const map = (m as THREE.Mesh).material && ((m as THREE.Mesh).material as THREE.MeshStandardMaterial).map;
      if (map) {
        map.minFilter = THREE.NearestFilter;
        map.generateMipmaps = false;
        map.needsUpdate = true;
      }
    });
    return o;
  }, [scene]);
  return { model, animations };
}

// Pose the model at one moment of a clip on a throwaway mixer, measure, and let go.
function measurePose<T>(model: THREE.Object3D, clip: THREE.AnimationClip | undefined, t: number, read: () => T): T {
  const mixer = new THREE.AnimationMixer(model);
  if (clip) mixer.clipAction(clip).play();
  mixer.setTime(t);
  model.updateMatrixWorld(true);
  const out = read();
  mixer.stopAllAction();
  mixer.uncacheRoot(model);
  return out;
}

const boneAt = (model: THREE.Object3D, name: string, local: V3 = [0, 0, 0]) => {
  const b = model.getObjectByName(name);
  return b ? b.localToWorld(new THREE.Vector3(...local)) : new THREE.Vector3();
};

// Thigh half-thickness: the sitting body rests this far below the hip joints.
const THIGH = 0.04;

function Person({ clip, p = [0, 0, 0], r = 0, path, speed = 1, still, seat, bob }: { clip: Clip; p?: V3; r?: number; path?: "loop" | "pace"; speed?: number; still: boolean; seat?: V3; bob?: number }) {
  const { model, animations } = useCharacter();
  // Sitting: where the hips are in the sit pose, so they can be put on the seat's surface.
  const sitting = !!seat;
  const hip = useMemo(() => {
    if (!sitting) return null;
    const sit = animations.find((a) => a.name === "sit");
    return measurePose(model, sit, 0, () => boneAt(model, "leg-left").add(boneAt(model, "leg-right")).multiplyScalar(0.5));
  }, [model, animations, sitting]);
  if (seat && hip) {
    const cos = Math.cos(r), sin = Math.sin(r);
    // hips a touch behind the seat's centre, toward the backrest
    const bx = seat[0] - sin * 0.02, bz = seat[2] - cos * 0.02;
    p = [bx - (hip.x * cos + hip.z * sin), seat[1] - (hip.y - THIGH), bz - (-hip.x * sin + hip.z * cos)];
  }
  const root = useRef<THREE.Group>(null);
  const { actions } = useAnimations(animations, root);

  useEffect(() => {
    const a = actions[clip];
    if (!a) return;
    a.reset().setEffectiveTimeScale(speed).fadeIn(0.25).play();
    return () => {
      a.fadeOut(0.25);
    };
  }, [actions, clip, speed]);

  useFrame(({ clock }) => {
    const g = root.current;
    if (!g || still) return;
    const t = clock.elapsedTime;
    if (path === "loop") {
      const a = t * 0.9;
      const R = 0.92;
      g.position.set(R * Math.cos(a), p[1], R * Math.sin(a));
      // face the direction of travel (the tangent of the loop), not away from it
      g.rotation.y = Math.atan2(-Math.sin(a), Math.cos(a));
    } else if (path === "pace") {
      const x = Math.sin(t * 0.7) * 0.75;
      g.position.set(p[0] + x, p[1], p[2]);
      g.rotation.y = Math.cos(t * 0.7) > 0 ? Math.PI / 2 : -Math.PI / 2;
    } else if (bob) {
      g.position.set(p[0], p[1] + Math.abs(Math.sin(t * 2.4)) * bob, p[2]);
    }
  });

  return (
    <group ref={root} position={p} rotation={[0, r, 0]}>
      <primitive object={model} />
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

function Fireflies({ still }: { still: boolean }) {
  const g = useRef<THREE.Group>(null);
  const flies = useMemo(() => Array.from({ length: 10 }, (_, i) => ({ x: ((i * 47) % 23) / 10 - 1.1, y: 0.3 + ((i * 13) % 9) / 10, z: ((i * 31) % 19) / 10 - 0.9, s: 0.5 + (i % 4) / 4 })), []);
  useFrame(({ clock }) => {
    if (!g.current || still) return;
    const t = clock.elapsedTime;
    g.current.children.forEach((m, i) => {
      const f = flies[i];
      m.position.set(f.x + Math.sin(t * f.s + i) * 0.15, f.y + Math.sin(t * 1.3 * f.s + i * 2) * 0.08, f.z + Math.cos(t * f.s + i) * 0.15);
      ((m as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.7);
    });
  });
  return (
    <group ref={g}>
      {flies.map((f, i) => (
        <mesh key={i} position={[f.x, f.y, f.z]}>
          <sphereGeometry args={[0.012, 8, 6]} />
          <meshBasicMaterial color="#FFF2A8" transparent toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// ---------- props built in code ----------
function useParkBench() {
  return useMemo(() => {
    const g = new THREE.Group();
    const wood = new THREE.MeshStandardMaterial({ color: "#B07A4A", roughness: 0.75 });
    const iron = new THREE.MeshStandardMaterial({ color: "#2A2D35", roughness: 0.5, metalness: 0.4 });
    const add = (m: THREE.Material, size: V3, at: V3, rx = 0) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), m);
      mesh.position.set(...at);
      mesh.rotation.x = rx;
      mesh.castShadow = mesh.receiveShadow = true;
      g.add(mesh);
    };
    const W = 0.78, SEAT = 0.2;
    for (let i = 0; i < 3; i++) add(wood, [W, 0.022, 0.06], [0, SEAT, 0.07 - i * 0.07]);
    for (let i = 0; i < 2; i++) add(wood, [W, 0.06, 0.022], [0, SEAT + 0.1 + i * 0.09, -0.1 - i * 0.012], -0.18);
    for (const x of [-W / 2 + 0.06, W / 2 - 0.06]) {
      add(iron, [0.025, SEAT, 0.025], [x, SEAT / 2, 0.08]);
      add(iron, [0.025, SEAT + 0.24, 0.025], [x, (SEAT + 0.24) / 2, -0.1]);
      add(iron, [0.025, 0.025, 0.24], [x, SEAT - 0.02, -0.01]);
      add(iron, [0.025, 0.025, 0.2], [x, SEAT + 0.08, 0.0]);
    }
    g.updateMatrixWorld(true);
    return g;
  }, []);
}

function ParkBench(props: { p?: V3; r?: number; still: boolean }) {
  return <SeatedOn obj={useParkBench()} {...props} />;
}

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

// The kick, in sync: sample the clip to find the frame where the right foot reaches furthest forward.
// The ball waits exactly there, leaves on that frame, flies into the net, and rolls back while he resets.
function Kicker({ p, r, still }: { p: V3; r: number; still: boolean }) {
  const { model, animations } = useCharacter();
  const root = useRef<THREE.Group>(null);
  const ball = useRef<THREE.Mesh>(null);
  const { actions } = useAnimations(animations, root);
  const R = 0.055;
  const info = useMemo(() => {
    const clip = animations.find((a) => a.name === "attack-kick-right");
    const dur = clip?.duration ?? 0.5;
    let best = { t: dur / 2, z: -Infinity, foot: new THREE.Vector3() };
    for (let k = 0; k <= 48; k++) {
      const t = (dur * k) / 48;
      const foot = measurePose(model, clip, t, () => boneAt(model, "leg-right", [0, -0.16, 0.03]));
      if (foot.z > best.z) best = { t, z: foot.z, foot };
    }
    return { dur, contact: best.t, foot: best.foot };
  }, [model, animations]);

  useEffect(() => {
    const kick = actions["attack-kick-right"];
    const idle = actions["idle"];
    if (!kick || !idle) return;
    kick.reset().play();
    kick.paused = true;
    idle.reset().play();
    return () => {
      kick.stop();
      idle.stop();
    };
  }, [actions]);

  useFrame(({ clock }, d) => {
    const kick = actions["attack-kick-right"];
    const idle = actions["idle"];
    const b = ball.current;
    if (!kick || !idle || !b) return;
    const SLOW = 0.7; // the clip is quick; play it a little slower so the strike reads
    const T = 3.4;
    const kickLen = info.dur / SLOW;
    const hit = info.contact / SLOW;
    const c = still ? hit : clock.elapsedTime % T;
    // body: wind up and strike, ease into idle, ease back into the wind-up before the next cycle
    const windup = T - 0.4;
    kick.time = c >= windup ? 0 : Math.min(c * SLOW, info.dur);
    const wk = c < kickLen + 0.1 ? 1 : c >= windup ? (c - windup) / 0.4 : Math.max(0, 1 - (c - kickLen - 0.1) / 0.3);
    kick.setEffectiveWeight(wk);
    idle.setEffectiveWeight(1 - wk);
    // ball: in his own frame, +z is where he faces, toward the goal
    const rest = new THREE.Vector3(info.foot.x, R, info.foot.z + R * 0.9);
    const dist = 1.3;
    const flight = 0.55, settle = 0.35;
    if (c < hit) b.position.copy(rest);
    else if (c < hit + flight) {
      const f = (c - hit) / flight;
      b.position.set(rest.x * (1 - f), R + Math.sin(f * Math.PI) * 0.3, rest.z + f * dist);
      if (!still) b.rotation.x += d * 14;
    } else if (c < hit + flight + settle) b.position.set(0, R, rest.z + dist);
    else {
      const f = Math.min(1, (c - hit - flight - settle) / (windup - 0.15 - hit - flight - settle));
      const e = 1 - Math.pow(1 - f, 3);
      b.position.set(0, R, rest.z + dist - e * dist);
      if (!still && f < 1) b.rotation.x -= d * 8;
    }
  });

  return (
    <group ref={root} position={p} rotation={[0, r, 0]}>
      <primitive object={model} />
      <mesh ref={ball} castShadow>
        <icosahedronGeometry args={[R, 1]} />
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
      <Person clip="interact-right" p={[0.75, 0, -0.95]} r={Math.PI + 0.5} still={still} />
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
          <Person clip="interact-right" p={[-0.3, 0, -0.78]} r={Math.PI} still={still} />
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
          <Person clip="walk" p={[0.2, 0, 0.3]} path="pace" still={still} />
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
          <Person clip="sit" seat={[0.75, 0.255, -0.85]} r={Math.atan2(1.3 - 0.75, -0.3 - -0.85)} still={still} />
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
          <Person clip="sprint" path="loop" still={still} />
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
    case "bench":
      return (
        <Ground c={c}>
          <mesh position={[0.2, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[0.55, ROOM]} />
            <meshStandardMaterial color={c.path} roughness={1} />
          </mesh>
          <ParkBench p={[-0.4, 0, -0.1]} r={Math.PI / 2} still={still} />
          <StreetLight p={[0.62, 0, -0.35]} r={Math.PI / 2} on={on} />
          <Model name="tree_oak" p={[-1.05, 0, -1.1]} s={1.3} />
          <Model name="tree_detailed" p={[1.1, 0, -1.15]} />
          <Model name="plant_bush" p={[-1.1, 0, 0.6]} s={1.4} />
          <Model name="plant_bushLarge" p={[1.05, 0, 0.9]} s={1.2} />
          <Fireflies still={still} />
          <Scatter seed={23} count={14} avoid={(x) => x > -0.15 && x < 0.55} />
        </Ground>
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
  useGLTF.preload(CHARACTER, false, false);
}
