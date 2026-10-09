"use client";

import { ShaderArt } from "./ShaderArt";
import { morphingGradientConnectPreset } from "./presets/morphing-gradient-connect";
import type { ShaderComponentProps } from "./types";

export function MorphingGradientConnect(props: ShaderComponentProps) {
  return <ShaderArt preset={morphingGradientConnectPreset} {...props} />;
}
