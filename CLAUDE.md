# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

`AGENTS.md` has the Next.js notice and the steps for installing `src/shaders/` into another app. `DEVELOPERS.md` is the human version of those steps. `.claude/skills/shader-experiments/SKILL.md` has the full workflow for adding an experiment: read it before adding or changing one.

## Commands

```bash
npm run dev                                        # http://localhost:3000 (webpack)
npm run lint                                       # eslint
npx tsc --noEmit                                   # type check
NEXT_PUBLIC_BASE_PATH=/pattern-experiment npm run build   # static export to ./out, as CI builds it
```

There is no test suite. A change is checked by type check, lint, the static build, and looking at the page in Chrome (WebGPU is required).

`dev` and `build` run on webpack, not Turbopack. The Figma runtime imports its own files as `./x.js` for `.ts`/`.tsx` sources, and only the `extensionAlias` in `next.config.ts` resolves that. Don't switch back to Turbopack.

## Architecture

A static Next.js (App Router) export, deployed to GitHub Pages on every push to `main` (`.github/workflows/deploy.yml`, check with `gh run list`). Two things live in one repo: a site that lists shader experiments, and `src/shaders/`, the folder other teams copy into their own apps. Keep `src/shaders/` free of anything specific to this site (no `next/*`, no registry imports).

How one shader variant flows through the code:

- `src/shaders/effects/` and `src/shaders/runtime/` are Figma's files, copied unchanged from `get_design_context` and the `shader-runtime-index` MCP resource. Never edit them. ESLint ignores both. Several Figma nodes can share one effect file with different params.
- `src/shaders/presets/<slug>.ts` binds an effect to its params exactly as Figma returned them, plus `reducedMotionParams` and a default `rotate`.
- `src/shaders/<Name>.tsx` is a thin `"use client"` component over `ShaderArt`. `index.ts` is the barrel.
- `src/shaders/ShaderArt.tsx` owns the shared behaviour: reduced motion (draws a still frame), WebGPU detection and `fallback`, the `aria-hidden` wrapper, and `rotate`. A rotated shader is drawn in a square of `max(100cqw, 100cqh)` and clipped, so the wrapper needs a definite size.
- `src/experiments/<slug>.ts` spreads a preset and adds listing metadata. `registry.ts` is the list the pages read, in listing order. `src/app/experiments/[slug]` is static (`generateStaticParams`, `dynamicParams = false`), and `ExperimentViewer` is only the page chrome around `ShaderArt`.

Param values come from Figma unchanged. The only overrides are `reducedMotionParams`. `rotate` is a presentation choice: the exported code for a rectangle drops the node's own rotation, so compare the render with the Figma screenshot. Never set `rotate` on a shader that reads the pointer, because the pointer position isn't rotated with it.

## Gotchas

- Anything that uses hooks or receives `setup`/`render` as props needs `"use client"`. Functions can't cross from a server component to a client one.
- Pages are served from `/pattern-experiment` on GitHub Pages, so `basePath` comes from `NEXT_PUBLIC_BASE_PATH`. `next/link` handles it. A plain `<img>` or raw `/path` doesn't, so prefix it with the same variable.
- Styling is split on purpose: `/examples` uses Tailwind utilities, and every other page and all of `src/shaders/` use CSS modules (so the shaders folder works in an app without Tailwind). Tailwind is imported without Preflight in `globals.css`. Don't add it: it would change the existing pages. The global resets sit in `@layer base`, because unlayered CSS beats every layer and would override utilities like `p-4`.
- Every page stays `noindex` and `robots.txt` stays `Disallow: /`.
- Preview images in `public/previews/` are captured from the real render (see the skill for the crop and size). Never use the Figma screenshot as an asset.
- The shaders animate on their own, so WCAG 2.2.2 needs a pause control on pages that use them. The components don't ship one, and the docs say so.
