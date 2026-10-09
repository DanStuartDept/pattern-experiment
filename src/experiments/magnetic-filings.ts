import { magneticFilingsPreset } from "../shaders/presets/magnetic-filings";
import type { Experiment } from "./types";

export const magneticFilings: Experiment = {
  ...magneticFilingsPreset,
  slug: "magnetic-filings",
  title: "Magnetic filings",
  description:
    "A grid of lines that opens into ellipses as a wave crosses the screen, and bends toward the cursor.",
  preview: { src: "/previews/magnetic-filings.jpg", width: 800, height: 740 },
  figmaUrl:
    "https://www.figma.com/design/XPKuHSijbsTmvnbhDxNb50/Landing-Page?node-id=341-414&m=dev",
};
