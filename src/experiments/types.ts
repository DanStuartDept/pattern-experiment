import type { ShaderPreset } from "../shaders/types";

/** A listing entry: the shader preset plus the metadata the site needs to show it. */
export type Experiment = ShaderPreset & {
  /** URL segment: /experiments/<slug>. Lowercase, hyphenated, unique. */
  slug: string;
  title: string;
  /** One sentence shown on the listing card. */
  description: string;
  /** Path under /public, e.g. "/previews/<slug>.jpg". Capture it from the real render. */
  preview: { src: string; width: number; height: number };
  /** Figma source, kept for traceability. */
  figmaUrl?: string;
};
