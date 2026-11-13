"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { BEATS, ramp } from "../beats";
import { seeded } from "./kit";

// The sky of the opening: stars of its own, the reel's Earth (one Blender still on a clear
// background, scripts/space/web_earth.py) that sinks away once the tablet fills the screen,
// and a soft light behind him. The stars stay as Earth goes, tilt a little as if he looks
// up, then thin out as he falls.

const EARTH_Z = -40;
const EARTH_ASPECT = 16 / 9;

export function Stars({ flight, still }: { flight: MotionValue<number>; still: boolean }) {
  const pts = useRef<THREE.Points>(null);
  const mat = useRef<THREE.PointsMaterial>(null);
  const geo = useMemo(() => {
    const rnd = seeded(11), n = 2600, at = new Float32Array(n * 3), col = new Float32Array(n * 3), v = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      v.set(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1).normalize().multiplyScalar(90);
      at.set([v.x, v.y, v.z], i * 3);
      // Most stars faint, a few bright, a touch of blue or warm in some.
      const b = Math.pow(rnd(), 3) * 0.9 + 0.12, warm = rnd();
      col.set([b * (warm > 0.8 ? 1 : 0.85), b * 0.9, b * (warm < 0.2 ? 1 : 0.85)], i * 3);
    }
    return new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(at, 3)).setAttribute("color", new THREE.BufferAttribute(col, 3));
  }, []);
  useFrame(({ clock }) => {
    const f = flight.get();
    if (pts.current) {
      pts.current.rotation.x = -0.25 * ramp(BEATS.fall, f); // he falls away
      pts.current.rotation.y = still ? 0 : clock.elapsedTime * 0.004;
    }
    if (mat.current) {
      const o = 1 - ramp(BEATS.stars, f);
      mat.current.opacity = o;
      if (pts.current) pts.current.visible = o > 0;
    }
  });
  return (
    <points ref={pts} geometry={geo} position={[0, 0, 6]} renderOrder={-2}>
      <pointsMaterial ref={mat} size={2} sizeAttenuation={false} vertexColors transparent fog={false} depthWrite={false} toneMapped={false} />
    </points>
  );
}

// Earth sinks out of frame while the tablet zooms in (`grow`), gone as it fills the screen.
export function Earth({ grow }: { grow: MotionValue<number> }) {
  const tex = useTexture("/space/earth.webp");
  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
  }, [tex]);
  const mesh = useRef<THREE.Mesh>(null);
  const { camera, size } = useThree();
  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const fov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov);
    const vh = 2 * (camera.position.z - EARTH_Z) * Math.tan(fov / 2);
    const h = Math.max(vh, (vh * size.width) / size.height / EARTH_ASPECT) * 1.02;
    const e = ramp([0.55, 1], grow.get());
    m.scale.set(h * EARTH_ASPECT, h, 1);
    // Sinks with an ease, slower than the stars feel, as if he drifts up and away from it.
    m.position.y = -e * h * 0.62;
    m.visible = e < 1;
  });
  return (
    <mesh ref={mesh} position={[0, 0, EARTH_Z]} renderOrder={-1}>
      <planeGeometry />
      <meshBasicMaterial map={tex} transparent toneMapped={false} fog={false} depthWrite={false} />
    </mesh>
  );
}

// A soft light behind him once Earth has gone, like Lusion's.
export function Glow({ flight }: { flight: MotionValue<number> }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    r.addColorStop(0, "rgba(150,165,210,1)");
    r.addColorStop(0.45, "rgba(80,95,150,0.35)");
    r.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    const f = flight.get();
    if (mat.current) mat.current.opacity = 0.22 * (1 - ramp(BEATS.fall, f));
  });
  return (
    <mesh position={[0, 0.2, -10]} scale={16}>
      <planeGeometry />
      <meshBasicMaterial ref={mat} map={tex} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} toneMapped={false} />
    </mesh>
  );
}
