import { compileSchema, Schema } from "kiwi-schema";
import { Message, Schema as CompiledSchema } from "./schema-defs";

export default class FigDataParser {
  data: Uint8Array;
  schema: Schema;
  constructor(data: Uint8Array, schema: Schema) {
    this.data = data;
    this.schema = schema;
  }

  parseMessage(): Message {
    const compiled = compileSchema(this.schema) as CompiledSchema;
    return compiled.decodeMessage(this.data);
  }

  parseAll(): Object {
    const compiled = compileSchema(this.schema);
    let decoded: any = null;
    let decodedName: string = "";
    const decoderNames = Object.keys(compiled).filter((d) =>
      d.startsWith("decode")
    );
    for (let name of decoderNames) {
      try {
        // Have to call with this syntax so this is bound to compiled :O
        decoded = compiled[name](this.data);
        decodedName = name;
        console.log("decoded as ", decodedName, decoded);
      } catch (err) {
        // console.error(err);
        // console.warn(name + "failed");
      }
    }
    if (decoded === null) {
      console.error("Tried all, couldn't decode");
    }
    return decoded;
  }
}
