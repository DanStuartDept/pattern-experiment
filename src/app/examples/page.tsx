import type { Metadata } from "next";
import Link from "next/link";
import {
  MorphingGradientAmber,
  MorphingGradientConnect,
  MorphingGradientEmpower,
  MorphingGradientGrow,
} from "@/shaders";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Using the shaders",
  description: "Wireframes showing the shader components in a 50/50 panel, a hero and a tile row.",
};

const panelCode = `import { MorphingGradientGrow } from "@/shaders";

// The shader fills its parent, so the parent needs a size.
<section className="panel">            {/* display: grid; grid-template-columns: 1fr 1fr */}
  <div className="panel-text">...</div>
  <div className="panel-art">          {/* min-height: 30rem, or aspect-ratio */}
    <MorphingGradientGrow rotate={0} />
  </div>
</section>`;

const heroCode = `import { MorphingGradientAmber } from "@/shaders";

<section className="hero">             {/* position: relative; min-height: 32rem */}
  <MorphingGradientAmber className="hero-art" />   {/* position: absolute; inset: 0 */}
  <div className="hero-text">          {/* position: relative; black text only */}
    <h1>Headline</h1>
    <a href="/register">Register now</a>
  </div>
</section>`;

const tilesCode = `import {
  MorphingGradientGrow,
  MorphingGradientEmpower,
  MorphingGradientConnect,
} from "@/shaders";

<li className="tile">                  {/* aspect-ratio: 1 */}
  <MorphingGradientEmpower />
</li>
<p>Empower</p>                        {/* the label is real text, outside the art */}`;

// Override colours or speed per use. Plain data only.
const overrideCode = `<MorphingGradientGrow
  params={{ speed: 0.2 }}
  fallback={<img src="/grow.jpg" alt="" />}
/>`;

function Code({ label, children }: { label: string; children: string }) {
  return (
    // Scrollable region: tabindex gives keyboard users a way to scroll it.
    <pre className={styles.code} tabIndex={0} role="region" aria-label={label}>
      <code>{children}</code>
    </pre>
  );
}

function Arrow() {
  return (
    <span className={styles.arrow} aria-hidden="true">
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 8h11M9 4l4 4-4 4" />
      </svg>
    </span>
  );
}

export default function ExamplesPage() {
  return (
    <>
      <a href="#main" className={styles.skip}>
        Skip to examples
      </a>
      <main id="main" className={styles.main}>
        <p className={styles.back}>
          <Link href="/">Back to library</Link>
        </p>
        <h1 className={styles.title}>Using the shaders in a site</h1>
        <p className={styles.intro}>
          Wireframes for the layouts the shaders are used in. Each block has the code to copy. Setup
          steps and rules are in <code>DEVELOPERS.md</code>.
        </p>

        <section aria-labelledby="panel-heading" className={styles.block}>
          <h2 id="panel-heading" className={styles.blockTitle}>
            50/50 panel
          </h2>
          <p className={styles.note}>
            Text on one half, shader on the other. The art stacks below the text on narrow screens.
            Grow is rotated for slide 7 by default, so this layout passes <code>rotate={"{0}"}</code>.
          </p>
          <div className={styles.panel}>
            <div className={styles.panelText}>
              <p className={styles.eyebrow}>Name Surname · Role</p>
              <h3 className={styles.panelHeading}>Growth ambition headline goes here</h3>
              <a href="#panel-code" className={styles.cta}>
                <span>
                  Watch now
                  <span className="visually-hidden">: Growth ambition headline goes here</span>
                </span>
                <Arrow />
              </a>
            </div>
            <div className={styles.panelArt}>
              <MorphingGradientGrow rotate={0} />
            </div>
          </div>
          <div id="panel-code">
            <Code label="Code: 50/50 panel">{panelCode}</Code>
          </div>
        </section>

        <section aria-labelledby="hero-heading" className={styles.block}>
          <h2 id="hero-heading" className={styles.blockTitle}>
            Hero
          </h2>
          <p className={styles.note}>
            Shader behind the content. Use black text on this one: white fails contrast on the amber.
            The darkest colour in the ramp is the worst case, so check against that.
          </p>
          <div className={styles.hero}>
            <MorphingGradientAmber className={styles.heroArt} />
            <div className={styles.heroText}>
              <h3 className={styles.heroHeading}>Hero headline goes here</h3>
              <p className={styles.heroBody}>One line of supporting copy.</p>
              <a href="#hero-code" className={styles.heroCta}>
                Primary action
              </a>
            </div>
          </div>
          <div id="hero-code">
            <Code label="Code: hero">{heroCode}</Code>
          </div>
        </section>

        <section aria-labelledby="tiles-heading" className={styles.block}>
          <h2 id="tiles-heading" className={styles.blockTitle}>
            Tiles
          </h2>
          <p className={styles.note}>
            Square tiles with the label outside the art, as on slide 7.
          </p>
          <ul className={styles.tiles}>
            <li>
              <div className={styles.tileArt}>
                <MorphingGradientGrow />
              </div>
              <h3 className={styles.tileLabel}>Grow</h3>
            </li>
            <li>
              <div className={styles.tileArt}>
                <MorphingGradientEmpower />
              </div>
              <h3 className={styles.tileLabel}>Empower</h3>
            </li>
            <li>
              <div className={styles.tileArt}>
                <MorphingGradientConnect />
              </div>
              <h3 className={styles.tileLabel}>Connect</h3>
            </li>
          </ul>
          <Code label="Code: tiles">{tilesCode}</Code>
        </section>

        <section aria-labelledby="props-heading" className={styles.block}>
          <h2 id="props-heading" className={styles.blockTitle}>
            Overrides and fallback
          </h2>
          <p className={styles.note}>
            Every component takes <code>className</code>, <code>style</code>, <code>rotate</code>,{" "}
            <code>params</code> and <code>fallback</code>. The fallback shows when WebGPU isn&apos;t
            available, so use <code>alt=&quot;&quot;</code>: it sits inside a hidden layer.
          </p>
          <Code label="Code: overrides and fallback">{overrideCode}</Code>
        </section>
      </main>
    </>
  );
}
