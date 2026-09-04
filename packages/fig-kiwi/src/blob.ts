import { readFigFile, type ParsedFigmaArchive } from "./index"

/** Read a local export without loading or decompressing its external images. */
export async function readFigFileBlob(file: Blob): Promise<ParsedFigmaArchive> {
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
  const { BlobReader, ZipReader } =
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
    return result
  } finally {
    await reader.close()
  }
}
