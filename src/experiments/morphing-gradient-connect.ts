import { morphingGradientConnectPreset } from "../shaders/presets/morphing-gradient-connect";
import type { Experiment } from "./types";

export const morphingGradientConnect: Experiment = {
  ...morphingGradientConnectPreset,
  slug: "morphing-gradient-connect",
  title: "Morphing gradient: Connect",
  description:
    "Purple vertical bands with a colour ramp that slides across them.",
  preview: { src: "/previews/morphing-gradient-connect.jpg", width: 800, height: 670 },
  figmaUrl:
    "https://www.figma.com/design/iEI5LpzAO7dLcyfexRqo90/VEON_Landing-Page_Creative-Concepts_EXT?node-id=15-955&m=dev",
};
