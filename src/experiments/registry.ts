import { magneticFilings } from "./magnetic-filings";
import type { Experiment } from "./types";

// Add new experiments here. Order is the order on the listing page.
export const experiments: Experiment[] = [magneticFilings];

export function getExperiment(slug: string): Experiment | undefined {
  return experiments.find((experiment) => experiment.slug === slug);
}
