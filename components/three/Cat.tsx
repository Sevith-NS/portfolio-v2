"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { Box, Label, TOON, type V3 } from "./kit";

// The studio's cats. Cream: all white, blue eyes, Pearl's daughter, chaos in a
// small body. She loafs on the desk by the lamp. Poke her and she jumps down,
// runs two laps of the room, and hops back up as if nothing happened. Simba:
// the big orange tabby. On the studio page he walks up out of the contact card
// and into the room, then loafs on the rug. Poke him and he complains about it,
// ambles off and back, then grooms like it never happened.

type Coat = { fur: string; belly: string; ear: string; eye: string; nose: string; stripe?: string };
export const COATS = {
  cream: { fur: "#F8F6F1", belly: "#FFFFFF", ear: "#F3C7C7", eye: "#7FC0EC", nose: "#EFA0A6" },
  simba: { fur: "#E39A4F", belly: "#FBEBD6", ear: "#EE9C98", eye: "#D9A23A", nose: "#E68A86", stripe: "#B5682A" },
} satisfies Record<string, Coat>;
const WALK = 0.55; // room units per second, strolling in
// A fuss: complain, amble out and back, groom. Seconds.
const GRUMBLE = 2.4, AMBLE = 3, GROOM = 3;
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

function Ear({ side, ear, coat }: { side: 1 | -1; ear: React.RefObject<THREE.Group | null>; coat: Coat }) {
  return (
    <group ref={ear} position={[0.022 * side, 0.03, -0.006]}>
      <group rotation={[0, 0, -0.18 * side]}>
        <mesh position={[0, 0.017, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[0.019, 0.036, 4]} />
          <meshToonMaterial color={coat.fur} gradientMap={TOON} />
        </mesh>
        <mesh position={[0, 0.013, 0.0055]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.0105, 0.024, 4]} />
          <meshToonMaterial color={coat.ear} gradientMap={TOON} />
        </mesh>
      </group>
    </group>
  );
}

// With `entry` (a point just outside the floor), the cat stays hidden until `inside`, then hops up onto the floor and walks home.
// `runs` and `fuss` are counters: each bump starts one run of laps, or one fuss.
export function Cat({ coat = COATS.cream, home, homeYaw, scale = 0.78, runs = 0, fuss = 0, still, entry, inside = true }: { coat?: Coat; home: V3; homeYaw: number; scale?: number; runs?: number; fuss?: number; still: boolean; entry?: V3; inside?: boolean }) {
  const FUR = coat.fur, BELLY = coat.belly, EYE = coat.eye, NOSE = coat.nose;
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const tip = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const legs = useRef<(THREE.Group | null)[]>([]);
  const earL = useRef<THREE.Group>(null), earR = useRef<THREE.Group>(null);
  const bubble = useRef<THREE.Group>(null);

  const lapTime = useMemo(() => LAP.getLength() / SPEED, []);
  const start = useMemo(() => LAP.getPointAt(0), []);
  // Seconds into the current run; null while she's loafing.
  const t = useRef<number | null>(null);
  useEffect(() => {
    if (runs > 0) t.current = still ? null : 0;
  }, [runs, still]);

  const from = useMemo(() => new THREE.Vector3(...home), [home]);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  // Coming in: below the edge, then up onto the floor, then a stroll to `home`.
  const enter = useRef<number | null>(null);
  const [below, edge] = useMemo(() => {
    if (!entry) return [null, null];
    const b = new THREE.Vector3(...entry);
    const dir = new THREE.Vector3(home[0] - b.x, 0, home[2] - b.z).normalize();
    return [b, new THREE.Vector3(b.x + dir.x * 0.35, 0, b.z + dir.z * 0.35)];
  }, [entry, home]);
  const walkTime = edge ? edge.distanceTo(from) / WALK : 0;
  const fussing = useRef<number | null>(null);
  useEffect(() => {
    if (fuss > 0) fussing.current = still ? null : 0;
  }, [fuss, still]);
  // Where he ambles to while he's fussing, and back.
  const away = useMemo(() => new THREE.Vector3(home[0] + 0.32, home[1], home[2] + 0.22), [home]);
  useEffect(() => {
    if (entry && inside) enter.current = still ? null : 0;
  }, [entry, inside, still]);

  useFrame(({ clock }, d) => {
    const g = root.current;
    if (!g) return;
    const now = still ? 0 : clock.elapsedTime;
    let yaw = homeYaw, crouch = -0.046, tuck = 0.16, breathe = 1 + Math.sin(now * 1.3) * 0.045;
    let swing = 0, tailLift = 0.12, curl = 0.15, swish = Math.sin(now * 0.55) * 0.24, nod = Math.sin(now * 0.7) * 0.06;
    let blink = (now % 4.2) / 4.2 > 0.96 ? 0.12 : 1;
    let earBack = 0, look = 0, paw = 0, talking = false;
    g.position.copy(from);
    g.visible = !entry || inside;

    if (enter.current !== null && below && edge) {
      enter.current += d;
      const s = enter.current;
      tuck = 1; breathe = 1; nod = 0; tailLift = 1.2; curl = 0.4;
      if (s < HOP) {
        const k = s / HOP;
        g.position.lerpVectors(below, edge, k);
        g.position.y += Math.sin(k * Math.PI) * 0.16;
        yaw = Math.atan2(edge.x - below.x, edge.z - below.z);
        swing = 0.6;
      } else if (s < HOP + walkTime) {
        g.position.lerpVectors(edge, from, (s - HOP) / walkTime);
        yaw = Math.atan2(from.x - edge.x, from.z - edge.z);
        swing = Math.sin(now * 9) * 0.5;
      } else enter.current = null;
    } else if (fussing.current !== null) {
      fussing.current += d;
      const s = fussing.current;
      if (s < GRUMBLE) {
        // Sat up, ears back, head going, tail lashing: he has a lot to say.
        talking = true;
        crouch = 0; tuck = 1; earBack = -0.45;
        nod = Math.sin(now * 13) * 0.13; look = Math.sin(now * 2.2) * 0.3;
        tailLift = 0.9; swish = Math.sin(now * 7) * 0.4;
      } else if (s < GRUMBLE + AMBLE) {
        const k = (s - GRUMBLE) / AMBLE, out = k < 0.5;
        const a = out ? from : away, b = out ? away : from;
        g.position.lerpVectors(a, b, out ? k * 2 : k * 2 - 1);
        yaw = Math.atan2(b.x - a.x, b.z - a.z);
        tuck = 1; breathe = 1; tailLift = 1.1; curl = 0.4;
        swing = Math.sin(now * 6) * 0.4;
      } else if (s < GRUMBLE + AMBLE + GROOM) {
        // Loafed, licking a raised paw, head dipping side to side.
        paw = -0.9 + Math.sin(now * 5) * 0.2;
        nod = 0.35 + Math.sin(now * 5) * 0.08; look = Math.sin(now * 1.4) * 0.5; blink = 0.15;
      } else fussing.current = null;
    } else if (t.current !== null) {
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
    if (head.current) { head.current.rotation.x = nod; head.current.rotation.y = look; }
    if (bubble.current) bubble.current.visible = talking && Math.sin(now * 9) > -0.6;
    if (tail.current) { tail.current.rotation.x = tailLift; tail.current.rotation.y = swish; }
    if (tip.current) { tip.current.rotation.x = curl; tip.current.rotation.y = swish * 0.7; }
    if (eyes.current) eyes.current.scale.y = blink;
    if (earL.current) earL.current.rotation.x = earBack;
    if (earR.current) earR.current.rotation.x = earBack;
    // Diagonal pairs swing together, like a real trot.
    legs.current.forEach((l, i) => {
      if (!l) return;
      l.scale.y = i === 0 && paw ? 1 : tuck;
      l.rotation.x = i === 0 && paw ? paw : (i === 0 || i === 3 ? 1 : -1) * swing;
    });
  });

  return (
    <group ref={root}>
      {/* What he's saying, as far as pixels can say it. The words go in the cat notes. */}
      <Billboard ref={bubble} position={[0, 0.34, 0]} visible={false}>
        <Box p={[0, 0, -0.004]} s={[0.15, 0.09, 0.006]} c="#F4F1E8" cast={false} />
        <Label text="!?" size={0.07} color="#1A1612" />
      </Billboard>
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
        {/* Tabby stripes: bands over the back and down the sides. */}
        {coat.stripe &&
          [-0.065, -0.035, -0.005, 0.03, 0.06].map((z) => (
            <Box key={z} p={[0, 0.098, z]} s={[z > 0.01 ? 0.08 : 0.09, z > 0.01 ? 0.07 : 0.076, 0.011]} c={coat.stripe!} cast={false} />
          ))}
        <group ref={tail} position={[0, 0.112, -0.079]}>
          <Box p={[0, 0, -0.034]} s={[0.017, 0.017, 0.07]} c={FUR} rough={0.95} />
          {coat.stripe && [-0.02, -0.05].map((z) => <Box key={z} p={[0, 0, z]} s={[0.019, 0.019, 0.01]} c={coat.stripe!} cast={false} />)}
          <group ref={tip} position={[0, 0, -0.066]}>
            <Box p={[0, 0, -0.026]} s={[0.015, 0.015, 0.054]} c={FUR} rough={0.95} />
            <Box p={[0, 0, -0.06]} s={[0.014, 0.014, 0.022]} c={coat.stripe ?? FUR} rough={0.95} />
          </group>
        </group>
        <group ref={head} position={[0, 0.152, 0.086]}>
          <Box p={[0, 0.002, 0]} s={[0.07, 0.062, 0.062]} c={FUR} rough={0.95} />
          {/* the tabby M on the forehead */}
          {coat.stripe && [-0.014, 0, 0.014].map((x) => <Box key={x} p={[x, 0.034, 0.014]} s={[0.007, 0.004, 0.03]} c={coat.stripe!} cast={false} />)}
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
          <Ear side={1} ear={earR} coat={coat} />
          <Ear side={-1} ear={earL} coat={coat} />
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
