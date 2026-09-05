import { readFigFile, type ParsedFigmaArchive } from "./index"

export interface FigmaImageEntry {
  /** Path relative to images/ in the ZIP. */
  name: string
  size: number
  compressedSize: number
  /** Read and decompress this entry only, when requested. */
  read: (signal?: AbortSignal) => Promise<Blob>
}

export interface ParsedFigmaBlob extends ParsedFigmaArchive {
  imageEntries?: FigmaImageEntry[]
}

/** Read a local export without loading or decompressing its external images. */
export async function readFigFileBlob(file: Blob): Promise<ParsedFigmaBlob> {
  const prefix = await file.slice(0, 4).arrayBuffer()
  const signature =
    prefix.byteLength === 4
      ? new DataView(prefix).getUint32(0, true)
      : undefined
  if (signature !== 0x04034b50 && signature !== 0x06054b50) {
    return readFigFile(new Uint8Array(await file.arrayBuffer()))
  }

  // BlobReader seeks to the ZIP directory and reads only the requested entries.
  // Passing a stream here would buffer the entire ZIP, including image bytes.
  const { BlobReader, BlobWriter, ZipReader } =
    await import("@zip.js/zip.js/lib/zip-core-native.js")
  const reader = new ZipReader(new BlobReader(file), { useWebWorkers: false })
  try {
    const entries = await reader.getEntries()
    const canvas = entries.find((entry) => entry.filename === "canvas.fig")
    if (!canvas || canvas.directory) {
      throw new Error(
        "This ZIP does not contain canvas.fig. Select a Figma .fig export."
      )
    }

    const result = readFigFile(new Uint8Array(await canvas.arrayBuffer()))
    const thumbnail = entries.find(
      (entry) => entry.filename === "thumbnail.png"
    )
    if (thumbnail && !thumbnail.directory) {
      result.preview = new Uint8Array(await thumbnail.arrayBuffer())
    }
    const imageEntries: FigmaImageEntry[] = []
    for (const entry of entries) {
      if (!entry.directory && entry.filename.startsWith("images/")) {
        imageEntries.push({
          name: entry.filename.slice("images/".length),
          size: entry.uncompressedSize,
          compressedSize: entry.compressedSize,
          read: (signal) => entry.getData(new BlobWriter(), { signal }),
        })
      }
    }
    return { ...result, imageEntries }
  } finally {
    await reader.close()
  }
}
