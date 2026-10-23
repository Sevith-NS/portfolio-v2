"use client";

import { forwardRef, useMemo } from "react";
import { BlendFunction, Effect, EffectAttribute } from "postprocessing";
import * as THREE from "three";

// The last pass of the room: a one-pixel dark outline wherever depth jumps, the
// ink line every 16-bit sprite has. The flat colour comes from the toon materials.
const frag = /* glsl */ `
uniform float edge;

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  vec2 px = 1.0 / resolution;
  float n = max(max(readDepth(uv + vec2(px.x, 0.0)), readDepth(uv - vec2(px.x, 0.0))),
                max(readDepth(uv + vec2(0.0, px.y)), readDepth(uv - vec2(0.0, px.y))));
  // Only the pixel in front of the jump gets the line, so outlines stay one pixel thin.
  float line = step(edge, n - depth);
  outputColor = vec4(mix(inputColor.rgb, inputColor.rgb * 0.3, line), inputColor.a);
}
`;

class PixelArtEffect extends Effect {
  constructor() {
    super("PixelArt", frag, {
      blendFunction: BlendFunction.NORMAL,
      attributes: EffectAttribute.DEPTH,
      uniforms: new Map([["edge", new THREE.Uniform(0.0006)]]),
    });
  }
}

export const PixelArt = forwardRef<PixelArtEffect>(function PixelArt(_, ref) {
  const effect = useMemo(() => new PixelArtEffect(), []);
  return <primitive ref={ref} object={effect} dispose={null} />;
});
