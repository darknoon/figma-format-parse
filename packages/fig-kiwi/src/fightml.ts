import {toByteArray} from "base64-js"

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
  const bytes = toByteArray(s);
  return new TextDecoder().decode(bytes);
}

function base64_decode_data(s: string): Uint8Array {
  return toByteArray(s);
}

// Or throw exception on error
export function parseHTMLString(html: string): ParsedFigmaHTML {
  const msi = html.indexOf(metaStart);
  const mei = html.indexOf(metaEnd);
  const fsi = html.indexOf(figmaStart);
  const fei = html.indexOf(figmaEnd);

  if (msi == -1 || msi > mei || mei == -1) {
    throw new Error("Couldn't find figmeta");
  }
  if (fsi == -1 || fsi > fei || fei == -1) {
    throw new Error("Couldn't find figma");
  }

  const metaB64 = html.substring(msi + metaStart.length, mei);
  const figB64 = html.substring(fsi + figmaStart.length, fei);

  const metaStr = base64_decode_string(metaB64);
  return {
    meta: JSON.parse(metaStr),
    figma: base64_decode_data(figB64),
  };
}

export function composeHTMLString(data: ParsedFigmaHTML): string {
  const strValue = "";
  // TODO: I think I need to EncodeURIComponent here?
  const metaJ = JSON.stringify(data.meta) + "\n";
  const metaStr = Buffer.from(metaJ).toString("base64");
  const figStr = Buffer.from(data.figma).toString("base64");

  return `<meta charset="utf-8" /><span
  data-metadata="<!--(figmeta)${metaStr}(/figmeta)-->"
></span
><span
  data-buffer="<!--(figma)${figStr}(/figma)-->"
></span
><span style="white-space: pre-wrap">${strValue}</span>`;
}
