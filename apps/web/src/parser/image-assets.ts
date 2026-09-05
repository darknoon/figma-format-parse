import type { Message } from "fig-kiwi"
import type { GUID, Image } from "fig-kiwi/schema-defs"
import type { FigmaImageEntry } from "fig-kiwi/blob"
import { hex } from "./hex"

export interface ImageReference {
  nodeIndex: number
  guid?: GUID
  name?: string
}

export interface ImageAsset {
  key: string
  entry?: FigmaImageEntry
  name: string
  references?: ImageReference[]
  thumbnail?: FigmaImageEntry
  isPreview?: boolean
}

export function imageId(image?: Image) {
  return image?.dataBlob !== undefined
    ? `blob:${image.dataBlob}`
    : image?.hash && hex(image.hash)
}

export function hasImageReferences(message: Message) {
  return (
    message.nodeChanges?.some((node) =>
      [...(node.fillPaints ?? []), ...(node.strokePaints ?? [])].some((paint) =>
        [paint.image, paint.animatedImage, paint.imageThumbnail].some(imageId)
      )
    ) ?? false
  )
}

/** Pair assets using Figma's image hashes, without reading any image bytes. */
export function imageAssets(
  entries: FigmaImageEntry[],
  message: Message,
  preview?: Uint8Array
): ImageAsset[] {
  const byName = new Map(entries.map((entry) => [entry.name, entry]))
  const names = new Map<string, string>()
  const uses = new Map<string, Map<number, ImageReference>>()
  const originals = new Set<string>()
  const thumbnails = new Set<string>()
  const pairedThumbnails = new Set<string>()
  const previewFor = new Map<string, FigmaImageEntry>()
  for (const [nodeIndex, node] of (message.nodeChanges ?? []).entries()) {
    for (const paint of [
      ...(node.fillPaints ?? []),
      ...(node.strokePaints ?? []),
    ]) {
      for (const image of [
        paint.image,
        paint.animatedImage,
        paint.imageThumbnail,
      ]) {
        const id = imageId(image)
        if (image && id) {
          if (!byName.has(id) && image.dataBlob !== undefined) {
            const bytes = message.blobs?.[image.dataBlob]?.bytes
            if (bytes)
              byName.set(id, {
                name: id,
                size: bytes.length,
                compressedSize: bytes.length,
                read: async (signal) => {
                  signal?.throwIfAborted()
                  return new Blob([new Uint8Array(bytes)])
                },
              })
          }
          const nodes = uses.get(id) ?? new Map<number, ImageReference>()
          nodes.set(nodeIndex, { nodeIndex, guid: node.guid, name: node.name })
          uses.set(id, nodes)
        }
        if (image && id && (image.name || node.name) && !names.has(id)) {
          names.set(id, image.name || node.name!)
        }
      }
      const thumbnailId = imageId(paint.imageThumbnail)
      const thumbnail = thumbnailId && byName.get(thumbnailId)
      if (thumbnail) thumbnails.add(thumbnail.name)
      for (const image of [paint.image, paint.animatedImage]) {
        const id = imageId(image)
        if (!id) continue
        originals.add(id)
        if (thumbnail && thumbnail.name !== id && !previewFor.has(id)) {
          previewFor.set(id, thumbnail)
          pairedThumbnails.add(thumbnail.name)
        }
      }
    }
  }
  const assets: ImageAsset[] = [...new Set([...byName.keys(), ...uses.keys()])]
    .filter((key) => !pairedThumbnails.has(key) || originals.has(key))
    .map((key) => ({
      key,
      entry: byName.get(key),
      references: [...(uses.get(key)?.values() ?? [])],
      name: names.get(key) ?? key,
      thumbnail:
        previewFor.get(key) ??
        (thumbnails.has(key) && !originals.has(key)
          ? byName.get(key)
          : undefined),
    }))
  if (preview?.length) {
    const blob = new Blob([new Uint8Array(preview)], { type: "image/png" })
    const entry: FigmaImageEntry = {
      name: "file-preview.png",
      size: preview.length,
      compressedSize: preview.length,
      read: async (signal) => {
        signal?.throwIfAborted()
        return blob
      },
    }
    assets.unshift({
      key: entry.name,
      entry,
      thumbnail: entry,
      name: "File preview",
      isPreview: true,
    })
  }
  return assets
}

/** Load only declared thumbnails, once per entry, with at most four reads at a time. */
export async function readThumbnails(
  assets: ImageAsset[],
  signal: AbortSignal,
  onLoad: (entry: FigmaImageEntry, blob: Blob) => void,
  onError: (entry: FigmaImageEntry) => void
) {
  const entries = [
    ...new Map(
      assets.flatMap(({ thumbnail }) =>
        thumbnail ? [[thumbnail.name, thumbnail] as const] : []
      )
    ).values(),
  ]
  let next = 0
  async function worker() {
    while (!signal.aborted && next < entries.length) {
      const entry = entries[next++]
      try {
        const blob = await entry.read(signal)
        if (!signal.aborted) onLoad(entry, blob)
      } catch {
        if (!signal.aborted) onError(entry)
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, entries.length) }, worker))
}
