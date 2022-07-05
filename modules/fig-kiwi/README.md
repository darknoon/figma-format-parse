## fig-kiwi parser

This module parses the figma file format:

- HTML file from pasteboard with (figma) (/figma) comments
- Data in .fig archives (starts with fig-kiwi)
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
const fig: UInt8Array = readFileSync("vector.fig");
const { message, schema, preview } = readFigFile(fig);
// do something

// write out file
const mod = writeFigFile({ message, schema });
writeFileSync("modified.fig", mod);
```
