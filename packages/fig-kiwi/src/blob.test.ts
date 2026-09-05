import { readFileSync } from "node:fs"
import { expect, test } from "vitest"
import { zipSync } from "fflate"
import { readFigFileBlob } from "./blob"
import { readFigFile } from "./index"

const canvas = new Uint8Array(
  readFileSync(__dirname + "/../data/blue-circle.fig")
)
const expected = readFigFile(canvas)

test("reads a raw Kiwi Blob", async () => {
  expect(await readFigFileBlob(new Blob([canvas]))).toEqual(expected)
})

test.each([0, 6] as const)(
  "reads only document assets from a ZIP at level %i",
  async (level) => {
    const zip = zipSync(
      {
        "canvas.fig": canvas,
        "thumbnail.png": expected.preview!,
        "images/large-image": new Uint8Array(8 * 1024 * 1024),
        "images/selected-image": expected.preview!,
        "images/": new Uint8Array(),
      },
      { level }
    )

    class TrackedBlob extends Blob {
      bytesRead = 0
      slice(start = 0, end = this.size, type?: string) {
        this.bytesRead += end - start
        return super.slice(start, end, type)
      }
      async arrayBuffer(): Promise<ArrayBuffer> {
        // Looking for the ZIP directory can read an entire very small archive.
        if (this.size > 100_000) {
          throw new Error("Must not read the whole large ZIP into memory")
        }
        this.bytesRead += this.size
        return super.arrayBuffer()
      }
      stream(): ReadableStream<Uint8Array<ArrayBuffer>> {
        throw new Error("Must not stream the whole ZIP into memory")
      }
    }
    const file = new TrackedBlob([zip])
    const parsed = await readFigFileBlob(file)

    const { imageEntries, ...document } = parsed
    expect(document).toEqual(expected)
    expect(parsed.images).toBeUndefined()
    expect(file.bytesRead).toBeLessThan(100_000)
    expect(imageEntries?.map(({ name, size }) => ({ name, size }))).toEqual([
      { name: "large-image", size: 8 * 1024 * 1024 },
      { name: "selected-image", size: expected.preview!.length },
    ])

    const beforeSelection = file.bytesRead
    const selected = await imageEntries![1].read()
    expect(new Uint8Array(await selected.arrayBuffer())).toEqual(expected.preview)
    expect(file.bytesRead - beforeSelection).toBeLessThan(100_000)
  }
)

test("defers an invalid image stream until that image is selected", async () => {
  const zip = zipSync({
    "canvas.fig": canvas,
    "images/damaged": new Uint8Array(1024),
    "images/good": expected.preview!,
  })
  const view = new DataView(zip.buffer)
  // Skip the canvas local header and payload, then corrupt only the image stream.
  const imageHeader = 30 + view.getUint16(26, true) + view.getUint16(28, true) + view.getUint32(18, true)
  const imageData = imageHeader + 30 + view.getUint16(imageHeader + 26, true) + view.getUint16(imageHeader + 28, true)
  zip[imageData] = 7 // Reserved DEFLATE block type.

  const parsed = await readFigFileBlob(new Blob([zip]))
  const good = await parsed.imageEntries![1].read()
  expect(new Uint8Array(await good.arrayBuffer())).toEqual(expected.preview)
  await expect(parsed.imageEntries![0].read()).rejects.toThrow()
})

test("can cancel an image read without preventing a later retry", async () => {
  const parsed = await readFigFileBlob(new Blob([zipSync({
    "canvas.fig": canvas,
    "images/preview": expected.preview!,
  })]))
  const controller = new AbortController()
  controller.abort()
  await expect(parsed.imageEntries![0].read(controller.signal)).rejects.toThrow()
  const image = await parsed.imageEntries![0].read()
  expect(new Uint8Array(await image.arrayBuffer())).toEqual(expected.preview)
})

test("explains when a ZIP Blob has no canvas.fig", async () => {
  await expect(readFigFileBlob(new Blob([zipSync({})]))).rejects.toThrow(
    "This ZIP does not contain canvas.fig"
  )
})

test("rejects a truncated ZIP Blob", async () => {
  const zip = zipSync({ "canvas.fig": canvas })
  await expect(
    readFigFileBlob(new Blob([zip.subarray(0, zip.length - 30)]))
  ).rejects.toThrow()
})
