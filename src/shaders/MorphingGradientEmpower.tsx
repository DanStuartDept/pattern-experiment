"use client";

import { ShaderArt } from "./ShaderArt";
import { morphingGradientEmpowerPreset } from "./presets/morphing-gradient-empower";
import type { ShaderComponentProps } from "./types";

export function MorphingGradientEmpower(props: ShaderComponentProps) {
  return <ShaderArt preset={morphingGradientEmpowerPreset} {...props} />;
}
