# CanvasKit backdrop blur experiment

Tests CanvasKit 0.42.0's backdrop blur on explicitly checked WebGL and software
backends. No CSS blur or application-managed GPU buffers are used.

```sh
cd experiments/canvaskit-backdrop
bun install
bun run dev
```

Open http://127.0.0.1:4317. Set `PORT` to use another port. The server binds only
to localhost. The dependency is pinned and served locally, including its WASM.

The core operation is in `demo.js`:

```js
const blur = CK.ImageFilter.MakeBlur(sigma, sigma, CK.TileMode.Clamp, null)
canvas.save()
canvas.clipRRect(rounded, CK.ClipOp.Intersect, true)
canvas.saveLayer(undefined, null, blur)
canvas.restore()
canvas.restore()
blur.delete()
```

Draw the background before this operation and foreground content afterward.
The third `saveLayer` argument filters existing backdrop pixels. Putting an
image filter on the layer's paint instead would filter its own contents.
Skia owns the temporary layer/texture allocation. Native C++ can use the
corresponding SkCanvas save-layer backdrop filter directly.

## Verification

Verified in the Codex in-app browser on 2026-09-05, at 1040 × 720 backing pixels
per surface (2× scene scale). Both surfaces confirmed their requested backend;
a WebGL-to-CPU fallback is treated as an error.

The demo automatically reads back pixels for six checks per backend:

- Backdrop pixels change inside the panel.
- Pixels outside the panel stay byte-identical.
- Pixels excluded by a rounded corner stay byte-identical.
- White foreground bars stay byte-identical.
- Blurred pixels change when the background moves.
- Setting blur to zero restores the original image exactly.

All 12 checks passed. Interior mean absolute channel changes were 32.33/255
(WebGL) and 32.14/255 (CPU); sampled outside/corner/foreground changes were zero.
The blur and sharp foreground were also visually inspected. Use the slider,
animation button, and rerun button to explore the result. Pixel readback occurs
only during verification, not during animation.

This establishes backdrop-filter functionality, not Figma pixel parity or a
performance budget. Gaussian sigma is not assumed to equal Figma's UI radius.
CPU and GPU output are not assumed identical. Nested backdrops, translucent
groups, color spaces, large scenes, and Figma's precise edge behavior still
need comparison fixtures before choosing compatibility settings.

API signatures: `node_modules/canvaskit-wasm/types/index.d.ts`,
`Canvas.saveLayer` and `ImageFilterFactory.MakeBlur`.
