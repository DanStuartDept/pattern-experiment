import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "How these experiments are made",
  description:
    "How an agent turns a Figma shader frame into a running experiment: the MCP calls, the verbatim runtime, and the checks.",
};

const fileMap: { path: string; purpose: string }[] = [
  {
    path: "src/lib/custom-effect-runtime/",
    purpose:
      "Figma's WebGPU runtime, copied from MCP resources. Never edited.",
  },
  {
    path: "src/lib/custom-effects/",
    purpose:
      "One shader source file per effect, copied from get_design_context. Never edited.",
  },
  {
    path: "src/experiments/<slug>.ts",
    purpose:
      "The experiment: title, description, preview, and the params exactly as Figma returned them.",
  },
  {
    path: "src/experiments/registry.ts",
    purpose: "The list that the library and the experiment pages read.",
  },
  {
    path: "public/previews/<slug>.jpg",
    purpose: "Thumbnail captured from the real render.",
  },
  {
    path: ".claude/skills/shader-experiments/SKILL.md",
    purpose: "The steps and mistakes an agent needs to add the next experiment.",
  },
];

export default function ProcessPage() {
  return (
    <main className={styles.main}>
      <p>
        <Link href="/" className={styles.back}>
          <span aria-hidden="true">←</span> Back to the library
        </Link>
      </p>

      <h1 className={styles.title}>How these experiments are made</h1>
      <p className={styles.lead}>
        Each experiment starts as a shader fill in Figma. An agent, working
        through the Figma MCP server, turns the frame into code that runs the
        same shader in the browser. This page covers that setup. It is
        written from the first experiment, Magnetic filings.
      </p>

      <nav aria-label="On this page" className={styles.toc}>
        <ul>
          <li>
            <a href="#pipeline">The pipeline</a>
          </li>
          <li>
            <a href="#runtime">Why the runtime is copied, not rewritten</a>
          </li>
          <li>
            <a href="#rules">Rules the agent follows</a>
          </li>
          <li>
            <a href="#setup">What the repo gives the agent</a>
          </li>
          <li>
            <a href="#checks">How it is checked</a>
          </li>
          <li>
            <a href="#problems">Problems found along the way</a>
          </li>
        </ul>
      </nav>

      <section aria-labelledby="pipeline">
        <h2 id="pipeline">The pipeline</h2>
        <p>
          The agent is given a Figma URL. The node ID in the URL, written{" "}
          <code>341-414</code> there, becomes <code>341:414</code> in tool
          calls. From there the work runs in this order.
        </p>
        <ol>
          <li>
            Load the Figma <code>figma-design-to-code</code> skill. The server
            requires it before any design call.
          </li>
          <li>
            Call <code>get_design_context</code> for the node, with a
            screenshot. The response has three parts: a render of the frame,
            a React snippet that uses <code>ShaderFill</code> with its exact
            params, and the shader source (WGSL wrapped in a small module).
            The screenshot is the visual target and is never used as an asset.
          </li>
          <li>
            Read the <code>shader-runtime-index</code> MCP resource. It lists
            the runtime files. Read each one through the{" "}
            <code>shader-runtime</code> resource URIs and write it into the
            repo unchanged.
          </li>
          <li>
            Save the shader source from the response into{" "}
            <code>src/lib/custom-effects/</code>, also unchanged.
          </li>
          <li>
            Write an experiment definition that imports the shader and holds
            the params copied from the response. Add it to the registry.
          </li>
          <li>
            Run the accessibility agent on the UI before it is written, then
            apply what it finds.
          </li>
          <li>
            Run the dev server, compare the render with the Figma screenshot,
            and capture the listing thumbnail from that render.
          </li>
        </ol>
        <p>
          Authoring a shader is a separate job. The Figma MCP server also has{" "}
          <code>create_shader</code> and <code>update_shader</code> tools,
          guarded by their own skill. None of the experiments so far needed
          them, because the shaders were already built in Figma.
        </p>
      </section>

      <section aria-labelledby="runtime">
        <h2 id="runtime">Why the runtime is copied, not rewritten</h2>
        <p>
          A Figma shader is not plain CSS or canvas drawing. It is WGSL that
          Figma&apos;s own runtime compiles, feeds with a clock and pointer
          position, and draws to a canvas. The response says so directly:
          copy the runtime verbatim and do not approximate the shader.
        </p>
        <p>
          That is why the runtime and shader folders are excluded from the
          linter and never hand-edited. If Figma updates them, the agent
          copies the new files over the old ones. The experiment definitions
          hold everything that is ours.
        </p>
      </section>

      <section aria-labelledby="rules">
        <h2 id="rules">Rules the agent follows</h2>
        <ul>
          <li>
            Params are copied from the design context exactly. The only
            overrides are for reduced motion, and they are listed per
            experiment.
          </li>
          <li>
            If the runtime cannot render something, the agent reports it. It
            does not swap in a lookalike.
          </li>
          <li>
            If MCP resources cannot be read in the client, the agent stops and
            says so instead of working around it. They were readable here.
          </li>
          <li>
            Experiments that need the HTML-in-Canvas API (shader effects with
            children) get a warning, because that API is not in every
            browser. Plain shader fills need only WebGPU.
          </li>
          <li>
            Each experiment should be checked for flashing above three times
            a second. Magnetic filings has not been measured yet.
          </li>
        </ul>
      </section>

      <section aria-labelledby="setup">
        <h2 id="setup">What the repo gives the agent</h2>
        <p>
          A project skill, <code>shader-experiments</code>, holds the
          workflow above and the mistakes already made once, so a new session
          can add an experiment without rediscovering them. Adding one is a
          definition file, a shader file, and one line in the registry.
        </p>
        <p>The table below maps the files that matter.</p>
        <table className={styles.table}>
          <caption>What each file and folder does</caption>
          <thead>
            <tr>
              <th scope="col">Path</th>
              <th scope="col">Purpose</th>
            </tr>
          </thead>
          <tbody>
            {fileMap.map(({ path, purpose }) => (
              <tr key={path}>
                <th scope="row">
                  <code>{path}</code>
                </th>
                <td>{purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>The same layout as a tree:</p>
        <pre
          className={styles.pre}
          tabIndex={0}
          role="region"
          aria-label="Project file tree"
        >
          <code>{`src/
  lib/
    custom-effect-runtime/   copied from Figma, verbatim
    custom-effects/          shader source, verbatim
  experiments/
    magnetic-filings.ts      params and metadata
    registry.ts              list of experiments
public/
  previews/                  listing thumbnails
.claude/
  skills/
    shader-experiments/      agent instructions`}</code>
        </pre>
        <p>
          The Next.js app around it is deliberately thin: a listing page, one
          static route per experiment, and a client viewer that handles
          WebGPU detection and reduced motion. The full source is in the{" "}
          <a href="https://github.com/DanStuartDept/pattern-experiment">
            pattern-experiment repository on GitHub
          </a>
          .
        </p>
      </section>

      <section aria-labelledby="checks">
        <h2 id="checks">How it is checked</h2>
        <p>
          The agent runs the type checker, the linter and a production build.
          Then it opens the experiment in Chrome with WebGPU, compares the
          render with the Figma screenshot, moves the pointer, and reads the
          console. Shaders that run on a clock look different from moment to
          moment, so it compares structure, not an exact frame.
        </p>
        <p>
          Some things are not tested in a browser yet: the message shown when
          WebGPU is missing, and the reduced-motion path. The page also has no
          pause control, which an accessibility review recommended for
          animation that starts on its own.
        </p>
      </section>

      <section aria-labelledby="problems">
        <h2 id="problems">Problems found along the way</h2>
        <ul>
          <li>
            The runtime imports its own files as <code>./x.js</code> while the
            files are <code>.ts</code> and <code>.tsx</code>. Turbopack in this
            Next.js version could not resolve that, so the build uses webpack
            with an extension alias. The runtime files stayed untouched.
          </li>
          <li>
            A plain <code>&lt;img&gt;</code> does not get the GitHub Pages
            base path. The listing would have shown broken thumbnails on the
            live site until the path was added by hand.
          </li>
          <li>
            A hook blocks UI file edits until the accessibility agent has
            reviewed. Writes that came first were rejected, so the agent wrote
            the non-UI files first and retried after the review.
          </li>
        </ul>
      </section>
    </main>
  );
}
