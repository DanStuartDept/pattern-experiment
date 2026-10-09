import { magneticFilings } from "./magnetic-filings";
import { morphingGradientGrow } from "./morphing-gradient-grow";
import { morphingGradientEmpower } from "./morphing-gradient-empower";
import { morphingGradientConnect } from "./morphing-gradient-connect";
import { morphingGradientAmber } from "./morphing-gradient-amber";
import type { Experiment } from "./types";

// Add new experiments here. Order is the order on the listing page.
export const experiments: Experiment[] = [
  magneticFilings,
  morphingGradientGrow,
  morphingGradientEmpower,
  morphingGradientConnect,
  morphingGradientAmber,
];

export function getExperiment(slug: string): Experiment | undefined {
  return experiments.find((experiment) => experiment.slug === slug);
}
