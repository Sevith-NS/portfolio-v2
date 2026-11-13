"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { light } from "@/lib/theme";

// The reel card, drawn on a fixed full-screen canvas so it can grow out of its slot
// under the intro into the whole screen. Its rect runs from the slot's to the pinned
// stage's as `progress` goes 0 to 1; on the way it bends like a sheet of paper, and
// its lapis duotone gives way to full colour. Pixel units: the camera is orthographic.

const VERT = /* glsl */ `
uniform float uBend;
uniform float uTime;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  // A travelling wave across the card, strongest mid-growth, gone once it locks.
  float wave = sin(uv.x * 3.14159 * 1.2 + uTime * 0.6);
  p.y += uBend * 0.08 * wave * (0.6 + 0.4 * uv.y);
  p.x += uBend * 0.03 * sin(uv.y * 3.14159);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const FRAG = /* glsl */ `
uniform sampler2D map;
uniform float uColour;
uniform vec2 uSize;
uniform float uRadius;
uniform float uVideoAspect;
uniform vec3 uDark;
uniform vec3 uLight;
varying vec2 vUv;
void main() {
  // Cover the card with the video, whatever its shape.
  float a = uSize.x / uSize.y;
  vec2 uv = vUv - 0.5;
  if (a > uVideoAspect) uv.y *= uVideoAspect / a; else uv.x *= a / uVideoAspect;
  vec3 c = texture2D(map, uv + 0.5).rgb;
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  vec3 duo = mix(uDark, uLight, smoothstep(0.04, 0.9, l));
  vec3 col = mix(duo, c, uColour);
  // Rounded corners while it's a card, square once it fills the screen.
  vec2 q = abs((vUv - 0.5) * uSize) - (uSize * 0.5 - uRadius);
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius; // inside counts as negative, or a square card goes half clear
  gl_FragColor = vec4(col, 1.0 - smoothstep(-1.0, 1.0, d));
  #include <colorspace_fragment>
}
`;

function Card({ slot, stage, progress, video }: { slot: RefObject<HTMLElement | null>; stage: RefObject<HTMLElement | null>; progress: MotionValue<number>; video: HTMLVideoElement }) {
  const mesh = useRef<THREE.Mesh>(null);
  const size = useThree((s) => s.size);
  const material = useMemo(() => {
    const map = new THREE.VideoTexture(video);
    map.colorSpace = THREE.SRGBColorSpace;
    return new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      uniforms: {
        map: { value: map },
        uBend: { value: 0 },
        uTime: { value: 0 },
        uColour: { value: 0 },
        uSize: { value: new THREE.Vector2(1, 1) },
        uRadius: { value: 18 },
        uVideoAspect: { value: 16 / 9 },
        // The duotone, vivid like Lusion's small card: lapis shadows, light-blue lights.
        uDark: { value: new THREE.Color(light.hex("lamp")) },
        uLight: { value: new THREE.Color(light.hex("deck-glow")) },
      },
    });
  }, [video]);
  useEffect(
    () => () => {
      (material.uniforms.map.value as THREE.Texture).dispose();
      material.dispose();
    },
    [material],
  );

  useFrame((_, dt) => {
    const a = slot.current?.getBoundingClientRect();
    const b = stage.current?.getBoundingClientRect();
    const m = mesh.current;
    if (!a || !b || !m) return;
    const p = progress.get();
    const e = p * p * (3 - 2 * p);
    const left = a.left + (b.left - a.left) * e;
    const top = a.top + (b.top - a.top) * e;
    const w = a.width + (b.width - a.width) * e;
    const h = a.height + (b.height - a.height) * e;
    m.scale.set(w, h, 1);
    m.position.set(left + w / 2 - size.width / 2, size.height / 2 - (top + h / 2), 0);
    const u = material.uniforms;
    u.uSize.value.set(w, h);
    u.uBend.value = Math.sin(Math.PI * p);
    u.uTime.value += dt;
    u.uColour.value = THREE.MathUtils.smoothstep(p, 0.35, 0.85);
    u.uRadius.value = 18 * (1 - e);
  });

  return (
    <mesh ref={mesh} material={material}>
      <planeGeometry args={[1, 1, 48, 24]} />
    </mesh>
  );
}

export default function ReelPlane({
  slot,
  stage,
  progress,
  active,
  phone,
}: {
  slot: RefObject<HTMLElement | null>;
  stage: RefObject<HTMLElement | null>;
  progress: MotionValue<number>;
  active: boolean;
  phone: boolean;
}) {
  const video = useMemo(() => {
    const v = document.createElement("video");
    Object.assign(v, { src: "/reel/loop.mp4", muted: true, loop: true, playsInline: true, crossOrigin: "anonymous", preload: "auto" });
    return v;
  }, []);
  useEffect(() => {
    if (active) video.play().catch(() => {});
    else video.pause();
  }, [active, video]);
  useEffect(() => () => video.removeAttribute("src"), [video]);

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 10], zoom: 1 }}
      dpr={phone ? [1, 1.25] : [1, 1.75]}
      frameloop={active ? "always" : "never"}
      gl={{ alpha: true, antialias: true }}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 10 }}
    >
      <Card slot={slot} stage={stage} progress={progress} video={video} />
    </Canvas>
  );
}
