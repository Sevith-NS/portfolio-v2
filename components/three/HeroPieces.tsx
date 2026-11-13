"use client";

import { Suspense, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { BallCollider, CylinderCollider, InstancedRigidBodies, Physics, RigidBody, type InstancedRigidBodyProps, type RapierRigidBody } from "@react-three/rapier";
import { EffectComposer, N8AO, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { PIECES } from "@/lib/theme";
import { Smear, type Pointer } from "./Smear";

// The hero: a packed cluster of the connector pieces (scripts/hero/connector.py),
// tumbling in zero gravity, pulled toward the middle of the card, shoved aside by
// the cursor, which also drags a liquid smear through the picture (Smear.tsx).

const MODEL = "/models/connector.glb";
const S = 1.9; // the model spans 2, so a piece spans 3.8
const ARM_R = 0.36 * S;
const ARM_H = 1.0 * S; // collider half-height: centre to arm end
// The cursor's touch, kept subtle like Lusion's (12 Nov): a small hand that moves
// slowly, so pieces ease aside rather than scatter.
const HAND = 1.9; // the cursor's reach
const HAND_STEP = 0.45; // the most the hand moves in a frame
const HAND_EASE = 0.2; // how fast it follows the cursor
const MAX_SPEED = 8; // a piece's top speed, units a second

const FINISH: Record<keyof typeof PIECES, THREE.MeshPhysicalMaterialParameters> = {
  // Toned down on 12 Nov ("it looks too glossy"): satin first, a thin coat on top.
  lapis: { roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.25 },
  oat: { roughness: 0.48, clearcoat: 0.15, clearcoatRoughness: 0.3, sheen: 0.2, sheenColor: new THREE.Color("#ffffff") },
  navy: { roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.26 }, // any glossier and the tube rims read as chrome rings
};

// A repeatable scatter, so the cluster forms the same way every load.
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The cluster's shape: wide and flat on a laptop card, tall on a phone's.
type Fit = { extent: [number, number, number]; pull: [number, number, number]; camera: number };
const WIDE: Fit = { extent: [15, 5.5, 4], pull: [0.3, 0.9, 0.9], camera: 20 };
const TALL: Fit = { extent: [7, 9, 4], pull: [0.9, 0.45, 0.9], camera: 30 };

// Start spread through the cluster's ellipsoid, no two pieces overlapping.
function scatter(count: number, seed: number, [ex, ey, ez]: Fit["extent"]) {
  const r = rng(seed);
  const out: [number, number, number][] = [];
  for (let tries = 0; out.length < count && tries < 20000; tries++) {
    const p: [number, number, number] = [(r() * 2 - 1) * ex, (r() * 2 - 1) * ey, (r() * 2 - 1) * ez];
    if ((p[0] / ex) ** 2 + (p[1] / ey) ** 2 + (p[2] / ez) ** 2 > 1) continue;
    if (out.some((q) => (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2 < 3.4 ** 2)) continue;
    out.push(p);
  }
  return out;
}

const ARMS = [
  <CylinderCollider key="y" args={[ARM_H, ARM_R]} friction={0.2} restitution={0.15} />,
  <CylinderCollider key="x" args={[ARM_H, ARM_R]} rotation={[0, 0, Math.PI / 2]} friction={0.2} restitution={0.15} />,
  <CylinderCollider key="z" args={[ARM_H, ARM_R]} rotation={[Math.PI / 2, 0, 0]} friction={0.2} restitution={0.15} />,
];

function Cluster({ pointer, count, fit }: { pointer: RefObject<Pointer>; count: number; fit: Fit }) {
  const { nodes } = useGLTF(MODEL) as unknown as { nodes: Record<string, THREE.Mesh> };
  const geometry = useMemo(() => {
    const g = Object.values(nodes).find((n) => (n as THREE.Mesh).isMesh)!.geometry.clone();
    g.scale(S, S, S);
    return g;
  }, [nodes]);
  const materials = useMemo(
    () => (Object.keys(PIECES) as (keyof typeof PIECES)[]).map((k) => new THREE.MeshPhysicalMaterial({ color: PIECES[k], ...FINISH[k] })),
    [],
  );
  // Each colour is its own group of bodies; together they make one cluster.
  const groups = useMemo(() => {
    const spots = scatter(count, 7, fit.extent);
    const r = rng(11);
    return materials.map((_, c) =>
      spots
        .filter((_, i) => i % materials.length === c)
        .map<InstancedRigidBodyProps>((position, i) => ({ key: `${c}-${i}`, position, rotation: [r() * 6.28, r() * 6.28, r() * 6.28] })),
    );
  }, [count, materials, fit]);
  // Each piece's own slow spin, so the cluster keeps tumbling.
  const spins = useMemo(() => {
    const r = rng(23);
    return Array.from({ length: count }, () => new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).normalize());
  }, [count]);

  const bodies = [useRef<RapierRigidBody[]>(null), useRef<RapierRigidBody[]>(null), useRef<RapierRigidBody[]>(null)];
  const hand = useRef<RapierRigidBody>(null);
  const handAt = useRef(new THREE.Vector3(0, 0, -14));
  const pull = useMemo(() => new THREE.Vector3(), []);
  const spin = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const reach = useMemo(() => new THREE.Vector3(), []);
  const { camera, viewport } = useThree();

  useFrame((_, dt) => {
    const step = Math.min(dt, 1 / 30);
    let n = 0;
    for (const group of bodies) {
      for (const body of group.current ?? []) {
        const p = body.translation();
        const m = body.mass();
        // Pulled toward the middle, weaker sideways so the cluster spreads across the
        // card, and harder once a piece is knocked out past the cluster's edge.
        const [ex, ey, ez] = fit.extent;
        const out = Math.max(0, Math.hypot(p.x / ex, p.y / ey, p.z / ez) - 1);
        pull.set(-p.x * fit.pull[0], -p.y * fit.pull[1], -p.z * fit.pull[2]).multiplyScalar(m * step * (2.4 + out * 9));
        body.applyImpulse(pull, true);
        spin.copy(spins[n++ % spins.length]).multiplyScalar(m * step * 1.1);
        body.applyTorqueImpulse(spin, true);
        // A shove moves a piece, it never launches it out of the card.
        const v = body.linvel();
        const speed = Math.hypot(v.x, v.y, v.z);
        if (speed > MAX_SPEED) body.setLinvel({ x: (v.x / speed) * MAX_SPEED, y: (v.y / speed) * MAX_SPEED, z: (v.z / speed) * MAX_SPEED }, true);
      }
    }
    // The hand follows the cursor on the plane through the cluster's middle, and
    // sinks behind it when the cursor leaves, so it never snaps through the pieces.
    // Its speed is capped, so a fast flick pushes hard but doesn't teleport.
    const p = pointer.current;
    const vp = viewport.getCurrentViewport(camera, [0, 0, 0]);
    target.set((p.x - 0.5) * vp.width, (p.y - 0.5) * vp.height, p.inside ? 0 : -14);
    const at = handAt.current;
    reach.copy(target).sub(at).multiplyScalar(p.inside ? HAND_EASE : 0.08);
    if (reach.length() > HAND_STEP) reach.setLength(HAND_STEP);
    at.add(reach);
    hand.current?.setNextKinematicTranslation(at);
  });

  return (
    <>
      {groups.map((instances, c) => (
        <InstancedRigidBodies
          key={c}
          ref={bodies[c]}
          instances={instances}
          colliders={false}
          colliderNodes={ARMS}
          linearDamping={1.2}
          angularDamping={0.8}
        >
          <instancedMesh args={[geometry, materials[c], instances.length]} frustumCulled={false} />
        </InstancedRigidBodies>
      ))}
      <RigidBody ref={hand} type="kinematicPosition" colliders={false} position={[0, 0, -14]}>
        <BallCollider args={[HAND]} />
      </RigidBody>
    </>
  );
}

// Strip lights reflected in the plastic, like a product shot. No image map needed.
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={2.6} position={[0, 9, 7]} scale={[34, 2.4, 1]} />
      <Lightformer form="rect" intensity={1.8} position={[-13, 2, 9]} scale={[3, 18, 1]} />
      <Lightformer form="rect" intensity={1} position={[13, -1, 8]} scale={[2.4, 14, 1]} />
      <Lightformer form="circle" intensity={0.4} position={[0, -9, 6]} scale={10} />
    </Environment>
  );
}

export default function HeroPieces({
  pointer,
  active,
  still,
  phone,
  background,
  night,
}: {
  pointer: RefObject<Pointer>;
  active: boolean;
  still: boolean;
  phone: boolean;
  background: string;
  night: boolean;
}) {
  const z = (phone ? TALL : WIDE).camera;
  return (
    <Canvas
      flat
      dpr={phone ? [1, 1.25] : [1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, z], fov: 26, near: 1, far: 80 }}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={[background]} />
      {/* Pieces at the back sink into the card's own colour, as Lusion's sink into the dark. */}
      <fog attach="fog" args={[background, z - 4, z + 14]} />
      <ambientLight intensity={0.08} />
      <directionalLight position={[-8, 12, 10]} intensity={1.4} />
      <directionalLight position={[10, -4, 6]} intensity={0.3} />
      <Studio />
      <Suspense fallback={null}>
        <Physics gravity={[0, 0, 0]} timeStep="vary" paused={still || !active}>
          <Cluster pointer={pointer} count={phone ? 24 : 51} fit={phone ? TALL : WIDE} />
        </Physics>
      </Suspense>
      <EffectComposer multisampling={phone ? 2 : 4} enableNormalPass={false}>
        <N8AO aoRadius={2.6} intensity={2.6} distanceFalloff={0.6} quality={phone ? "performance" : "medium"} halfRes={phone} />
        {/* Under reduced motion the pointer is never fed, so the trail stays empty. */}
        <Smear pointer={pointer} />
        {/* Lusion's darkened edges: deeper on the night card, gentle on the oat one. */}
        <Vignette offset={0.22} darkness={night ? 0.78 : 0.42} />
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      </EffectComposer>
    </Canvas>
  );
}

useGLTF.preload(MODEL);
