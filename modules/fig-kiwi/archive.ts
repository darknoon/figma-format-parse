export type Header = { prelude: string; version: number };

export default class FigmaArchiveParser {
  buffer: Uint8Array;
  data: DataView;
  offset = 0;

  constructor(buffer: Uint8Array) {
    this.buffer = buffer;
    this.data = new DataView(buffer.buffer);
  }

  readUint32(): number {
    // All little endian
    const n = this.data.getUint32(this.offset, true);
    this.offset += 4;
    return n;
  }

  read(bytes: number): Uint8Array {
    if (this.offset + bytes <= this.buffer.length) {
      const d = this.buffer.slice(this.offset, this.offset + bytes);
      this.offset += bytes;
      return d;
    } else {
      throw new Error(`read(${bytes}) is past end of data`);
    }
  }

  readHeader(): Header {
    const preludeExpected = "fig-kiwi";
    const preludeData = this.read(preludeExpected.length);
    const prelude = String.fromCharCode(...preludeData);
    if (prelude != preludeExpected) {
      throw new Error(`Unexpected prelude: "${prelude}"`);
    }
    const version = this.readUint32();
    return { prelude, version };
  }

  readData(size: number): Uint8Array {
    return this.read(size);
  }

  readAll(): { header: Header; files: Uint8Array[] } {
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
