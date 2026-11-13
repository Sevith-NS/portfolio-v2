"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { BEATS, ramp, within } from "../beats";
import { GHOSTS, HANDOFF, PALE, ghostLife, place, placeInCorridor, struggle } from "./Astronaut";
import { CAM_Z, ghostMaterial, tunnelColour, wander } from "./kit";

// Simba, Ash, Pearl and Cream in small spacesuits like his, with clear bubble helmets, flying
// the whole way with the astronaut, each by personality: Simba zooms round and spins, Ash
// clings to his shoulder, Pearl floats calmly and slow-blinks, Cream tumbles in chaos. Down the
// tunnels they struggle like he does: heads turning in their helmets, tails lashing, legs paddling.
// Modelled in Blender (scripts/space/web_cats.py); the fur grows here, in layers (shell fur):
// each layer is the skin pushed out a little further, keeping only the strands still that
// long, so the fur thins to soft tips. Looks from the photos in public/cats.

const URL = "/models/cats.glb";
const SCALE = 0.15; // a cat beside a two-unit astronaut, a little bigger than life so it reads
export const NAMES = ["simba", "ash", "pearl", "cream"] as const;
type Name = (typeof NAMES)[number];

const LOOK: Record<Name, { base: string; dark: string; light: string; eye: string; nose: string; skin: string; pattern: number }> = {
  simba: { base: "#DDA266", dark: "#B0703A", light: "#F3E9DA", eye: "#B07428", nose: "#D98A8A", skin: "#E7A9A9", pattern: 0 },
  ash: { base: "#767C87", dark: "#646A75", light: "#8A909A", eye: "#D6A21C", nose: "#4F5056", skin: "#B08C92", pattern: 1 },
  pearl: { base: "#F0EEE9", dark: "#A3A4A8", light: "#F7F5F1", eye: "#C9A93A", nose: "#E8A0A6", skin: "#EBB0B4", pattern: 2 },
  cream: { base: "#F5F2EC", dark: "#E6DED2", light: "#FBF9F5", eye: "#3A3F4A", nose: "#F0A8AE", skin: "#F2B5BA", pattern: 3 },
};

// ---- fur ----
const FUR_VERT = /* glsl */ `
uniform float uLen;
uniform float uShells;
uniform vec3 uComb;
varying vec3 vObj;
varying vec3 vN;
varying vec3 vView;
varying float vH;
void main() {
  float h = (float(gl_InstanceID) + 1.0) / uShells;
  vec3 p = position + normal * uLen * h + uComb * uLen * h * h;
  vObj = position;
  vH = h;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vN = normalize(normalMatrix * normal);
  vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}`;
const FUR_FRAG = /* glsl */ `
uniform vec3 uBase;
uniform vec3 uDark;
uniform vec3 uLight;
uniform int uPattern;
uniform int uPart;
uniform vec3 uHead;
uniform float uHeadR;
uniform float uDensity;
uniform vec3 uSun;
uniform float uFade;
varying vec3 vObj;
varying vec3 vN;
varying vec3 vView;
varying float vH;
float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
// The coat: each cat's colours, laid out over the head (x across, y up, -z forward).
vec3 coat(vec3 o) {
  vec3 h = (o - uHead) / uHeadR;
  float fwd = -h.z, up = h.y;
  float n = noise(o * 9.0);
  vec3 c = uBase * (0.88 + 0.24 * n);
  float muzzle = uPart == 0 ? smoothstep(0.3, 0.62, fwd) * smoothstep(0.08, -0.3, up) : 0.0;
  if (uPattern == 0) {
    // Ginger tabby: bands over the crown and cheeks, rings down the tail, a white muzzle.
    // Bands round the head and tail, with the tabby's M of fine lines up the forehead.
    float s = uPart == 2 ? sin(o.z * 30.0 + n) : sin(up * 17.0 + abs(h.x) * 4.0 + n * 1.0);
    float m = uPart == 0 ? smoothstep(0.25, 0.5, fwd) * smoothstep(0.15, 0.4, up) * smoothstep(0.55, 0.95, sin(h.x * 34.0 + n)) : 0.0;
    c = mix(c, uDark, max(smoothstep(0.45, 0.9, s), m) * (1.0 - muzzle) * 0.8);
    c = mix(c, uLight, muzzle);
  } else if (uPattern == 1) {
    c = mix(c, uLight, muzzle * 0.6);
  } else if (uPattern == 2 && uPart == 0) {
    // White, with a grey smudge on the forehead.
    vec3 d = h - vec3(0.0, 0.66, -0.45);
    c = mix(c, uDark, clamp(exp(-dot(d, d) / 0.11) * (0.8 + 0.5 * noise(o * 14.0)), 0.0, 1.0));
  }
  return c;
}
void main() {
  vec3 q = vObj * uDensity;
  float r = hash(floor(q));
  float len = 0.5 + 0.5 * r; // some strands shorter than others
  if (vH > len) discard;
  if (length(fract(q) - 0.5) > 0.55 * (1.0 - vH / len)) discard; // thick at the root, fine at the tip
  vec3 n = normalize(vN);
  float wrap = clamp(dot(n, normalize(uSun)) * 0.5 + 0.5, 0.0, 1.0);
  float rim = pow(1.0 - clamp(dot(n, normalize(vView)), 0.0, 1.0), 2.5);
  vec3 base = coat(vObj);
  vec3 col = base * mix(0.4, 1.0, vH) * (0.32 + 0.9 * wrap) + rim * 0.3 * base * vH;
  gl_FragColor = vec4(col * uFade, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

type Kit = { group: THREE.Group; limbs: Limbs; eyeU: { uBlink: { value: number } }; ghosts: { group: THREE.Group; limbs: Limbs; mat: THREE.ShaderMaterial }[] };

function eyeMaterial(look: (typeof LOOK)[Name], geo: THREE.BufferGeometry, blink: { value: number }) {
  // The two eyes' centres, so the iris and the slit pupil can be painted from the front.
  const pos = geo.getAttribute("position");
  const l = new THREE.Box3(), r = new THREE.Box3(), v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) (v.fromBufferAttribute(pos, i).x < 0 ? l : r).expandByPoint(v);
  const m = new THREE.MeshStandardMaterial({ roughness: 0.06, metalness: 0, envMapIntensity: 1.4 });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uEyeL = { value: l.getCenter(new THREE.Vector3()) };
    sh.uniforms.uEyeR = { value: r.getCenter(new THREE.Vector3()) };
    sh.uniforms.uIris = { value: new THREE.Color(look.eye) };
    sh.uniforms.uBlink = blink;
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uEyeL;\nuniform vec3 uEyeR;\nuniform float uBlink;\nvarying vec3 vEye;")
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvec3 ec = position.x < 0.0 ? uEyeL : uEyeR;\nvEye = position;\ntransformed.y = ec.y + (transformed.y - ec.y) * (1.0 - 0.92 * uBlink);",
      );
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uEyeL;\nuniform vec3 uEyeR;\nuniform vec3 uIris;\nvarying vec3 vEye;")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
  vec3 d = normalize(vEye - (vEye.x < 0.0 ? uEyeL : uEyeR));
  float ang = acos(clamp(-d.z, -1.0, 1.0));
  float iris = 1.0 - smoothstep(0.86, 0.92, ang);
  float tall = max(0.15, 1.0 - pow(abs(d.y) / 0.72, 2.0));
  float slit = 1.0 - smoothstep(0.07, 0.1, abs(d.x) / tall);
  vec3 ir = uIris * mix(1.35, 0.5, smoothstep(0.15, 0.9, ang / 0.92));
  diffuseColor.rgb = mix(mix(vec3(0.06, 0.04, 0.03), ir, iris), vec3(0.008), slit * iris);`,
      );
  };
  return m;
}

function furMaterial(look: (typeof LOOK)[Name], part: number, head: THREE.Vector3, headR: number, len: number, shells: number) {
  return new THREE.ShaderMaterial({
    vertexShader: FUR_VERT,
    fragmentShader: FUR_FRAG,
    uniforms: {
      uLen: { value: len },
      uShells: { value: shells },
      uComb: { value: new THREE.Vector3(0, -0.4, 0.6) }, // combed back and down
      uBase: { value: new THREE.Color(look.base) },
      uDark: { value: new THREE.Color(look.dark) },
      uLight: { value: new THREE.Color(look.light) },
      uPattern: { value: look.pattern },
      uPart: { value: part },
      uHead: { value: head },
      uHeadR: { value: headR },
      uDensity: { value: 210 },
      uSun: { value: new THREE.Vector3(-0.5, 0.6, 0.6) },
      uFade: { value: 1 },
    },
  });
}

const helmetMaterial = () =>
  new THREE.MeshPhysicalMaterial({ color: "#FFFFFF", transparent: true, opacity: 0.16, roughness: 0.02, metalness: 0, clearcoat: 1, iridescence: 0.5, iridescenceIOR: 1.3, envMapIntensity: 2.2, depthWrite: false });

// The parts of a cat that move: the neck (head, face and ears turn inside the helmet), the tail
// (pivots at its root) and the four legs (each pivots at its shoulder or hip).
type Limbs = { neck: THREE.Object3D; tail: THREE.Object3D; legs: THREE.Object3D[] };
const LEGS = ["leg_fl", "leg_fr", "leg_bl", "leg_br"];
function limbsOf(root: THREE.Object3D, name: Name): Limbs {
  const get = (p: string) => root.getObjectByName(`${name}_${p}`)!;
  return { neck: get("neck"), tail: get("tail"), legs: LEGS.map(get) };
}

// One cat, dressed: suit, helmet, eyes, nose, and fur layered onto the head, ears and tail.
// Its ghosts are see-through copies of the whole cat, with limbs of their own.
export function dress(source: THREE.Object3D, name: Name, shells: number, ghosts: number): Kit {
  const look = LOOK[name];
  const group = new THREE.Group();
  const cat = source.clone(true);
  cat.position.set(0, 0, 0);
  group.add(cat);
  const head = cat.getObjectByName(`${name}_head`) as THREE.Mesh;
  head.geometry.computeBoundingBox();
  const hc = head.geometry.boundingBox!.getCenter(new THREE.Vector3());
  const hr = head.geometry.boundingBox!.getSize(new THREE.Vector3()).x / 2;
  const blink = { value: 0 };
  const flat = (color: string, rough = 0.8, metal = 0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
  const furs: [THREE.Mesh, THREE.InstancedMesh][] = [];
  cat.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const part = m.name.slice(name.length + 1);
    if (part === "eyes") m.material = eyeMaterial(look, m.geometry, blink);
    else if (part === "helmet") {
      m.material = helmetMaterial();
      m.renderOrder = 2;
    } else if (part === "suit" || part === "pack" || part.startsWith("leg_")) m.material = flat("#DCDBD6", 0.82);
    else if (part.startsWith("stripe")) m.material = flat("#B4502E", 0.7);
    else if (part === "patch") m.material = flat("#2440A8", 0.6);
    else if (part === "metal") m.material = flat("#C9CED6", 0.35, 0.8);
    else if (part === "nose") m.material = flat(look.nose, 0.45);
    else if (part === "earskin") m.material = flat(look.skin, 0.65);
    else if (part === "whiskers") m.material = new THREE.MeshBasicMaterial({ color: "#F2F2F2" });
    if (part === "head" || part === "ears" || part === "tail") {
      // The skin under the fur, then the layers of fur on top of it.
      m.material = flat(new THREE.Color(look.base).multiplyScalar(0.5).getStyle(), 0.95);
      const which = part === "head" ? 0 : part === "ears" ? 1 : 2;
      const len = part === "head" ? 0.045 : part === "ears" ? 0.018 : 0.07;
      const fur = new THREE.InstancedMesh(m.geometry, furMaterial(look, which, hc, hr, len, shells), shells);
      for (let i = 0; i < shells; i++) fur.setMatrixAt(i, new THREE.Matrix4());
      fur.frustumCulled = false;
      furs.push([m, fur]);
    }
  });
  // The fur rides on its mesh, so it turns with the head and lashes with the tail.
  for (const [m, fur] of furs) m.add(fur);
  group.scale.setScalar(SCALE);
  const shades = GHOSTS.slice(0, ghosts).map(() => {
    const g = new THREE.Group();
    const copy = source.clone(true);
    copy.position.set(0, 0, 0);
    const mat = ghostMaterial();
    copy.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.material = mat;
      const part = m.name.slice(name.length + 1);
      if (part === "whiskers" || part === "eyes" || part === "nose") m.visible = false;
    });
    g.add(copy);
    g.scale.setScalar(SCALE);
    g.visible = false;
    return { group: g, limbs: limbsOf(copy, name), mat };
  });
  return { group, limbs: limbsOf(cat, name), eyeU: { uBlink: blink }, ghosts: shades };
}

const him = new THREE.Object3D(), off = new THREE.Vector3(), drift = new THREE.Vector3();

// Where each cat is relative to him, by personality, at time t.
function orbit(name: Name, t: number, wave: number, out: THREE.Vector3, rot: THREE.Euler) {
  if (name === "simba") {
    // Zooms round him in wide loops, spinning as he goes.
    const a = t * 1.5;
    out.set(Math.cos(a) * (1.8 - 0.5 * wave), Math.sin(a * 0.7) * 0.7 + 0.6 * wave, Math.sin(a) * 1.3);
    rot.set(0, -a + Math.PI / 2, t * 2.4);
  } else if (name === "ash") {
    // Clings near his shoulder, twitchy.
    out.set(0.72 + Math.sin(t * 13) * 0.012, 0.62 + Math.sin(t * 11) * 0.012, 0.25);
    rot.set(-0.3, 0.5, 0.15 + Math.sin(t * 9) * 0.02);
  } else if (name === "pearl") {
    // Floats calmly off to one side.
    out.set(1.55 + Math.sin(t * 0.3) * 0.12, -0.75 + Math.sin(t * 0.45) * 0.14 + 1.2 * wave, 0.45);
    rot.set(Math.sin(t * 0.2) * 0.15, -0.6 + Math.sin(t * 0.25) * 0.2, Math.sin(t * 0.3) * 0.1);
  } else {
    // Tumbles about in chaos.
    out.set(-1.35 + Math.sin(t * 1.7) * 0.35, 0.35 + Math.sin(t * 2.3) * 0.4 + 0.5 * wave, 0.5 + Math.sin(t * 1.1) * 0.3);
    rot.set(t * 2.5, t * 3.1, t * 1.9);
  }
}

// How much each one fights it, and how fast: Simba hard, Ash small and quick, Pearl barely and
// slowly, Cream all over the place.
const PEP: Record<Name, { amp: number; speed: number }> = {
  simba: { amp: 1.15, speed: 1.3 },
  ash: { amp: 0.7, speed: 2.1 },
  pearl: { amp: 0.5, speed: 0.55 },
  cream: { amp: 1.35, speed: 1.6 },
};

// A cat struggling in its suit: head turning in the helmet, tail lashing, legs paddling like a
// trot (diagonal pairs together). `s` (0 to 1) is how hard, the same measure as his.
function wriggle(l: Limbs, name: Name, t: number, s: number) {
  const { amp, speed } = PEP[name];
  const a = (0.25 + 0.75 * s) * amp, u = t * speed, seed = NAMES.indexOf(name) * 10;
  l.neck.rotation.set(wander(u * 0.8, seed + 1) * 0.22 * a, wander(u * 0.7, seed + 2) * 0.45 * a, wander(u * 0.6, seed + 3) * 0.15 * a);
  l.tail.rotation.set(wander(u * 1.4, seed + 4) * 0.35 * a, wander(u * 1.7, seed + 5) * 0.7 * a, wander(u * 1.2, seed + 6) * 0.25 * a);
  l.legs.forEach((leg, i) => {
    const phase = i === 0 || i === 3 ? 0 : Math.PI;
    leg.rotation.set(Math.sin(u * 4 + phase) * 0.45 * a + wander(u, seed + 7 + i) * 0.2 * a, 0, wander(u * 0.8, seed + 11 + i) * 0.15 * a);
  });
}

// Blinks: Pearl slow-blinks every seven seconds or so; the others blink now and then.
function blinkAt(name: Name, t: number) {
  const period = name === "pearl" ? 7 : name === "ash" ? 3.1 : name === "simba" ? 4.3 : 2.6;
  const len = name === "pearl" ? 0.9 : 0.18;
  const x = (t + NAMES.indexOf(name) * 1.3) % period;
  return x < len ? Math.sin((x / len) * Math.PI) : 0;
}

function Crew({ flight, still, phone, corridor }: { flight: MotionValue<number>; still: boolean; phone: boolean; corridor: boolean }) {
  const { scene } = useGLTF(URL, "/draco/");
  const kits = useMemo(
    () => NAMES.map((n) => ({ name: n, ...dress(scene.getObjectByName(n)!, n, phone ? 10 : 14, corridor ? 0 : phone ? 1 : 2) })),
    [scene, phone, corridor],
  );
  useEffect(
    () => () =>
      kits.forEach((k) =>
        [k.group, ...k.ghosts.map((g) => g.group)].forEach((root) =>
          root.traverse((o) => {
            ((o as THREE.Mesh).material as THREE.Material | undefined)?.dispose();
          }),
        ),
      ),
    [kits],
  );
  const rot = useMemo(() => new THREE.Euler(), []);
  useFrame(({ clock }) => {
    const f = flight.get(), t = still ? 0 : clock.elapsedTime;
    const shown = corridor ? f >= BEATS.room[0] - 0.01 && f < HANDOFF : f < BEATS.room[0] + 0.01 || f >= HANDOFF;
    if (corridor) placeInCorridor(him, f, t);
    else place(him, f, t, phone ? 5.4 : CAM_Z);
    const wave = corridor ? 0 : ramp([BEATS.wave[0], BEATS.wave[0] + 0.04], f);
    // They fight it as hard as he does; in the corridor and at the end, they settle.
    const s = corridor ? 0.3 : f >= HANDOFF ? 0.2 : struggle(f);
    // Simba zooms ahead toward you now and then while they're down the tunnels.
    const dash = corridor ? 0 : (within(BEATS.lattice, f) + within(BEATS.cages, f)) * Math.pow(Math.max(0, Math.sin(t * 0.55)), 6);
    for (const k of kits) {
      k.group.visible = shown;
      if (!shown) {
        k.ghosts.forEach((g) => (g.group.visible = false));
        continue;
      }
      orbit(k.name, t, wave, off, rot);
      // Ash rides with his tumble; the others keep their own bearings.
      if (k.name === "ash") off.applyEuler(him.rotation);
      k.group.position.copy(him.position).add(off.multiplyScalar(him.scale.x || 1));
      if (k.name === "simba") k.group.position.z += dash * 14;
      k.group.rotation.copy(rot);
      k.group.scale.setScalar(SCALE * (him.scale.x || 1));
      k.eyeU.uBlink.value = blinkAt(k.name, t);
      wriggle(k.limbs, k.name, t, s);
      // Their ghosts: faint echoes of their own wriggling, turning up at random spots about the
      // tunnel and fading, in the tunnel's colour, like his.
      k.ghosts.forEach((gh, i) => {
        const seed = GHOSTS[i].seed + NAMES.indexOf(k.name) * 5;
        const seen = corridor ? 0 : ghostLife(seed, f, t, drift, 0.7);
        gh.group.visible = seen > 0.01;
        if (!gh.group.visible) return;
        gh.group.position.copy(k.group.position).add(drift);
        gh.group.rotation.set(rot.x + wander(t * 0.5, seed + 30) * 0.4, rot.y + seed, rot.z + wander(t * 0.6, seed + 40) * 0.4);
        gh.group.scale.copy(k.group.scale);
        wriggle(gh.limbs, k.name, t - GHOSTS[i].lag, s);
        tunnelColour(f, (i % 2) as 0 | 1, gh.mat.uniforms.uColor.value).lerp(PALE, 0.35);
        gh.mat.uniforms.uOpacity.value = 0.3 * seen;
      });
    }
  });
  return (
    <>
      {kits.map((k) => (
        <group key={k.name}>
          <primitive object={k.group} />
          {k.ghosts.map((g, i) => (
            <primitive key={i} object={g.group} />
          ))}
        </group>
      ))}
    </>
  );
}

export function Cats(props: { flight: MotionValue<number>; still: boolean; phone: boolean }) {
  return <Crew {...props} corridor={false} />;
}

// The same four, flying with him in the room and up the corridor (drawn on the screen).
export function CorridorCats(props: { flight: MotionValue<number>; still: boolean; phone: boolean }) {
  return <Crew {...props} corridor />;
}

useGLTF.preload(URL, "/draco/");
