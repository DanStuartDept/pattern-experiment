import type { Shader } from "../lib/custom-effect-runtime/types";

export type Experiment = {
  /** URL segment: /experiments/<slug>. Lowercase, hyphenated, unique. */
  slug: string;
  title: string;
  /** One sentence shown on the listing card. */
  description: string;
  /** Path under /public, e.g. "/previews/<slug>.jpg". Capture it from the real render. */
  preview: { src: string; width: number; height: number };
  /** Figma source, kept for traceability. */
  figmaUrl?: string;
  /** setup/render/manifest come from src/lib/custom-effects/<file>. */
  shader: Pick<Shader, "setup" | "render" | "manifest">;
  /** Params exactly as get_design_context returned them. */
  params: Record<string, unknown>;
  /** Merged over params when prefers-reduced-motion is set. Stop motion and pointer effects here. */
  reducedMotionParams?: Record<string, unknown>;
};
