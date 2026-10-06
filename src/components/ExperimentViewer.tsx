"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { ShaderFill, useWebGPUDevice } from "../lib/custom-effect-runtime/index";
import { getExperiment } from "../experiments/registry";
import styles from "./ExperimentViewer.module.css";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

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

export function ExperimentViewer({ slug }: { slug: string }) {
  const experiment = getExperiment(slug);
  const reducedMotion = usePrefersReducedMotion();
  const hasWebGPU = useHasWebGPU();
  const { error: deviceError } = useWebGPUDevice();

  // Reduced motion: stop the clock and pointer tracking, keep drawing a still frame.
  const shader = useMemo(() => {
    if (!experiment) return null;
    const { setup, render, manifest } = experiment.shader;
    return {
      setup,
      render,
      params: reducedMotion
        ? { ...experiment.params, ...experiment.reducedMotionParams }
        : experiment.params,
      manifest: manifest
        ? reducedMotion
          ? { ...manifest, isAnimated: false, usesMouse: false }
          : manifest
        : undefined,
    };
  }, [experiment, reducedMotion]);

  if (!experiment || !shader) return null;

  const unsupported = !hasWebGPU || deviceError !== null;

  return (
    <main className={styles.page}>
      <Link href="/" className={styles.back}>
        <span aria-hidden="true">←</span> Back to library
      </Link>
      <h1 className="visually-hidden">
        {experiment.title}: interactive generative art
      </h1>
      <div className={styles.shader} aria-hidden="true">
        {unsupported ? null : <ShaderFill shader={shader} />}
      </div>
      {/* Rendered from the start so screen readers announce the text when it appears. */}
      <div className={styles.fallback}>
        <p role="status">
          {unsupported
            ? "WebGPU isn't available in this browser. Try a recent Chrome, Edge or Safari."
            : null}
        </p>
      </div>
    </main>
  );
}
