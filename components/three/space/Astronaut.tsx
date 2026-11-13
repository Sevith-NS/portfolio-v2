"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { BEATS, ramp, span, within } from "../beats";
import { CAM_Z, DROP, ghostMaterial, tunnelColour, wander } from "./kit";

// The astronaut: NASA's suit, rigged in Blender (scripts/space/web_astronaut.py), moving the way
// Lusion's does (astro.mp4). Close up, arms out and gesturing; behind the line he turns his back
// and sinks away; tumbling and struggling down the tunnels, with faint copies of himself
// appearing about the tunnel; walking up the corridor (Corridor.tsx draws him there); then out
// of the screen toward you, hands up, arms wide, landing in a crouch, standing, waving.

const URL = "/models/emu.glb";
const BONES = ["hips", "chest", "head", "upperarm_r", "upperarm_l", "forearm_r", "forearm_l", "thigh_r", "thigh_l", "shin_r", "shin_l"] as const;
type Bone = (typeof BONES)[number];
type Rig = { root: THREE.Object3D; b: Record<Bone, THREE.Object3D>; rest: Record<Bone, THREE.Quaternion> };
type Pose = Partial<Record<Bone, [number, number, number]>>; // turns about the suit's x, y, z

function rig(root: THREE.Object3D): Rig {
  root.updateMatrixWorld(true);
  const b = {} as Rig["b"], rest = {} as Rig["rest"];
  for (const n of BONES) {
    b[n] = root.getObjectByName(n)!;
    rest[n] = b[n].quaternion.clone();
  }
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.frustumCulled = false; // a skinned suit's box doesn't follow its limbs
  });
  return { root, b, rest };
}

// Turns a bone about the suit's own axes (x across, y up, z through front and back), at its
// joint, on top of its rest pose: parent⁻¹ · turn · parent · rest. Bones go parents first.
const AX = new THREE.Vector3(1, 0, 0), AY = new THREE.Vector3(0, 1, 0), AZ = new THREE.Vector3(0, 0, 1);
const rootInv = new THREE.Quaternion(), par = new THREE.Quaternion(), turn = new THREE.Quaternion(), tmp = new THREE.Quaternion();
function bend(k: Rig, n: Bone, [ax, ay, az]: [number, number, number]) {
  const bone = k.b[n];
  k.root.getWorldQuaternion(rootInv).invert();
  bone.parent!.getWorldQuaternion(par).premultiply(rootInv);
  turn.setFromAxisAngle(AX, ax).premultiply(tmp.setFromAxisAngle(AY, ay)).premultiply(tmp.setFromAxisAngle(AZ, az));
  bone.quaternion.copy(tmp.copy(par).invert().multiply(turn).multiply(par).multiply(k.rest[n]));
}

// His key poses, read off the video. Right arm is +z to lift, left arm -z; +x swings a limb forward.
const FLOAT: Pose = { upperarm_r: [-0.15, 0, 0.95], upperarm_l: [-0.15, 0, -0.95], forearm_r: [0.9, 0, 0.4], forearm_l: [0.9, 0, -0.4], thigh_r: [0.08, 0, 0.06], thigh_l: [-0.04, 0, -0.06], shin_r: [-0.2, 0, 0], shin_l: [-0.12, 0, 0] };
const PUSH: Pose = { upperarm_r: [0.45, 0, 1.75], upperarm_l: [0.45, 0, -1.75], forearm_r: [1.0, 0, 0.2], forearm_l: [1.0, 0, -0.2], thigh_r: [0.3, 0, 0.05], shin_r: [-0.5, 0, 0], thigh_l: [-0.1, 0, -0.05], shin_l: [-0.2, 0, 0] };
const WIDE: Pose = { upperarm_r: [0, 0, 1.15], upperarm_l: [0, 0, -1.15], forearm_r: [0, 0, 0.8], forearm_l: [0, 0, -0.8], thigh_r: [0.55, 0, 0.1], thigh_l: [0.1, 0, -0.1], shin_r: [-0.8, 0, 0], shin_l: [-0.2, 0, 0] }; // arms out level, stepping out
const CROUCH: Pose = { chest: [-0.5, 0, 0], head: [-0.15, 0, 0], upperarm_r: [0.6, 0, 0.35], upperarm_l: [0.6, 0, -0.35], forearm_r: [0.6, 0, 0], forearm_l: [0.6, 0, 0], thigh_r: [1.2, 0, 0.55], thigh_l: [1.2, 0, -0.55], shin_r: [-2, 0, 0], shin_l: [-2, 0, 0] }; // knees up and wide, hands toward them: it reads from the front
const STAND: Pose = { upperarm_r: [0.05, 0, 0.3], upperarm_l: [0.05, 0, -0.3], forearm_r: [0.3, 0, 0], forearm_l: [0.3, 0, 0] };
const WAVE: Pose = { upperarm_r: [0.1, 0, 1.66], forearm_r: [0, 0, 0.96], upperarm_l: [0.05, 0, -0.3], forearm_l: [0.3, 0, 0] };

const mix = (a: Pose, b: Pose, k: number): Pose => {
  const out: Pose = {};
  for (const n of BONES) {
    const p = a[n] ?? [0, 0, 0], q = b[n] ?? [0, 0, 0];
    out[n] = [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + (q[2] - p[2]) * k];
  }
  return out;
};

// How hard he struggles at flight f: from the turn behind the line to the end of the cages.
export function struggle(f: number) {
  return 0.1 + 0.9 * ramp(BEATS.turn, f) * (1 - ramp([BEATS.cages[1] - 0.01, BEATS.room[0]], f));
}

// The walk out, as in the video: hands up at the glass, arms wide once through, a crouch as he
// lands, standing, then the wave. Each pose takes over from the one before.
const CROUCHING = [BEATS.land[0], BEATS.land[0] + 0.015] as const;
const STANDING = [BEATS.land[1] - 0.012, BEATS.land[1] + 0.004] as const;
const WAVING = [BEATS.wave[0] + 0.004, BEATS.wave[0] + 0.02] as const;

// His body at flight f, time t: the beat's key pose, his slow gestures, and the struggle on top.
function pose(k: Rig, f: number, t: number, s = struggle(f)) {
  let base = FLOAT;
  if (f >= BEATS.screen[0]) {
    base = mix(FLOAT, PUSH, ramp([BEATS.screen[0], BEATS.shatter[0] + 0.01], f));
    base = mix(base, WIDE, ramp([BEATS.shatter[0] + 0.03, BEATS.shatter[0] + 0.045], f));
    base = mix(base, CROUCH, ramp(CROUCHING, f));
    base = mix(base, STAND, ramp(STANDING, f));
    base = mix(base, WAVE, ramp(WAVING, f));
  }
  const waving = ramp(WAVING, f);
  const w = (i: number, speed = 1) => wander(t * speed, i);
  const g = 0.22 * (1 - ramp([BEATS.screen[0], BEATS.screen[0] + 0.02], f)); // slow gestures, as weightless
  for (const n of BONES) {
    if (n === "hips") continue;
    const [x, y, z] = base[n] ?? [0, 0, 0];
    const i = BONES.indexOf(n) * 3;
    const arm = n.startsWith("upper") || n.startsWith("fore"), leg = n.startsWith("thigh") || n.startsWith("shin");
    const amp = s * (arm ? 0.55 : leg ? 0.45 : 0.2) + g * (arm ? 1 : 0.3);
    const swing = n === "forearm_r" ? waving * 0.32 * Math.sin(t * 7) : 0;
    bend(k, n, [x + w(i, 1.5) * amp * (n === "forearm_r" ? 1 - waving : 1), y + w(i + 1, 0.8) * amp * 0.4, z + w(i + 2, 1.6) * amp * 0.6 * (n === "upperarm_r" ? 1 - waving : 1) + swing]);
  }
}

// Where he is in the main scene at flight f, time t (ghosts pass an earlier t). Close at first,
// head to knees on screen; Cats.tsx flies the cats round the same spot.
const from = new THREE.Object3D(), step = new THREE.Vector3();
// His depth down the lattice, read off the video: far as it opens, near through the colours,
// far again as it twists, then a speck against the pink tunnel's glow. Shares of the lattice
// beat, and units nearer (+) or further (-) than where his fall ends.
const SWING_U = [0, 0.16, 0.3, 0.5, 0.69, 0.84, 0.95];
const SWING_Z = [0, -14, 4, 3, -3.5, -7.7, -23];
function keyed(u: number, xs: number[], ys: number[]) {
  let i = 1;
  while (i < xs.length - 1 && u > xs[i]) i++;
  return ys[i - 1] + (ys[i] - ys[i - 1]) * ramp([xs[i - 1], xs[i]], u);
}
const CLOSE = new THREE.Vector3(0, -0.62, 2.2);
const STEP_AT = new THREE.Vector3(0.05, -0.75, 3); // close, as he steps out through the glass
const LAND_AT = new THREE.Vector3(0.05, -0.2, 1.5); // a little back, so the crouch is in frame
const WAVE_AT = new THREE.Vector3(0.05, -0.2, 2.7); // standing: head to waist, the end line over him like Lusion's
export const PANE = 0.95; // the screen's size once it has pulled back from the corridor (Corridor.tsx)
export const SCREEN = { scale: PANE }; // that size against the whole canvas, which Corridor.tsx measures
export const HANDOFF = BEATS.shatter[0] + 0.014; // he pushes through the cracked glass; this one takes over from his copy on it

// `camZ` is the page camera's distance (closer on a phone, SpaceScene.tsx).
export function place(g: THREE.Object3D, f: number, t: number, camZ = CAM_Z) {
  g.scale.setScalar(1);
  if (f >= HANDOFF) {
    // He walks out of the screen: he takes over from his copy on it at the very spot it shows
    // him (on a screen shrunk to s, that copy looks as he would 1/s as far away, the same lens
    // drawing both), comes on toward you, drops into a crouch as he lands, and stands.
    placeInCorridor(from, HANDOFF, t);
    from.position.z = camZ + (from.position.z - camZ) / SCREEN.scale;
    const k = ramp([HANDOFF, HANDOFF + 0.035], f);
    const crouch = ramp(CROUCHING, f) * (1 - ramp(STANDING, f));
    step.copy(STEP_AT).setZ(camZ < CAM_Z ? CLOSE.z : STEP_AT.z); // on a tall phone he already fills the width
    g.position.lerpVectors(from.position, step, k).lerp(LAND_AT, ramp(CROUCHING, f)).lerp(WAVE_AT, ramp(STANDING, f));
    g.position.y += Math.sin(t * 0.7) * 0.03 * k - 0.2 * crouch;
    g.rotation.set(from.rotation.x * (1 - k), from.rotation.y + (Math.PI + 0.12 - from.rotation.y) * k, from.rotation.z * (1 - k));
    return;
  }
  // Close to you, then turning his back behind the line and sinking away, then tumbling down the
  // tunnels: far down the white glass, drifting nearer through the colours, far again as the
  // lattice twists, a speck against the pink tunnel's glow.
  const turned = ramp(BEATS.turn, f), away = ramp(BEATS.fall, f), on = span(BEATS.fall, f), deep = span([BEATS.fall[1], BEATS.cages[1]], f);
  const jx = wander(t * 0.6, 21) * 0.35 * deep, jy = wander(t * 0.5, 22) * 0.3 * deep;
  const swing = keyed(span(BEATS.lattice, f), SWING_U, SWING_Z);
  g.position.set(
    Math.sin(t * 0.4) * 0.05 + jx,
    CLOSE.y + Math.sin(t * 0.6) * 0.04 - 0.55 * turned * (1 - away) + (0.12 - CLOSE.y) * away * away + jy,
    CLOSE.z + (-DROP - CLOSE.z) * Math.pow(away, 1.35) + swing,
  );
  g.rotation.set(
    0.05 + Math.sin(t * 0.3) * 0.04 + on * on * 1.4 + deep * 4 + wander(t * 0.7, 23) * 0.3 * deep,
    Math.PI + 0.12 + Math.sin(t * 0.25) * 0.06 + Math.PI * turned + on * 0.6 + wander(t * 0.6, 24) * 0.3 * deep,
    Math.sin(t * 0.35) * 0.04 + on * 0.8 + deep * 6 + wander(t * 0.5, 25) * 0.25 * deep,
  );
}

// Ghosts: faint copies of him, each an echo of his own movements a moment ago, appearing at a
// random spot near him, never nearer you, holding a moment and fading, in the tunnel's colour,
// then turning up somewhere else. Down both tunnels. The cats' ghosts work the same way.
export const GHOSTS = [
  { lag: 0.2, seed: 1 },
  { lag: 0.45, seed: 2 },
  { lag: 0.7, seed: 3 },
];
const LIFE = 2.4; // seconds each appearance lasts
export const PALE = new THREE.Color("#FFFFFF"); // ghosts are the tunnel's colour washed toward white
const hash = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};
// A ghost's spot (an offset from whoever it echoes) and how visible it is, at flight f, time t.
export function ghostLife(seed: number, f: number, t: number, out: THREE.Vector3, reach = 1) {
  const phase = t / LIFE + seed * 0.37, c = Math.floor(phase), u = phase - c, n = c * 7 + seed * 131;
  out.set((hash(n) - 0.5) * 4.8 * reach, (hash(n + 1) - 0.5) * 3 * reach, -hash(n + 2) * 3 * reach + u * 1.2);
  return within(BEATS.split, f, 0.01) * Math.sin(Math.PI * u);
}

function ghostly(root: THREE.Object3D) {
  const mat = ghostMaterial();
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = mat;
  });
  return mat;
}

export function Astronaut({ flight, still, phone }: { flight: MotionValue<number>; still: boolean; phone: boolean }) {
  const { scene } = useGLTF(URL, "/draco/");
  const main = useMemo(() => rig(cloneSkinned(scene)), [scene]);
  const ghosts = useMemo(
    () =>
      GHOSTS.slice(0, phone ? 2 : 3).map((gh) => {
        const k = rig(cloneSkinned(scene));
        return { ...gh, k, mat: ghostly(k.root) };
      }),
    [scene, phone],
  );
  const body = useRef<THREE.Group>(null);
  const shades = useRef<(THREE.Group | null)[]>([]);
  useEffect(() => () => ghosts.forEach((g) => g.mat.dispose()), [ghosts]);
  const off = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const f = flight.get(), t = still ? 0 : clock.elapsedTime;
    const g = body.current;
    if (!g) return;
    // He leaves the main scene for the room and corridor (drawn on the screen), and walks back out of it.
    const shown = f < BEATS.room[0] + 0.01 || f >= HANDOFF;
    const camZ = phone ? 5.4 : CAM_Z;
    g.visible = shown;
    place(g, f, t, camZ);
    pose(main, f, t);

    ghosts.forEach((gh, i) => {
      const sh = shades.current[i];
      if (!sh) return;
      const seen = ghostLife(gh.seed, f, t, off);
      sh.visible = shown && seen > 0.01;
      if (!sh.visible) return;
      const then = t - gh.lag;
      place(sh, f, then, camZ);
      sh.position.add(off);
      sh.rotation.y += (hash(Math.floor(t / LIFE) + gh.seed) - 0.5) * 2;
      pose(gh.k, f, then);
      tunnelColour(f, (i % 2) as 0 | 1, gh.mat.uniforms.uColor.value).lerp(PALE, 0.35);
      gh.mat.uniforms.uOpacity.value = 0.3 * seen;
    });
  });

  return (
    <>
      <group ref={body}>
        <primitive object={main.root} />
      </group>
      {ghosts.map((gh, i) => (
        <group key={i} ref={(el) => void (shades.current[i] = el)} visible={false}>
          <primitive object={gh.k.root} />
        </group>
      ))}
    </>
  );
}

// Where he is in the room and corridor world: inside the glass cube at the room's centre, then
// walking up the corridor toward you. Cats.tsx flies the cats round him there too.
export function placeInCorridor(g: THREE.Object3D, f: number, t: number) {
  const room = span(BEATS.room, f), hall = span([BEATS.corridor[0], HANDOFF], f);
  if (f < BEATS.corridor[0]) {
    g.position.set(0, -0.05, 0);
    g.rotation.set(room * 2, Math.PI + room * 3, room * 1.5);
    g.scale.setScalar(0.22 * (1 - 0.8 * ramp([0.7, 1], room))); // small in the cube as the camera dives in
  } else {
    // From far down the corridor to close up, filling most of the screen as it pulls back.
    g.position.set(Math.sin(t * 0.5) * 0.1, 0.1 + Math.sin(t * 0.7) * 0.06, -10 + 11.3 * ramp([0, 0.55], hall));
    g.rotation.set(0.1 * (1 - hall), Math.PI + 0.2 * Math.sin(t * 0.3), 0.08 * Math.sin(t * 0.4));
    g.scale.setScalar(1);
  }
}

// His copy inside the room and corridor (Corridor.tsx renders that world onto the screen).
export function CorridorAstronaut({ flight, still }: { flight: MotionValue<number>; still: boolean }) {
  const { scene } = useGLTF(URL, "/draco/");
  const k = useMemo(() => rig(cloneSkinned(scene)), [scene]);
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const f = flight.get(), t = still ? 0 : clock.elapsedTime;
    if (!g.current) return;
    placeInCorridor(g.current, f, t);
    g.current.visible = f < HANDOFF; // from here the real one walks out (place)
    pose(k, Math.min(f, HANDOFF - 0.001), t, 0.1); // hands coming up to the glass, as the real one at the handoff
  });
  return (
    <group ref={g}>
      <primitive object={k.root} />
    </group>
  );
}

useGLTF.preload(URL, "/draco/");
