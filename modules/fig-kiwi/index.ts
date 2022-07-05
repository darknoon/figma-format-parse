import { composeHTMLString, FigmaMeta, parseHTMLString } from "./fightml";
import FigmaArchiveParser, { FigmaArchiveWriter, Header } from "./archive";
import {
  compileSchema,
  decodeBinarySchema,
  encodeBinarySchema,
  Schema,
} from "kiwi-schema";
import { Message, Schema as CompiledSchema } from "./schema-defs";
import { deflateRaw, inflateRaw } from "pako";
// Exports as the parsed default schema
import defaultSchema from "./schema";

export { type FigmaMeta };

interface ParsedFigma {
  header: Header;
  meta: FigmaMeta;
  schema: Schema;
  message: Message;
}

export function readHTMLMessage(html: string): ParsedFigma {
  const { figma, meta } = parseHTMLString(html);
  const { header, files } = FigmaArchiveParser.parseArchive(figma);
  const [schemaCompressed, dataCompressed] = files;
  const schema = decodeBinarySchema(inflateRaw(schemaCompressed));
  const compiledSchema = compileSchema(schema) as CompiledSchema;
  const message = compiledSchema.decodeMessage(inflateRaw(dataCompressed));
  return { header, meta, schema, message };
}

export function writeHTMLMessage(m: {
  meta: FigmaMeta;
  schema: Schema;
  message: Message;
}): string {
  const { meta, schema, message } = m;
  const encoder = new FigmaArchiveWriter();
  const binSchema = encodeBinarySchema(schema);
  const compiledSchema = compileSchema(schema) as CompiledSchema;
  encoder.files = [
    deflateRaw(binSchema),
    deflateRaw(compiledSchema.encodeMessage(m.message)),
  ];
  const data = encoder.write();
  return composeHTMLString({ meta, figma: data });
}

export function readFigFile(data: Uint8Array): {
  schema: Schema;
  header: Header;
  message: Message;
  preview: Uint8Array;
} {
  const { header, files } = FigmaArchiveParser.parseArchive(data);
  const [schemaFile, dataFile, preview] = files;
  const fileSchema = decodeBinarySchema(inflateRaw(schemaFile));
  const compiledSchema = compileSchema(fileSchema) as CompiledSchema;
  const message = compiledSchema.decodeMessage(inflateRaw(dataFile));
  return { message, schema: fileSchema, header, preview };
}

export function writeFigFile(settings: {
  schema?: Schema;
  header?: Header;
  message: Message;
  preview?: Uint8Array;
}): Uint8Array {
  const { schema = defaultSchema, message, preview } = settings;
  const compiledSchema = compileSchema(schema);
  const binSchema = encodeBinarySchema(schema);

  const writer = new FigmaArchiveWriter();
  writer.files = [
    deflateRaw(binSchema),
    deflateRaw(compiledSchema.encodeMessage(message)),
  ];
  if (preview) {
    writer.files.push(preview);
  }
  return writer.write();
}

export { FigmaArchiveParser };
