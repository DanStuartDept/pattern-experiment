import { setup, render, manifest } from "../effects/CodeComponentId_298861697e46579d115df6a54449f007cc6b038f_4e19d36246a429f6549de5261c94ab7fc825f7c0";
import type { ShaderPreset } from "../types";

export const morphingGradientAmberPreset: ShaderPreset = {
  shader: { setup, render, manifest },
  // Params copied unchanged from the Figma design context (node 15:1043).
  params: {
    gradientSpeed: 1.2699999809265137,
    mode: 1,
    detail: 0.41999998688697815,
    frequency: 20,
    zoom: 5,
    colors: {
      stops: [
        { position: 0, color: { r: 1, g: 0.7490196228027344, b: 0, a: 1 } },
        { position: 0.5, color: { r: 1, g: 0.6784313917160034, b: 0, a: 1 } },
        { position: 1, color: { r: 0.9137254953384399, g: 0.3450980484485626, b: 0.04313725605607033, a: 1 } },
      ],
    },
    speed: 0.38999998569488525,
    wave: 1,
    direction: { x: 50, y: 30.311403274536133, radius: 35.49932098388672, angle: 90 },
  },
  reducedMotionParams: { speed: 0, gradientSpeed: 0 },
  // Slide 8 draws the shader in a 1920px square rotated -90 degrees.
  rotate: -90,
};
