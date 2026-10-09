# shaders

Copy this whole folder into a Next.js App Router app, then follow [DEVELOPERS.md](../../DEVELOPERS.md) at the repo root for the setup (WebGPU types, a webpack `extensionAlias`, running Next with `--webpack`).

```tsx
import { MorphingGradientGrow } from "@/shaders";

<div style={{ height: "30rem" }}>
  <MorphingGradientGrow rotate={0} />
</div>
```

- `runtime/` and `effects/` are Figma's files. Don't edit them.
- `presets/` holds the params exactly as Figma exported them, plus reduced-motion overrides.
- `ShaderArt.tsx` is the reusable component. The named components are thin wrappers over it.
