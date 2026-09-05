import { useEffect, useState } from "react"
import type { GUID } from "fig-kiwi/schema-defs"
import { NodeReferenceLink } from "./node-reference-link"
import type { FigmaImageEntry } from "fig-kiwi/blob"
import { Input } from "@/components/ui/input"
import { ImageLightbox } from "./image-lightbox"
import { ReferenceCount } from "./reference-count"
import { readThumbnails, type ImageAsset } from "./image-assets"
import { cn } from "@/lib/utils"
import { assetCardClassName, assetGridClassName } from "./asset-gallery"

export function ImageBrowser({
  assets,
  onSelect,
}: {
  assets: ImageAsset[]
  onSelect: (guid: GUID) => void
}) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<ImageAsset | null>(null)
  const [thumbnails, setThumbnails] = useState<Map<string, string | null>>(
    () => new Map()
  )

  useEffect(() => {
    const controller = new AbortController()
    const urls: string[] = []
    setThumbnails(new Map())
    void readThumbnails(
      assets,
      controller.signal,
      (entry, blob) => {
        const url = URL.createObjectURL(blob)
        urls.push(url)
        setThumbnails((previous) => new Map(previous).set(entry.name, url))
      },
      (entry) => {
        setThumbnails((previous) => new Map(previous).set(entry.name, null))
      }
    )
    return () => {
      controller.abort()
      for (const url of urls) URL.revokeObjectURL(url)
    }
  }, [assets])

  const visible = assets.filter((asset) =>
    `${asset.name} ${asset.entry.name} ${asset.thumbnail?.name ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase())
  )

  return (
    <section aria-label="Images" className="space-y-4">
      <Input
        type="search"
        aria-label="Search images"
        placeholder="Search images…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <ul aria-label="Images" className={assetGridClassName}>
        {visible.map((asset) => (
          <li key={asset.entry.name} className="min-w-0">
            <button
              type="button"
              aria-haspopup="dialog"
              aria-label={`${asset.name}, ${formatSize(asset.entry.size)}`}
              title={`${asset.name}\n${asset.entry.name}`}
              onClick={() => setSelected(asset)}
              className={cn(
                assetCardClassName,
                "group flex h-full w-full cursor-pointer flex-col gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              )}
            >
              <span className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-md bg-muted/40 transition-opacity group-hover:opacity-85">
                {asset.thumbnail && thumbnails.get(asset.thumbnail.name) ? (
                  <img
                    src={thumbnails.get(asset.thumbnail.name)!}
                    alt=""
                    className="h-full w-full object-contain"
                    onError={() =>
                      setThumbnails((previous) =>
                        new Map(previous).set(asset.thumbnail!.name, null)
                      )
                    }
                  />
                ) : (
                  <span className="p-3 text-sm text-muted-foreground">
                    {!asset.thumbnail
                      ? "No embedded thumbnail"
                      : thumbnails.has(asset.thumbnail.name)
                        ? "Thumbnail unavailable"
                        : "Loading thumbnail…"}
                  </span>
                )}
              </span>
              <span className="min-w-0 w-full space-y-1">
                <span className="line-clamp-2 min-h-10 break-words text-sm leading-5">
                  {asset.name}
                </span>
                <span className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                  <span>{formatSize(asset.entry.size)}</span>
                  {asset.isPreview ? (
                    <span>Preview</span>
                  ) : (
                    <ReferenceCount count={asset.references?.length ?? 0} />
                  )}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {!visible.length && (
        <p className="text-sm text-muted-foreground">
          No images match your search.
        </p>
      )}
      {selected && (
        <ImageLightbox
          title={selected.name}
          onClose={() => setSelected(null)}
          footer={
            selected.references?.length ? (
              <div className="flex items-baseline gap-3 text-sm">
                <span className="font-medium">Uses</span>
                <ul className="flex flex-wrap gap-x-3 gap-y-1">
                  {selected.references.map((reference) => (
                    <li key={reference.nodeIndex}>
                      {reference.guid ? (
                        <NodeReferenceLink
                          guid={reference.guid}
                          title={reference.name}
                          onSelect={() => {
                            setSelected(null)
                            onSelect(reference.guid!)
                          }}
                        />
                      ) : (
                        <span>nodeChanges[{reference.nodeIndex}]</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : undefined
          }
        >
          <SelectedImage
            key={selected.entry.name}
            entry={selected.entry}
            alt={selected.name}
          />
        </ImageLightbox>
      )}
    </section>
  )
}

function SelectedImage({
  entry,
  alt,
}: {
  entry: FigmaImageEntry
  alt: string
}) {
  const [url, setUrl] = useState<string>()
  const [error, setError] = useState<string>()
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let objectUrl: string | undefined
    setUrl(undefined)
    setError(undefined)
    entry
      .read(controller.signal)
      .then((blob) => {
        if (controller.signal.aborted) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            error instanceof Error
              ? error.message
              : "Could not load this image."
          )
        }
      })
    return () => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [entry, attempt])

  if (error) {
    return (
      <div className="max-w-lg space-y-4 p-6 text-center">
        <p role="alert">{error}</p>
        <button
          type="button"
          className="rounded-md border px-4 py-2"
          onClick={() => setAttempt(attempt + 1)}
        >
          Try again
        </button>
      </div>
    )
  }
  if (!url)
    return (
      <p role="status" className="px-6 py-4">
        Loading image…
      </p>
    )
  return (
    <img
      src={url}
      alt={alt}
      className="max-h-full max-w-full object-contain"
      onError={() =>
        setError("This image could not be displayed by the browser.")
      }
    />
  )
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} bytes`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
