# Using the shaders in a site

`src/shaders/` is a self-contained folder of WebGPU shader components built from Figma frames. Copy it into a Next.js (App Router) app and drop a component into a layout. The `/examples` page in this repo shows a 50/50 panel, a hero and a tile row with the code for each.

```tsx
import { MorphingGradientGrow } from "@/shaders";

<div style={{ height: "30rem" }}>
  <MorphingGradientGrow rotate={0} />
</div>
```

## Components

| Component | Look | Figma |
| --- | --- | --- |
| `MorphingGradientGrow` | Blue chevron bands | [15:952](https://www.figma.com/design/iEI5LpzAO7dLcyfexRqo90/VEON_Landing-Page_Creative-Concepts_EXT?node-id=15-952) |
| `MorphingGradientEmpower` | Soft amber rings | [15:954](https://www.figma.com/design/iEI5LpzAO7dLcyfexRqo90/VEON_Landing-Page_Creative-Concepts_EXT?node-id=15-954) |
| `MorphingGradientConnect` | Purple vertical bands | [15:955](https://www.figma.com/design/iEI5LpzAO7dLcyfexRqo90/VEON_Landing-Page_Creative-Concepts_EXT?node-id=15-955) |
| `MorphingGradientAmber` | Wide amber rings from the left edge | [15:1043](https://www.figma.com/design/iEI5LpzAO7dLcyfexRqo90/VEON_Landing-Page_Creative-Concepts_EXT?node-id=15-1043) |
| `MagneticFilings` | Line grid that opens into ellipses and follows the cursor | [341:414](https://www.figma.com/design/XPKuHSijbsTmvnbhDxNb50/Landing-Page?node-id=341-414) |

Each component already has the exact params from Figma, so it matches the design with no props.

## Quick start

1. **Copy the folder.** Copy `src/shaders/` into your app's `src/`. Take the whole folder: the components import `runtime/`, `effects/` and `presets/` with relative paths.
2. **Add the WebGPU types.** The runtime uses `GPUDevice` and friends.
   ```bash
   npm i -D @webgpu/types
   ```
   In `tsconfig.json`, add `"types": ["@webgpu/types"]` under `compilerOptions` (keep any types you already list).
3. **Teach webpack about `.js` imports.** The runtime imports its own files as `./x.js` and the real files are `.ts` and `.tsx`. In `next.config.ts`:
   ```ts
   const nextConfig: NextConfig = {
     webpack: (config) => {
       config.resolve.extensionAlias = {
         ...config.resolve.extensionAlias,
         ".js": [".ts", ".tsx", ".js"],
       };
       return config;
     },
   };
   ```
4. **Run Next with webpack.** Set `"dev": "next dev --webpack"` and `"build": "next build --webpack"` in `package.json`. Turbopack can't remap those `.js` imports (see Troubleshooting).
5. **Import from the barrel.** `import { MorphingGradientGrow } from "@/shaders"` (the `@/` alias is the create-next-app default; use a relative path if you don't have it).

The folder needs React and nothing else. It has no `next/*` imports. These steps were run against a fresh `create-next-app` (Next.js 16.4, React 19, App Router): it built, and the component rendered at the size of its parent.

## Props

Every named component takes the same props.

| Prop | Type | What it does |
| --- | --- | --- |
| `className` | `string` | Goes on the outer wrapper. Use it to position or size the art. |
| `style` | `CSSProperties` | Same, inline. |
| `rotate` | `number` | Degrees. Overrides the component's default. See Rotation. |
| `params` | `Record<string, unknown>` | Shallow overrides for the Figma params, for example `{ speed: 0.2 }`. Plain data only. |
| `fallback` | `ReactNode` | Shown instead of the shader when WebGPU isn't available. |

To build a new variant from an existing shader, pass a preset to `ShaderArt`. The barrel exports `ShaderArt`, the presets and the `ShaderPreset` type.

## Sizing

The art fills its parent, and the parent needs a definite width and height. A parent with `height: auto` and no content gives you a zero-height box. Any of these works:

- a fixed `height` or `min-height`
- `aspect-ratio` on the parent
- a grid or flex child that stretches to a row with a set height
- `className` that makes the component `position: absolute; inset: 0` inside a positioned section (the hero example)

The wrapper is `overflow: hidden`. The canvas is sharp at the device pixel ratio and resizes itself.

## Rotation

Figma nodes are often rotated, and the exported params describe the unrotated shader. Compare the render with the design. If the shader looks turned 90 degrees, set `rotate`.

`MorphingGradientGrow` defaults to `-90` (the chevron points up, as on slide 7). Slide 11 uses it unrotated, with the chevron pointing right, so that layout passes `rotate={0}`. The same shader can be rotated in one frame and not in another, so check each instance.

Under the hood a rotated shader is drawn in a square big enough to cover the box, then rotated and clipped. Don't set `rotate` on `MagneticFilings`: it follows the pointer, and the pointer position isn't rotated with the shader.

## Reduced motion

Components read `prefers-reduced-motion: reduce`. When it's on, each one draws a single still frame, with the clock and pointer tracking off. Each preset says what "still" means in `reducedMotionParams` (for the gradients, `speed` and `gradientSpeed` go to `0`; for the filings, the wave and cursor effect turn off). Nothing for you to wire up.

During server rendering and hydration the preference reads as "no preference", then corrects on the client. A visitor who has the setting can get a frame or two of the animated state before the still frame.

## Accessibility

Read this section before you build a page with these.

- **The art is decorative.** Each component's root is `aria-hidden="true"`. Don't put focusable or meaningful content inside it (a hidden focusable element is an accessibility bug). Put text and links next to the art, not in it.
- **WCAG 2.2.2 (Pause, Stop, Hide, Level A).** Moving content that starts automatically, runs longer than 5 seconds and sits next to other content needs a way to pause, stop or hide it. A decorative background counts. Reduced-motion support doesn't satisfy this for visitors who haven't set the preference. These components don't ship a pause control: you need to add one on pages that use them. A real `<button>` with `aria-pressed` and a visible label such as "Pause background animation" works. This has been raised with the team and is open.
- **Text over the art.** Use black text on the amber and orange shaders. Measured against the ramp: black is 5.9:1 on the darkest orange and 12.7:1 on the lightest amber. White is 3.6:1 on the darkest orange and 1.65:1 on the lightest amber, which fails. The Figma slide 8 design puts white text on this shader, so check that with design. Re-check contrast whenever you change the colours in `params`.
- **Fallback images use `alt=""`.** The fallback sits inside the hidden layer. If an image carries meaning, put it outside the component with real alt text.
- **Labels go in real text.** For a tile row, put the label under the art as visible text, not inside it.
- **Test the page.** Check it at 320px wide and 400% zoom, with `forced-colors`, and by keyboard. One `h1` per page.
- **Flashing.** The gradients and rings are slow and low contrast. If you speed one up or change its colours a lot, recheck WCAG 2.3.1 (no more than three flashes per second).

## No WebGPU

The shaders need WebGPU: current Chrome, Edge and Safari. Where it's missing, the component renders `fallback` or nothing. The server and the first client render assume WebGPU exists, so the fallback appears after hydration. If you need a placeholder with no gap, give the parent a background colour:

```tsx
<div style={{ height: "30rem", background: "#00407e" }}>
  <MorphingGradientGrow fallback={<img src="/grow.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />} />
</div>
```

You own the copy, so extend this however the client needs: a static image per variant, a CSS gradient, a message.

## Performance

Each component runs its own render loop on the GPU. A page with one or two is fine. Don't tile dozens. The runtime doesn't pause the loop when the element scrolls offscreen (browsers throttle hidden tabs on their own), so a long page with several animated shaders keeps all of them running. If that matters, add an `IntersectionObserver` in your copy.

## Rules for the folder

- **Don't edit `runtime/` or `effects/`.** They're Figma's files, copied unchanged. A new Figma export replaces them wholesale.
- **Keep `"use client"`** on the components, `ShaderArt` and `hooks.ts`. They take functions as props and use React hooks, so a server component can render them but can't contain them.
- Everything else (`presets/`, the named components, `ShaderArt.module.css`) is yours to change.

## Adding a shader from Figma

The steps live in `.claude/skills/shader-experiments/SKILL.md` and run well from Claude Code with the Figma MCP server. The short version: `get_design_context` on the node, save the shader source to `effects/`, write a preset with the params exactly as returned, add a component, compare with the Figma screenshot, and set `rotate` if it's turned.

## Troubleshooting

- **`Module not found: Can't resolve './components/ShaderEffect.js'`** (or another `./x.js`). The `extensionAlias` in step 3 is missing, or the app is running on Turbopack. Use `--webpack`. Next 16 uses Turbopack by default, so a fresh `create-next-app` hits this until you change the scripts. Turbopack's `resolveExtensions` option doesn't fix it.
- **`Cannot find name 'GPUTexture'`** (or another `GPU...` type). Step 2: install `@webgpu/types` and list it under `types` in `tsconfig.json`.
- **`You're importing a module that depends on useSyncExternalStore into a React Server Component module`.** A file lost its `"use client"` line.
- **Nothing shows, no errors.** The parent has no height (see Sizing), or the browser has no WebGPU.
- **The shader looks turned 90 degrees against Figma.** Set `rotate`.
