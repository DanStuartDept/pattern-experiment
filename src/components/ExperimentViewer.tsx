"use client";

import Link from "next/link";
import { ShaderArt } from "../shaders/ShaderArt";
import { useWebGPUSupported } from "../shaders/hooks";
import { getExperiment } from "../experiments/registry";
import styles from "./ExperimentViewer.module.css";

// Page chrome around one experiment. The shader itself, including reduced motion and rotation,
// lives in ShaderArt so other sites can use it without any of this.
export function ExperimentViewer({ slug }: { slug: string }) {
  const experiment = getExperiment(slug);
  const supported = useWebGPUSupported();

  if (!experiment) return null;

  return (
    <main className={styles.page}>
      <Link href="/" className={styles.back}>
        <span aria-hidden="true">←</span> Back to library
      </Link>
      <h1 className="visually-hidden">
        {experiment.title}: interactive generative art
      </h1>
      <div className={styles.shader}>
        <ShaderArt preset={experiment} />
      </div>
      {/* Rendered from the start so screen readers announce the text when it appears. */}
      <div className={styles.fallback}>
        <p role="status">
          {supported
            ? null
            : "WebGPU isn't available in this browser. Try a recent Chrome, Edge or Safari."}
        </p>
      </div>
    </main>
  );
}
