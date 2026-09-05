import { expect, test } from "bun:test"
import type { Message } from "fig-kiwi"
import type { FigmaImageEntry } from "fig-kiwi/blob"
import { imageAssets, readThumbnails } from "../src/parser/image-assets"

const hash = (id: number) => new Uint8Array(20).fill(id)
const name = (id: number) => id.toString(16).padStart(2, "0").repeat(20)
function entry(
  id: number,
  read: FigmaImageEntry["read"] = async () => new Blob()
): FigmaImageEntry {
  return { name: name(id), size: 1_000_000, compressedSize: 900_000, read }
}
function message(original: number, thumbnail: number): Message {
  return {
    nodeChanges: [
      {
        name: "Layer name",
        fillPaints: [
          {
            image: { hash: hash(original), name: "Image name" },
            imageThumbnail: { hash: hash(thumbnail) },
          },
        ],
      },
    ],
  }
}

test("pairs by hash, displaying one card whose click target is the original", () => {
  const original = entry(1)
  const thumbnail = entry(2)
  expect(imageAssets([thumbnail, original], message(1, 2))).toEqual([
    {
      entry: original,
      name: "Image name",
      thumbnail,
      references: [{ nodeIndex: 0, name: "Layer name", guid: undefined }],
    },
  ])
})

test("keeps images without thumbnails visible without reading their bytes", async () => {
  let reads = 0
  const read = async () => {
    reads++
    return new Blob()
  }
  const missingThumbnail = entry(1, read)
  const unreferenced = { ...entry(3, read), name: "thumbnail.png" }
  const assets = imageAssets([missingThumbnail, unreferenced], message(1, 2))
  expect(assets.map((asset) => asset.thumbnail)).toEqual([undefined, undefined])
  await readThumbnails(
    assets,
    new AbortController().signal,
    () => {},
    () => {}
  )
  expect(reads).toBe(0)
})

test("keeps additional thumbnail variants accessible", () => {
  const entries = [entry(1), entry(2), entry(3)]
  const assets = imageAssets(entries, {
    nodeChanges: [...message(1, 2).nodeChanges!, ...message(1, 3).nodeChanges!],
  })
  expect(
    assets.map(({ entry, thumbnail }) => [entry.name, thumbnail?.name])
  ).toEqual([
    [name(1), name(2)],
    [name(3), name(3)],
  ])
})

test("loads a shared thumbnail once, never reading either original", async () => {
  const reads: number[] = []
  const entries = [1, 2, 3].map((id) =>
    entry(id, async () => {
      reads.push(id)
      return new Blob()
    })
  )
  const data: Message = {
    nodeChanges: [
      ...message(1, 2).nodeChanges!,
      { strokePaints: message(3, 2).nodeChanges![0].fillPaints },
    ],
  }
  const loaded: string[] = []
  await readThumbnails(
    imageAssets(entries, data),
    new AbortController().signal,
    (item) => loaded.push(item.name),
    () => {}
  )
  expect(reads).toEqual([2])
  expect(loaded).toEqual([name(2)])
})

test("a failed thumbnail never falls back to loading the original", async () => {
  const reads: number[] = []
  const entries = [1, 2].map((id) =>
    entry(id, async () => {
      reads.push(id)
      throw new Error("Invalid image")
    })
  )
  const errors: string[] = []
  await readThumbnails(
    imageAssets(entries, message(1, 2)),
    new AbortController().signal,
    () => {
      throw new Error("Should not load")
    },
    (item) => errors.push(item.name)
  )
  expect(reads).toEqual([2])
  expect(errors).toEqual([name(2)])
})

test("retains standalone thumbnails but does not auto-load an original that references itself", () => {
  const thumbnail = entry(2)
  expect(imageAssets([thumbnail], message(1, 2))).toEqual([
    {
      entry: thumbnail,
      name: "Layer name",
      thumbnail,
      references: [{ nodeIndex: 0, name: "Layer name", guid: undefined }],
    },
  ])
  expect(imageAssets([entry(1)], message(1, 1))[0].thumbnail).toBeUndefined()
})

test("limits concurrent reads and abandons queued thumbnails when the view closes", async () => {
  const pending: Array<(blob: Blob) => void> = []
  const controller = new AbortController()
  const assets = Array.from({ length: 10 }, (_, id) => {
    const thumbnail = entry(id, (signal) => {
      expect(signal).toBe(controller.signal)
      return new Promise<Blob>((resolve) => pending.push(resolve))
    })
    return { entry: thumbnail, thumbnail, name: thumbnail.name }
  })
  let loaded = 0
  const reading = readThumbnails(
    assets,
    controller.signal,
    () => loaded++,
    () => {}
  )
  expect(pending).toHaveLength(4)
  controller.abort()
  for (const resolve of pending) resolve(new Blob())
  await reading
  expect(pending).toHaveLength(4)
  expect(loaded).toBe(0)
})

test("counts referencing nodes once across fills, strokes, and thumbnail aliases", () => {
  const paints = message(1, 1).nodeChanges![0].fillPaints
  const assets = imageAssets([entry(1), entry(2)], {
    nodeChanges: [
      { fillPaints: paints, strokePaints: paints },
      { fillPaints: paints },
    ],
  })
  expect(assets.map((asset) => asset.references?.length)).toEqual([2, 0])
  const referenced = imageAssets([entry(1)], {
    nodeChanges: [
      {
        guid: { sessionID: 3, localID: 4 },
        name: "Picture",
        fillPaints: paints,
      },
    ],
  })
  expect(referenced[0].references).toEqual([
    { nodeIndex: 0, guid: { sessionID: 3, localID: 4 }, name: "Picture" },
  ])
})
