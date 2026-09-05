# fig-renderer

A React/SVG preview for decoded Figma documents. This package owns scene construction,
cached path and vector-network decoding, image loading, glyph rendering, clipping,
selection outlines, and camera interactions. It has its own CSS and does not depend
on the web app, Tailwind, or any app components. `fig-kiwi` supplies TypeScript types;
parsing the archive remains the caller's responsibility.

```tsx
import { FigmaRenderer } from "fig-renderer"

// parsed is returned by readFigFileBlob(file), or readHTMLMessage(html).
;<div style={{ height: 700 }}>
  <FigmaRenderer
    message={parsed.message}
    imageEntries={parsed.imageEntries}
    selected={selectedGuid}
    focusRequest={revealCounter}
    onSelect={setSelectedGuid}
  />
</div>
```

`selected` is controlled by the host. Increment `focusRequest` when a tree selection
should switch to its page and fit its bounds. Canvas clicks call `onSelect` without
moving the camera. The package provides middle-button drag and Space+drag panning,
cursor-centered wheel zoom and floating fit controls. Select pages through the host’s node tree. Shift+1 fits the page;
Shift+2 fits the selection while the canvas has keyboard focus.

The host decides whether a tree click previews a node or opens its property data.
There is no separate inspect mode in the renderer.

`fig-renderer/core` exports the pure scene builder, hierarchy, camera helpers, and
binary geometry decoders. It imports neither React nor CSS and works in non-browser
tests. `buildNodeTree` is shared with the web app so sibling ordering and parent links
remain consistent.

## Geometry and text

Saved node transforms and sizes are authoritative; the renderer does not run auto
layout or apply constraints. Cached `fillGeometry` and `strokeGeometry` reference
blobs with one-byte verbs followed by little-endian float32 coordinates:

| Verb      | Opcode | Coordinates                           |
| --------- | ------ | ------------------------------------- |
| Close     | 0      | none                                  |
| Move      | 1      | x, y                                  |
| Line      | 2      | x, y                                  |
| Quadratic | 3      | control x/y, end x/y                  |
| Cubic     | 4      | control 1 x/y, control 2 x/y, end x/y |

Text uses `derivedTextData.glyphs` in newer exports and `textData.glyphs` in older
ones. Each glyph reuses its saved path at its saved position and font size, with the
em-coordinate Y axis flipped. Tracking, kerning, wrapping, and alignment are already
encoded in those positions. No browser font measurement or text reflow occurs.

If cached vector paths are absent, the network fallback reads three uint32 counts,
12-byte vertex records (style, x, y), 28-byte segment records (style, start vertex,
start tangent x/y, end vertex, end tangent x/y), and region loop segment lists. It
traces connected edges, reverses tangent order when needed, and scales from
`normalizedSize` to the saved node size. Cached geometry takes precedence because
it already incorporates corner rounding and stroke expansion.

## Performance and lifetime

Paths are decoded once per document and glyph definitions are shared through SVG
`use` elements. The scene drawing is memoized; camera movement updates one SVG group
at most once per animation frame. Images are read only for the active page, with
four reads at a time, deduplicated by hash/blob index. Object URLs are released and
pending reads aborted when the page or document is disposed. The renderer performs
no network requests for images or fonts.

## Current limits

This is an inspection renderer, not a pixel-identical implementation of Figma.

- Missing glyph outlines are not reconstructed using substitute fonts.
- The vector-network fallback does not reproduce per-vertex rounding or per-region
  paint overrides and uses even-odd filling. Cached paths preserve these details.
- Angular and diamond gradients are approximated with radial gradients. Background
  blur, newer material effects, and some blend modes are not reproduced.
- Stroke alignment is exact when expanded stroke geometry is present; primitive
  fallback strokes use centered SVG strokes.
- Instances need expanded scene children/geometry in the export. The renderer does
  not synthesize missing instance subtrees from component definitions.
- Image color adjustments and color-profile conversion are not implemented.

## Development

From the repository root:

```sh
bun run check
bun run --cwd packages/fig-renderer build
bun run --cwd apps/web build
```

The package exports source entrypoints, matching this monorepo's workspace setup.
Its build command also emits JavaScript, declarations, and CSS into `dist/` for
packaging inspection. No user test exports are copied into the repository.
