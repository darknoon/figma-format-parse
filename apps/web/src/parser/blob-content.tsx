import { useMemo } from "react"
import { BlobInspector } from "fig-renderer"
import type { GUID } from "fig-kiwi/schema-defs"
import type { BlobReference } from "./blob-references"
import { HexView } from "./hex-view"
import { ImageLightbox } from "./image-lightbox"
import { TypePill } from "./type-pill"
import { ReferenceCount } from "./reference-count"
import { NodeReferenceLink } from "./node-reference-link"

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
      renderType={(type) => <TypePill type={type} />}
      renderBytes={(data, ranges) => <HexView bytes={data} ranges={ranges} />}
      renderDetails={(content, onClose) => (
        <ImageLightbox
          title={`Blob ${index} details`}
          closeLabel="Close blob"
          onClose={onClose}
        >
          <div className="max-h-[calc(100dvh-4rem)] w-[min(48rem,calc(100vw-4rem))] overflow-auto p-6">
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
      referenceCount={
        <ReferenceCount
          count={new Set(references.map((r) => r.nodeIndex)).size}
        />
      }
      references={
        <BlobUsage
          references={references}
          onSelect={(r) => r.guid && onSelect(r.guid, index, r.path)}
        />
      }
    />
  )
}

function BlobUsage({
  references,
  onSelect,
}: {
  references: BlobReference[]
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
  return (
    <div>
      <h3 className="mb-1 text-sm font-medium">Uses</h3>
      <ul className="flex flex-wrap gap-x-2 text-sm leading-5">
        {groups.map((group) => {
          const first = group[0]
          const label = first.guid
            ? `${first.guid.sessionID}:${first.guid.localID}`
            : `nodeChanges[${first.nodeIndex}]`
          return (
            <li key={first.nodeIndex} className="min-w-0">
              {first.guid ? (
                <NodeReferenceLink
                  guid={first.guid}
                  title={`${first.nodeName} (${label})\n${group.map((r) => r.path).join("\n")}`}
                  onSelect={() => onSelect(first)}
                />
              ) : (
                label
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
