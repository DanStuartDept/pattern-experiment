"use client";

import { useSyncExternalStore } from "react";
import { useWebGPUDevice } from "./runtime/index";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** True when the visitor's OS asks for reduced motion. Server snapshot is false. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

const noopSubscribe = () => () => {};

/**
 * False when this browser can't run the shaders. The server snapshot is true so the server and
 * first client render match, then it corrects on the client.
 */
export function useWebGPUSupported() {
  const hasWebGPU = useSyncExternalStore(
    noopSubscribe,
    () => "gpu" in navigator,
    () => true,
  );
  const { error } = useWebGPUDevice();
  return hasWebGPU && error === null;
}
