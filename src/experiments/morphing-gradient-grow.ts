import { morphingGradientGrowPreset } from "../shaders/presets/morphing-gradient-grow";
import type { Experiment } from "./types";

export const morphingGradientGrow: Experiment = {
  ...morphingGradientGrowPreset,
  slug: "morphing-gradient-grow",
  title: "Morphing gradient: Grow",
  description:
    "Blue chevron bands with a colour ramp that slides through them.",
  preview: { src: "/previews/morphing-gradient-grow.jpg", width: 800, height: 670 },
  figmaUrl:
    "https://www.figma.com/design/iEI5LpzAO7dLcyfexRqo90/VEON_Landing-Page_Creative-Concepts_EXT?node-id=15-952&m=dev",
};
