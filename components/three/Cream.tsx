"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box, type V3 } from "./kit";

// Cream: all white, blue eyes, Pearl's daughter, chaos in a small body. She
// loafs on the desk by the lamp. Poke her and she jumps down, runs two laps of
// the room, and hops back up as if nothing happened.

const FUR = "#F8F6F1", BELLY = "#FFFFFF", EAR = "#F3C7C7", EYE = "#7FC0EC", NOSE = "#EFA0A6";
const SPEED = 1.35; // room units per second
const LAPS = 2;
const HOP = 0.45; // seconds for each jump, off the desk and back on

// Her lap: round the rug, past Pearl's cushion, along the gym corner, and back
// in front of the chair. Closed, so the second lap carries straight on.
const LAP = new THREE.CatmullRomCurve3(
  [
    [-0.45, -0.55], [-0.85, 0.05], [-0.45, 0.6], [0.3, 0.85],
    [0.9, 0.5], [0.85, -0.3], [0.45, -0.25], [-0.05, -0.2],
  ].map(([x, z]) => new THREE.Vector3(x, 0, z)),
  true,
  "catmullrom",
  0.5
);

function Ear({ side, ear }: { side: 1 | -1; ear: React.RefObject<THREE.Group | null> }) {
  return (
    <group ref={ear} position={[0.022 * side, 0.03, -0.006]}>
      <group rotation={[0, 0, -0.18 * side]}>
        <mesh position={[0, 0.017, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[0.019, 0.036, 4]} />
          <meshStandardMaterial color={FUR} roughness={0.95} flatShading />
        </mesh>
        <mesh position={[0, 0.013, 0.0055]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.0105, 0.024, 4]} />
          <meshStandardMaterial color={EAR} roughness={0.9} flatShading />
        </mesh>
      </group>
    </group>
  );
}

export function Cream({ home, homeYaw, scale = 0.78, runs, still }: { home: V3; homeYaw: number; scale?: number; runs: number; still: boolean }) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const tip = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const legs = useRef<(THREE.Group | null)[]>([]);
  const earL = useRef<THREE.Group>(null), earR = useRef<THREE.Group>(null);

  const lapTime = useMemo(() => LAP.getLength() / SPEED, []);
  const start = useMemo(() => LAP.getPointAt(0), []);
  // Seconds into the current run; null while she's loafing.
  const t = useRef<number | null>(null);
  useEffect(() => {
    if (runs > 0) t.current = still ? null : 0;
  }, [runs, still]);

  const from = useMemo(() => new THREE.Vector3(...home), [home]);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, d) => {
    const g = root.current;
    if (!g) return;
    const now = still ? 0 : clock.elapsedTime;
    let yaw = homeYaw, crouch = -0.046, tuck = 0.16, breathe = 1 + Math.sin(now * 1.3) * 0.045;
    let swing = 0, tailLift = 0.12, curl = 0.15, swish = Math.sin(now * 0.55) * 0.24, nod = Math.sin(now * 0.7) * 0.06;
    let blink = (now % 4.2) / 4.2 > 0.96 ? 0.12 : 1;
    let earBack = 0;
    g.position.copy(from);

    if (t.current !== null) {
      t.current += d;
      const s = t.current, run = lapTime * LAPS;
      crouch = 0; tuck = 1; breathe = 1; blink = 1; nod = 0;
      tailLift = 1.42; curl = 0.5; swish = Math.sin(now * 6) * 0.14; earBack = -0.4;
      const hop = (a: THREE.Vector3, b: THREE.Vector3, k: number) => {
        g.position.lerpVectors(a, b, k);
        g.position.y += Math.sin(k * Math.PI) * 0.16;
        yaw = Math.atan2(b.x - a.x, b.z - a.z);
        swing = 0.6;
      };
      if (s < HOP) hop(from, start, s / HOP);
      else if (s < HOP + run) {
        const u = ((s - HOP) / lapTime) % 1;
        LAP.getPointAt(u, tmp);
        g.position.copy(tmp);
        g.position.y += Math.abs(Math.sin(now * 16)) * 0.012;
        const tan = LAP.getTangentAt(u);
        yaw = Math.atan2(tan.x, tan.z);
        swing = Math.sin(now * 18) * 0.75;
      } else if (s < HOP * 2 + run) hop(start, from, (s - HOP - run) / HOP);
      else t.current = null;
    }

    g.rotation.y = yaw;
    g.scale.setScalar(scale);
    if (body.current) { body.current.position.y = crouch; body.current.scale.y = breathe; }
    if (head.current) head.current.rotation.x = nod;
    if (tail.current) { tail.current.rotation.x = tailLift; tail.current.rotation.y = swish; }
    if (tip.current) { tip.current.rotation.x = curl; tip.current.rotation.y = swish * 0.7; }
    if (eyes.current) eyes.current.scale.y = blink;
    if (earL.current) earL.current.rotation.x = earBack;
    if (earR.current) earR.current.rotation.x = earBack;
    // Diagonal pairs swing together, like a real trot.
    legs.current.forEach((l, i) => {
      if (!l) return;
      l.scale.y = tuck;
      l.rotation.x = (i === 0 || i === 3 ? 1 : -1) * swing;
    });
  });

  return (
    <group ref={root}>
      {([[-0.027, 0.052], [0.027, 0.052], [-0.03, -0.058], [0.03, -0.058]] as const).map(([x, z], i) => (
        <group key={i} ref={(n) => void (legs.current[i] = n)} position={[x, 0.06, z]}>
          <Box p={[0, -0.027, 0]} s={[0.022, 0.054, 0.025]} c={FUR} rough={0.95} />
          <Box p={[0, -0.053, 0.003]} s={[0.024, 0.014, 0.03]} c={BELLY} rough={0.95} cast={false} />
        </group>
      ))}
      <group ref={body}>
        <Box p={[0, 0.095, -0.03]} s={[0.086, 0.072, 0.1]} c={FUR} rough={0.95} />
        <Box p={[0, 0.093, 0.045]} s={[0.076, 0.066, 0.072]} c={FUR} rough={0.95} />
        <Box p={[0.034, 0.082, -0.05]} s={[0.03, 0.06, 0.066]} c={FUR} rough={0.95} />
        <Box p={[-0.034, 0.082, -0.05]} s={[0.03, 0.06, 0.066]} c={FUR} rough={0.95} />
        <Box p={[0, 0.066, 0.064]} s={[0.058, 0.038, 0.05]} c={BELLY} rough={0.95} />
        <group ref={tail} position={[0, 0.112, -0.079]}>
          <Box p={[0, 0, -0.034]} s={[0.017, 0.017, 0.07]} c={FUR} rough={0.95} />
          <group ref={tip} position={[0, 0, -0.066]}>
            <Box p={[0, 0, -0.026]} s={[0.015, 0.015, 0.054]} c={FUR} rough={0.95} />
            <Box p={[0, 0, -0.06]} s={[0.014, 0.014, 0.022]} c={FUR} rough={0.95} />
          </group>
        </group>
        <group ref={head} position={[0, 0.152, 0.086]}>
          <Box p={[0, 0.002, 0]} s={[0.07, 0.062, 0.062]} c={FUR} rough={0.95} />
          <Box p={[0, -0.016, 0.006]} s={[0.086, 0.034, 0.05]} c={FUR} rough={0.95} />
          <Box p={[0, -0.017, 0.034]} s={[0.036, 0.024, 0.018]} c={BELLY} rough={0.95} cast={false} />
          <Box p={[0, -0.006, 0.044]} s={[0.012, 0.008, 0.006]} c={NOSE} rough={0.6} cast={false} />
          {([1, -1] as const).flatMap((side) =>
            [0.004, -0.004].map((dy, i) => (
              <mesh key={`${side}${i}`} position={[0.034 * side, -0.016 + dy, 0.038]} rotation={[0, 0, dy * 18 * side]}>
                <boxGeometry args={[0.036, 0.0016, 0.0016]} />
                <meshBasicMaterial color="#EDE8DF" />
              </mesh>
            ))
          )}
          <Ear side={1} ear={earR} />
          <Ear side={-1} ear={earL} />
          <group ref={eyes} position={[0, 0.007, 0]}>
            {([1, -1] as const).map((side) => (
              <group key={side} position={[0.017 * side, 0, 0.031]}>
                <Box p={[0, 0, 0]} s={[0.015, 0.014, 0.004]} c={EYE} rough={0.3} cast={false} />
                <Box p={[0, 0, 0.0025]} s={[0.0045, 0.011, 0.002]} c="#15110E" rough={0.3} cast={false} />
                <Box p={[0.003, 0.003, 0.0038]} s={[0.003, 0.003, 0.001]} c="#FFFFFF" cast={false} />
              </group>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}
