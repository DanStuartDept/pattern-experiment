"use client";

import { ShaderArt } from "./ShaderArt";
import { magneticFilingsPreset } from "./presets/magnetic-filings";
import type { ShaderComponentProps } from "./types";

export function MagneticFilings(props: ShaderComponentProps) {
  return <ShaderArt preset={magneticFilingsPreset} {...props} />;
}
