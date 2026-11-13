"use client";

import { useEffect, useMemo, type RefObject } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Effect, EffectAttribute } from "postprocessing";

// Where the cursor is over the card, in card UV (y up), and how far it moved since
// the last frame. Shared by the push (HeroPieces) and the smear.
export type Pointer = { x: number; y: number; dx: number; dy: number; inside: boolean };

const VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// The trail: each pixel holds a drag offset (xy) and how much smear is there (z).
// It drifts along its own drag, fades, and the cursor paints into it.
const SIM = /* glsl */ `
uniform sampler2D prev;
uniform vec2 mouse;
uniform vec2 vel;
uniform float aspect;
uniform float touching; // "active" is reserved in GLSL
varying vec2 vUv;
void main() {
  vec4 here = texture2D(prev, vUv);
  vec4 p = texture2D(prev, vUv - here.xy * 0.35);
  // A soft cut, barely there (his note, 12 Nov): a narrow, short trail and a small drag.
  p *= 0.93;
  vec2 d = vUv - mouse;
  d.x *= aspect;
  float g = exp(-dot(d, d) / 0.0035) * touching;
  p.xy += vel * g * 2.5;
  float len = length(p.xy);
  if (len > 0.04) p.xy *= 0.04 / len;
  p.z = clamp(p.z + g * min(length(vel) * 70.0, 1.0), 0.0, 1.0);
  gl_FragColor = p;
}
`;

// The look: the picture is dragged along the trail with each colour pulled a hair
// further, and a faint light rim where the smear ends. Kept so light that it reads
// as a soft cut through glass, never as a rainbow.
const LOOK = /* glsl */ `
uniform sampler2D trail;
uniform vec2 texel;
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec4 t = texture2D(trail, uv);
  vec2 off = t.xy;
  vec3 col = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    float s = 0.55 + 0.15 * float(i);
    col.r += texture2D(inputBuffer, uv - off * s).r;
    col.g += texture2D(inputBuffer, uv - off * s * 1.03).g;
    col.b += texture2D(inputBuffer, uv - off * s * 1.06).b;
  }
  col *= 0.25;
  float gx = texture2D(trail, uv + vec2(texel.x, 0.0)).z - texture2D(trail, uv - vec2(texel.x, 0.0)).z;
  float gy = texture2D(trail, uv + vec2(0.0, texel.y)).z - texture2D(trail, uv - vec2(0.0, texel.y)).z;
  float rim = smoothstep(0.04, 0.14, length(vec2(gx, gy)));
  vec3 tint = mix(vec3(1.0), 0.5 + 0.5 * cos(6.28318 * (vec3(0.0, 0.33, 0.67) + t.z * 1.4 + uv.x * 0.8)), 0.15);
  col += tint * rim * 0.025;
  col += t.z * 0.008;
  outputColor = vec4(col, inputColor.a);
}
`;

class SmearEffect extends Effect {
  constructor() {
    super("SmearEffect", LOOK, {
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map<string, THREE.Uniform>([
        ["trail", new THREE.Uniform(null)],
        ["texel", new THREE.Uniform(new THREE.Vector2(1 / 256, 1 / 128))],
      ]),
    });
  }
}

export function Smear({ pointer }: { pointer: RefObject<Pointer> }) {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const effect = useMemo(() => new SmearEffect(), []);
  const sim = useMemo(() => {
    const opts = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: SIM,
      uniforms: {
        prev: { value: null },
        mouse: { value: new THREE.Vector2(0.5, 0.5) },
        vel: { value: new THREE.Vector2() },
        aspect: { value: 2 },
        touching: { value: 0 },
      },
    });
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    return { read: new THREE.WebGLRenderTarget(256, 128, opts), write: new THREE.WebGLRenderTarget(256, 128, opts), mat, scene, cam: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1) };
  }, []);

  useEffect(() => {
    const w = 256, h = Math.max(48, Math.round((256 * size.height) / Math.max(size.width, 1)));
    sim.read.setSize(w, h);
    sim.write.setSize(w, h);
    (effect.uniforms.get("texel")!.value as THREE.Vector2).set(1 / w, 1 / h);
    sim.mat.uniforms.aspect.value = size.width / Math.max(size.height, 1);
  }, [size, sim, effect]);

  useEffect(
    () => () => {
      sim.read.dispose();
      sim.write.dispose();
      sim.mat.dispose();
      effect.dispose();
    },
    [sim, effect],
  );

  useFrame(() => {
    const p = pointer.current;
    const u = sim.mat.uniforms;
    u.prev.value = sim.read.texture;
    u.mouse.value.set(p.x, p.y);
    u.vel.value.set(p.dx, p.dy);
    u.touching.value = p.inside ? 1 : 0;
    p.dx = p.dy = 0;
    gl.setRenderTarget(sim.write);
    gl.render(sim.scene, sim.cam);
    gl.setRenderTarget(null);
    const t = sim.read;
    sim.read = sim.write;
    sim.write = t;
    effect.uniforms.get("trail")!.value = sim.read.texture;
  });

  return <primitive object={effect} dispose={null} />;
}
