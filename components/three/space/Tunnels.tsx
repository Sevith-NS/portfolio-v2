"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { BEATS, ramp, span } from "../beats";
import { GREEN, MIRRORS, PINK, TEAL, latticeMix, seeded, twistable } from "./kit";

// The two tunnels of the flight, as in Lusion's (astro.mp4).
// Lattice: a full, regular scaffold of dim grey bars round a hollow core in the dark, glints of
// glass clustered in an X toward its four corners, white, then pink and teal, then green; in
// its last stretch diagonal braces grow in and it twists into triangles.
// Cages: a hard cut to a tube of pink and steel triangles round a hot glow far ahead, rolling,
// brighter and brighter until it blows out to white.

const CELL = 1.6;
const NODES = 5; // nodes out from the axis on each side
const CORE = 2; // nodes inside this are the hollow the astronaut falls down
const Z0 = 10;

// Glass shards: tiny quads that glint at their own pace and grow in at their own moment.
// `uMix` walks the palette: 0 white, 1 pink and teal, 2 green. Twisted like the beams.
const SHARD_VERT = /* glsl */ `
attribute float aHue;
attribute float aSeed;
attribute float aBirth;
uniform float uTwist;
uniform float uDepth;
uniform float uGrow;
varying float vHue;
varying float vSeed;
varying float vFar;
void main() {
  vec4 p = modelMatrix * instanceMatrix * vec4(position * smoothstep(aBirth, aBirth + 0.05, uGrow), 1.0);
  float turn = uTwist * max(0.0, uDepth - p.z);
  p.xy = mat2(cos(turn), sin(turn), -sin(turn), cos(turn)) * p.xy;
  vec4 mv = viewMatrix * p;
  vFar = smoothstep(14.0, 70.0, -mv.z);
  vHue = aHue;
  vSeed = aSeed;
  gl_Position = projectionMatrix * mv;
}`;
const SHARD_FRAG = /* glsl */ `
uniform float uTime;
uniform float uOn;
uniform float uMix;
varying float vHue;
varying float vSeed;
varying float vFar;
vec3 palette(float h, float m) {
  vec3 white = mix(vec3(0.8, 0.88, 1.0), vec3(1.0), h);
  vec3 pt = h < 0.5 ? vec3(1.0, 0.24, 0.66) : vec3(0.24, 0.92, 1.0);
  vec3 gr = h < 0.4 ? vec3(0.24, 1.0, 0.56) : h < 0.75 ? vec3(0.72, 1.0, 0.32) : vec3(0.24, 0.92, 1.0);
  return m < 1.0 ? mix(white, pt, m) : mix(pt, gr, m - 1.0);
}
void main() {
  float glint = pow(0.5 + 0.5 * sin(uTime * (1.2 + vSeed * 3.0) + vSeed * 40.0), 12.0);
  float a = uOn * (1.0 - vFar);
  gl_FragColor = vec4(palette(vHue, uMix) * (0.45 + 1.1 * glint) * a, a);
}`;

type Uniforms = { uTime: { value: number }; uOn: { value: number }; uMix: { value: number }; uTwist: { value: number }; uDepth: { value: number }; uGrow: { value: number } };
const uniformsFor = (mix = 0): Uniforms => ({ uTime: { value: 0 }, uOn: { value: 0 }, uMix: { value: mix }, uTwist: { value: 0 }, uDepth: { value: 6 }, uGrow: { value: 1 } });
type Placed = { m: THREE.Matrix4; hue: number; seed: number; birth: number };

function Shards({ placed, uniforms }: { placed: Placed[]; uniforms: Uniforms }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1);
    g.setAttribute("aHue", new THREE.InstancedBufferAttribute(new Float32Array(placed.map((s) => s.hue)), 1));
    g.setAttribute("aSeed", new THREE.InstancedBufferAttribute(new Float32Array(placed.map((s) => s.seed)), 1));
    g.setAttribute("aBirth", new THREE.InstancedBufferAttribute(new Float32Array(placed.map((s) => s.birth)), 1));
    return g;
  }, [placed]);
  const mat = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: SHARD_VERT, fragmentShader: SHARD_FRAG, uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }),
    [uniforms],
  );
  useEffect(() => {
    placed.forEach((s, i) => mesh.current!.setMatrixAt(i, s.m));
    mesh.current!.instanceMatrix.needsUpdate = true;
    mesh.current!.computeBoundingSphere();
    return () => {
      geo.dispose();
      mat.dispose();
    };
  }, [placed, geo, mat]);
  return <instancedMesh ref={mesh} args={[geo, mat, placed.length]} frustumCulled={false} />;
}

// A cluster of shards round a point, mirrored four ways.
function cluster(rnd: () => number, cx: number, cy: number, cz: number, n: number, spread: number, birth: number, out: Placed[], scale = 1) {
  const e = new THREE.Euler(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const r = Math.pow(rnd(), 1.6) * spread;
    const a = rnd() * Math.PI * 2, b = rnd() * Math.PI;
    const dx = r * Math.cos(a) * Math.sin(b), dy = r * Math.sin(a) * Math.sin(b), dz = r * Math.cos(b) * 1.6;
    const size = (0.03 + Math.pow(rnd(), 3) * 0.16) * scale;
    q.setFromEuler(e.set(rnd() * 6.3, rnd() * 6.3, rnd() * 6.3));
    if (rnd() < 0.5) s.set(size * (1.6 + rnd() * 2), size * 0.35, 1);
    else s.set(size * 0.35, size * (1.6 + rnd() * 2), 1); // short bars of light, like glitches
    const hue = rnd(), seed = rnd();
    for (const [mx, my] of MIRRORS) out.push({ m: new THREE.Matrix4().compose(p.set((cx + dx) * mx, (cy + dy) * my, cz + dz), q, s), hue, seed, birth });
  }
}

// The lattice, built once: every beam and cluster knows the moment it grows in (0 to 1). A
// sparse plain grid first, then more runs and cross pieces, then diagonal braces and more glass.
function buildLattice(slices: number, phone: boolean) {
  const rnd = seeded(23);
  const beams: { m: THREE.Matrix4; birth: number }[] = [];
  const seen = new Set<string>();
  const q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), zAxis = new THREE.Vector3(0, 0, 1), d = new THREE.Vector3();
  // Each beam is placed in one quadrant and mirrored; a beam on an axis is placed once.
  const add = (x: number, y: number, z: number, sx: number, sy: number, sz: number, birth: number, turn?: THREE.Quaternion) => {
    for (const [mx, my] of MIRRORS) {
      const key = `${(x * mx).toFixed(2)},${(y * my).toFixed(2)},${z.toFixed(2)},${sx},${sy},${sz.toFixed(2)},${turn ? mx * my : 0}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const qq = turn ? q.copy(turn).set(turn.x * my, turn.y * mx, turn.z * mx * my, turn.w) : q.identity();
      beams.push({ m: new THREE.Matrix4().compose(p.set(x * mx, y * my, z), qq, s.set(sx, sy, sz)), birth });
    }
  };
  const T = 0.12; // beam thickness
  const outside = (i: number, j: number) => Math.max(i, j) > CORE;
  // Long beams down the tunnel, in broken runs. Every other node is the plain grid you start with.
  for (let i = 0; i <= NODES; i++)
    for (let j = 0; j <= NODES; j++) {
      if (!outside(i, j) || rnd() < 0.35) continue; // not every node: bars with gaps between, not graph paper
      const plain = true; // every node: a full regular scaffold from the start
      let k = Math.floor(rnd() * 6);
      while (k < slices) {
        const len = 3 + Math.floor(rnd() * 9);
        const end = Math.min(slices, k + len);
        // Some thin rods, some flat slabs.
        add(i * CELL, j * CELL, Z0 - ((k + end) / 2) * CELL, T * (0.6 + rnd() * 0.9), T * (0.6 + rnd() * 0.9), (end - k) * CELL, plain && rnd() < 0.8 ? rnd() * 0.05 : 0.85 + rnd() * 0.14);
        k = end + 1 + Math.floor(rnd() * 2);
      }
    }
  // Cross beams at every slice, one cell long, across and up: the grid fills out.
  for (let k = 0; k < slices; k++) {
    const z = Z0 - k * CELL;
    for (let j = 0; j <= NODES; j++)
      for (let i = 0; i < NODES; i++) {
        // Square frames every other slice (the regular scaffold), a few more pieces late on.
        const frame = k % 3 === 0;
        if (outside(i, j) && outside(i + 1, j) && (frame || rnd() < 0.08)) add((i + 0.5) * CELL, j * CELL, z, CELL, T, T, frame ? rnd() * 0.05 : 0.85 + rnd() * 0.14);
        if (outside(j, i) && outside(j, i + 1) && (frame || rnd() < 0.08)) add(j * CELL, (i + 0.5) * CELL, z, T, CELL, T, frame ? rnd() * 0.05 : 0.85 + rnd() * 0.14);
      }
  }
  // Diagonal braces, last of all: across a cell face and down to the next slice.
  for (let k = 0; k < slices - 1; k++)
    for (let n = 0; n < 3; n++) {
      if (rnd() > 0.55) continue;
      const i = CORE + 1 + Math.floor(rnd() * (NODES - CORE)), j = Math.floor(rnd() * NODES);
      const [a, b] = rnd() < 0.5 ? [new THREE.Vector3(i * CELL, j * CELL, Z0 - k * CELL), new THREE.Vector3(i * CELL, (j + 1) * CELL, Z0 - (k + 1) * CELL)] : [new THREE.Vector3(j * CELL, i * CELL, Z0 - k * CELL), new THREE.Vector3((j + 1) * CELL, i * CELL, Z0 - (k + 1) * CELL)];
      d.subVectors(b, a);
      const mid = a.clone().add(b).multiplyScalar(0.5);
      add(mid.x, mid.y, mid.z, T * 0.8, T * 0.8, d.length(), 0.86 + rnd() * 0.13, new THREE.Quaternion().setFromUnitVectors(zAxis, d.clone().normalize()));
    }
  // Chips: short stubs off the nodes, along any axis, so the walls read busy like Lusion's.
  for (let n = 0; n < (phone ? 260 : 480); n++) {
    const i = Math.floor(rnd() * (NODES + 1)), j = Math.floor(rnd() * (NODES + 1)), k = Math.floor(rnd() * slices);
    if (!outside(i, j)) continue;
    const len = (0.25 + rnd() * 0.65) * CELL, w = T * (0.8 + rnd() * 0.8), axis = Math.floor(rnd() * 3);
    const [x, y, z] = [i * CELL + (axis === 0 ? len / 2 : 0), j * CELL + (axis === 1 ? len / 2 : 0), Z0 - k * CELL - (axis === 2 ? len / 2 : 0)];
    add(x, y, z, axis === 0 ? len : w, axis === 1 ? len : w, axis === 2 ? len : w, rnd() * 0.05);
  }
  // Clusters of glass shards near the hollow, where the light catches them: a few at first, many by the end.
  const shards: Placed[] = [];
  const per = phone ? 30 : 52;
  for (let z = Z0 - 4; z > Z0 - slices * CELL; z -= 1 + rnd()) {
    // Toward the corners of the hollow, so the glints read as an X.
    const d = CORE + 0.6 + rnd(), e = (rnd() - 0.5) * 0.5;
    cluster(rnd, (d + e) * CELL, (d - e) * CELL, z, per, 0.9 + rnd() * 1.2, rnd() < 0.75 ? rnd() * 0.1 : 0.8 + rnd() * 0.18, shards, 2.2);
  }
  return { beams, shards };
}

function placeLattice(g: THREE.Object3D, u: number) {
  g.position.z = u * u * 30 + u * 75; // flying forward, a little faster as it goes
  g.rotation.z = ramp([0.75, 1], u) * 0.35;
}

// The lattice's beams and glass, driven by the given uniforms.
function LatticeBody({ built, uniforms }: { built: ReturnType<typeof buildLattice>; uniforms: Uniforms }) {
  const beamMat = useMemo(
    () => twistable(new THREE.MeshStandardMaterial({ color: "#6A7180", metalness: 0.4, roughness: 0.5, envMapIntensity: 0.3 }), { twist: uniforms.uTwist, depth: uniforms.uDepth, grow: uniforms.uGrow }),
    [uniforms],
  );
  const beamGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1);
    g.setAttribute("aBirth", new THREE.InstancedBufferAttribute(new Float32Array(built.beams.map((b) => b.birth)), 1));
    return g;
  }, [built]);
  const mesh = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    built.beams.forEach((b, i) => mesh.current!.setMatrixAt(i, b.m));
    mesh.current!.instanceMatrix.needsUpdate = true;
    return () => {
      beamGeo.dispose();
      beamMat.dispose();
    };
  }, [built, beamGeo, beamMat]);
  return (
    <>
      <instancedMesh ref={mesh} args={[beamGeo, beamMat, built.beams.length]} frustumCulled={false} />
      <Shards placed={built.shards} uniforms={uniforms} />
    </>
  );
}

// Lights that ride with him down the lattice, in its colours.
const WHITE = new THREE.Color("#DDE6FF");
function lightLattice(mix: number, on: number, a: THREE.PointLight | null, b: THREE.PointLight | null) {
  if (a) {
    if (mix < 1) a.color.copy(WHITE).lerp(PINK, mix);
    else a.color.copy(PINK).lerp(GREEN, mix - 1);
    a.intensity = (20 + 30 * ramp([1.6, 2], mix)) * on;
  }
  if (b) {
    if (mix < 1) b.color.copy(WHITE).lerp(TEAL, mix);
    else b.color.copy(TEAL).lerp(GREEN, (mix - 1) * 0.85);
    b.intensity = (16 + 24 * ramp([1.6, 2], mix)) * on;
  }
}

// How complex the lattice has grown (0 to 1): the scaffold, then the braces in its last stretch.
const grown = (u: number) => 0.8 + 0.2 * ramp([0.82, 1], u);

export function Lattice({ flight, phone }: { flight: MotionValue<number>; phone: boolean }) {
  const built = useMemo(() => buildLattice(phone ? 70 : 110, phone), [phone]);
  const uniforms = useMemo(() => uniformsFor(), []);
  const group = useRef<THREE.Group>(null);
  const keyA = useRef<THREE.PointLight>(null), keyB = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const f = flight.get();
    // In from the dark; at its end a hard cut to the cages, as in the video.
    const on = f < BEATS.lattice[1] ? ramp([BEATS.lattice[0] - 0.02, BEATS.lattice[0] + 0.05], f) : 0;
    const g = group.current;
    if (!g) return;
    g.visible = on > 0;
    lightLattice(latticeMix(f), on, keyA.current, keyB.current);
    if (!g.visible) return;
    const u = span(BEATS.lattice, f);
    placeLattice(g, u);
    uniforms.uMix.value = latticeMix(f);
    uniforms.uOn.value = on;
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uTwist.value = ramp([0.72, 0.98], u) * 0.03;
    uniforms.uGrow.value = grown(u);
  });
  return (
    <>
      {/* Off toward the glint corners, not down the middle, so the far end stays dark. */}
      <pointLight ref={keyA} position={[3.2, 3.2, -9]} distance={22} decay={1.4} intensity={0} />
      <pointLight ref={keyB} position={[-3.2, -3.2, -20]} distance={22} decay={1.4} intensity={0} />
      <group ref={group} visible={false}>
        <LatticeBody built={built} uniforms={uniforms} />
      </group>
    </>
  );
}

// ---- the pink geodesic tunnel ----
// Rings of corners, each ring turned half a step from the last and joined to it by struts: a
// tube of triangles, like Lusion's, with a finer tube inside it, chunky slabs on some edges,
// streaks of light flying past, and a hot tangle of bars far ahead that he is silhouetted
// against. The world flies toward you and rolls; the camera holds still.
type Bar = { a: THREE.Vector3; b: THREE.Vector3; thick: number; pink: boolean };

function tube(rnd: () => number, sides: number, rings: number, r: number, z0: number, gap: number, thick: number, keep: number, pinks: number) {
  const pts = Array.from({ length: rings }, (_, k) =>
    Array.from({ length: sides }, (_, i) => {
      const a = ((i + (k % 2) * 0.5) / sides) * Math.PI * 2 + k * 0.035;
      const rr = r * (0.9 + 0.2 * rnd());
      return new THREE.Vector3(Math.cos(a) * rr, Math.sin(a) * rr, z0 - k * gap);
    }),
  );
  const bars: Bar[] = [];
  const bar = (a: THREE.Vector3, b: THREE.Vector3) => rnd() < keep && bars.push({ a, b, thick: thick * (0.7 + rnd() * 0.6), pink: rnd() < pinks });
  for (let k = 0; k < rings; k++)
    for (let i = 0; i < sides; i++) {
      bar(pts[k][i], pts[k][(i + 1) % sides]);
      if (k + 1 === rings) continue;
      // Each corner joins the two nearest corners of the next ring: triangles all the way down.
      bar(pts[k][i], pts[k + 1][i]);
      bar(pts[k][i], pts[k + 1][k % 2 ? (i + 1) % sides : (i + sides - 1) % sides]);
    }
  return bars;
}

const UP = new THREE.Vector3(0, 1, 0);
const along = (a: THREE.Vector3, b: THREE.Vector3, thick: number) => {
  const d = b.clone().sub(a);
  return new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(UP, d.clone().normalize()), new THREE.Vector3(thick, d.length(), thick));
};

function buildCages(phone: boolean) {
  const rnd = seeded(5);
  const outer = tube(rnd, 6, 36, 6.4, 8, 5, 0.13, 1, 0.75);
  const inner = tube(rnd, 5, 36, 3.4, 5.5, 5, 0.05, 0.7, 0.5);
  const far = tube(rnd, 7, 36, 9.5, 10.5, 5, 0.16, 0.85, 0.6);
  const bars = [...outer, ...inner, ...far];
  const pink = bars.filter((b) => b.pink).map((b) => along(b.a, b.b, b.thick));
  const steel = bars.filter((b) => !b.pink).map((b) => along(b.a, b.b, b.thick));
  // Chunky slabs riding just outside some of the outer ring's edges.
  const slabs: THREE.Matrix4[] = [];
  const x = new THREE.Vector3(), y = new THREE.Vector3(), z = new THREE.Vector3(), m = new THREE.Vector3();
  for (const b of [...outer, ...far]) {
    if (Math.abs(b.a.z - b.b.z) > 0.01 || rnd() > 0.5) continue; // ring edges only
    x.subVectors(b.b, b.a);
    const len = x.length();
    x.normalize();
    m.addVectors(b.a, b.b).multiplyScalar(0.5);
    y.set(m.x, m.y, 0).normalize();
    z.crossVectors(x, y);
    slabs.push(new THREE.Matrix4().makeBasis(x, y, z).scale(new THREE.Vector3(len * (0.5 + rnd() * 0.4), 0.5 + rnd() * 0.4, 0.2 + rnd() * 0.2)).setPosition(m.addScaledVector(y, 0.25)));
  }
  // Streaks of light down the tube, fast.
  const streaks: THREE.Matrix4[] = [];
  for (let i = 0, n = phone ? 50 : 90; i < n; i++) {
    const a = rnd() * Math.PI * 2, r = 1.2 + rnd() * 4.4;
    streaks.push(new THREE.Matrix4().compose(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 6 - rnd() * 206), new THREE.Quaternion(), new THREE.Vector3(0.022, 0.022, 2 + rnd() * 4)));
  }
  // The hot tangle far ahead: bars criss-crossing in a ball.
  const heart: THREE.Matrix4[] = [];
  for (let i = 0; i < 70; i++) {
    const a = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize().multiplyScalar(2.4 * Math.cbrt(rnd()));
    const b = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize().multiplyScalar(2.4 * Math.cbrt(rnd()));
    heart.push(along(a, b, 0.03));
  }
  // Glints of pink and teal glass about the tube's walls.
  const shards: Placed[] = [];
  for (let n = 0; n < 36; n++) cluster(rnd, 2.5 + rnd() * 2.5, rnd() * 3.5, -4 - n * 3.4 + rnd() * 3, phone ? 16 : 30, 1.4, 0, shards, 3);
  return { pink, steel, slabs, streaks, heart, shards };
}

function Instances({ list, geo, mat }: { list: THREE.Matrix4[]; geo: THREE.BufferGeometry; mat: THREE.Material }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    list.forEach((m, i) => mesh.current!.setMatrixAt(i, m));
    mesh.current!.instanceMatrix.needsUpdate = true;
  }, [list]);
  return <instancedMesh ref={mesh} args={[geo, mat, list.length]} frustumCulled={false} />;
}

// How hot the cages run at flight f (0 to 1): the second half of the beat, into the blowout.
export const cagesHot = (f: number) => ramp([0.45, 0.9], span(BEATS.cages, f));

export function Cages({ flight, phone }: { flight: MotionValue<number>; phone: boolean }) {
  const built = useMemo(() => buildCages(phone), [phone]);
  const cu = useMemo(() => uniformsFor(1), []);
  const kit = useMemo(
    () => ({
      bar: new THREE.CylinderGeometry(1, 1, 1, 6),
      box: new THREE.BoxGeometry(1, 1, 1),
      // Chrome that mirrors the pink light, with a glow of its own that swells into the blowout.
      pink: new THREE.MeshStandardMaterial({ color: "#B07890", metalness: 0.9, roughness: 0.3, emissive: "#FF2A6D", emissiveIntensity: 0.05 }),
      steel: new THREE.MeshStandardMaterial({ color: "#8FA6C0", metalness: 0.9, roughness: 0.3, emissive: "#46CFFF", emissiveIntensity: 0.03 }),
      slab: new THREE.MeshStandardMaterial({ color: "#8E6E80", metalness: 0.6, roughness: 0.4, emissive: "#FF2A6D", emissiveIntensity: 0.05 }),
      streak: new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.4, 1.8), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
      heart: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.3, 1.9), transparent: true, opacity: 0, fog: false, toneMapped: false }),
    }),
    [],
  );
  const core = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!, r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, "rgba(255,255,255,1)");
    r.addColorStop(0.3, "rgba(255,150,210,0.6)");
    r.addColorStop(1, "rgba(255,60,160,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  useEffect(() => () => [...Object.values(kit), core].forEach((x) => x.dispose()), [kit, core]);
  const group = useRef<THREE.Group>(null), streaks = useRef<THREE.Group>(null), heart = useRef<THREE.Group>(null);
  const glow = useRef<THREE.PointLight>(null), cool = useRef<THREE.PointLight>(null), halo = useRef<THREE.Mesh>(null), haloMat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    const f = flight.get(), g = group.current;
    // On from the lattice's last frame until the flash has whited out the view for the room.
    const on = f >= BEATS.cages[0] && f < BEATS.room[0] ? 1 : 0;
    if (glow.current) glow.current.intensity = 0;
    if (cool.current) cool.current.intensity = 0;
    if (!g || !streaks.current || !heart.current || !halo.current) return;
    g.visible = streaks.current.visible = heart.current.visible = halo.current.visible = on > 0;
    if (!on) return;
    const u = span(BEATS.cages, f), hot = cagesHot(f);
    g.position.z = u * 90; // flying on through it
    g.rotation.z = u * 1.4;
    streaks.current.position.z = u * 180;
    streaks.current.rotation.z = g.rotation.z;
    heart.current.rotation.set(clock.elapsedTime * 0.3, clock.elapsedTime * 0.4, u * 2);
    heart.current.scale.setScalar(1 + hot * 1.5);
    kit.pink.emissiveIntensity = 0.05 + hot * 3.4;
    kit.steel.emissiveIntensity = 0.03 + hot * 1.8;
    kit.slab.emissiveIntensity = 0.05 + hot * 0.8;
    kit.streak.opacity = 0.55;
    kit.heart.opacity = 0.75 + hot * 0.25;
    cu.uOn.value = 1 + hot;
    cu.uTime.value = clock.elapsedTime;
    halo.current.scale.setScalar(9 * (1 + hot * 5));
    if (haloMat.current) haloMat.current.opacity = 0.5 + hot * 0.5;
    if (glow.current) glow.current.intensity = 60 + hot * 260;
    if (cool.current) cool.current.intensity = 50;
  });
  return (
    <>
      <pointLight ref={glow} position={[0, 0, -8]} color={PINK} distance={26} decay={1.2} intensity={0} />
      <pointLight ref={cool} position={[3, 3, -2]} color={TEAL} distance={30} decay={1.4} intensity={0} />
      <group ref={group} visible={false}>
        <Instances list={built.pink} geo={kit.bar} mat={kit.pink} />
        <Instances list={built.steel} geo={kit.bar} mat={kit.steel} />
        <Instances list={built.slabs} geo={kit.box} mat={kit.slab} />
        <Shards placed={built.shards} uniforms={cu} />
      </group>
      <group ref={streaks} visible={false}>
        <Instances list={built.streaks} geo={kit.box} mat={kit.streak} />
      </group>
      {/* The glow far down the tunnel he is silhouetted against. */}
      <group ref={heart} position={[0, 0, -64]} visible={false}>
        <Instances list={built.heart} geo={kit.bar} mat={kit.heart} />
      </group>
      <mesh ref={halo} position={[0, 0, -66]} visible={false}>
        <planeGeometry />
        <meshBasicMaterial ref={haloMat} map={core} color={new THREE.Color(2.2, 1.6, 2)} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} toneMapped={false} />
      </mesh>
    </>
  );
}
