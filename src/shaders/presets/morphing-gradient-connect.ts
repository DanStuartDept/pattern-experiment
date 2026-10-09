import { setup, render, manifest } from "../effects/CodeComponentId_298861697e46579d115df6a54449f007cc6b038f_4e19d36246a429f6549de5261c94ab7fc825f7c0";
import type { ShaderPreset } from "../types";

export const morphingGradientConnectPreset: ShaderPreset = {
  shader: { setup, render, manifest },
  // Params copied unchanged from the Figma design context (node 15:955).
  params: {
    gradientSpeed: 2,
    mode: 0,
    detail: 0.41999998688697815,
    frequency: 20,
    zoom: 5,
    colors: {
      stops: [
        { position: 0, color: { r: 0.9176470637321472, g: 0.3764705955982208, b: 0.929411768913269, a: 1 } },
        { position: 0.5, color: { r: 0.5137255191802979, g: 0.16862745583057404, b: 0.7882353067398071, a: 1 } },
        { position: 1, color: { r: 0.32156863808631897, g: 0.05882352963089943, b: 0.5333333611488342, a: 1 } },
      ],
    },
    speed: 0.38999998569488525,
    wave: 1,
    direction: { x: 50, y: 50, radius: 50.967891693115234, angle: 90 },
  },
  reducedMotionParams: { speed: 0, gradientSpeed: 0 },
  // The Figma node is rotated -90 degrees (vertical bands).
  rotate: -90,
};
