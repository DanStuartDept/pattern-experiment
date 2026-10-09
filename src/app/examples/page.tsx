import type { Metadata } from "next";
import Link from "next/link";
import {
  MorphingGradientAmber,
  MorphingGradientConnect,
  MorphingGradientEmpower,
  MorphingGradientGrow,
} from "@/shaders";

export const metadata: Metadata = {
  title: "Using the shaders",
  description: "Wireframes showing the shader components in a 50/50 panel, a hero and a tile row.",
};

const panelCode = `import { MorphingGradientGrow } from "@/shaders";

// The shader fills its parent, so the parent needs a size.
<section className="grid grid-cols-1 sm:grid-cols-2">
  <div className="p-8">...</div>
  <div className="aspect-[4/3] sm:aspect-auto sm:min-h-[28rem]">
    <MorphingGradientGrow rotate={0} />
  </div>
</section>`;

const heroCode = `import { MorphingGradientAmber } from "@/shaders";

<section className="relative flex min-h-[32rem] items-end overflow-hidden">
  <MorphingGradientAmber className="absolute inset-0" />
  <div className="relative p-8 text-black">
    <h1>Headline</h1>
    <a href="/register">Register now</a>
  </div>
</section>`;

const tilesCode = `import {
  MorphingGradientGrow,
  MorphingGradientEmpower,
  MorphingGradientConnect,
} from "@/shaders";

<li>
  <div className="aspect-square overflow-hidden rounded-lg">
    <MorphingGradientEmpower />
  </div>
  <p>Empower</p> {/* the label is real text, outside the art */}
</li>`;

// Override colours or speed per use. Plain data only.
const overrideCode = `<MorphingGradientGrow
  params={{ speed: 0.2 }}
  fallback={<img src="/grow.jpg" alt="" />}
/>`;

// Double ring: the white ring contrasts with the black halo, and the halo contrasts with
// whatever is underneath. Written out in full so Tailwind can see every class.
const focusRing =
  "focus-visible:outline-3 focus-visible:outline-white focus-visible:outline-offset-2 focus-visible:shadow-[0_0_0_2px_#000]";
const highContrastBorder = "forced-colors:border forced-colors:border-[CanvasText]";
const noteText =
  "mt-3 max-w-[44rem] text-[1.0625rem] leading-normal text-[#c7c7c7] [&_code]:font-(family-name:--font-geist-mono) [&_code]:text-[0.9em] [&_code]:text-[#ededed]";
const blockTitle = "text-2xl leading-[1.3] font-semibold";

function Code({ label, children }: { label: string; children: string }) {
  return (
    // Scrollable region: tabindex gives keyboard users a way to scroll it.
    <pre
      className={`mt-4 overflow-x-auto rounded-lg border border-solid border-[#444] bg-[#111] px-5 py-4 font-(family-name:--font-geist-mono) text-sm leading-[1.6] text-[#ededed] [tab-size:2] ${highContrastBorder} ${focusRing}`}
      tabIndex={0}
      role="region"
      aria-label={label}
    >
      <code>{children}</code>
    </pre>
  );
}

function Arrow() {
  return (
    <span
      className="inline-flex size-9 items-center justify-center rounded-[0.125rem] bg-[#ffbf00] text-black"
      aria-hidden="true"
    >
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 8h11M9 4l4 4-4 4" />
      </svg>
    </span>
  );
}

export default function ExamplesPage() {
  return (
    <>
      <a
        href="#main"
        className={`absolute top-2 left-2 z-20 -translate-y-[200%] rounded-sm bg-white px-4 py-3 text-black focus-visible:translate-y-0 ${focusRing}`}
      >
        Skip to examples
      </a>
      <main id="main" className="mx-auto w-full max-w-6xl px-6 pt-12 pb-20">
        <p>
          <Link
            href="/"
            className={`inline-block py-2 text-[#8ab4ff] underline underline-offset-[0.15em] ${focusRing}`}
          >
            Back to library
          </Link>
        </p>
        <h1 className="mt-2 text-[2rem] leading-[1.2] font-semibold">Using the shaders in a site</h1>
        <p className={noteText}>
          Wireframes for the layouts the shaders are used in. Each block has the code to copy. Setup
          steps and rules are in <code>DEVELOPERS.md</code>.
        </p>

        <section aria-labelledby="panel-heading" className="mt-14">
          <h2 id="panel-heading" className={blockTitle}>
            50/50 panel
          </h2>
          <p className={noteText}>
            Text on one half, shader on the other. The art stacks below the text on narrow screens.
            Grow is rotated for slide 7 by default, so this layout passes <code>rotate={"{0}"}</code>.
          </p>
          <div className="mt-6 grid grid-cols-1 overflow-hidden rounded-lg sm:grid-cols-2">
            <div className="flex flex-col gap-4 bg-[#d4d4d4] p-8 text-black sm:min-h-[28rem]">
              <p className="text-base leading-[1.4]">Name Surname · Role</p>
              <h3 className="max-w-[22rem] text-[clamp(2rem,4vw,3.25rem)] leading-[1.1] font-normal tracking-[-0.02em]">
                Growth ambition headline goes here
              </h3>
              <a
                href="#panel-code"
                className={`mt-auto inline-flex min-h-11 items-center gap-4 self-start rounded-sm bg-white py-1 pr-1 pl-3 text-base text-black ${highContrastBorder} ${focusRing}`}
              >
                <span>
                  Watch now
                  <span className="sr-only">: Growth ambition headline goes here</span>
                </span>
                <Arrow />
              </a>
            </div>
            <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[28rem]">
              <MorphingGradientGrow rotate={0} />
            </div>
          </div>
          <div id="panel-code">
            <Code label="Code: 50/50 panel">{panelCode}</Code>
          </div>
        </section>

        <section aria-labelledby="hero-heading" className="mt-14">
          <h2 id="hero-heading" className={blockTitle}>
            Hero
          </h2>
          <p className={noteText}>
            Shader behind the content. Use black text on this one: white fails contrast on the amber.
            The darkest colour in the ramp is the worst case, so check against that.
          </p>
          <div className="relative mt-6 flex min-h-[32rem] items-end overflow-hidden rounded-lg">
            <MorphingGradientAmber className="absolute inset-0" />
            <div className="relative max-w-xl p-8 text-black">
              <h3 className="text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] font-medium tracking-[-0.02em]">
                Hero headline goes here
              </h3>
              <p className="mt-3 text-lg leading-normal">One line of supporting copy.</p>
              <a
                href="#hero-code"
                className={`mt-5 inline-flex min-h-11 items-center rounded-sm bg-black px-5 text-base text-white ${highContrastBorder} ${focusRing}`}
              >
                Primary action
              </a>
            </div>
          </div>
          <div id="hero-code">
            <Code label="Code: hero">{heroCode}</Code>
          </div>
        </section>

        <section aria-labelledby="tiles-heading" className="mt-14">
          <h2 id="tiles-heading" className={blockTitle}>
            Tiles
          </h2>
          <p className={noteText}>Square tiles with the label outside the art, as on slide 7.</p>
          <ul className="mt-6 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-6">
            <li>
              <div className="aspect-square overflow-hidden rounded-lg">
                <MorphingGradientGrow />
              </div>
              <h3 className="mt-3 text-lg font-normal">Grow</h3>
            </li>
            <li>
              <div className="aspect-square overflow-hidden rounded-lg">
                <MorphingGradientEmpower />
              </div>
              <h3 className="mt-3 text-lg font-normal">Empower</h3>
            </li>
            <li>
              <div className="aspect-square overflow-hidden rounded-lg">
                <MorphingGradientConnect />
              </div>
              <h3 className="mt-3 text-lg font-normal">Connect</h3>
            </li>
          </ul>
          <Code label="Code: tiles">{tilesCode}</Code>
        </section>

        <section aria-labelledby="props-heading" className="mt-14">
          <h2 id="props-heading" className={blockTitle}>
            Overrides and fallback
          </h2>
          <p className={noteText}>
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
