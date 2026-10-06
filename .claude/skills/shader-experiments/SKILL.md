---
name: shader-experiments
description: Use when adding, changing, or debugging a shader experiment in this repo (the Next.js library of WebGPU experiments built from Figma shader frames). Covers the Figma-to-experiment workflow, the registry, the verbatim runtime, previews, static export on GitHub Pages, and the mistakes already made once.
---

# Shader experiments

The site is a static Next.js export on GitHub Pages. `/` lists experiments and `/experiments/<slug>` runs one full-viewport. Each experiment is a Figma shader frame rendered by Figma's WebGPU runtime.

Read `AGENTS.md` first. This Next.js version differs from training data, so check `node_modules/next/dist/docs/` before writing Next code.

## Layout

- `src/lib/custom-effect-runtime/`: Figma's runtime, copied verbatim. Never edit it.
- `src/lib/custom-effects/`: one shader source file per effect, copied verbatim from `get_design_context`. Never edit it.
- `src/experiments/<slug>.ts`: the experiment definition (title, description, preview, params).
- `src/experiments/registry.ts`: the list the pages read. Order here is the order on the listing.
- `src/components/ExperimentViewer.tsx`: the client viewer. It handles WebGPU detection, the fallback message, and reduced motion.
- `public/previews/<slug>.jpg`: listing thumbnail.

## Add an experiment

1. Load the `figma-design-to-code` skill, then call `get_design_context` for the node with a screenshot. Turn `node-id=341-414` from the URL into `341:414`.
2. Save the shader source from the response into `src/lib/custom-effects/`, using the file name in the response. Keep it unchanged. If the response says the runtime changed, re-copy the files listed by the `shader-runtime-index` MCP resource (read each as `file:///shader-runtime/<path>`). Otherwise leave the runtime alone.
3. Copy `src/experiments/magnetic-filings.ts` to `src/experiments/<slug>.ts`. Point the import at the new shader file, and paste `params` exactly as the response gave them. Set `reducedMotionParams` to whatever switches off motion and pointer effects for that shader. Check the shader's `defineProperties` block for the param names.
4. Add the experiment to `registry.ts`.
5. Run the `accessibility-lead` agent on any UI change. A hook blocks UI file edits until it has run.
6. Capture the preview (below), then verify.

## Preview image

Start `npm run dev`, open `/experiments/<slug>` in Chrome (needs WebGPU), and screenshot soon after load, while the shader is mid-animation. Save it to `public/previews/<slug>.jpg`. Then crop out the Next dev indicator at the bottom left and shrink it with `sips`, for example `sips -Z 800 -s formatOptions 60 file.jpg` then `sips --cropToHeightWidth <h> <w> --cropOffset 0 0 file.jpg`. Put the final pixel size in `preview.width` and `preview.height`. Aim for under 400 KB. The screenshot tool only writes inside the repo, and it names JPEGs `.jpeg`, so rename the file.

Never use the Figma screenshot as an asset. It is only the visual target.

## Rules

- Params come from the design context unchanged. The only overrides are `reducedMotionParams`.
- No CSS or canvas approximation of a shader. If the runtime can't render it, report that.
- No Tailwind. Use CSS modules.
- `ShaderFill` needs WebGPU. `ShaderEffect` with children also needs the HTML-in-Canvas API, so warn the user if an experiment uses it.
- Check each experiment for flashing above three times per second (WCAG 2.3.1). Fast, high-contrast shaders can fail this.
- Every page stays `noindex`, and `robots.txt` stays `Disallow: /`. Don't remove either.
- The experiment page always has a visually hidden `<h1>`, an `aria-hidden` canvas wrapper, and a pre-rendered `role="status"` region for the no-WebGPU message.

## Build and deploy gotchas

- `dev` and `build` run with `--webpack`. The runtime imports `./x.js` for `.ts` and `.tsx` files, and Turbopack here can't resolve that. `next.config.ts` has the `extensionAlias` that fixes it. Don't switch back to Turbopack.
- The export is static (`output: 'export'`). Dynamic routes need `generateStaticParams`, and `dynamicParams` stays `false`.
- GitHub Pages serves from `/<repo>`, so `basePath` comes from `NEXT_PUBLIC_BASE_PATH`. `next/link` handles it. A plain `<img>` or any raw `/path` does not, so prefix it with the same variable.
- ESLint ignores `src/lib/custom-effect-runtime/**` and `src/lib/custom-effects/**` because those files are generated.
- Pushing to `main` runs `.github/workflows/deploy.yml`. Check the run with `gh run list`.

## Verify before saying it works

1. `npx tsc --noEmit` and `npm run lint`.
2. `NEXT_PUBLIC_BASE_PATH=/pattern-experiment npm run build`, then check `out/` for the new route and that asset URLs carry the prefix.
3. In Chrome with WebGPU, open the experiment, compare it with the Figma screenshot, move the pointer, and read the console for errors. Time-driven shaders look different at different moments, so compare the structure, not the exact frame.
4. Tab once on the experiment page. The back link should be focused, with a visible ring.
5. Report anything that doesn't render. Say plainly what you could not test, such as reduced motion or a browser without WebGPU.
