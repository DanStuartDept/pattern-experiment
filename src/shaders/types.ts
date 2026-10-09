import type { CSSProperties, ReactNode } from "react";
import type { Shader } from "./runtime/types";

/** Everything needed to draw one shader variant exactly as it looks in Figma. */
export type ShaderPreset = {
  /** setup/render/manifest from a file in effects/. */
  shader: Pick<Shader, "setup" | "render" | "manifest">;
  /** Params exactly as Figma's get_design_context returned them. */
  params: Record<string, unknown>;
  /** Merged over params when the visitor prefers reduced motion. Stops motion and pointer effects. */
  reducedMotionParams?: Record<string, unknown>;
  /**
   * Degrees to rotate the shader. Figma nodes are often rotated; the exported params describe the
   * unrotated shader. Compare with the design and override per use if the instance differs.
   */
  rotate?: number;
};

/** Props shared by every named component (MorphingGradientGrow and friends). */
export type ShaderComponentProps = {
  className?: string;
  style?: CSSProperties;
  /** Override the preset's rotation, in degrees. */
  rotate?: number;
  /** Shallow overrides for the preset's params, e.g. { speed: 0.2 }. Plain data only. */
  params?: Record<string, unknown>;
  /** Shown instead of the shader when WebGPU isn't available. It sits inside an aria-hidden layer. */
  fallback?: ReactNode;
};
