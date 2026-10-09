import { setup, render, manifest } from "../effects/CodeComponentId_298861697e46579d115df6a54449f007cc6b038f_4e19d36246a429f6549de5261c94ab7fc825f7c0";
import type { ShaderPreset } from "../types";

export const morphingGradientGrowPreset: ShaderPreset = {
  shader: { setup, render, manifest },
  // Params copied unchanged from the Figma design context (node 15:952).
  params: {
    gradientSpeed: 1.2699999809265137,
    mode: 2,
    detail: 0.41999998688697815,
    frequency: 20,
    zoom: 5,
    colors: {
      stops: [
        { position: 0, color: { r: 0.6666666865348816, g: 0.8196078538894653, b: 0.8470588326454163, a: 1 } },
        { position: 0.5, color: { r: 0, g: 0.4941176474094391, b: 0.7568627595901489, a: 1 } },
        { position: 1, color: { r: 0, g: 0.24705882370471954, b: 0.5529412031173706, a: 1 } },
      ],
    },
    speed: 0.38999998569488525,
    wave: 1,
    direction: { x: 0, y: 50, radius: 50.29123306274414, angle: 0 },
  },
  // Time-driven only, no pointer input. Zero speeds freeze it.
  reducedMotionParams: { speed: 0, gradientSpeed: 0 },
  // Slide 7 draws this rotated -90 degrees (chevron points up). Pass rotate={0} for the
  // right-pointing version used on slide 11.
  rotate: -90,
};
