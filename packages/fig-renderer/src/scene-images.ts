import { useEffect, useState } from "react"
import type { Message } from "fig-kiwi"
import type { FigmaImageEntry } from "fig-kiwi/blob"
import type { Image as FigmaImage } from "fig-kiwi/schema-defs"
const hex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
import type { SceneItem } from "./scene-data"

export function imageKey(image?: FigmaImage) {
  if (image?.dataBlob !== undefined) return `blob:${image.dataBlob}`
  return image?.hash && hex(image.hash)
}

export interface LoadedImage {
  url: string
  width: number
  height: number
}

export function useSceneImages(
  items: SceneItem[],
  message: Message,
  entries: FigmaImageEntry[] | undefined
) {
  const [images, setImages] = useState<Map<string, LoadedImage>>(new Map())
  const [failed, setFailed] = useState(0)
  const [pending, setPending] = useState(0)
  const [total, setTotal] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    const urls: string[] = []
    const requested = new Map<string, FigmaImage>()
    for (const { node, visible } of items) {
      if (!visible) continue
      for (const paint of [
        ...(node.fillPaints ?? []),
        ...(node.strokePaints ?? []),
      ]) {
        if (paint.visible === false) continue
        for (const image of [paint.image, paint.imageThumbnail]) {
          const key = imageKey(image)
          if (image && key) requested.set(key, image)
        }
      }
    }
    const byName = new Map(entries?.map((entry) => [entry.name, entry]))
    const queue = [...requested]
    const loaded = new Map<string, LoadedImage>()
    setImages(new Map())
    setFailed(0)
    setTotal(queue.length)
    setPending(queue.length)
    let next = 0
    async function worker() {
      while (!controller.signal.aborted && next < queue.length) {
        const [key, image] = queue[next++]
        try {
          const bytes =
            image.dataBlob !== undefined
              ? message.blobs?.[image.dataBlob]?.bytes
              : undefined
          const blob = bytes
            ? new Blob([new Uint8Array(bytes)])
            : await byName.get(key)?.read(controller.signal)
          if (controller.signal.aborted) return
          if (!blob) throw new Error("Missing image")
          const url = URL.createObjectURL(blob)
          urls.push(url)
          const element = new Image()
          element.src = url
          await element.decode()
          if (controller.signal.aborted) return
          loaded.set(key, {
            url,
            width: element.naturalWidth,
            height: element.naturalHeight,
          })
          setImages(new Map(loaded))
        } catch {
          if (!controller.signal.aborted) setFailed((count) => count + 1)
        } finally {
          if (!controller.signal.aborted) setPending((count) => count - 1)
        }
      }
    }
    void Promise.all(Array.from({ length: Math.min(4, queue.length) }, worker))
    return () => {
      controller.abort()
      for (const url of urls) URL.revokeObjectURL(url)
    }
  }, [items, message, entries])
  return { images, failed, pending, total }
}
