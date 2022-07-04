import { compileSchema } from "kiwi-schema";
import schema from "./schema";

type Decoder = (d: ArrayBuffer) => any;

export default class FigDataParser {
  data: DataView;
  constructor(buffer: ArrayBuffer) {
    this.data = new DataView(buffer);
  }

  parseAll(): Object {
    const compiled = compileSchema(schema);
    let decoded: any = null;
    let decodedName: string = "";
    const decoderNames = Object.keys(compiled).filter((d) =>
      d.startsWith("decode")
    );
    for (let name of decoderNames) {
      try {
        const d: Decoder = compiled[name];
        // console.log("using decoder " + name);
        decoded = d(new Uint8Array(this.data.buffer));
      } catch (err) {
        console.error(err);
        // console.warn(name + "failed");
      }
    }
    console.log("Tried all");
    return decoded;
  }
}
