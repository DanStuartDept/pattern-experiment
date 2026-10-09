// Everything the app needs from this folder. Copy src/shaders/ whole and import from here.
export { MorphingGradientGrow } from "./MorphingGradientGrow";
export { MorphingGradientEmpower } from "./MorphingGradientEmpower";
export { MorphingGradientConnect } from "./MorphingGradientConnect";
export { MorphingGradientAmber } from "./MorphingGradientAmber";
export { MagneticFilings } from "./MagneticFilings";

// Build your own variant from a preset.
export { ShaderArt } from "./ShaderArt";
export type { ShaderArtProps } from "./ShaderArt";
export type { ShaderPreset, ShaderComponentProps } from "./types";
export { usePrefersReducedMotion, useWebGPUSupported } from "./hooks";

export { morphingGradientGrowPreset } from "./presets/morphing-gradient-grow";
export { morphingGradientEmpowerPreset } from "./presets/morphing-gradient-empower";
export { morphingGradientConnectPreset } from "./presets/morphing-gradient-connect";
export { morphingGradientAmberPreset } from "./presets/morphing-gradient-amber";
export { magneticFilingsPreset } from "./presets/magnetic-filings";
