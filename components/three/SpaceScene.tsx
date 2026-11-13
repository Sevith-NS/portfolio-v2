"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Bloom, ChromaticAberration, EffectComposer } from "@react-three/postprocessing";
import type { BloomEffect, ChromaticAberrationEffect } from "postprocessing";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { BEATS, ramp, within } from "./beats";
import { CAM_Z, VOID } from "./space/kit";
import { Earth, Glow, Stars } from "./space/Sky";
import { Astronaut } from "./space/Astronaut";
import { Cages, Lattice, cagesHot } from "./space/Tunnels";
import { Corridor } from "./space/Corridor";
import { Cats } from "./space/Cats";

// The close of the home page, Lusion's flight with Sevith's touches. Every piece is placed by
// `flight` (0 to 1 down the pinned run, timetable in beats.ts), so scrolling back runs it
// backwards. In order: NASA's suit over the reel's Earth (Sky.tsx, Astronaut.tsx), his fall,
// the kaleidoscope lattice with his ghost copies, the pink cages and the flash (Tunnels.tsx),
// the paw-print room and corridor on a screen that shatters (Corridor.tsx), the wave. His four
// cats fly the whole way (Cats.tsx).

// On a tall phone screen the same lens crops him to his chest: widen it and step in a little.
function Fit() {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const tall = size.width < size.height;
    cam.fov = tall ? 50 : 35;
    cam.position.z = tall ? 5.4 : CAM_Z;
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return null;
}

// The dark between beats: night, dark green down the lattice's last stretch, near black with
// a hint of magenta in the cages, glowing pink as they blow out, a deep navy as the screen breaks.
function Backdrop({ flight }: { flight: MotionValue<number> }) {
  const { scene } = useThree();
  const night = useMemo(() => new THREE.Color(VOID), []), moss = useMemo(() => new THREE.Color("#03160C"), []);
  const rose = useMemo(() => new THREE.Color("#160310"), []), hot = useMemo(() => new THREE.Color("#B8285A"), []), navy = useMemo(() => new THREE.Color("#060B2A"), []);
  useEffect(() => {
    scene.background = night.clone();
    scene.fog = new THREE.Fog(VOID, 10, 62);
  }, [scene, night]);
  useFrame(() => {
    const f = flight.get();
    const [a, b] = BEATS.lattice;
    const g = f < b ? ramp([a + (b - a) * 0.62, a + (b - a) * 0.74], f) : 0;
    const c = f >= BEATS.cages[0] && f < BEATS.room[0] ? 1 : 0;
    const n = within([BEATS.shatter[0] + 0.01, BEATS.lift[1] - 0.012], f, 0.012);
    (scene.background as THREE.Color).copy(night).lerp(moss, g).lerp(rose, c).lerp(hot, 0.2 * cagesHot(f) * c).lerp(navy, n);
    (scene.fog as THREE.Fog).color.copy(scene.background as THREE.Color);
  });
  return null;
}

// What the visor, the beams and the glass reflect: a warm key and a lapis wash, rendered once.
// The tunnels' colours reach the metal through their own lights (Tunnels.tsx).
function Reflections() {
  return (
    <Environment resolution={128} frames={1}>
      <Lightformer form="rect" intensity={3} position={[-4, 3, 4]} scale={[6, 6, 1]} color="#FFE6CC" />
      <Lightformer form="rect" intensity={1.6} position={[5, -1, 2]} scale={[5, 8, 1]} color="#3B66FF" />
      <Lightformer form="ring" intensity={1.2} position={[0, 2, -8]} scale={6} color="#9DB4FF" />
    </Environment>
  );
}

// Strong rainbow fringing in the tunnels, like Lusion's; a hair of it elsewhere. Bloom swells
// into the flash.
function Grade({ flight, phone }: { flight: MotionValue<number>; phone: boolean }) {
  const fringe = useRef<ChromaticAberrationEffect>(null), bloom = useRef<BloomEffect>(null);
  const offset = useMemo(() => new THREE.Vector2(0.0008, 0.0008), []);
  useFrame(() => {
    const f = flight.get();
    const tunnels = within(BEATS.lattice, f) + 0.8 * within(BEATS.cages, f);
    const s = 0.0006 + 0.0011 * within(BEATS.fall, f) + 0.0055 * tunnels + 0.003 * within([BEATS.shatter[0], BEATS.wave[0] + 0.02], f);
    fringe.current?.offset.set(s, s * 0.7);
    if (bloom.current) bloom.current.intensity = 1.1 + 2.6 * ramp([BEATS.cages[0] + 0.06, BEATS.flash[0] + 0.02], f) * (1 - ramp([BEATS.flash[0] + 0.03, BEATS.room[0] + 0.03], f));
  });
  return (
    <EffectComposer multisampling={phone ? 0 : 4}>
      <Bloom ref={bloom} mipmapBlur luminanceThreshold={0.95} luminanceSmoothing={0.2} intensity={1.1} />
      <ChromaticAberration ref={fringe} offset={offset} radialModulation modulationOffset={0.35} />
    </EffectComposer>
  );
}

// The sun, the lapis fill and the reflections: full over Earth, dim down the tunnels so he and
// the metal read as grey shapes lit by the glints, like Lusion's, and back for the end.
function Lights({ flight }: { flight: MotionValue<number> }) {
  const { scene } = useThree();
  const sun = useRef<THREE.DirectionalLight>(null), fill = useRef<THREE.DirectionalLight>(null);
  useFrame(() => {
    const f = flight.get();
    const tunnels = within([BEATS.lattice[0], BEATS.cages[1]], f, 0.03), dim = 1 - 0.8 * tunnels;
    if (sun.current) sun.current.intensity = 2.8 * dim;
    if (fill.current) fill.current.intensity = 1.1 * dim;
    scene.environmentIntensity = 1 - 0.75 * tunnels;
  });
  return (
    <>
      {/* The sun, from the left and a little in front, as in the reel's orbit shot. */}
      <directionalLight ref={sun} position={[-4, 2, 2.2]} intensity={2.8} color="#FFE6CC" />
      <directionalLight ref={fill} position={[4, -1, 1]} intensity={1.1} color="#5577FF" />
    </>
  );
}

export default function SpaceScene({ flight, grow, active, still, phone }: { flight: MotionValue<number>; grow: MotionValue<number>; active: boolean; still: boolean; phone: boolean }) {
  return (
    <Canvas
      dpr={phone ? [1, 1.5] : [1, 1.5]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, CAM_Z], fov: 35, near: 0.1, far: 220 }}
      gl={{ antialias: false }}
      // The canvas is scaled down to fit the small tablet; measure it unscaled.
      resize={{ offsetSize: true }}
    >
      <Fit />
      <Backdrop flight={flight} />
      <ambientLight intensity={0.22} />
      <Lights flight={flight} />
      <hemisphereLight args={["#000000", "#2A4A9A", 0.5]} />
      <Suspense fallback={null}>
        <Stars flight={flight} still={still} />
        <Earth grow={grow} />
        <Glow flight={flight} />
        <Astronaut flight={flight} still={still} phone={phone} />
        <Cats flight={flight} still={still} phone={phone} />
        <Lattice flight={flight} phone={phone} />
        <Cages flight={flight} phone={phone} />
        <Corridor flight={flight} still={still} phone={phone} />
        <Reflections />
      </Suspense>
      <Grade flight={flight} phone={phone} />
    </Canvas>
  );
}
