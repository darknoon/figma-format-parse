import { useEffect, useMemo, useState } from "react"
import type { FigmaImageEntry } from "fig-kiwi/blob"
import type { Message } from "fig-kiwi"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ImageLightbox } from "./image-lightbox"
import { hex } from "./hex"

export function ImageBrowser({
  entries,
  message,
}: {
  entries: FigmaImageEntry[]
  message: Message
}) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<FigmaImageEntry | null>(null)
  const names = useMemo(() => {
    const names = new Map<string, string>()
    for (const node of message.nodeChanges ?? []) {
      for (const paint of [
        ...(node.fillPaints ?? []),
        ...(node.strokePaints ?? []),
      ]) {
        for (const [image, suffix] of [
          [paint.image, ""],
          [paint.imageThumbnail, " (thumbnail)"],
          [paint.animatedImage, ""],
        ] as const) {
          if (image?.hash && (image.name || node.name)) {
            const hash = hex(image.hash)
            if (!names.has(hash))
              names.set(hash, `${image.name || node.name}${suffix}`)
          }
        }
      }
    }
    return names
  }, [message])
  const visible = entries.filter((entry) =>
    `${names.get(entry.name) ?? ""} ${entry.name}`
      .toLowerCase()
      .includes(query.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg tracking-tight">Images ({entries.length})</h2>
        <p className="text-sm text-muted-foreground">
          Select an image to load and view it.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="search"
          aria-label="Search images"
          placeholder="Search images…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((entry) => (
            <li key={entry.name} className="min-w-0">
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => setSelected(entry)}
                className="flex w-full items-center gap-3 rounded-md border p-4 text-left hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="shrink-0 text-muted-foreground"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8" cy="8" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
                <span className="min-w-0 space-y-1">
                  <span
                    className="block truncate text-sm font-medium"
                    title={names.get(entry.name) ?? entry.name}
                  >
                    {names.get(entry.name) ?? entry.name}
                  </span>
                  <span
                    className="block truncate font-mono text-xs text-muted-foreground"
                    title={entry.name}
                  >
                    {entry.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {formatSize(entry.size)}
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
      </CardContent>
      {selected && (
        <ImageLightbox
          title={names.get(selected.name) ?? selected.name}
          onClose={() => setSelected(null)}
        >
          <SelectedImage
            key={selected.name}
            entry={selected}
            alt={names.get(selected.name) ?? selected.name}
          />
        </ImageLightbox>
      )}
    </Card>
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
      <div className="max-w-lg space-y-4 text-center">
        <p role="alert">{error}</p>
        <button
          type="button"
          className="rounded-md border border-white/40 px-4 py-2"
          onClick={() => setAttempt(attempt + 1)}
        >
          Try again
        </button>
      </div>
    )
  }
  if (!url) return <p role="status">Loading image…</p>
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
