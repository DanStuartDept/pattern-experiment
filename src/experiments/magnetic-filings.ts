import {
  setup,
  render,
  manifest,
} from "../lib/custom-effects/CodeComponentId_1b4321a8631d56ca8f0f04284a543e385583df84_e4a10e9514412d0fadf3be87e963faee9589936a";
import type { Experiment } from "./types";

export const magneticFilings: Experiment = {
  slug: "magnetic-filings",
  title: "Magnetic filings",
  description:
    "A grid of lines that opens into ellipses as a wave crosses the screen, and bends toward the cursor.",
  preview: { src: "/previews/magnetic-filings.jpg", width: 800, height: 740 },
  figmaUrl:
    "https://www.figma.com/design/XPKuHSijbsTmvnbhDxNb50/Landing-Page?node-id=341-414&m=dev",
  shader: { setup, render, manifest },
  // Params copied unchanged from the Figma design context.
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
};
