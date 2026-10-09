import { morphingGradientAmberPreset } from "../shaders/presets/morphing-gradient-amber";
import type { Experiment } from "./types";

export const morphingGradientAmber: Experiment = {
  ...morphingGradientAmberPreset,
  slug: "morphing-gradient-amber",
  title: "Morphing gradient: Amber",
  description:
    "Wide amber rings radiating from the left edge, used as the Capital Markets Day background.",
  preview: { src: "/previews/morphing-gradient-amber.jpg", width: 800, height: 670 },
  figmaUrl:
    "https://www.figma.com/design/iEI5LpzAO7dLcyfexRqo90/VEON_Landing-Page_Creative-Concepts_EXT?node-id=15-1043&m=dev",
};
