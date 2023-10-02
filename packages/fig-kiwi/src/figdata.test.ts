import FigmaArchiveParser, { FigmaArchiveWriter } from "./archive";
import { readFileSync, writeFileSync } from "fs";
import {
  compileSchema,
  decodeBinarySchema,
  compileSchemaTypeScript,
  prettyPrintSchema,
  encodeBinarySchema,
} from "kiwi-schema";
import schema from "./schema";
import {
  Schema as CompiledSchema,
  NodeChange,
  Message,
  SparseMessage,
} from "./schema-defs";
import { deflateRaw, inflateRaw } from "pako";
import { readFigFile } from "./index";

test.skip("this just formats the schema", () => {
  const prettySchema = prettyPrintSchema(schema);
  writeFileSync(__dirname + "/figma.kiwi", prettySchema);
});

test("able to parse figma kiwi", () => {
  const data = readFileSync(__dirname + "/../data/blue-circle.fig");
  const parsed = FigmaArchiveParser.parseArchive(data);
  expect(parsed.header.version).toBe(15);
  const [schemaFile, dataFile, previewFile] = parsed.files;
  const figDataDec = inflateRaw(dataFile);
  expect(figDataDec.length).toBeGreaterThan(100);
  writeFileSync(__dirname + "/../data/blue-circle.fig-inflated", figDataDec);
  const fileSchema = decodeBinarySchema(inflateRaw(schemaFile));
  expect(fileSchema).toHaveProperty("definitions");
  const compiledSchema = compileSchema(fileSchema) as CompiledSchema;
  const decoded = compiledSchema.decodeMessage(figDataDec);
  expect(decoded).not.toBeNull();
});

test("compare red and blue", () => {
  const blue = readFigFile(
    readFileSync(__dirname + "/../data/blue-circle.fig")
  ).message;
  const red = readFigFile(
    readFileSync(__dirname + "/../data/red-circle.fig")
  ).message;
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
  const meta = readFileSync(__dirname + "/../data/red-circle.fig-meta");
  const schemaBin = inflateRaw(meta);
  writeFileSync(__dirname + "/../data/red-circle.bkiwi", schemaBin);
  const figMetaSchema = decodeBinarySchema(schemaBin);
  writeFileSync(
    __dirname + "/../data/red-circle.kiwi",
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
  const dataCompressed = readFileSync(__dirname + "/../data/set-black.bin");
  const data = inflateRaw(dataCompressed);
  const decoded = cs.decodeMessage(data);
  expect(decoded).not.toBeNull();
  expect(decoded).toMatchSnapshot();
});

test("able to write dummy files to a fig-kiwi archive", () => {
  const encoder = new FigmaArchiveWriter();
  const expectedFiles = [
    new Uint8Array([128, 1, 2, 3, 4, 5]),
    new Uint8Array([256, 5, 6, 7, 8, 23, 11]),
  ];
  encoder.files = expectedFiles;
  const archive = encoder.write();

  // Now decode and verify
  const { header, files } = FigmaArchiveParser.parseArchive(archive);
  expect(files).toEqual(expectedFiles);
  expect(header).toEqual(encoder.header);
});

test("able to write a Message to an archive", () => {
  const binSchema = encodeBinarySchema(schema);
  const compiledSchema = compileSchema(schema) as CompiledSchema;
  const message: SparseMessage = JSON.parse(
    readFileSync(__dirname + "/../data/grey-circle-paste.json", {
      encoding: "utf8",
    })
  );
  const encoder = new FigmaArchiveWriter();
  encoder.files = [
    deflateRaw(binSchema),
    deflateRaw(compiledSchema.encodeMessage(message)),
  ];
  const data = encoder.write();
  writeFileSync(__dirname + "/../data/grey-circle-paste-generated.fig", data);
});
