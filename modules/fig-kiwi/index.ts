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

export { FigmaArchiveParser };
