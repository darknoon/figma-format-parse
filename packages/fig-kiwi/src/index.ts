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
import { decompress as zstdDecompress } from "fzstd";
// Exports as the parsed default schema
import defaultSchema from "./schema";

export { type FigmaMeta, type Message, type Header, type CompiledSchema };

const ZSTD_MAGIC = 0xfd2fb528;

function decompress(data: Uint8Array): Uint8Array {
  if (data.length >= 4) {
    const magic = new DataView(data.buffer, data.byteOffset, 4).getUint32(0, true);
    if (magic === ZSTD_MAGIC) {
      return zstdDecompress(data);
    }
  }
  return inflateRaw(data);
}

export interface ParsedFigma {
  header: Header;
  schema: Schema;
  message: Message;
}
export interface ParsedFigmaHTML extends ParsedFigma {
  header: Header;
  meta: FigmaMeta;
  schema: Schema;
  message: Message;
}

export interface ParsedFigmaArchive extends ParsedFigma {
  preview: Uint8Array;
}

export function readHTMLMessage(html: string): ParsedFigmaHTML {  
  const { figma, meta } = parseHTMLString(html);
  const { header, files } = FigmaArchiveParser.parseArchive(figma);
  const [schemaCompressed, dataCompressed] = files;
  const schema = decodeBinarySchema(decompress(schemaCompressed));
  const compiledSchema = compileSchema(schema) as CompiledSchema;
  const message = compiledSchema.decodeMessage(decompress(dataCompressed));
  return { header, meta, schema, message };
}

export function writeHTMLMessage(m: {
  meta: FigmaMeta;
  schema: Schema;
  header?: Header;
  message: Message;
}): string {
  const { meta, schema, header, message } = m;
  return composeHTMLString({
    meta,
    figma: writeFigFile({ schema, header, message }),
  });
}

export function readFigFile(data: Uint8Array): ParsedFigmaArchive {
  const { header, files } = FigmaArchiveParser.parseArchive(data);
  const [schemaFile, dataFile, preview] = files;
  const fileSchema = decodeBinarySchema(decompress(schemaFile));
  const compiledSchema = compileSchema(fileSchema) as CompiledSchema;
  const message = compiledSchema.decodeMessage(decompress(dataFile));
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
