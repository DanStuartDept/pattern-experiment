import { setup, render, manifest } from "../effects/CodeComponentId_1b4321a8631d56ca8f0f04284a543e385583df84_e4a10e9514412d0fadf3be87e963faee9589936a";
import type { ShaderPreset } from "../types";

export const magneticFilingsPreset: ShaderPreset = {
  shader: { setup, render, manifest },
  // Params copied unchanged from the Figma design context (node 341:414).
  params: {
    gridSpacing: 25,
    lineThickness: 2.5,
    waveFrequency: 1,
    noiseAmount: 0,
    waveSpeed: 176,
    cursorEnabled: true,
    cursorRadius: 248,
    morphShape: 0,
    lineColor: { r: 1, g: 1, b: 1, a: 1 },
    animationEnabled: true,
    noiseScale: 40,
    attractionStrength: 1,
    animationMode: 0,
    waveDirection: 45,
    waveWidth: 491,
    lineLength: 28,
    waveStrength: 1,
    restingAngle: 45,
    backgroundColor: { r: 0, g: 0, b: 0, a: 1 },
  },
  reducedMotionParams: { animationEnabled: false, cursorEnabled: false },
  // This shader follows the pointer, so don't set `rotate`: the pointer position isn't rotated with it.
};
