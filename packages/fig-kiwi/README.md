## fig-kiwi parser

This module parses the figma file format:

- HTML file from pasteboard with (figma) (/figma) comments
- Data in .fig archives (starts with fig-kiwi)
- ZIP-wrapped .fig exports containing canvas.fig, thumbnail.png, and images/
- Includes typescript definitions derived from the [kiwi schema](https://github.com/evanw/kiwi) included with pasteboard and file data

Not included:

- Parsing Blob data in the returned Message (ie for vector networks etc)

Your use of this library is your responsibility, there is no warranty or support of any kind.

## Usage

```ts
import { readHTMLMessage } from "fig-kiwi";
const html = clipboardData.getData("text/html");
const { message, meta } = readHTMLMessage(html);
```

message data:

```json
{
  "type": "NODE_CHANGES",
  "sessionID": 0,
  "ackID": 0,
  "pasteID": 96190569,
  "pasteFileKey": "5z51beZU76UT5i92h3clNO",
  "pasteIsPartiallyOutsideEnclosingFrame": false,
  "pastePageId": {
    "sessionID": 0,
    "localID": 1
  }
  // ...
}
```

## Loading a .fig file in node

```ts
import { readFigFile, writeFigFile } from "fig-kiwi";
const fig: Uint8Array = readFileSync("vector.fig");
const { message, schema, preview, images } = readFigFile(fig);
// do something

// write out file
const mod = writeFigFile({ message, schema });
writeFileSync("modified.fig", mod);
```

`readFigFile` detects raw Kiwi and ZIP-wrapped files automatically. `preview` is
optional and uses `thumbnail.png` when present in a ZIP. `images` contains external
image bytes keyed by their path relative to `images/`; raw Kiwi files omit it.
Pass `{ includeImages: false }` as the second argument to skip extracting external
images when only inspecting document data and the thumbnail. This also omits
`images` from the result, avoiding large unused byte arrays in a viewer's state.
ZIP metadata (`meta.json`) is not parsed. `writeFigFile` writes a raw Kiwi archive
and does not package external image assets into a ZIP.

For browser file inputs, use the asynchronous Blob reader to avoid reading the
entire ZIP into memory. It reads the ZIP directory, `canvas.fig`, and
`thumbnail.png` directly from byte ranges of the original File. External image
entries are listed as `imageEntries` without being extracted or decompressed.
Each entry includes its name, size, compressed size, and an asynchronous `read`
function. Call it only when the image is needed; it returns a Blob and accepts an
optional AbortSignal. Retaining these entries retains access to the original File.

```ts
import { readFigFileBlob } from "fig-kiwi/blob";
const parsed = await readFigFileBlob(fileInput.files[0]);
// On selection, load just that image (the caller owns any object URL it creates).
const image = await parsed.imageEntries?.[0]?.read();
```
