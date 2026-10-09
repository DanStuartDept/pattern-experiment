<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Shader experiments

This repo is a Next.js App Router library of WebGPU shader experiments built from Figma frames, plus `src/shaders/`, the folder other sites copy. Two jobs live here:

- **Adding or changing an experiment in this repo.** Follow `.claude/skills/shader-experiments/SKILL.md`.
- **Installing the shaders into another app.** Follow the next section. `DEVELOPERS.md` is the human version of the same steps.

## Install `src/shaders/` into another app

Use this when you are in a different Next.js project and the user wants these components, for example a 50/50 panel or a hero with `<MorphingGradientGrow />`.

### Check first, and stop to ask if any of these fail

- The target project uses the Next.js App Router (an `app/` directory). Nothing else has been tested.
- You can read `src/shaders/` from this repo, either from a local path or a clone of `https://github.com/DanStuartDept/pattern-experiment`. If you can't, ask the user for it. Don't rewrite the shaders from memory.
- The project can run on webpack. Step 5 moves `dev` and `build` off Turbopack. Ask first if the config has a `turbopack` key, or if the deploy runs its own build command.
- Read the target project's own agent instructions and the Next.js docs in its `node_modules/next/dist/docs/` before you write code.

### Steps

1. **Inspect the target.** Note the Next.js version, whether it has a `src/` directory, the `tsconfig.json` path alias (`@/*` or none), the package manager (from the lockfile), the name of the next config file, and whether that config already has a `webpack` function.
2. **Copy the folder.** Copy all of `src/shaders/` to `src/shaders/` in the target (or `shaders/` at the root if there is no `src/`). Copy the whole folder: the components import `runtime/`, `effects/` and `presets/` with relative paths. Never edit files in `runtime/` or `effects/`.
3. **Install the WebGPU types** as a dev dependency with the project's package manager: `@webgpu/types`. Leave `tsconfig.json` `types` alone, because `webgpu.d.ts` in the folder pulls them in. Check that `include` covers the folder.
4. **Add the extension alias to the next config.** The runtime imports its own files as `./x.js` and the real files are `.ts` and `.tsx`. Keep any existing `webpack` function: call it first, then set the alias.
   ```ts
   webpack: (config) => {
     config.resolve.extensionAlias = {
       ...config.resolve.extensionAlias,
       ".js": [".ts", ".tsx", ".js"],
     };
     return config;
   },
   ```
5. **Run Next on webpack.** In `package.json`, set `dev` to `next dev --webpack` and `build` to `next build --webpack`. Turbopack can't remap the `.js` imports, and its `resolveExtensions` option doesn't fix it. Look for CI or deploy config that calls `next build` directly, and change it or tell the user.
6. **Use a component where the user asked for it.** The parent needs a definite width and height, because the art fills it.
   ```tsx
   import { MorphingGradientGrow } from "@/shaders";

   <div style={{ height: "30rem" }}>
     <MorphingGradientGrow rotate={0} />
   </div>
   ```
   Use a relative import if the project has no `@/` alias. If the user gave a Figma frame, compare the render with it and set `rotate`: Figma often rotates the node, and the same shader can be rotated in one frame and not another.
7. **Verify.** Run the type check and `build`. Run `dev` and open the page in a browser with WebGPU. Confirm the canvas is the size of its parent and the console has no errors. If you can't run a WebGPU browser, say so.

If a step fails, check the Troubleshooting section in `DEVELOPERS.md` before changing anything else.

### Rules while building with the components

- The art is `aria-hidden`. Put no focusable or meaningful content inside a component, and put text and links beside it.
- Use black text over the amber and orange shaders. White text fails contrast on them. Check contrast again if you change colours.
- These animate on their own for longer than 5 seconds, so WCAG 2.2.2 requires a way to pause them. The components don't ship one. Add a real pause button on pages that use them, or tell the user it's missing. Reduced-motion support is built in and is not a substitute.
- Change colours or speed through the `params` prop. Don't edit presets to taste unless asked, and never swap a shader for a CSS gradient or a canvas approximation.
- A `fallback` image needs `alt=""`. It sits inside the hidden layer.
- Keep `"use client"` on every file in the folder that has it.

### Report back

List the files you added or changed (the folder, the config, the scripts), the commands you ran and what they showed, and what you couldn't test, such as reduced motion or a browser without WebGPU.
