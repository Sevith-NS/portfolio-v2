import * as THREE from "three";
import { BEATS, ramp } from "../beats";

// Shared pieces for the home page's closing flight (components/three/SpaceScene.tsx).

export const VOID = "#020309";
export const GREEN = new THREE.Color("#3DFF8E");
export const PINK = new THREE.Color("#FF3DA8");
export const TEAL = new THREE.Color("#3DEBFF");
export const LAPIS = new THREE.Color("#2440E8"); // the corridor's blue, a brighter lapis
export const CAM_Z = 6;
export const DROP = 14; // how far he falls back, so the tunnels open round him

// The lattice's light at flight `f`: white glass, then pink and teal, then green (Tunnels.tsx).
// `side` picks pink (0) or teal (1) for the middle stretch. The ghost copies take it on too.
const WHITE = new THREE.Color("#DDE6FF");
export function latticeMix(f: number) {
  const [a, b] = BEATS.lattice;
  const u = Math.min(1, Math.max(0, (f - a) / (b - a)));
  return ramp([0.3, 0.42], u) + ramp([0.62, 0.74], u);
}
export function tunnelColour(f: number, side: 0 | 1, out: THREE.Color) {
  if (f >= BEATS.cages[0]) return out.copy(side ? TEAL : PINK).lerp(WHITE, 0.6); // pale in the pink tunnel
  const mix = latticeMix(f), mid = side ? TEAL : PINK;
  return mix < 1 ? out.copy(WHITE).lerp(mid, mix) : out.copy(mid).lerp(GREEN, mix - 1);
}

// Smooth wandering noise, -1 to 1: three sines at unrelated speeds, so it never looks like a loop.
export function wander(t: number, seed: number) {
  return Math.sin(t * 1.13 + seed * 7.1) * 0.55 + Math.sin(t * 2.37 + seed * 3.3) * 0.3 + Math.sin(t * 4.71 + seed * 1.7) * 0.15;
}

// The ghosts' look (Astronaut.tsx, Cats.tsx): a faint glassy shape lit only at its edges, where
// you look across its surface, so a model's many inner layers don't add up to a solid figure.
const GHOST_VERT = /* glsl */ `
#include <common>
#include <skinning_pars_vertex>
varying float vRim;
void main() {
  #include <skinbase_vertex>
  #include <begin_vertex>
  #include <beginnormal_vertex>
  #include <skinnormal_vertex>
  #include <skinning_vertex>
  vec4 mv = modelViewMatrix * vec4(transformed, 1.0);
  vRim = pow(1.0 - abs(dot(normalize(normalMatrix * objectNormal), normalize(-mv.xyz))), 3.0);
  gl_Position = projectionMatrix * mv;
}`;
const GHOST_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vRim;
void main() {
  gl_FragColor = vec4(uColor * (0.04 + vRim) * uOpacity, 1.0);
}`;
export function ghostMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: GHOST_VERT,
    fragmentShader: GHOST_FRAG,
    uniforms: { uColor: { value: new THREE.Color() }, uOpacity: { value: 0 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

// A small seeded random, so the scene is the same on every visit.
export function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Kaleidoscope: every piece placed once is placed four times, mirrored across both axes of
// the tunnel, so the view reads as one symmetric pattern.
export const MIRRORS: [number, number][] = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
];

// Twists a material's instances round the tunnel's axis, more the further away they are.
// `u.twist` is radians per unit of depth, `u.depth` where the twist starts. With `u.grow`,
// each instance appears at its own moment (its `aBirth`, 0 to 1), growing in as `grow` passes
// it, so a structure can build up piece by piece.
export function twistable(material: THREE.Material, u: { twist: { value: number }; depth: { value: number }; grow?: { value: number } }) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTwist = u.twist;
    shader.uniforms.uDepth = u.depth;
    shader.uniforms.uGrow = u.grow ?? { value: 1 };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTwist;\nuniform float uDepth;\nuniform float uGrow;\nattribute float aBirth;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\ntransformed *= smoothstep(aBirth, aBirth + 0.05, uGrow);")
      .replace(
        "#include <project_vertex>",
        `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
#endif
  vec4 placed = modelMatrix * mvPosition;
  float turn = uTwist * max(0.0, uDepth - placed.z);
  placed.xy = mat2(cos(turn), sin(turn), -sin(turn), cos(turn)) * placed.xy;
  mvPosition = viewMatrix * placed;
  gl_Position = projectionMatrix * mvPosition;`,
      );
  };
  material.needsUpdate = true;
  return material;
}
