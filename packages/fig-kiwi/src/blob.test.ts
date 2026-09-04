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

    expect(parsed).toEqual(expected)
    expect(parsed.images).toBeUndefined()
    expect(file.bytesRead).toBeLessThan(100_000)
  }
)

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
