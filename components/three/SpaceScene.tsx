"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useReducedMotion, type MotionValue } from "framer-motion";
import * as THREE from "three";
import { dark } from "@/lib/theme";
import { BEATS, ramp } from "./beats";

// The landing page's closing scene, after Lusion's: an astronaut (modelled in Blender,
// scripts/astronaut.py) adrift over a planet, who falls away down a tunnel of lit
// frames as you scroll and comes back to wave. Everything is placed by `progress`
// (0 to 1 down the section, timetable in beats.ts), so scrolling back runs it backwards.

const NIGHT = dark.hex("paper");
const mix = THREE.MathUtils.lerp;
type Driven = { progress: MotionValue<number>; still: boolean };

// ---- the astronaut ----------------------------------------------------------
const JOINTS = ["ArmL", "ArmR", "ForearmL", "ForearmR", "LegL", "LegR", "ShinL", "ShinR", "Head"] as const;
const FRONT = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.04, -0.18, 0.03));

function Astronaut({ progress, still }: Driven) {
  const { scene } = useGLTF("/models/astronaut.glb");
  const body = useRef<THREE.Group>(null);
  const j = useMemo(() => Object.fromEntries(JOINTS.map((n) => [n, scene.getObjectByName(n)!])) as Record<(typeof JOINTS)[number], THREE.Object3D>, [scene]);
  // The tumble adds up frame by frame, so its speed can change without a jump.
  const spin = useRef(new THREE.Euler(0.2, 0.4, 0));
  const turn = useMemo(() => new THREE.Quaternion(), []);

  useFrame(({ clock, viewport }, dt) => {
    const g = body.current;
    if (!g) return;
    const p = still ? 1 : progress.get(), t = still ? 0 : clock.elapsedTime;
    const card = 1 - ramp(BEATS.open, p), away = ramp(BEATS.away, p), back = ramp(BEATS.back, p);
    const wide = viewport.aspect > 1;

    // Place: in the card's half of the screen, then mid-screen, then far off, then close.
    const drift = 1 - back;
    g.position.set(
      (wide ? -viewport.width * 0.23 : 0) * card + Math.sin(t * 0.31) * 0.5 * away * drift,
      mix((wide ? 0.1 : -0.75) * card + Math.sin(t * 0.5) * 0.1 + Math.cos(t * 0.23) * 0.4 * away, -0.55, back),
      mix(mix(0, -24, away), 1.4, back)
    );
    g.scale.setScalar(mix(mix(0.92, 0.72, card), 1.18, back));

    // Turn: a slow tumble that quickens as it falls away, and squares up to face you on the way back.
    const rate = 0.12 + away * 0.9;
    if (!still) {
      spin.current.x += dt * rate * 0.5;
      spin.current.y += dt * rate;
      spin.current.z += dt * rate * 0.3;
    }
    g.quaternion.copy(turn.setFromEuler(spin.current)).slerp(FRONT, Math.max(back, card * 0.85));

    // Limbs: loose and adrift, a little out of step with each other. On arrival the left arm goes up and waves.
    const s = (speed: number, phase: number) => Math.sin(t * speed + phase);
    j.ArmL.rotation.set(-0.25 + s(0.6, 0) * 0.12, 0, mix(0.55 + s(0.5, 1) * 0.12, 2.55, back));
    j.ForearmL.rotation.set(mix(-0.7 + s(0.7, 2) * 0.15, 0, back), 0, mix(0, 0.35 + s(5, 0) * 0.42, back));
    j.ArmR.rotation.set(-0.15 + s(0.55, 3) * 0.12, 0, -(0.5 + s(0.45, 2) * 0.12));
    j.ForearmR.rotation.set(-0.6 + s(0.65, 1) * 0.15, 0, 0);
    j.LegL.rotation.set(-0.35 + s(0.4, 0.5) * 0.12, 0, 0.1);
    j.ShinL.rotation.set(0.6 + s(0.5, 1.5) * 0.15, 0, 0);
    j.LegR.rotation.set(0.12 + s(0.42, 2.5) * 0.12, 0, -0.1);
    j.ShinR.rotation.set(0.32 + s(0.48, 3.5) * 0.12, 0, 0);
    j.Head.rotation.set(s(0.5, 0) * 0.05, s(0.33, 1) * 0.12, back * s(1.2, 0) * 0.06);
  });

  return (
    <group ref={body}>
      <primitive object={scene} />
    </group>
  );
}
useGLTF.preload("/models/astronaut.glb");

// ---- the planet -------------------------------------------------------------
const NOISE = /* glsl */ `
float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z); }
float fbm(vec3 p){ float a = 0.5, v = 0.0; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; } return v; }`;
const SPHERE_VERT = /* glsl */ `varying vec3 vAt, vN, vView;
void main(){ vAt = position; vec4 w = modelMatrix * vec4(position, 1.0); vN = normalize(mat3(modelMatrix) * normal); vView = normalize(cameraPosition - w.xyz); gl_Position = projectionMatrix * viewMatrix * w; }`;
// Sea, land and cloud from noise, lit from one side, with the air glowing along the edge.
const PLANET_FRAG = /* glsl */ `uniform float fade, time; varying vec3 vAt, vN, vView; ${NOISE}
void main(){ vec3 n = normalize(vAt);
  vec3 sea = mix(vec3(0.002, 0.01, 0.07), vec3(0.008, 0.06, 0.3), fbm(n * 2.3 + 4.0));
  vec3 land = mix(vec3(0.02, 0.06, 0.05), vec3(0.13, 0.14, 0.11), fbm(n * 9.0));
  vec3 col = mix(sea, land, smoothstep(0.5, 0.56, fbm(n * 3.1 + 1.7)));
  col = mix(col, vec3(0.9), smoothstep(0.56, 0.74, fbm(n * 7.0 + vec3(time * 0.012, 0.0, 9.0))) * 0.75);
  float day = clamp(dot(vN, normalize(vec3(0.55, 0.5, 0.65))), 0.0, 1.0);
  float edge = pow(1.0 - max(dot(vN, vView), 0.0), 2.6);
  col = col * (0.03 + day * 0.95) + vec3(0.12, 0.32, 1.0) * edge * (0.2 + day * 0.8);
  gl_FragColor = vec4(col * fade, 1.0); }`;
const AIR_FRAG = /* glsl */ `uniform float fade; varying vec3 vN, vView;
void main(){ float rim = pow(clamp(1.0 + dot(vN, vView), 0.0, 1.0), 5.0); gl_FragColor = vec4(vec3(0.14, 0.36, 1.0) * rim * 1.25 * fade, 1.0); }`;
const EARTH = 30;

function Planet({ progress, still }: Driven) {
  const g = useRef<THREE.Group>(null);
  const u = useMemo(() => ({ fade: { value: 1 }, time: { value: 0 } }), []);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const p = still ? 1 : progress.get(), gone = ramp(BEATS.away, p);
    // Its curve fills the bottom of the frame; it drops away as the astronaut leaves it behind.
    g.current.position.set(0, -EARTH - 2.1 - gone * 26, -11);
    g.current.rotation.y = still ? 0 : clock.elapsedTime * 0.008;
    g.current.visible = gone < 0.999;
    u.fade.value = 1 - gone;
    u.time.value = still ? 0 : clock.elapsedTime;
  });
  return (
    <group ref={g} rotation={[0.5, 0, 0.3]}>
      <mesh>
        <sphereGeometry args={[EARTH, 96, 64]} />
        <shaderMaterial vertexShader={SPHERE_VERT} fragmentShader={PLANET_FRAG} uniforms={u} />
      </mesh>
      <mesh scale={1.045}>
        <sphereGeometry args={[EARTH, 64, 48]} />
        <shaderMaterial vertexShader={SPHERE_VERT} fragmentShader={AIR_FRAG} uniforms={u} side={THREE.BackSide} blending={THREE.AdditiveBlending} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

// ---- the tunnel -------------------------------------------------------------
const FRAMES = 64, GAP = 2.6, LENGTH = FRAMES * GAP, PANELS = 150, HALF = 3.4;
// Brighter than white, so the bloom catches them: lapis, the light blue, and paper.
const GLOW = [new THREE.Color(0.1, 0.22, 1.6), new THREE.Color(0.55, 0.7, 2.2), new THREE.Color(1.5, 1.5, 1.7)];

function Tunnel({ progress, still }: Driven) {
  const frames = useRef<THREE.InstancedMesh>(null), panels = useRef<THREE.InstancedMesh>(null);
  const lines = useRef<THREE.MeshBasicMaterial>(null), lights = useRef<THREE.MeshBasicMaterial>(null);
  // A square outline: a ring with four sides.
  const square = useMemo(() => new THREE.RingGeometry(HALF * 1.4, HALF * 1.4 + 0.035, 4, 1, Math.PI / 4), []);
  // Each lit panel: how far down the tunnel, which wall, where along it, its size, colour and flicker.
  const lit = useMemo(() => Array.from({ length: PANELS }, (_, i) => ({ z: Math.random() * LENGTH, wall: i % 4, along: (Math.random() - 0.5) * 2 * HALF * 0.85, w: 0.25 + Math.random() * 0.9, h: 0.08 + Math.random() * 0.22, c: GLOW[i % 3], f: 2 + Math.random() * 9, ph: Math.random() * 6.3 })), []);
  const m = useMemo(() => new THREE.Object3D(), []);
  const tint = useMemo(() => new THREE.Color(), []);
  useEffect(() => {
    for (let i = 0; i < FRAMES; i++) frames.current?.setColorAt(i, GLOW[i % 7 === 0 ? 2 : i % 3 === 0 ? 1 : 0]);
    if (frames.current?.instanceColor) frames.current.instanceColor.needsUpdate = true;
  }, []);

  useFrame(({ clock }) => {
    const f = frames.current, q = panels.current;
    if (!f || !q || !lines.current || !lights.current) return;
    const p = still ? 1 : progress.get(), t = still ? 0 : clock.elapsedTime;
    // In as the astronaut falls away, out as it comes back.
    const show = ramp([BEATS.tunnel[0], BEATS.tunnel[0] + 0.07], p) * (1 - ramp([BEATS.tunnel[1] - 0.07, BEATS.tunnel[1]], p));
    f.visible = q.visible = show > 0.002;
    if (!f.visible) return;
    lines.current.opacity = show * 0.9;
    lights.current.opacity = show;
    // The scroll is the flight: frames come at the camera, pass it, and rejoin at the far end.
    // The twist depends on where a frame is, not which frame it is, so nothing jumps as they wrap.
    const travel = (p - BEATS.tunnel[0]) * 330 + t * 1.5;
    const depth = (z0: number) => 8 - ((((z0 - travel) % LENGTH) + LENGTH) % LENGTH);
    for (let i = 0; i < FRAMES; i++) {
      const z = depth(i * GAP);
      m.position.set(0, 0, z);
      m.rotation.set(0, 0, z * 0.055 + t * 0.04);
      m.scale.setScalar(1);
      m.updateMatrix();
      f.setMatrixAt(i, m.matrix);
    }
    f.instanceMatrix.needsUpdate = true;
    lit.forEach((l, i) => {
      const z = depth(l.z), a = z * 0.055 + t * 0.04 + (l.wall * Math.PI) / 2;
      // On one of the four walls, turned with the tunnel's twist at that depth.
      m.position.set(Math.cos(a) * HALF - Math.sin(a) * l.along, Math.sin(a) * HALF + Math.cos(a) * l.along, z);
      m.rotation.set(0, 0, a + Math.PI / 2);
      m.scale.set(l.w, l.h, 1);
      m.updateMatrix();
      q.setMatrixAt(i, m.matrix);
      q.setColorAt(i, tint.copy(l.c).multiplyScalar(Math.sin(t * l.f + l.ph) > 0.2 ? 1 : 0.06));
    });
    q.instanceMatrix.needsUpdate = true;
    if (q.instanceColor) q.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={frames} args={[square, undefined, FRAMES]} frustumCulled={false}>
        <meshBasicMaterial ref={lines} transparent toneMapped={false} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={panels} args={[undefined, undefined, PANELS]} frustumCulled={false}>
        <planeGeometry />
        <meshBasicMaterial ref={lights} transparent toneMapped={false} side={THREE.DoubleSide} />
      </instancedMesh>
    </>
  );
}

// ---- the stars --------------------------------------------------------------
function Stars({ still }: { still: boolean }) {
  const pts = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const n = 1600, at = new Float32Array(n * 3), v = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      v.randomDirection().multiplyScalar(60 + Math.random() * 50);
      at.set([v.x, v.y, v.z - 20], i * 3);
    }
    return new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(at, 3));
  }, []);
  useFrame((_, dt) => {
    if (pts.current && !still) pts.current.rotation.y += dt * 0.004;
  });
  return (
    <points ref={pts} geometry={geo}>
      <pointsMaterial size={1.6} sizeAttenuation={false} color="#DCE4FF" fog={false} />
    </points>
  );
}

export default function SpaceScene({ progress, active }: { progress: MotionValue<number>; active: boolean }) {
  const still = !!useReducedMotion();
  return (
    <Canvas dpr={[1, 1.75]} frameloop={!active ? "never" : still ? "demand" : "always"} camera={{ position: [0, 0, 8], fov: 35, near: 0.1, far: 220 }} gl={{ antialias: true }}>
      <color attach="background" args={[NIGHT]} />
      {/* Distance swallows the far end of the tunnel and the astronaut as it falls away. */}
      <fog attach="fog" args={[NIGHT, 14, 80]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 4, 6]} intensity={2.6} color="#FFF6EA" />
      {/* The planet's light, from below and behind. */}
      <directionalLight position={[-4, -3, -2]} intensity={1.6} color="#3B66FF" />
      <Stars still={still} />
      <Planet progress={progress} still={still} />
      <Tunnel progress={progress} still={still} />
      <Suspense fallback={null}>
        <Astronaut progress={progress} still={still} />
        {/* What the visor reflects: a soft key, a blue wash and a strip of rim light. No file to fetch. */}
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={3} position={[4, 4, 6]} scale={[6, 6, 1]} color="#FFF6EA" />
          <Lightformer form="rect" intensity={2} position={[-6, -1, 2]} scale={[5, 8, 1]} color="#3B66FF" />
          <Lightformer form="ring" intensity={1.5} position={[0, 2, -8]} scale={6} color="#9DB4FF" />
        </Environment>
      </Suspense>
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.9} />
      </EffectComposer>
    </Canvas>
  );
}
