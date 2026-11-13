"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerspectiveCamera, RenderTexture, useGLTF } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { BEATS, ramp, span, within } from "../beats";
import { CorridorAstronaut, PANE, SCREEN } from "./Astronaut";
import { CorridorCats } from "./Cats";
import { seeded } from "./kit";

// After the flash, Lusion's blue room and corridor, with his own touch: cat paw outlines. That
// world is drawn into a texture and shown on a screen that fills the view; at the end of the
// corridor it pulls back into a 16:9 screen in the dark, its glass cracks, he pushes through
// toward you (Astronaut.tsx) as the glass flies past, and the screen slides up and away. Then
// glitter, out of focus behind him, for the wave.

const SCREEN_Z = -8;
const CUBE = 1; // the glass cube he floats in, in the room
// The bakes came out light; these deepen them to Lusion's saturated blue (linear multipliers).
const ROOM_TINT = new THREE.Color(0.3, 0.25, 0.9), HALL_TINT = new THREE.Color(0.75, 0.7, 1);
// Tall doorways of white light in the room's four side walls (its inner faces are at ±8).
const DOORS: [number, number, number, number][] = [[-8, 1.5, Math.PI / 2, 3.6], [8, -2, -Math.PI / 2, 3.2], [2.5, -8, 0, 3.6], [-1.5, 8, Math.PI, 3.4]];
const ROOM_URL = "/models/paw_room.glb";
const HALL_URL = "/models/paw_corridor.glb";

// The baked walls (scripts/space/web_corridor.py), drawn exactly as Cycles lit them. Outside
// them the world is pure white, so every slot and arched door glows through.
function useBaked(url: string, tint: THREE.Color) {
  const { scene } = useGLTF(url, "/draco/");
  const root = useMemo(() => {
    const r = scene.clone(true);
    r.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const src = m.material as THREE.MeshStandardMaterial;
      m.material = new THREE.MeshBasicMaterial({ map: src.map, color: tint, toneMapped: false, side: THREE.DoubleSide });
    });
    return r;
  }, [scene, tint]);
  useEffect(() => () => root.traverse((o) => ((o as THREE.Mesh).material as THREE.Material | undefined)?.dispose()), [root]);
  return root;
}

// A cat's paw print as thick flat outlines (the main pad and four toes), like Lusion's shapes on
// its walls. Same proportions as the Blender cutters, in paw units.
function pawOutline() {
  const ring = (x: number, y: number, rx: number, ry: number, w = 0.08) => {
    const s = new THREE.Shape().absellipse(x, y, rx, ry, 0, Math.PI * 2, false, 0);
    s.holes.push(new THREE.Path().absellipse(x, y, rx - w, ry - w, 0, Math.PI * 2, true, 0));
    return s;
  };
  const shapes = [ring(0, -0.16, 0.34, 0.27), ring(-0.33, 0.17, 0.115, 0.115), ring(-0.12, 0.34, 0.12, 0.12), ring(0.12, 0.34, 0.12, 0.12), ring(0.33, 0.17, 0.115, 0.115)];
  return new THREE.ShapeGeometry(shapes, 20);
}

// Where the outlines go in the corridor (its own space: floor y -3, ceiling 3, walls x ±3.5,
// arched doors at z -0.5, -9.5 and on every 9): down the floor and ceiling, and on each wall
// between the doors, a big one low and a small one up high.
function pawSpots() {
  const rnd = seeded(31), o = new THREE.Object3D(), out: THREE.Matrix4[] = [];
  const put = (x: number, y: number, z: number, rx: number, ry: number, turn: number, size: number) => {
    o.position.set(x, y, z);
    o.rotation.set(rx, ry, turn);
    o.scale.setScalar(size);
    o.updateMatrix();
    out.push(o.matrix.clone());
  };
  for (let z = 5; z > -62; z -= 3.4 + rnd() * 1.2) {
    put((rnd() - 0.5) * 3.4, -3, z, -Math.PI / 2, 0, rnd() * 6.28, 1.9 + rnd() * 0.8);
    put((rnd() - 0.5) * 3.4, 3, z - 1.7, Math.PI / 2, 0, rnd() * 6.28, 1.9 + rnd() * 0.8);
  }
  for (let k = 0; k < 7; k++)
    for (const side of [-1, 1]) {
      const z = -(5 + 9 * k);
      put(side * 3.5, 0.1, z + (rnd() - 0.5) * 1.2, 0, -side * (Math.PI / 2), (rnd() - 0.5) * 0.8, 2.2 + rnd() * 0.4);
      put(side * 3.5, 2.35, z + 2 + (rnd() - 0.5), 0, -side * (Math.PI / 2), (rnd() - 0.5) * 1.2, 0.95 + rnd() * 0.2);
    }
  return out;
}

function Paws() {
  const geo = useMemo(pawOutline, []), spots = useMemo(pawSpots, []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#CDD1EC", toneMapped: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), []);
  const mesh = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    spots.forEach((m, i) => mesh.current!.setMatrixAt(i, m));
    mesh.current!.instanceMatrix.needsUpdate = true;
    return () => {
      geo.dispose();
      mat.dispose();
    };
  }, [spots, geo, mat]);
  return <instancedMesh ref={mesh} args={[geo, mat, spots.length]} frustumCulled={false} />;
}

// The world on the screen. The room: from the flash the camera rushes round the glass cube he
// floats in, spinning fast and settling as it closes in, and dives into it, like Lusion's.
// Then the corridor, where the camera holds exactly where the page's camera is, so he can walk
// out of the screen. `lens` is this world's own camera: inside a render texture, useThree() can
// hand back the page's.
function World({ flight, still, phone, lens }: { flight: MotionValue<number>; still: boolean; phone: boolean; lens: React.RefObject<THREE.PerspectiveCamera | null> }) {
  const roomWalls = useBaked(ROOM_URL, ROOM_TINT), hallWalls = useBaked(HALL_URL, HALL_TINT);
  const { size } = useThree();
  const room = useRef<THREE.Group>(null), cube = useRef<THREE.Group>(null), hall = useRef<THREE.Group>(null);
  useFrame(() => {
    const f = flight.get();
    const inHall = f >= BEATS.corridor[0];
    const u = span([BEATS.room[0], BEATS.corridor[0]], f), v = span([BEATS.corridor[0], BEATS.shatter[0]], f);
    if (room.current) room.current.visible = !inHall;
    if (hall.current) {
      hall.current.visible = inHall;
      hall.current.position.z = v * 10;
    }
    if (cube.current) cube.current.rotation.set(u * 2, u * 3, u * 1.5);
    const cam = lens.current;
    if (!cam) return;
    const tall = size.width < size.height, base = tall ? 50 : 35;
    if (!inHall) {
      // The rush: round and round the cube, closing in, the view rolling, then into it.
      const e = u * u * (3 - 2 * u), turn = 1 - (1 - u) * (1 - u);
      const r = 0.3 + 6.4 * Math.pow(1 - u, 0.6);
      const a = 0.5 + turn * Math.PI * 2.4;
      cam.position.set(Math.sin(a) * r, Math.sin(u * 5) * 1.4 * (1 - e), Math.cos(a) * r);
      cam.lookAt(0, 0, 0);
      cam.rotateZ(turn * Math.PI * 1.6);
      cam.fov = base + 22 * (1 - e * 0.5);
    } else {
      cam.position.set(0, 0, tall ? 5.4 : 6);
      cam.rotation.set(0, 0, 0);
      cam.fov = base;
    }
    cam.updateProjectionMatrix();
  });
  return (
    <>
      <color attach="background" args={["#FFFFFF"]} />
      {/* Light for him, the cats and the outlines; the walls carry their own baked light. */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <hemisphereLight args={["#FFFFFF", "#2440E8", 0.8]} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 4]} scale={[8, 4, 1]} color="#FFFFFF" />
        <Lightformer form="rect" intensity={2} position={[-5, 0, 0]} scale={[4, 8, 1]} color="#2440E8" />
      </Environment>
      <group ref={room}>
        <primitive object={roomWalls} />
        {DOORS.map(([x, z, turn, w], i) => (
          <mesh key={i} position={[x - Math.sign(x) * 0.02, -8 + 3.3, z - Math.sign(z) * 0.02]} rotation={[0, turn, 0]}>
            <planeGeometry args={[w, 6.6]} />
            <meshBasicMaterial color="#FFFFFF" toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        ))}
        <group ref={cube}>
          <mesh>
            <boxGeometry args={[CUBE, CUBE, CUBE]} />
            <meshStandardMaterial color="#CFE0FF" emissive="#8FB2FF" emissiveIntensity={0.7} transparent opacity={0.26} />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(CUBE, CUBE, CUBE)]} />
            <lineBasicMaterial color="#FFFFFF" />
          </lineSegments>
          <pointLight intensity={4} distance={4} color="#FFFFFF" />
        </group>
      </group>
      <group ref={hall}>
        <primitive object={hallWalls} />
        <Paws />
      </group>
      <CorridorAstronaut flight={flight} still={still} />
      <CorridorCats flight={flight} still={still} phone={phone} />
    </>
  );
}

// ---- the screen ----
const SCREEN_VERT = /* glsl */ `
uniform vec2 uScale;
uniform float uCrop;
varying vec2 vUv;
void main() {
  vUv = vec2(0.5 + (uv.x - 0.5) * uCrop, uv.y);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x * uScale.x * uCrop, position.y * uScale.y, 0.0, 1.0);
}`;
const SCREEN_FRAG = /* glsl */ `
uniform sampler2D uMap;
uniform float uSpin;
uniform float uZoom;
uniform float uCrack;
uniform float uAspect;
uniform float uPx;
varying vec2 vUv;
float hash(float n) { return fract(sin(n * 12.9898) * 43758.5453); }
float seg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0));
}
void main() {
  vec2 c = vUv - 0.5;
  vec3 col = texture2D(uMap, vUv).rgb;
  // The room's speed: smeared round the middle and out from it. A per-pixel offset to the taps
  // turns their banding into fine grain.
  if (uSpin + uZoom > 0.001) {
    float j = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    col = vec3(0.0);
    for (int k = 0; k < 12; k++) {
      float s = (float(k) + j) / 12.0 - 0.5, a = uSpin * s;
      col += texture2D(uMap, vec2(c.x * cos(a) - c.y * sin(a), c.x * sin(a) + c.y * cos(a)) * (1.0 + uZoom * s) + 0.5).rgb;
    }
    col /= 12.0;
  }
  // The glass cracking from where his hands meet it: thin lines running out, a web between them.
  if (uCrack > 0.0) {
    vec2 p = vec2(c.x * uAspect, c.y - 0.06);
    float d = 1e3;
    for (int i = 0; i < 12; i++) {
      float fi = float(i);
      float a0 = (fi + hash(fi) * 0.7) / 12.0 * 6.2832, a1 = a0 + (hash(fi + 7.0) - 0.5) * 0.5;
      vec2 m = vec2(cos(a0), sin(a0)) * (0.1 + hash(fi + 3.0) * 0.18);
      vec2 e = m + vec2(cos(a1), sin(a1)) * (0.35 + hash(fi + 5.0) * 0.7);
      d = min(d, min(seg(p, vec2(0.0), m), seg(p, m, e)));
      float an = (fi + 1.0 + hash(fi + 1.0) * 0.7) / 12.0 * 6.2832;
      vec2 mn = vec2(cos(an), sin(an)) * (0.1 + hash(fi + 4.0) * 0.18);
      if (hash(fi + 9.0) > 0.35) d = min(d, seg(p, m * 0.75, mn * 0.75));
    }
    col = mix(col, vec3(0.92, 0.96, 1.0), (1.0 - smoothstep(0.0, uPx * 1.6, d)) * step(length(p), uCrack * 1.3) * 0.75);
  }
  gl_FragColor = vec4(col, 1.0);
}`;

// Glass breaking off the screen and flying past him, blue, violet and teal, gone as he lands.
const TINTS = ["#5B7BFF", "#8C62FF", "#46D2E8", "#C9D6FF"].map((c) => new THREE.Color(c));
function Glass({ flight, phone, half }: { flight: MotionValue<number>; phone: boolean; half: THREE.Vector2 }) {
  const n = phone ? 80 : 160;
  const bits = useMemo(() => {
    const rnd = seeded(13);
    return Array.from({ length: n }, () => {
      const x = rnd() * 2 - 1, y = rnd() * 2 - 1;
      return {
        x,
        y,
        vel: new THREE.Vector3(x * (2 + rnd() * 5), y * (1.5 + rnd() * 3.5), 4 + rnd() * 8),
        axis: new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(),
        spin: 1.5 + rnd() * 5,
        size: 0.15 + Math.pow(rnd(), 2) * 1.1,
        delay: rnd() * 0.12,
        tint: TINTS[Math.floor(rnd() * TINTS.length)],
      };
    });
  }, [n]);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0.6, 0, -0.5, -0.4, 0, 0.55, -0.3, 0], 3));
    g.computeVertexNormals();
    return g;
  }, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ metalness: 0.5, roughness: 0.12, transparent: true, opacity: 0.55, side: THREE.DoubleSide, emissive: "#1A2470", emissiveIntensity: 0.6 }), []);
  const mesh = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    bits.forEach((b, i) => mesh.current!.setColorAt(i, b.tint));
    mesh.current!.instanceColor!.needsUpdate = true;
    return () => {
      geo.dispose();
      mat.dispose();
    };
  }, [bits, geo, mat]);
  const m = useMemo(() => new THREE.Matrix4(), []), q = useMemo(() => new THREE.Quaternion(), []), p = useMemo(() => new THREE.Vector3(), []), s = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }) => {
    const f = flight.get(), x = mesh.current;
    if (!x) return;
    const [a, b] = [BEATS.shatter[0] + 0.004, BEATS.land[1]];
    x.visible = f > a && f < b;
    if (!x.visible) return;
    const t = span([a, b], f);
    bits.forEach((bit, i) => {
      const u = Math.max(0, (t - bit.delay) / (1 - bit.delay));
      p.set(bit.x * half.x, bit.y * half.y, SCREEN_Z + 0.05).addScaledVector(bit.vel, u * 1.4);
      q.setFromAxisAngle(bit.axis, u * bit.spin);
      const gone = u <= 0 || p.z > camera.position.z - 0.3;
      m.compose(p, q, s.setScalar(gone ? 0 : bit.size * Math.min(1, u * 8)));
      x.setMatrixAt(i, m);
    });
    x.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[geo, mat, n]} frustumCulled={false} visible={false} />;
}

// Out-of-focus glitter behind him at the end, like Lusion's: soft flecks of glass catching the
// light on one edge, a few star glints and small plus marks.
const GLITTER_VERT = /* glsl */ `
attribute vec2 aDot;
uniform float uTime;
varying vec2 vUv;
varying vec2 vDot;
void main() {
  vUv = uv;
  vDot = aDot;
  vec4 p = instanceMatrix * vec4(position, 1.0);
  p.xy += vec2(sin(uTime * 0.21 + aDot.x * 40.0), cos(uTime * 0.17 + aDot.x * 30.0)) * 0.12;
  gl_Position = projectionMatrix * modelViewMatrix * p;
}`;
const GLITTER_FRAG = /* glsl */ `
uniform float uOn;
uniform float uTime;
varying vec2 vUv;
varying vec2 vDot;
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float seed = vDot.x, a = 0.0;
  vec3 col = vec3(1.0);
  if (vDot.y < 0.5) {
    float r = length(p), disc = 1.0 - smoothstep(0.7, 1.0, r);
    vec2 lit = vec2(cos(seed * 6.283), sin(seed * 6.283));
    float rim = smoothstep(0.35, 0.95, r) * disc * max(0.0, dot(normalize(p + 1e-4), lit));
    a = disc * 0.1 + rim * 0.55;
    col = mix(vec3(0.72, 0.8, 1.0), vec3(1.0), rim);
  } else if (vDot.y < 1.5) {
    float twinkle = 0.4 + 0.6 * (0.5 + 0.5 * sin(uTime * (1.5 + seed * 2.0) + seed * 30.0));
    float rays = exp(-abs(p.x) * 40.0) * (1.0 - abs(p.y)) + exp(-abs(p.y) * 40.0) * (1.0 - abs(p.x));
    a = (rays * 0.9 + exp(-dot(p, p) * 30.0)) * twinkle;
  } else {
    a = (abs(p.x) < 0.07 && abs(p.y) < 0.8) || (abs(p.y) < 0.07 && abs(p.x) < 0.8) ? 0.6 : 0.0;
  }
  a *= uOn;
  gl_FragColor = vec4(col * a, a);
}`;

function Glitter({ flight, phone }: { flight: MotionValue<number>; phone: boolean }) {
  const dots = useMemo(() => {
    const rnd = seeded(17), o = new THREE.Object3D(), mats: THREE.Matrix4[] = [], meta: number[] = [];
    const add = (kind: number, size: number) => {
      const z = -3 - rnd() * 11, reach = (6 - z) * 0.22; // spread over the part of the view you see at its depth
      o.position.set((rnd() * 2 - 1) * reach * 2.2, (rnd() * 2 - 1) * reach, z);
      o.rotation.set(0, 0, rnd() * 6.28);
      o.scale.setScalar(size);
      o.updateMatrix();
      mats.push(o.matrix.clone());
      meta.push(rnd(), kind);
    };
    for (let i = 0, n = phone ? 40 : 70; i < n; i++) add(0, 0.25 + rnd() * 0.4);
    for (let i = 0; i < 6; i++) add(1, 0.8 + rnd() * 0.6);
    for (let i = 0; i < 10; i++) add(2, 0.12);
    return { mats, meta };
  }, [phone]);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1);
    g.setAttribute("aDot", new THREE.InstancedBufferAttribute(new Float32Array(dots.meta), 2));
    return g;
  }, [dots]);
  const mat = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: GLITTER_VERT, fragmentShader: GLITTER_FRAG, uniforms: { uOn: { value: 0 }, uTime: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
    [],
  );
  const mesh = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    dots.mats.forEach((m, i) => mesh.current!.setMatrixAt(i, m));
    mesh.current!.instanceMatrix.needsUpdate = true;
    return () => {
      geo.dispose();
      mat.dispose();
    };
  }, [dots, geo, mat]);
  useFrame(({ clock }) => {
    const on = ramp([BEATS.wave[0], BEATS.wave[0] + 0.03], flight.get());
    if (mesh.current) mesh.current.visible = on > 0;
    mat.uniforms.uOn.value = on;
    mat.uniforms.uTime.value = clock.elapsedTime;
  });
  return <instancedMesh ref={mesh} args={[geo, mat, dots.mats.length]} frustumCulled={false} visible={false} />;
}

export function Corridor({ flight, still, phone }: { flight: MotionValue<number>; still: boolean; phone: boolean }) {
  const uniforms = useMemo(
    () => ({ uMap: { value: null as THREE.Texture | null }, uScale: { value: new THREE.Vector2(1, 1) }, uCrop: { value: 1 }, uSpin: { value: 0 }, uZoom: { value: 0 }, uCrack: { value: 0 }, uAspect: { value: 1 }, uPx: { value: 0.001 } }),
    [],
  );
  const pane = useRef<THREE.Mesh>(null);
  const lens = useRef<THREE.PerspectiveCamera>(null);
  const half = useMemo(() => new THREE.Vector2(1, 1), []); // the screen's half size once pulled back, for the glass
  const { camera, size, viewport, gl } = useThree();
  // Only draw the world into its texture while it's on screen.
  const [live, setLive] = useState(false);
  useFrame(() => {
    const f = flight.get();
    const on = f > BEATS.room[0] - 0.01 && f < BEATS.lift[1];
    if (on !== live) setLive(on);
    const m = pane.current;
    if (!m) return;
    m.visible = on;
    if (!on) return;
    // Exactly fills the view at its depth, then pulls back into a 16:9 screen (on a wide view),
    // cracks, and slides straight up out of frame.
    const cam = camera as THREE.PerspectiveCamera;
    const h = 2 * (cam.position.z - SCREEN_Z) * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2), aspect = size.width / size.height;
    const k = (m.material as THREE.ShaderMaterial).uniforms; // the material's own copy of the uniforms
    // At full zoom the tablet shows only the middle of this canvas, magnified (Space.tsx), so the
    // screen pulls back to PANE of the part you can see.
    const seen = Math.min(1, window.innerHeight / gl.domElement.getBoundingClientRect().height);
    SCREEN.scale = PANE * seen;
    const back = ramp(BEATS.screen, f), crop = 1 + (Math.min(1, 16 / 9 / aspect) - 1) * back, away = ramp(BEATS.lift, f);
    k.uScale.value.set(h * aspect, h);
    k.uCrop.value = crop;
    k.uAspect.value = aspect * crop;
    m.scale.setScalar(1 + (SCREEN.scale - 1) * back);
    m.position.set(0, h * seen * 1.05 * away, SCREEN_Z);
    k.uPx.value = seen / (size.height * m.scale.y);
    half.set((h * aspect * crop * m.scale.x) / 2, (h * m.scale.y) / 2);
    k.uCrack.value = ramp([BEATS.shatter[0] - 0.002, BEATS.shatter[0] + 0.016], f);
    k.uSpin.value = f < BEATS.corridor[0] ? 0.3 * (1 - ramp([BEATS.room[0] + 0.005, BEATS.room[0] + 0.06], f)) : 0;
    k.uZoom.value = 0.3 * within([BEATS.corridor[0] - 0.002, BEATS.corridor[0] + 0.002], f, 0.003);
  });
  return (
    <>
      <mesh ref={pane} frustumCulled={false} visible={false}>
        <planeGeometry />
        <shaderMaterial vertexShader={SCREEN_VERT} fragmentShader={SCREEN_FRAG} uniforms={uniforms} toneMapped={false}>
          {/* Three-quarter resolution: the corridor is mostly flat colour, and it saves a lot. */}
          <RenderTexture attach="uniforms-uMap-value" frames={live ? Infinity : 0} width={Math.round(size.width * viewport.dpr * 0.75)} height={Math.round(size.height * viewport.dpr * 0.75)}>
            {/* The same lens and spot as the page's camera, so he can step off the screen seamlessly. */}
            <PerspectiveCamera ref={lens} makeDefault position={[0, 0, phone ? 5.4 : 6]} fov={phone ? 50 : 35} />
            <World flight={flight} still={still} phone={phone} lens={lens} />
          </RenderTexture>
        </shaderMaterial>
      </mesh>
      <Glass flight={flight} phone={phone} half={half} />
      <Glitter flight={flight} phone={phone} />
    </>
  );
}

useGLTF.preload(ROOM_URL, "/draco/");
useGLTF.preload(HALL_URL, "/draco/");
