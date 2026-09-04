import { readFileSync } from "node:fs"
import { describe, expect, test } from "vitest"
import { Zip, ZipPassThrough, zipSync } from "fflate"
import { readFigFile } from "./index"
import { parseHTMLString } from "./fightml"

const raw = new Uint8Array(readFileSync(__dirname + "/../data/blue-circle.fig"))
const expected = readFigFile(raw)
const thumbnail = expected.preview!
const image = new Uint8Array([1, 2, 3, 4])

describe("ZIP-wrapped Figma exports", () => {
  test.each([0, 6] as const)("reads a ZIP at compression level %i", (level) => {
    const zip = zipSync(
      {
        "canvas.fig": raw,
        "thumbnail.png": thumbnail,
        "images/": new Uint8Array(),
        "images/image-hash": image,
        "meta.json": new TextEncoder().encode('{"file_name":"Example"}'),
      },
      { level }
    )

    const parsed = readFigFile(zip)

    expect(parsed.header).toEqual(expected.header)
    expect(parsed.schema).toEqual(expected.schema)
    expect(parsed.message).toEqual(expected.message)
    expect(parsed.preview).toEqual(thumbnail)
    expect(parsed.images).toEqual({ "image-hash": image })
    // Assets belong to the ZIP; they must not replace the document's blobs.
    expect(parsed.message.blobs).toEqual(expected.message.blobs)
  })

  test("reads streaming ZIPs with data descriptors, as used by Figma exports", () => {
    const chunks: Uint8Array[] = []
    const zip = new Zip((error, chunk) => {
      if (error) throw error
      chunks.push(chunk)
    })
    const canvas = new ZipPassThrough("canvas.fig")
    zip.add(canvas)
    canvas.push(raw, true)
    zip.end()

    const bytes = new Uint8Array(Buffer.concat(chunks))
    expect(new DataView(bytes.buffer).getUint16(6, true) & 8).toBe(8)
    expect(readFigFile(bytes).message).toEqual(expected.message)
  })

  test("reads Zstandard-compressed Kiwi data inside a ZIP", () => {
    const html = readFileSync(__dirname + "/../data/figma-paste.html", "utf8")
    const { figma } = parseHTMLString(html)
    const parsed = readFigFile(zipSync({ "canvas.fig": figma }))

    expect(parsed.message.nodeChanges).toHaveLength(5)
    expect(parsed.schema.definitions).toHaveLength(580)
    expect(parsed.message).toEqual(readFigFile(figma).message)
    expect(parsed.preview).toBeUndefined()
    expect(parsed.images).toEqual({})
  })

  test("prefers the ZIP thumbnail and falls back to an embedded preview", () => {
    const externalPreview = new Uint8Array([5, 6, 7])
    expect(
      readFigFile(
        zipSync({ "canvas.fig": raw, "thumbnail.png": externalPreview })
      ).preview
    ).toEqual(externalPreview)
    expect(readFigFile(zipSync({ "canvas.fig": raw })).preview).toEqual(
      thumbnail
    )
  })

  test.each([
    ["raw Kiwi", raw],
    ["ZIP", zipSync({ "canvas.fig": raw })],
  ] as const)(
    "reads %s from a byte array with a nonzero offset",
    (_name, bytes) => {
      const padded = new Uint8Array(bytes.length + 31)
      padded.set(bytes, 17)
      const view = padded.subarray(17, 17 + bytes.length)

      expect(readFigFile(view).message).toEqual(expected.message)
    }
  )

  test.each([
    ["unrelated ZIP", zipSync({ "notes.txt": image })],
    ["empty ZIP", zipSync({})],
  ] as const)("explains a missing canvas.fig in an %s", (_name, bytes) => {
    expect(() => readFigFile(bytes)).toThrow(
      "This ZIP does not contain canvas.fig"
    )
  })

  test("rejects a truncated ZIP", () => {
    const zip = zipSync({ "canvas.fig": raw })
    expect(() => readFigFile(zip.subarray(0, zip.length - 30))).toThrow()
  })

  test("can skip external images while preserving the document and preview", () => {
    const zip = zipSync({
      "canvas.fig": raw,
      "thumbnail.png": thumbnail,
      "images/large-image": new Uint8Array(1024 * 1024),
    })
    const parsed = readFigFile(zip, { includeImages: false })

    expect(parsed.message).toEqual(expected.message)
    expect(parsed.preview).toEqual(thumbnail)
    expect(parsed.images).toBeUndefined()
  })

  test("rejects invalid Kiwi data inside a ZIP", () => {
    const invalid = new TextEncoder().encode("invalid canvas data")
    expect(() => readFigFile(zipSync({ "canvas.fig": invalid }))).toThrow(
      "Unexpected prelude"
    )
  })
})
