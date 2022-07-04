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
import { Schema as CompiledSchema, NodeChange, Message } from "./schema-defs";
import { inflateRaw } from "pako";

test("this just formats the schema", () => {
  const prettySchema = prettyPrintSchema(schema);
  writeFileSync(__dirname + "/figma-pretty.kiwi", prettySchema);
});

function parseFile(data: Uint8Array): Message {
  const parsed = FigmaArchiveParser.parseArchive(data);
  const [schemaFile, dataFile, previewFile] = parsed.files;
  const fileSchema = decodeBinarySchema(inflateRaw(schemaFile));
  const parser = new FigDataParser(inflateRaw(dataFile), fileSchema);
  return parser.parseMessage();
}

test("able to parse figma kiwi", () => {
  const data = readFileSync(__dirname + "/data/blue-circle.fig");
  const parsed = FigmaArchiveParser.parseArchive(data);
  const [schemaFile, dataFile, previewFile] = parsed.files;
  const figDataDec = inflateRaw(dataFile);
  expect(figDataDec.length).toBeGreaterThan(100);
  writeFileSync(__dirname + "/data/blue-circle.fig-inflated", figDataDec);
  const fileSchema = decodeBinarySchema(inflateRaw(schemaFile));
  expect(fileSchema).toHaveProperty("definitions");
  const parser = new FigDataParser(figDataDec, fileSchema);
  const decoded = parser.parseMessage();
  expect(decoded).not.toBeNull();
});

test("compare red and blue", () => {
  const blue = parseFile(readFileSync(__dirname + "/data/blue-circle.fig"));
  const red = parseFile(readFileSync(__dirname + "/data/red-circle.fig"));
  expect(blue).toMatchSnapshot();
});

test("able to enc dec a known message", () => {
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

test("able to decode a real websocket message", () => {
  const cs = compileSchema(schema) as CompiledSchema;
  const dataCompressed = readFileSync(__dirname + "/data/set-black.bin");
  const data = inflateRaw(dataCompressed);
  const decoded = cs.decodeMessage(data);
  expect(decoded).not.toBeNull();
  expect(decoded).toMatchSnapshot();
});
