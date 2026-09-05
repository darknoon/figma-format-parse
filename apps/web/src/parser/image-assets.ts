import type { Message } from "fig-kiwi"
import type { GUID } from "fig-kiwi/schema-defs"
import type { FigmaImageEntry } from "fig-kiwi/blob"
import { hex } from "./hex"

export interface ImageReference {
  nodeIndex: number
  guid?: GUID
  name?: string
}

export interface ImageAsset {
  entry: FigmaImageEntry
  name: string
  references?: ImageReference[]
  thumbnail?: FigmaImageEntry
}

/** Pair assets using Figma's image hashes, without reading any image bytes. */
export function imageAssets(
  entries: FigmaImageEntry[],
  message: Message
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
        if (image?.hash) {
          const id = hex(image.hash)
          const nodes = uses.get(id) ?? new Map<number, ImageReference>()
          nodes.set(nodeIndex, { nodeIndex, guid: node.guid, name: node.name })
          uses.set(id, nodes)
        }
        if (
          image?.hash &&
          (image.name || node.name) &&
          !names.has(hex(image.hash))
        ) {
          names.set(hex(image.hash), image.name || node.name!)
        }
      }
      const thumbnailId =
        paint.imageThumbnail?.hash && hex(paint.imageThumbnail.hash)
      const thumbnail = thumbnailId && byName.get(thumbnailId)
      if (thumbnail) thumbnails.add(thumbnail.name)
      for (const image of [paint.image, paint.animatedImage]) {
        if (!image?.hash) continue
        const id = hex(image.hash)
        if (!byName.has(id)) continue
        originals.add(id)
        if (thumbnail && thumbnail.name !== id && !previewFor.has(id)) {
          previewFor.set(id, thumbnail)
          pairedThumbnails.add(thumbnail.name)
        }
      }
    }
  }
  return entries
    .filter(
      (entry) => !pairedThumbnails.has(entry.name) || originals.has(entry.name)
    )
    .map((entry) => ({
      entry,
      references: [...(uses.get(entry.name)?.values() ?? [])],
      name: names.get(entry.name) ?? entry.name,
      thumbnail:
        previewFor.get(entry.name) ??
        (thumbnails.has(entry.name) && !originals.has(entry.name)
          ? entry
          : undefined),
    }))
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
