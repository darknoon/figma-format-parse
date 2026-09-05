import { useEffect, useState } from "react"
import type { FigmaImageEntry } from "fig-kiwi/blob"
import { imageId, type ImageAsset } from "./image-assets"
import type { Color, NodeChange } from "fig-kiwi/schema-defs"

function colorHex(color: Color) {
  return `#${[color.r, color.g, color.b].map((value) =>
    Math.round(Math.min(1, Math.max(0, value)) * 255).toString(16).padStart(2, "0")
  ).join("").toUpperCase()}`
}

export function SelectionCard({ node, assets = [], onSeeAll }: { node: NodeChange; assets: ImageAsset[]; onSeeAll: () => void }) {
  const fills = node.fillPaints?.filter((paint) => paint.visible !== false) ?? []
  const paint = fills[0]
  const asset = assets.find((asset) => asset.key === imageId(paint?.image ?? paint?.animatedImage))
  const thumbnail = asset?.thumbnail ?? asset?.entry
  const color = paint ? paint.color : node.backgroundColor
  const solid = color && (!paint || !paint.type || paint.type === "SOLID")
  const fillLabel = solid ? colorHex(color) : paint?.type === "IMAGE" ? "Image"
    : paint?.type?.startsWith("GRADIENT") ? "Gradient" : paint?.type?.toLowerCase()
  return (
    <aside
      aria-label="Selected node"
      tabIndex={0}
      className="group absolute right-4 top-4 z-10 w-60 hover:w-66 focus-within:w-66 transition-[width] duration-150 motion-reduce:transition-none max-w-[calc(100%-2rem)] rounded-xl border bg-card/95 px-3 py-2 text-sm shadow-sm backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-blue-400"
    >
      <dl className="space-y-1 text-xs">
        <div className="flex items-center justify-between gap-6">
          <dt className="text-muted-foreground">{!paint && node.backgroundColor ? "Background" : "Fill"}</dt>
          <dd className="flex items-center gap-1.5">
            {solid && <span className="h-3 w-3 rounded-sm border border-black/10" style={{
              backgroundColor: colorHex(color), opacity: (color.a ?? 1) * (paint?.opacity ?? node.backgroundOpacity ?? 1),
            }} />}
            {paint?.type === "IMAGE" ? <FillThumbnail key={asset?.key ?? "missing"} entry={thumbnail} /> : <span>{fillLabel || "None"}</span>}
            {fills.length > 1 && <span>+{fills.length - 1}</span>}
          </dd>
        </div>
        {node.fontName?.family && (
          <div className="flex items-center justify-between gap-6">
            <dt className="text-muted-foreground">Font</dt>
            <dd className="min-w-0 truncate" title={node.fontName.family}>{node.fontName.family}</dd>
          </div>
        )}
        {node.opacity !== undefined && (
          <div className="flex items-center justify-between gap-6">
            <dt className="text-muted-foreground">Opacity</dt>
            <dd className="tabular-nums">{Math.round(node.opacity * 100)}%</dd>
          </div>
        )}
      </dl>
      <div className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-150 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 motion-reduce:transition-none">
        <div className="overflow-hidden">
          <dl className="mt-2 space-y-1 border-t pt-2 text-xs">
            {node.size && <div className="flex justify-between gap-6">
              <dt className="text-muted-foreground">Size</dt>
              <dd className="tabular-nums">{Number(node.size.x.toFixed(2))} × {Number(node.size.y.toFixed(2))}</dd>
            </div>}
            {node.transform && <div className="flex justify-between gap-6">
              <dt className="text-muted-foreground">Position</dt>
              <dd className="tabular-nums">{Number(node.transform.m02.toFixed(2))}, {Number(node.transform.m12.toFixed(2))}</dd>
            </div>}
            {node.cornerRadius !== undefined && <div className="flex justify-between gap-6">
              <dt className="text-muted-foreground">Corner radius</dt>
              <dd className="tabular-nums">{Number(node.cornerRadius.toFixed(2))}</dd>
            </div>}
          </dl>
          <button type="button" onClick={onSeeAll} className="mt-3 block text-xs text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-blue-400">
            See all <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

function FillThumbnail({ entry }: { entry?: FigmaImageEntry }) {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    const controller = new AbortController()
    let objectUrl: string | undefined
    setUrl(undefined)
    entry?.read(controller.signal).then((blob) => {
      if (controller.signal.aborted) return
      objectUrl = URL.createObjectURL(blob)
      setUrl(objectUrl)
    }).catch(() => { /* Missing data keeps the placeholder. */ })
    return () => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [entry])
  return url
    ? <img src={url} alt="Image fill" className="h-6 w-6 rounded-sm object-cover" />
    : <span role="img" aria-label="Image fill unavailable" className="h-6 w-6 rounded-sm bg-muted" />
}
