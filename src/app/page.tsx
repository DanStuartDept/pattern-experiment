"use client";

import { useMemo, useSyncExternalStore } from "react";
import { ShaderFill, useWebGPUDevice } from "../lib/custom-effect-runtime/index";
import {
  setup,
  render,
  manifest,
} from "../lib/custom-effects/CodeComponentId_1b4321a8631d56ca8f0f04284a543e385583df84_e4a10e9514412d0fadf3be87e963faee9589936a";
import styles from "./page.module.css";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Params copied unchanged from the Figma design context.
const designParams = {
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
};

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

const noopSubscribe = () => () => {};

function useHasWebGPU() {
  return useSyncExternalStore(
    noopSubscribe,
    () => "gpu" in navigator,
    () => true,
  );
}

export default function Home() {
  const reducedMotion = usePrefersReducedMotion();
  const hasWebGPU = useHasWebGPU();
  const { error: deviceError } = useWebGPUDevice();

  // Reduced motion: stop the clock and the pointer effect, keep drawing the resting frame.
  const shader = useMemo(
    () => ({
      setup,
      render,
      params: reducedMotion
        ? { ...designParams, animationEnabled: false, cursorEnabled: false }
        : designParams,
      manifest: reducedMotion
        ? { ...manifest, isAnimated: false, usesMouse: false }
        : manifest,
    }),
    [reducedMotion],
  );

  const unsupported = !hasWebGPU || deviceError !== null;

  return (
    <main className={styles.page} data-node-id="341:414" data-name="Pattern Experiment">
      <h1 className={styles.visuallyHidden}>
        Magnetic filings: interactive generative art
      </h1>
      {unsupported ? (
        <p role="status" className={styles.fallback}>
          This artwork needs WebGPU, which your browser or device doesn&apos;t
          support. The page is otherwise empty.
        </p>
      ) : (
        <div className={styles.shader} aria-hidden="true">
          <ShaderFill shader={shader} />
        </div>
      )}
    </main>
  );
}
