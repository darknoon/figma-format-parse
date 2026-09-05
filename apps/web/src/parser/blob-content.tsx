import { useMemo } from "react"
import { BlobInspector } from "fig-renderer"
import type { GUID } from "fig-kiwi/schema-defs"
import type { BlobReference } from "./blob-references"
import { HexView } from "./hex-view"
import { ImageLightbox } from "./image-lightbox"

export function BlobContent({
  bytes,
  index,
  references = [],
  onSelect,
}: {
  bytes: Uint8Array
  index: number
  references?: BlobReference[]
  onSelect: (guid: GUID, blob: number, path: string) => void
}) {
  const network = references.some((r) =>
    /(?:^|\.)vectorNetworkBlob$/.test(r.path)
  )
  const path = references.some((r) => /(?:^|\.)commandsBlob$/.test(r.path))
  return (
    <BlobInspector
      bytes={bytes}
      renderBytes={(data) => <HexView bytes={data} />}
      renderDetails={(content, onClose) => (
        <ImageLightbox
          title={`Blob ${index} details`}
          closeLabel="Close blob"
          onClose={onClose}
        >
          <div className="max-h-[calc(100dvh-4rem)] w-[min(64rem,calc(100vw-4rem))] overflow-auto p-6">
            {content}
          </div>
        </ImageLightbox>
      )}
      kind={network === path ? "unknown" : network ? "vector-network" : "path"}
      glyph={
        path &&
        references.every((r) =>
          /(?:^|\.)glyphs\[\d+\]\.commandsBlob$/.test(r.path)
        )
      }
      heading={
        <>
          <span title={`${bytes.length.toLocaleString()} bytes`}>
            {bytes.length < 1024
              ? `${bytes.length} B`
              : `${(bytes.length / 1024).toFixed(1)} KB`}
          </span>
        </>
      }
      references={(expanded) => (
        <BlobUsage
          references={references}
          expanded={expanded}
          onSelect={(r) => r.guid && onSelect(r.guid, index, r.path)}
        />
      )}
    />
  )
}

function BlobUsage({
  references,
  expanded,
  onSelect,
}: {
  references: BlobReference[]
  expanded: boolean
  onSelect: (reference: BlobReference) => void
}) {
  const groups = useMemo(() => {
    const nodes = new Map<number, BlobReference[]>()
    for (const r of references) {
      const group = nodes.get(r.nodeIndex)
      if (group) group.push(r)
      else nodes.set(r.nodeIndex, [r])
    }
    return [...nodes.values()]
  }, [references])
  if (!groups.length) return null
  const visible = expanded ? groups : groups.slice(0, 3)
  return (
    <ul className="flex flex-wrap gap-x-2 text-sm leading-5">
      {visible.map((group) => {
        const first = group[0]
        const label = first.guid
          ? `${first.guid.sessionID}:${first.guid.localID}`
          : `nodeChanges[${first.nodeIndex}]`
        return (
          <li key={first.nodeIndex} className="min-w-0">
            {first.guid ? (
              <button
                className="inline-flex max-w-full items-center gap-1 text-left text-blue-700 hover:underline"
                title={`${first.nodeName} (${label})\n${group.map((r) => r.path).join("\n")}`}
                onClick={() => onSelect(first)}
              >
                <span className="truncate">{label}</span>
                <svg
                  aria-hidden="true"
                  className="h-3 w-3 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17 17 7M7 7h10v10" />
                </svg>
              </button>
            ) : (
              label
            )}
          </li>
        )
      })}
      {!expanded && groups.length > visible.length && (
        <li
          className="text-muted-foreground"
          title="More references in details"
        >
          +{groups.length - visible.length}
        </li>
      )}
    </ul>
  )
}
