import { morphingGradientEmpowerPreset } from "../shaders/presets/morphing-gradient-empower";
import type { Experiment } from "./types";

export const morphingGradientEmpower: Experiment = {
  ...morphingGradientEmpowerPreset,
  slug: "morphing-gradient-empower",
  title: "Morphing gradient: Empower",
  description:
    "Soft amber rings radiating from the centre.",
  preview: { src: "/previews/morphing-gradient-empower.jpg", width: 800, height: 670 },
  figmaUrl:
    "https://www.figma.com/design/iEI5LpzAO7dLcyfexRqo90/VEON_Landing-Page_Creative-Concepts_EXT?node-id=15-954&m=dev",
};
