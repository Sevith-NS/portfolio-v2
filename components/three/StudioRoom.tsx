"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { useInView3D } from "./useInView3D";
import { ideas } from "@/data/studio";

export type SceneId = "design" | "editing" | "trading" | "sports" | "cinema" | "cooking" | "panic" | "ideas";

type Palette = {
  floor: string; wall: string; wall2: string; wood: string; ink: string; lapis: string;
  oat: string; skin: string; hair: string; screen: string; red: string; green: string; plant: string;
  sage: string; butter: string; blush: string; mist: string;
};

const LIGHT: Palette = {
  floor: "#E7E6E1", wall: "#F6F5F2", wall2: "#ECEBE7", wood: "#B68F6A", ink: "#1A1A1A", lapis: "#002DB4",
  oat: "#FFFFFF", skin: "#B98260", hair: "#231A16", screen: "#0B1026", red: "#C2553F", green: "#3E8E6A", plant: "#5E7F5A",
  sage: "#CDD6C4", butter: "#E8DFBA", blush: "#EAD4C8", mist: "#CBD2EC",
};
const DARK: Palette = {
  ...LIGHT, floor: "#18214A", wall: "#121A3C", wall2: "#0E1533", wood: "#6B5037", oat: "#E9E9E6", lapis: "#3D63E8",
};

// ---------- voxel blocks ----------
// Texels per world unit. Every block gets per-texel noise and darker edges in the shader,
// so props of any size read as Minecraft-style blocks without image textures.
const PX = 16;
const geos = new Map<string, THREE.BoxGeometry>();
const mats = new Map<string, THREE.MeshStandardMaterial>();

function voxelGeometry(s: [number, number, number]) {
  const key = s.join(",");
  let g = geos.get(key);
  if (!g) {
    g = new THREE.BoxGeometry(...s);
    const n = g.attributes.position.count;
    g.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(Array.from({ length: n }, () => s).flat()), 3));
    geos.set(key, g);
  }
  return g;
}

function voxelMaterial(color: string, plank: boolean) {
  const key = `${color}|${plank}`;
  let m = mats.get(key);
  if (m) return m;
  m = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
  if (plank) m.defines = { PLANK: "" };
  m.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec3 aSize;\nvarying vec3 vLocal;\nvarying vec3 vHalf;\nvarying vec3 vFaceN;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLocal = position;\nvHalf = aSize * 0.5;\nvFaceN = normal;");
    s.fragmentShader = s.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vLocal;
varying vec3 vHalf;
varying vec3 vFaceN;
float vxHash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }`
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
{
  vec3 an = abs(vFaceN);
  vec3 q = vLocal + vHalf - vFaceN * 0.001;
  // the two axes lying in this face, measured from its corner
  vec2 uv = an.x > 0.5 ? q.zy : an.y > 0.5 ? q.xz : q.xy;
  vec2 hs = an.x > 0.5 ? vHalf.zy : an.y > 0.5 ? vHalf.xz : vHalf.xy;
  vec2 px = floor(uv * ${PX}.0);
  float shade = 0.88 + 0.12 * vxHash(vec3(px, dot(vFaceN, vec3(1.0, 2.0, 3.0))));
  #ifdef PLANK
    float row = floor(px.y / 3.0);
    shade *= 0.9 + 0.1 * vxHash(vec3(row, 7.0, 1.0));
    if (mod(px.y, 3.0) < 1.0) shade *= 0.82;
    if (mod(px.x + row * 5.0, 12.0) < 1.0) shade *= 0.85;
  #endif
  vec2 edge = hs - abs(uv - hs);
  float band = min(1.0 / ${PX}.0, 0.3 * min(hs.x, hs.y));
  if (min(edge.x, edge.y) < band) shade *= 0.8;
  diffuseColor.rgb *= shade;
}`
      );
  };
  m.customProgramCacheKey = () => (plank ? "voxel-plank" : "voxel");
  mats.set(key, m);
  return m;
}

const Box = ({ p, s, c, r = [0, 0, 0], plank = false }: { p: [number, number, number]; s: [number, number, number]; c: string; r?: [number, number, number]; plank?: boolean }) => (
  <mesh position={p} rotation={r} geometry={voxelGeometry(s)} material={voxelMaterial(c, plank)} castShadow receiveShadow />
);

// ---------- lighting ----------
type Sky = { window: string; sun: string; sunI: number; amb: number; beam: string; beamI: number; beamLen: number };

const SKIES: Record<"dawn" | "day" | "golden" | "dusk" | "night", Sky> = {
  dawn: { window: "#F2B8A0", sun: "#FFB38A", sunI: 0.9, amb: 0.55, beam: "#FFB38A", beamI: 0.35, beamLen: 1.8 },
  day: { window: "#8DB6F2", sun: "#FFFFFF", sunI: 1.5, amb: 0.75, beam: "#FFF4DA", beamI: 0.22, beamLen: 1.0 },
  golden: { window: "#F5C27A", sun: "#FFC77A", sunI: 1.2, amb: 0.6, beam: "#FFC77A", beamI: 0.4, beamLen: 1.7 },
  dusk: { window: "#6D5BA8", sun: "#C9A0FF", sunI: 0.6, amb: 0.45, beam: "#C9A0FF", beamI: 0.22, beamLen: 1.4 },
  night: { window: "#141B3F", sun: "#8FA8FF", sunI: 0.35, amb: 0.3, beam: "#8FA8FF", beamI: 0.14, beamLen: 1.2 },
};
const SKY_CYCLE = [SKIES.dawn, SKIES.day, SKIES.golden, SKIES.dusk, SKIES.night];

const LAMP: [number, number, number] = [-2.1, 1.42, -2.1];

// Eases every light toward its target; under reduced motion it snaps in one frame.
function Lights({ on, sky, still }: { on: boolean; sky: Sky; still: boolean }) {
  const amb = useRef<THREE.AmbientLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const lamp = useRef<THREE.PointLight>(null);
  const sunColor = useMemo(() => new THREE.Color(sky.sun), [sky]);
  const invalidate = useThree((s) => s.invalidate);

  useFrame((_, d) => {
    if (!amb.current || !hemi.current || !sun.current || !lamp.current) return;
    const k = still ? 1 : 1 - Math.exp(-5 * d);
    const fill = on ? 1 : 0.12;
    const targets: [THREE.Light, number][] = [
      [amb.current, sky.amb * fill],
      [hemi.current, 0.3 * fill],
      [sun.current, sky.sunI * (on ? 1 : 0.3)],
      [lamp.current, on ? 5 : 0],
    ];
    let moving = false;
    for (const [light, t] of targets) {
      light.intensity += (t - light.intensity) * k;
      if (Math.abs(t - light.intensity) > 0.002) moving = true;
    }
    sun.current.color.lerp(sunColor, k);
    if (moving) invalidate();
  });

  return (
    <>
      <ambientLight ref={amb} intensity={0.75} />
      <directionalLight
        ref={sun}
        position={[5, 9, 4]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0004}
      />
      <hemisphereLight ref={hemi} args={["#FFFFFF", "#002DB4", 0.3]} />
      <pointLight ref={lamp} position={LAMP} intensity={5} distance={9} color="#FFD9A0" castShadow shadow-mapSize={[512, 512]} shadow-camera-near={0.05} shadow-bias={-0.002} />
    </>
  );
}

function FloorLamp({ c, on }: { c: Palette; on: boolean }) {
  const [x, y, z] = LAMP;
  return (
    <group position={[x, 0, z]}>
      <Box p={[0, 0.03, 0]} s={[0.38, 0.06, 0.38]} c={c.ink} />
      <Box p={[0, 0.68, 0]} s={[0.06, 1.24, 0.06]} c={c.ink} />
      <mesh position={[0, y, 0]}>
        <boxGeometry args={[0.14, 0.12, 0.14]} />
        <meshBasicMaterial color={on ? "#FFE3A8" : "#4A4238"} toneMapped={false} />
      </mesh>
      <Box p={[0, y + 0.22, 0]} s={[0.46, 0.32, 0.46]} c={c.oat} />
    </group>
  );
}

// The window shows the sky; its colour eases when the sky changes.
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
    <group position={[-2.49, 1.9, 0.6]}>
      <Box p={[0, 0, 0]} s={[0.03, 1.2, 1.3]} c={c.oat} />
      <mesh position={[0.02, 0, 0]}>
        <boxGeometry args={[0.02, 1.04, 1.14]} />
        <meshBasicMaterial ref={pane} color={sky.window} toneMapped={false} />
      </mesh>
      <Box p={[0.035, 0, 0]} s={[0.02, 1.04, 0.05]} c={c.oat} />
      <Box p={[0.035, 0, 0]} s={[0.02, 0.05, 1.14]} c={c.oat} />
    </group>
  );
}

// Light from the window falling on the floor: a pixel-stepped, additive patch with the mullion cross.
const beamVert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const beamFrag = /* glsl */ `
uniform vec3 uColor;
uniform float uStrength;
varying vec2 vUv;
void main() {
  vec2 p = floor(vUv * 16.0) / 16.0;
  float bar = step(abs(p.y - 0.47), 0.04) + step(abs(p.x - 0.47), 0.04);
  float fade = 1.0 - p.x;
  gl_FragColor = vec4(uColor * uStrength * fade * (1.0 - clamp(bar, 0.0, 1.0)), 1.0);
}`;

function WindowLight({ sky, on }: { sky: Sky; on: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({ uColor: { value: new THREE.Color(sky.beam) }, uStrength: { value: sky.beamI } }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const target = useMemo(() => new THREE.Color(sky.beam), [sky]);
  const invalidate = useThree((s) => s.invalidate);
  useFrame((_, d) => {
    if (!mat.current || !mesh.current) return;
    const k = 1 - Math.exp(-3 * d);
    const strength = sky.beamI * (on ? 1 : 1.6);
    uniforms.uColor.value.lerp(target, k);
    uniforms.uStrength.value += (strength - uniforms.uStrength.value) * k;
    mesh.current.scale.x += (sky.beamLen - mesh.current.scale.x) * k;
    mesh.current.position.x = -2.5 + mesh.current.scale.x / 2;
    if (Math.abs(strength - uniforms.uStrength.value) > 0.002 || Math.abs(sky.beamLen - mesh.current.scale.x) > 0.002) invalidate();
  });
  return (
    <mesh ref={mesh} position={[-2.5 + sky.beamLen / 2, 0.02, 0.6]} rotation={[-Math.PI / 2, 0, 0]} scale={[sky.beamLen, 1, 1]}>
      <planeGeometry args={[1, 1.1]} />
      <shaderMaterial ref={mat} vertexShader={beamVert} fragmentShader={beamFrag} uniforms={uniforms} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

// ---------- props ----------
function Desk({ c, x = 0, z = -1.4, w = 2.4 }: { c: Palette; x?: number; z?: number; w?: number }) {
  return (
    <group position={[x, 0, z]}>
      <Box p={[0, 0.78, 0]} s={[w, 0.08, 1]} c={c.wood} plank />
      {[-1, 1].map((sx) => [-1, 1].map((sz) => <Box key={`${sx}${sz}`} p={[sx * (w / 2 - 0.08), 0.37, sz * 0.4]} s={[0.07, 0.74, 0.07]} c={c.ink} />))}
    </group>
  );
}

function Monitor({ c, x = 0, z = -1.7, rot = 0, children }: { c: Palette; x?: number; z?: number; rot?: number; children?: React.ReactNode }) {
  return (
    <group position={[x, 0.82, z]} rotation={[0, rot, 0]}>
      <Box p={[0, 0.05, 0]} s={[0.3, 0.04, 0.2]} c={c.ink} />
      <Box p={[0, 0.25, 0]} s={[0.05, 0.4, 0.05]} c={c.ink} />
      <Box p={[0, 0.62, 0]} s={[1.1, 0.66, 0.05]} c={c.ink} />
      <group position={[0, 0.62, 0.03]}>
        <mesh>
          <planeGeometry args={[1.02, 0.58]} />
          <meshBasicMaterial color={c.screen} toneMapped={false} />
        </mesh>
        <group position={[0, 0, 0.005]}>{children}</group>
      </group>
      {/* screen glow: faint with the room lit, the main light once it's off */}
      <pointLight position={[0, 0.62, 0.4]} intensity={0.8} distance={2.2} color="#8EA2FF" />
    </group>
  );
}

const Rect = ({ x, y, w, h, c }: { x: number; y: number; w: number; h: number; c: string }) => (
  <mesh position={[x, y, 0]}>
    <planeGeometry args={[w, h]} />
    <meshBasicMaterial color={c} toneMapped={false} />
  </mesh>
);

function Chair({ c, z = -0.6, rot = 0 }: { c: Palette; z?: number; rot?: number }) {
  return (
    <group position={[0, 0, z]} rotation={[0, rot, 0]}>
      <Box p={[0, 0.48, 0]} s={[0.6, 0.08, 0.6]} c={c.lapis} />
      <Box p={[0, 0.85, 0.28]} s={[0.6, 0.7, 0.07]} c={c.lapis} />
      <Box p={[0, 0.24, 0]} s={[0.07, 0.48, 0.07]} c={c.ink} />
    </group>
  );
}

function Plant({ c, p }: { c: Palette; p: [number, number, number] }) {
  const leaves: [number, number, number][] = [[0, 0.6, 0], [0.14, 0.72, 0.08], [-0.12, 0.78, -0.1], [0.02, 0.92, 0.04], [-0.1, 0.66, 0.14]];
  return (
    <group position={p}>
      <Box p={[0, 0.2, 0]} s={[0.34, 0.4, 0.34]} c={c.oat} />
      {leaves.map((l, i) => (
        <Box key={i} p={l} s={[0.22, 0.22, 0.22]} c={c.plant} />
      ))}
    </group>
  );
}

// Text drawn to a small canvas and scaled with nearest filtering, so it reads as pixel type.
// No font worker, so it runs under a strict CSP.
function Label({ text, size, color, position = [0, 0, 0], maxWidth }: { text: string; size: number; color: string; position?: [number, number, number]; maxWidth?: number }) {
  const tex = useMemo(() => {
    const lines = text.split("\n");
    const px = 16;
    const lh = px * 1.25;
    const font = `700 ${px}px ui-monospace, "Courier New", monospace`;
    const c = document.createElement("canvas");
    const g = c.getContext("2d")!;
    g.font = font;
    const w = Math.ceil(Math.max(...lines.map((l) => g.measureText(l).width))) + 6;
    c.width = w;
    c.height = Math.ceil(lh * lines.length) + 2;
    g.font = font;
    g.fillStyle = color;
    g.textAlign = "center";
    g.textBaseline = "middle";
    lines.forEach((l, i) => g.fillText(l, w / 2, 1 + lh * (i + 0.5)));
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    return { t, aspect: w / c.height, lines: lines.length };
  }, [text, color]);
  useEffect(() => () => tex.t.dispose(), [tex]);
  let h = size * 1.3 * tex.lines;
  let w = h * tex.aspect;
  if (maxWidth && w > maxWidth) {
    h *= maxWidth / w;
    w = maxWidth;
  }
  return (
    <mesh position={position}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={tex.t} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

// ---------- the person ----------
type Pose = "sit" | "stand" | "kick" | "stir" | "pace" | "write";

function Person({ c, pose, p = [0, 0, -0.6], rot = Math.PI }: { c: Palette; pose: Pose; p?: [number, number, number]; rot?: number }) {
  const root = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const sit = pose === "sit";

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!root.current || !armL.current || !armR.current || !legR.current || !head.current) return;
    if (sit) {
      // typing
      armL.current.rotation.x = -1.2 + Math.sin(t * 9) * 0.06;
      armR.current.rotation.x = -1.2 + Math.cos(t * 8) * 0.06;
      head.current.rotation.x = 0.1 + Math.sin(t * 0.8) * 0.04;
    } else if (pose === "kick") {
      legR.current.rotation.x = Math.sin(t * 3) * 0.9;
      armL.current.rotation.x = -Math.sin(t * 3) * 0.5;
      armR.current.rotation.x = Math.sin(t * 3) * 0.5;
    } else if (pose === "stir") {
      armR.current.rotation.x = -1.1;
      armR.current.rotation.z = Math.sin(t * 4) * 0.3;
      head.current.rotation.x = 0.35;
    } else if (pose === "pace") {
      root.current.position.x = p[0] + Math.sin(t * 0.9) * 0.9;
      root.current.rotation.y = rot + (Math.cos(t * 0.9) > 0 ? -Math.PI / 2 : Math.PI / 2);
      legR.current.rotation.x = Math.sin(t * 6) * 0.5;
      armL.current.rotation.x = -2.6 + Math.sin(t * 5) * 0.2; // hands on head
      armR.current.rotation.x = -2.6 + Math.cos(t * 5) * 0.2;
      head.current.rotation.z = Math.sin(t * 7) * 0.12;
    } else if (pose === "write") {
      // marker on the whiteboard, stepping back now and then to look
      const look = Math.sin(t * 0.5) > 0.6;
      armR.current.rotation.x = look ? -0.4 : -2.1 + Math.sin(t * 7) * 0.08;
      armR.current.rotation.z = look ? 0 : Math.sin(t * 3.5) * 0.15;
      armL.current.rotation.x = look ? -0.9 : 0;
      head.current.rotation.x = look ? -0.1 : -0.2;
    } else {
      head.current.rotation.y = Math.sin(t * 0.6) * 0.3;
      armR.current.rotation.x = Math.sin(t * 1.2) * 0.1;
    }
  });

  const hip = sit ? 0.52 : 0.82;
  return (
    <group ref={root} position={p} rotation={[0, rot, 0]}>
      {/* legs */}
      <group position={[-0.12, hip, 0]} rotation={[sit ? -Math.PI / 2 : 0, 0, 0]}>
        <Box p={[0, -0.38, 0]} s={[0.17, 0.76, 0.2]} c={c.ink} />
      </group>
      <group ref={legR} position={[0.12, hip, 0]} rotation={[sit ? -Math.PI / 2 : 0, 0, 0]}>
        <Box p={[0, -0.38, 0]} s={[0.17, 0.76, 0.2]} c={c.ink} />
      </group>
      {/* torso: lapis sweater */}
      <Box p={[0, hip + 0.36, 0]} s={[0.5, 0.72, 0.3]} c={c.lapis} />
      {/* arms */}
      <group ref={armL} position={[-0.32, hip + 0.66, 0]}>
        <Box p={[0, -0.3, 0]} s={[0.13, 0.6, 0.14]} c={c.lapis} />
        <Box p={[0, -0.64, 0]} s={[0.12, 0.1, 0.12]} c={c.skin} />
      </group>
      <group ref={armR} position={[0.32, hip + 0.66, 0]}>
        <Box p={[0, -0.3, 0]} s={[0.13, 0.6, 0.14]} c={c.lapis} />
        <Box p={[0, -0.64, 0]} s={[0.12, 0.1, 0.12]} c={c.skin} />
      </group>
      {/* block head: hair over the top and back, two pixel eyes on the face (+z) */}
      <group ref={head} position={[0, hip + 0.98, 0]}>
        <Box p={[0, 0, 0]} s={[0.42, 0.42, 0.42]} c={c.skin} />
        <Box p={[0, 0.18, -0.02]} s={[0.46, 0.1, 0.46]} c={c.hair} />
        <Box p={[0, 0.02, -0.21]} s={[0.46, 0.34, 0.06]} c={c.hair} />
        {[-1, 1].map((sx) => (
          <Box key={sx} p={[sx * 0.09, 0.02, 0.215]} s={[0.06, 0.06, 0.01]} c={c.ink} />
        ))}
      </group>
    </group>
  );
}

// ---------- scenes ----------
function Candles({ c }: { c: Palette }) {
  const bars = [0.2, 0.28, 0.18, 0.3, 0.36, 0.26, 0.4, 0.34];
  return (
    <>
      {bars.map((h, i) => (
        <Rect key={i} x={-0.4 + i * 0.11} y={-0.15 + h / 2 + (i % 3) * 0.03} w={0.05} h={h} c={i % 3 === 2 ? c.red : c.green} />
      ))}
    </>
  );
}

function Timeline({ c }: { c: Palette }) {
  return (
    <>
      <Rect x={0} y={0.12} w={0.9} h={0.22} c={c.lapis} />
      {[0, 1, 2].map((r) => (
        <Rect key={r} x={-0.1 + r * 0.12} y={-0.12 - r * 0.07} w={0.5 - r * 0.1} h={0.05} c={[c.oat, c.green, c.red][r]} />
      ))}
      <Rect x={0.05} y={-0.15} w={0.01} h={0.26} c={c.oat} />
    </>
  );
}

function UIMock({ c }: { c: Palette }) {
  return (
    <>
      <Rect x={-0.34} y={0} w={0.22} h={0.5} c={c.lapis} />
      <Rect x={0.12} y={0.16} w={0.6} h={0.1} c={c.oat} />
      <Rect x={0.0} y={-0.05} w={0.36} h={0.22} c={c.oat} />
      <Rect x={0.3} y={-0.05} w={0.16} h={0.22} c={c.green} />
    </>
  );
}

function Ball({ c }: { c: Palette }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * 3;
    ref.current.position.y = 0.16 + Math.abs(Math.sin(t)) * 0.9;
    ref.current.position.z = 0.1 + Math.sin(t * 0.5) * 0.3;
    ref.current.rotation.x = t;
  });
  return (
    <group ref={ref} position={[0.6, 0.16, 0.1]}>
      <Box p={[0, 0, 0]} s={[0.28, 0.28, 0.28]} c={c.oat} />
    </group>
  );
}

function Steam({ c }: { c: Palette }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    g.current?.children.forEach((m, i) => {
      const t = (clock.elapsedTime * 0.6 + i * 0.33) % 1;
      m.position.y = 1.15 + t * 0.9;
      (m as THREE.Mesh).scale.setScalar(0.6 + t);
      ((m as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 1 - t;
    });
  });
  return (
    <group ref={g} position={[0.55, 0, -1.3]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[(i - 1) * 0.06, 0, 0]}>
          <boxGeometry args={[0.14, 0.14, 0.14]} />
          <meshStandardMaterial color={c.oat} transparent />
        </mesh>
      ))}
    </group>
  );
}

function Thoughts({ c }: { c: Palette }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (g.current) g.current.position.y = 2.35 + Math.sin(clock.elapsedTime * 1.4) * 0.06;
  });
  return (
    <group ref={g} position={[0, 2.35, 0.2]}>
      <Label text="2027 ?!" size={0.34} color={c.lapis} />
    </group>
  );
}

// Small seeded PRNG, so everyone on the site sees the same room in the same minute.
function rng(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The brainstorming room quietly rearranges itself every minute: new ideas on the board, props moved.
function IdeasRoom({ c, minute }: { c: Palette; minute: number }) {
  const v = useMemo(() => {
    const r = rng(minute * 9973 + 17);
    const pool = [...ideas];
    const notes = [0, 1, 2].map(() => ({
      text: pool.splice(Math.floor(r() * pool.length), 1)[0],
      color: [c.sage, c.butter, c.blush, c.mist][Math.floor(r() * 4)],
      tilt: (r() - 0.5) * 0.14,
      dy: (r() - 0.5) * 0.16,
    }));
    const chairs: { p: [number, number, number]; rot: number }[] = [
      { p: [-0.6, 0, 0.6], rot: 0.5 },
      { p: [0.7, 0, 1.1], rot: -0.7 },
      { p: [-1.4, 0, -0.3], rot: 1.3 },
    ];
    return {
      notes,
      chair: chairs[Math.floor(r() * chairs.length)],
      mug: r() > 0.35,
      books: r() > 0.5,
      sketches: 1 + Math.floor(r() * 3),
      papers: Array.from({ length: Math.floor(r() * 5) }, () => [-1.2 + r() * 2.6, -0.4 + r() * 1.9, r() * 3] as const),
    };
  }, [minute, c]);

  return (
    <>
      {/* whiteboard */}
      <group position={[-0.4, 1.8, -2.47]}>
        <Box p={[0, 0, 0]} s={[3.3, 1.6, 0.04]} c={c.ink} />
        <Box p={[0, 0, 0.025]} s={[3.2, 1.5, 0.02]} c={c.oat} />
        <Label text="IDEAS" size={0.1} color={c.lapis} position={[-1.3, 0.6, 0.04]} />
        {v.notes.map((n, i) => (
          <group key={i} position={[-1.05 + i * 1.05, 0.08 + n.dy, 0.04]} rotation={[0, 0, n.tilt]}>
            <Box p={[0, 0, 0]} s={[0.94, 0.7, 0.01]} c={n.color} />
            <Label text={n.text} size={0.12} color={c.ink} position={[0, 0, 0.01]} maxWidth={0.84} />
          </group>
        ))}
        {/* marker arrows between the notes */}
        <Box p={[-0.52, -0.5, 0.04]} s={[0.5, 0.03, 0.01]} c={c.lapis} />
        <Box p={[0.53, -0.5, 0.04]} s={[0.5, 0.03, 0.01]} c={c.lapis} />
        <Box p={[0.8, -0.5, 0.04]} s={[0.06, 0.12, 0.01]} c={c.lapis} />
        {/* marker tray */}
        <Box p={[0, -0.8, 0.06]} s={[1.2, 0.05, 0.1]} c={c.ink} />
      </group>

      <Person c={c} pose="write" p={[1.7, 0, -1.45]} rot={Math.PI + 0.7} />

      {/* sketches pinned on the side wall */}
      {Array.from({ length: v.sketches }, (_, i) => (
        <group key={i} position={[-2.48, 1.95 + (i % 2) * 0.12, -1.8 + i * 0.55]} rotation={[0, Math.PI / 2, 0]}>
          <Box p={[0, 0, 0]} s={[0.42, 0.52, 0.02]} c={c.oat} />
          <Box p={[0, 0.06, 0.015]} s={[0.26, 0.04, 0.01]} c={c.lapis} />
          <Box p={[-0.04, -0.06, 0.015]} s={[0.18, 0.04, 0.01]} c={c.ink} />
        </group>
      ))}

      <group position={v.chair.p} rotation={[0, v.chair.rot, 0]}>
        <Chair c={c} z={0} />
      </group>

      {/* side table */}
      <group position={[1.8, 0, 1.0]}>
        <Box p={[0, 0.3, 0]} s={[0.6, 0.6, 0.6]} c={c.wood} plank />
        {v.mug && <Box p={[0.12, 0.69, 0.1]} s={[0.14, 0.18, 0.14]} c={c.oat} />}
        {v.books &&
          [c.lapis, c.red, c.green].map((col, i) => (
            <Box key={i} p={[-0.1, 0.64 + i * 0.08, -0.08]} s={[0.34, 0.08, 0.24]} c={col} r={[0, i * 0.2, 0]} />
          ))}
      </group>

      {v.papers.map(([x, z, ry], i) => (
        <Box key={i} p={[x, 0.07, z]} s={[0.14, 0.14, 0.14]} c={c.oat} r={[ry, ry * 2, 0]} />
      ))}
    </>
  );
}

function SceneContent({ id, c, minute }: { id: SceneId; c: Palette; minute: number }) {
  switch (id) {
    case "design":
      return (
        <>
          <Desk c={c} />
          <Monitor c={c}><UIMock c={c} /></Monitor>
          <Chair c={c} />
          <Person c={c} pose="sit" />
          {/* type specimens pinned on the wall */}
          {["Aa", "Rg", "&"].map((g, i) => (
            <group key={g} position={[-1.6 + i * 0.75, 2.15, -2.44]}>
              <Box p={[0, 0, 0]} s={[0.6, 0.78, 0.02]} c={i === 1 ? c.lapis : c.oat} />
              <Label text={g} size={0.34} color={i === 1 ? c.oat : c.ink} position={[0, 0, 0.02]} />
            </group>
          ))}
          <Plant c={c} p={[1.9, 0, -1.9]} />
        </>
      );
    case "editing":
      return (
        <>
          <Desk c={c} w={2.8} />
          <Monitor c={c} x={-0.62} rot={0.18}><Timeline c={c} /></Monitor>
          <Monitor c={c} x={0.62} rot={-0.18}><Rect x={0} y={0} w={0.96} h={0.52} c={c.lapis} /></Monitor>
          <Chair c={c} />
          <Person c={c} pose="sit" />
          {/* clapperboard */}
          <group position={[1.9, 0.86, -1.3]} rotation={[0, -0.5, 0]}>
            <Box p={[0, 0, 0]} s={[0.5, 0.36, 0.04]} c={c.ink} />
            <Box p={[0, 0.22, 0]} s={[0.5, 0.08, 0.04]} c={c.oat} r={[0, 0, 0.18]} />
          </group>
        </>
      );
    case "trading":
      return (
        <>
          <Desk c={c} />
          <Monitor c={c}><Candles c={c} /></Monitor>
          <Chair c={c} />
          <Person c={c} pose="sit" />
          {/* coffee and a late-night lamp */}
          <Box p={[0.85, 0.9, -1.2]} s={[0.14, 0.18, 0.14]} c={c.oat} />
          <group position={[-0.95, 0.82, -1.6]}>
            <Box p={[0, 0.3, 0]} s={[0.04, 0.6, 0.04]} c={c.ink} />
            <Box p={[0, 0.64, 0.05]} s={[0.3, 0.18, 0.3]} c={c.lapis} />
            <pointLight position={[0, 0.5, 0.1]} intensity={2.2} distance={3} color="#FFD9A0" />
          </group>
        </>
      );
    case "sports":
      return (
        <>
          <Person c={c} pose="kick" p={[0, 0, 0]} rot={Math.PI * 0.85} />
          <Ball c={c} />
          {/* mini goal */}
          <group position={[0, 0, -2]}>
            <Box p={[-1.1, 0.6, 0]} s={[0.07, 1.2, 0.07]} c={c.oat} />
            <Box p={[1.1, 0.6, 0]} s={[0.07, 1.2, 0.07]} c={c.oat} />
            <Box p={[0, 1.2, 0]} s={[2.27, 0.07, 0.07]} c={c.oat} />
          </group>
        </>
      );
    case "cinema":
      return (
        <>
          {/* couch */}
          <group position={[0, 0, 0.9]}>
            <Box p={[0, 0.3, 0]} s={[2.2, 0.36, 0.9]} c={c.lapis} />
            <Box p={[0, 0.7, 0.36]} s={[2.2, 0.6, 0.2]} c={c.lapis} />
          </group>
          <Person c={c} pose="sit" p={[0.2, 0, 0.75]} rot={Math.PI} />
          {/* screen on the wall */}
          <Box p={[0, 1.7, -2.44]} s={[3, 1.6, 0.03]} c={c.oat} />
          <mesh position={[0, 1.7, -2.42]}>
            <planeGeometry args={[2.8, 1.4]} />
            <meshBasicMaterial color={c.screen} toneMapped={false} />
          </mesh>
          <Label text="Now showing" size={0.2} color={c.oat} position={[0, 1.7, -2.4]} />
          {/* projector beam */}
          <mesh position={[0, 2.1, -0.6]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[1.6, 0.9, 3.4]} />
            <meshBasicMaterial color="#FFF4DA" transparent opacity={0.07} depthWrite={false} />
          </mesh>
        </>
      );
    case "cooking":
      return (
        <>
          {/* counter and stove */}
          <Box p={[0, 0.5, -1.5]} s={[3, 1, 0.9]} c={c.oat} />
          <Box p={[0, 1.02, -1.5]} s={[3, 0.05, 0.92]} c={c.wood} plank />
          <Box p={[0.55, 1.15, -1.3]} s={[0.5, 0.22, 0.5]} c={c.ink} />
          <Steam c={c} />
          <Person c={c} pose="stir" p={[0.2, 0, -0.5]} rot={Math.PI} />
          <Plant c={c} p={[-1.8, 0, 1.4]} />
        </>
      );
    case "panic":
      return (
        <>
          <Desk c={c} x={-0.8} z={-1.6} w={1.8} />
          <Monitor c={c} x={-0.8} z={-1.9}>
            <Rect x={0} y={0} w={0.96} h={0.52} c={c.red} />
          </Monitor>
          <Person c={c} pose="pace" p={[0.3, 0, 0.4]} rot={Math.PI} />
          <Thoughts c={c} />
          {/* crumpled paper */}
          {[[0.9, 1.1], [1.4, 0.2], [-0.2, 1.4], [1.7, 1.2]].map(([x, z], i) => (
            <Box key={i} p={[x, 0.07, z]} s={[0.14, 0.14, 0.14]} c={c.oat} r={[i, i * 0.7, 0]} />
          ))}
        </>
      );
    case "ideas":
      return <IdeasRoom c={c} minute={minute} />;
  }
}

// Fit the whole room to the canvas, whatever its size (the room is ~7.5 units across in iso).
function FitZoom() {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.zoom = Math.min(size.width / 7.6, size.height / 6.4);
    camera.lookAt(0, 0.9, 0);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

function Room({ id, c, sky, on, minute }: { id: SceneId; c: Palette; sky: Sky; on: boolean; minute: number }) {
  const g = useRef<THREE.Group>(null);
  // Each new scene settles in from slightly below: a small, weighted entrance.
  useEffect(() => {
    if (g.current) {
      g.current.position.y = -0.6;
      g.current.scale.setScalar(0.94);
    }
  }, [id]);
  useFrame((_, d) => {
    if (!g.current) return;
    g.current.position.y = THREE.MathUtils.damp(g.current.position.y, 0, 5, d);
    const s = THREE.MathUtils.damp(g.current.scale.x, 1, 5, d);
    g.current.scale.setScalar(s);
  });
  return (
    <group ref={g}>
      {/* the room shell: plank floor and two block walls */}
      <Box p={[0, -0.1, 0]} s={[5, 0.2, 5]} c={c.floor} plank />
      <Box p={[0, 1.6, -2.55]} s={[5, 3.2, 0.1]} c={c.wall} />
      <Box p={[-2.55, 1.6, 0]} s={[0.1, 3.2, 5]} c={c.wall2} />
      <Window c={c} sky={sky} />
      <WindowLight sky={sky} on={on} />
      <FloorLamp c={c} on={on} />
      {/* rug */}
      <Box p={[0.3, 0.005, 0.2]} s={[2.6, 0.01, 2]} c={c.oat} />
      <SceneContent id={id} c={c} minute={minute} />
    </group>
  );
}

// Current minute on the wall clock; checked every few seconds.
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
  const camera = useMemo(() => ({ position: [9, 8, 9] as [number, number, number], zoom: 78, near: 0.1, far: 100 }), []);
  const minute = useMinute();
  // Only the brainstorming room follows the minute clock through the day.
  const sky = id === "ideas" ? SKY_CYCLE[minute % SKY_CYCLE.length] : SKIES.day;

  return (
    <div ref={wrap} className="h-full w-full" role="img" aria-label={`A voxel room showing Sevith in the current scene, with the lights ${lightsOn ? "on" : "off"}`}>
      <Canvas orthographic flat shadows dpr={[1, 1.75]} frameloop={!inView ? "never" : still ? "demand" : "always"} camera={camera} onCreated={({ camera }) => camera.lookAt(0, 0.9, 0)}>
        <Lights on={lightsOn} sky={sky} still={still} />
        <FitZoom />
        <Room id={id} c={c} sky={sky} on={lightsOn} minute={minute} />
        <ContactShadows position={[0, -0.21, 0]} opacity={0.25} scale={12} blur={2.4} far={3} />
      </Canvas>
    </div>
  );
}
