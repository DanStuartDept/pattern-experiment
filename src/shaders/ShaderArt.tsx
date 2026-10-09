"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";
import { ShaderFill } from "./runtime/index";
import { usePrefersReducedMotion, useWebGPUSupported } from "./hooks";
import type { ShaderPreset } from "./types";
import styles from "./ShaderArt.module.css";

export type ShaderArtProps = {
  preset: ShaderPreset;
  /** Shallow overrides for preset.params. Plain data only (it is compared by value). */
  params?: Record<string, unknown>;
  /** Overrides preset.rotate, in degrees. */
  rotate?: number;
  className?: string;
  style?: CSSProperties;
  /** Rendered instead of the shader when WebGPU isn't available. */
  fallback?: ReactNode;
};

/**
 * Decorative shader layer that fills its parent. Hidden from assistive technology.
 * Honours prefers-reduced-motion by drawing one still frame with no pointer tracking.
 * The parent must have a definite width and height.
 */
export function ShaderArt({ preset, params, rotate, className, style, fallback }: ShaderArtProps) {
  const reducedMotion = usePrefersReducedMotion();
  const supported = useWebGPUSupported();
  const degrees = rotate ?? preset.rotate ?? 0;

  // The runtime re-runs setup when the shader object changes, so keep it stable. Overrides are
  // compared by value so a consumer can pass an inline object.
  const overridesKey = JSON.stringify(params ?? null);
  const shader = useMemo(() => {
    const { setup, render, manifest } = preset.shader;
    const overrides = JSON.parse(overridesKey) as Record<string, unknown> | null;
    return {
      setup,
      render,
      params: {
        ...preset.params,
        ...overrides,
        ...(reducedMotion ? preset.reducedMotionParams : null),
      },
      manifest: manifest
        ? reducedMotion
          ? { ...manifest, isAnimated: false, usesMouse: false }
          : manifest
        : undefined,
    };
  }, [preset, overridesKey, reducedMotion]);

  const art = <ShaderFill shader={shader} />;

  return (
    <div className={[styles.outer, className].filter(Boolean).join(" ")} style={style} aria-hidden="true">
      <div className={styles.root}>
        <div className={styles.fill}>
          {!supported ? (
            fallback
          ) : degrees ? (
            <div className={styles.rotated} style={{ transform: `translate(-50%, -50%) rotate(${degrees}deg)` }}>
              {art}
            </div>
          ) : (
            art
          )}
        </div>
      </div>
    </div>
  );
}
