"use client";

import { ShaderArt } from "./ShaderArt";
import { morphingGradientAmberPreset } from "./presets/morphing-gradient-amber";
import type { ShaderComponentProps } from "./types";

export function MorphingGradientAmber(props: ShaderComponentProps) {
  return <ShaderArt preset={morphingGradientAmberPreset} {...props} />;
}
