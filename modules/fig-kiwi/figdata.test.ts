import FigmaArchiveParser from "./archive";
import FigDataParser from "./figdata";
import { readFileSync, writeFileSync } from "fs";
import {
  compileSchema,
  decodeBinarySchema,
  compileSchemaTypeScript,
  prettyPrintSchema,
} from "kiwi-schema";
import schema from "./schema";
import { deflateRaw, inflateRaw } from "pako";

test("able to parse figma kiwi", () => {
  const data = readFileSync(__dirname + "/data/blue-circle.fig");
  const parsed = FigmaArchiveParser.parseArchive(data);
  const figData = parsed.files[1];
  console.log("Decompress");
  const figDataDec = inflateRaw(figData);
  expect(figDataDec.length).toBeGreaterThan(100);
  console.log(
    `Decompressed ${figData.length} bytes to ${figDataDec.length} bytes`
  );
  console.log(figDataDec.buffer);
  writeFileSync(__dirname + "/data/blue-circle.fig-inflated", figDataDec);
  const parser = new FigDataParser(figDataDec.buffer);
  const decoded = parser.parseAll();
  // expect(decoded).not.toBeNull();
});

const tryAllDecoders = (data: ArrayBuffer): any => {};

export interface NodeChange {
  guid: { sessionID: number; localID: number };
}
interface CompiledSchema {
  encodeNodeChange(message: NodeChange): Uint8Array;
  decodeNodeChange(buffer: Uint8Array): NodeChange;
}

test("able to enc dec basic message", () => {
  const cs = compileSchema(schema) as CompiledSchema;
  const message: NodeChange = { guid: { sessionID: 123, localID: 321 } };
  const data = cs.encodeNodeChange(message);
  const decoded = cs.decodeNodeChange(data);
  expect(decoded).toEqual(message);
});

test("it's compressed binary kiwi format in the metadata", () => {
  const meta = readFileSync(__dirname + "/data/red-circle.fig-meta");
  const schemaBin = inflateRaw(meta);
  const figMetaSchema = decodeBinarySchema(schemaBin);
  writeFileSync(
    __dirname + "/data/red-circle.kiwi",
    prettyPrintSchema(figMetaSchema)
  );

  // writeFileSync(
  //   __dirname + "/fig-kiwi.ts",
  //   compileSchemaTypeScript(figMetaSchema)
  // );
  // console.log(tsdef);
});

test.skip("able to dec real websocket message", () => {
  const cs = compileSchema(schema) as CompiledSchema;
  const dataCompressed = readFileSync(__dirname + "/data/set-black.bin");
  const data = inflateRaw(dataCompressed);
  const decoded = cs.decodeNodeChange(new Uint8Array(data));
  expect(decoded).not.toBeNull();
});
