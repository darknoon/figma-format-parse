export type Header = { prelude: string; version: number };

const FIG_KIWI_PRELUDE = "fig-kiwi";
const FIG_KIWI_VERSION = 15;

export default class FigmaArchiveParser {
  buffer: Uint8Array;
  data: DataView;
  offset = 0;

  constructor(buffer: Uint8Array) {
    this.buffer = buffer;
    this.data = new DataView(buffer.buffer);
  }

  private readUint32(): number {
    // All little endian
    const n = this.data.getUint32(this.offset, true);
    this.offset += 4;
    return n;
  }

  private read(bytes: number): Uint8Array {
    if (this.offset + bytes <= this.buffer.length) {
      const d = this.buffer.slice(this.offset, this.offset + bytes);
      this.offset += bytes;
      return d;
    } else {
      throw new Error(`read(${bytes}) is past end of data`);
    }
  }

  private readHeader(): Header {
    const preludeData = this.read(FIG_KIWI_PRELUDE.length);
    // @ts-ignore todo: either downlevel-iteration or a type mismatch here
    const prelude = String.fromCharCode.apply(String, preludeData);
    if (prelude != FIG_KIWI_PRELUDE) {
      throw new Error(`Unexpected prelude: "${prelude}"`);
    }
    const version = this.readUint32();
    return { prelude, version };
  }

  private readData(size: number): Uint8Array {
    return this.read(size);
  }

  private readAll(): { header: Header; files: Uint8Array[] } {
    const header = this.readHeader();
    const files: Uint8Array[] = [];
    while (this.offset + 4 < this.buffer.length) {
      const size = this.readUint32();
      const data = this.readData(size);
      files.push(data);
    }
    return { header, files };
  }

  static parseArchive(data: Uint8Array): {
    header: Header;
    files: Uint8Array[];
  } {
    const parser = new FigmaArchiveParser(data);
    return parser.readAll();
  }
}

export class FigmaArchiveWriter {
  public header: Header;
  public files: Uint8Array[] = [];

  constructor() {
    this.header = { prelude: FIG_KIWI_PRELUDE, version: FIG_KIWI_VERSION };
  }

  /** 
   Add pre-compressed chunk to archive
  */

  write(): Uint8Array {
    // First find the total size, allocate a large enough buffer
    const headerSize = FIG_KIWI_PRELUDE.length + 4;
    const totalSize = this.files.reduce(
      (sz, f) => sz + 4 + f.byteLength,
      headerSize
    );
    const buffer = new Uint8Array(totalSize);
    const view = new DataView(buffer.buffer);
    const enc = new TextEncoder();
    // Write
    let offset = 0;
    offset = enc.encodeInto(FIG_KIWI_PRELUDE, buffer).written!;
    view.setUint32(offset, this.header.version, true);
    offset += 4;
    for (let file of this.files) {
      view.setUint32(offset, file.byteLength, true);
      offset += 4;
      buffer.set(file, offset);
      offset += file.byteLength;
    }
    return buffer;
  }
}
