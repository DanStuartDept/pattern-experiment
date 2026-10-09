# Shader experiments

A library of WebGPU shader experiments built from Figma frames. `/` lists them and `/experiments/<slug>` runs one full-viewport.

The first is "Magnetic filings", from the Figma frame
[Landing Page, node 341:414](https://www.figma.com/design/XPKuHSijbsTmvnbhDxNb50/Landing-Page?node-id=341-414&m=dev).
A grid of white lines rotates and opens into ellipses as a wave crosses the screen. The cursor pulls nearby lines toward it.

The site is a static Next.js export, deployed to GitHub Pages. It is set to `noindex` and `robots.txt` disallows everything.

## Add an experiment

Each experiment is a preset in `src/shaders/presets/`, a named component in `src/shaders/`, a listing entry in `src/experiments/` and one line in `src/experiments/registry.ts`. The shader source goes in `src/shaders/effects/`, unchanged from Figma. A project skill at `.claude/skills/shader-experiments/SKILL.md` has the full steps for Claude Code.

## Use the shaders in another site

Copy `src/shaders/` into the app and use the components, for example `<MorphingGradientGrow />`. The setup steps, props, accessibility notes and layout examples are in [DEVELOPERS.md](DEVELOPERS.md). The `/examples` page shows a 50/50 panel, a hero and a tile row with code to copy.

If a coding agent is doing the install, point it at [AGENTS.md](AGENTS.md). It has the same setup as ordered steps, with checks and the points where it should stop and ask.

## Requirements

- A browser with WebGPU (current Chrome, Edge, or Safari). Without it the page shows a short text message instead of the shader.
- With `prefers-reduced-motion: reduce`, the wave and the cursor effect are switched off and the shader draws a still frame.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000, experiments at /experiments/<slug>
npm run build   # static export to ./out
```

`dev` and `build` run on webpack (`--webpack`). The shader runtime imports its own files as `./x.js`, and Turbopack in this Next.js version doesn't map those to `.ts` and `.tsx`. `next.config.ts` adds a webpack `extensionAlias` so the runtime files stay untouched.

## Deploy

`.github/workflows/deploy.yml` builds the export and publishes it with GitHub Actions.
In the repo settings, set Pages > Source to "GitHub Actions". The workflow passes the Pages base path to the build through `NEXT_PUBLIC_BASE_PATH`.

## How it was built

An agent built this from the Figma URL, using the Figma MCP server:

1. **Design context.** The `figma-design-to-code` skill loads first, then `get_design_context` runs on node 341:414 and returns a screenshot, the `ShaderFill` usage with its exact params, and the WGSL shader source.
2. **Runtime.** The response says the shader needs Figma's runtime. The agent read the `shader-runtime-index` MCP resource and copied each listed file with the `shader-runtime` resource URIs into `src/shaders/runtime/`, unchanged. The shader source went into `src/shaders/effects/`. Neither folder is hand-edited or linted.
3. **Accessibility review.** An accessibility-lead agent reviewed the planned page before it was written. The page applies its advice: the shader sits in an `aria-hidden` wrapper, a visually hidden `<h1>` names the page, and a `role="status"` message covers missing WebGPU.
4. **Viewer.** `src/components/ExperimentViewer.tsx` is page chrome around `ShaderArt`, a client component, because the shader needs WebGPU and pointer events. Params live in the preset and are copied from the design context. The only overrides are under reduced motion.
5. **Verification.** The dev server ran in Chrome with WebGPU. A frame captured shortly after load matches the design screenshot, and moving the pointer opens the filings around it.

The pause button the accessibility review recommended (WCAG 2.2.2) is not built yet.
