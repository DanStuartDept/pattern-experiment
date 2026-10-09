"use client";

import { ShaderArt } from "./ShaderArt";
import { morphingGradientGrowPreset } from "./presets/morphing-gradient-grow";
import type { ShaderComponentProps } from "./types";

export function MorphingGradientGrow(props: ShaderComponentProps) {
  return <ShaderArt preset={morphingGradientGrowPreset} {...props} />;
}
