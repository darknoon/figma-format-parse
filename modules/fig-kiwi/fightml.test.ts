import { readFileSync, writeFileSync } from "fs";
import { parseHTMLString } from "./fightml";
import FigmaArchiveParser from "./archive";
import { compileSchema, decodeBinarySchema } from "kiwi-schema";
import { Schema as CompiledSchema, Message, SparseMessage } from "./fig-kiwi";
import { inflateRaw } from "pako";

test("parses components from html string", () => {
  const str = readFileSync(__dirname + "/data/c00000-circle-paste.html", {
    encoding: "utf-8",
  });

  const { figma, meta } = parseHTMLString(str);

  expect(meta).toEqual({
    fileKey: "whhd71XEXzYNauiHCeztfu",
    pasteID: 2130739331,
    dataType: "scene",
  });

  expect(figma.byteLength).toBeGreaterThan(1000);

  // Just to make debugging easier, extract the file
  writeFileSync(
    __dirname + "/data/c00000-circle-paste.fig",
    new Uint8Array(figma)
  );

  const parsed = FigmaArchiveParser.parseArchive(figma);
  expect(parsed.files.length).toBe(2);

  const [schemaFile, dataFile] = parsed.files;
  const fileSchema = decodeBinarySchema(inflateRaw(schemaFile));

  const cs = compileSchema(fileSchema) as CompiledSchema;

  const message: SparseMessage = cs.decodeSparseMessage(inflateRaw(dataFile));
  expect(message).toMatchSnapshot();
});
