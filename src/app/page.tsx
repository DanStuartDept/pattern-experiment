import Link from "next/link";
import { experiments } from "../experiments/registry";
import styles from "./page.module.css";

// Plain <img> doesn't get basePath from Next, so prefix it for GitHub Pages.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Shader experiments</h1>
      <p className={styles.intro}>
        WebGPU shaders built from Figma frames. Each one runs live in the
        browser and reacts to the cursor.
      </p>
      <ul className={styles.grid}>
        {experiments.map((experiment) => (
          <li key={experiment.slug} className={styles.card}>
            {/* Decorative: the link below already names the destination. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.preview}
              src={`${basePath}${experiment.preview.src}`}
              alt=""
              width={experiment.preview.width}
              height={experiment.preview.height}
              loading="lazy"
            />
            <div className={styles.body}>
              <h2 className={styles.cardTitle}>
                <Link
                  href={`/experiments/${experiment.slug}`}
                  className={styles.link}
                >
                  {experiment.title}
                </Link>
              </h2>
              <p className={styles.description}>{experiment.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
