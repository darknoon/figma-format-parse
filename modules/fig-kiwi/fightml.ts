import { Buffer } from "buffer";

const metaStart = "<!--(figmeta)";
const metaEnd = "(/figmeta)-->";

const figmaStart = "<!--(figma)";
const figmaEnd = "(/figma)-->";

export interface FigmaMeta {
  fileKey: string;
  pasteID: number;
  dataType: "scene";
}
export interface ParsedFigmaHTML {
  meta: FigmaMeta;
  figma: Uint8Array;
}

function base64_decode_string(s: string): string {
  // TODO: don't require Buffer for this
  return Buffer.from(s, "base64").toString();
}

function base64_decode_data(s: string): Uint8Array {
  // TODO: don't require Buffer for this
  return Buffer.from(s, "base64");
}

// Or throw exception on error
export function parseHTMLString(html: string): ParsedFigmaHTML {
  const msi = html.indexOf(metaStart);
  const mei = html.indexOf(metaEnd);
  const fsi = html.indexOf(figmaStart);
  const fei = html.indexOf(figmaEnd);

  if (msi == -1) {
    throw new Error("Couldn't find start of figmeta");
  }

  const metaB64 = html.substring(msi + metaStart.length, mei);
  const figB64 = html.substring(fsi + figmaStart.length, fei);

  const metaStr = base64_decode_string(metaB64);
  return {
    meta: JSON.parse(metaStr),
    figma: base64_decode_data(figB64),
  };
}
