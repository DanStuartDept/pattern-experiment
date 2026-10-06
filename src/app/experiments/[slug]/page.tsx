import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExperimentViewer } from "../../../components/ExperimentViewer";
import { experiments, getExperiment } from "../../../experiments/registry";

// Static export: every experiment is built ahead of time, anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return experiments.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/experiments/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const experiment = getExperiment(slug);
  return experiment
    ? { title: experiment.title, description: experiment.description }
    : {};
}

export default async function ExperimentPage({
  params,
}: PageProps<"/experiments/[slug]">) {
  const { slug } = await params;
  if (!getExperiment(slug)) notFound();
  return <ExperimentViewer slug={slug} />;
}
