import { useMemo } from "react"
import type { GUID, NodeChange } from "fig-kiwi/schema-defs"
import { cn } from "@/lib/utils"
import { decodePosition } from "./fractional-position"
import { nodeId } from "./node-tree-data"

function percent(value: number) {
  return `${Number((value * 100).toPrecision(12))}%`
}

export function SiblingPosition({ node, nodes, onSelect }: {
  node: NodeChange
  nodes?: NodeChange[]
  onSelect: (guid: GUID) => void
}) {
  const parentId = node.parentIndex && nodeId(node.parentIndex.guid)
  const siblings = useMemo(() => {
    if (!parentId) return []
    return (nodes ?? []).flatMap((sibling) => {
      if (!sibling.guid || !sibling.parentIndex ||
          nodeId(sibling.parentIndex.guid) !== parentId) return []
      const position = decodePosition(sibling.parentIndex.position)
      return position === undefined ? [] : [{
        guid: sibling.guid,
        name: sibling.name || "no name",
        stored: sibling.parentIndex.position,
        position,
      }]
    }).sort((a, b) => a.stored < b.stored ? -1 : a.stored > b.stored ? 1 : 0)
  }, [nodes, parentId])

  if (!node.parentIndex) return <span>—</span>
  const stored = node.parentIndex.position
  const position = decodePosition(stored)
  if (position === undefined) return <code>{JSON.stringify(stored)}</code>

  // Fit the sibling range so tightly packed positions remain visible.
  const min = siblings[0]?.position ?? position
  const max = siblings[siblings.length - 1]?.position ?? position
  const padding = Math.max(max - min, 0.02) * 0.15
  const start = siblings.length > 1 ? Math.max(0, min - padding) : 0
  const end = siblings.length > 1 ? Math.min(1, max + padding) : 1
  const selectedId = node.guid && nodeId(node.guid)

  return (
    <div>
      <div className="w-40 max-w-full" title={`Sibling range: ${percent(start)}–${percent(end)} · ${siblings.length} nodes`}>
        <div role="group" aria-label="Sibling positions" className="relative h-6">
          <div aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-400" />
          {siblings.map((sibling) => {
            const selected = nodeId(sibling.guid) === selectedId
            return (
              <button
                key={nodeId(sibling.guid)}
                type="button"
                aria-label={`Open sibling ${sibling.name} (${nodeId(sibling.guid)}), position ${percent(sibling.position)}`}
                aria-pressed={selected}
                title={`${sibling.name} (${nodeId(sibling.guid)}) · ${percent(sibling.position)}`}
                onClick={() => onSelect(sibling.guid)}
                style={{ left: `${(sibling.position - start) / (end - start) * 100}%` }}
                className={cn(
                  "group absolute top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
                  selected ? "z-10" : "hover:z-20",
                )}
              >
                <span className={selected
                  ? "h-3 w-0.5 bg-blue-600"
                  : "h-2 w-px bg-muted-foreground group-hover:bg-foreground"
                } />
              </button>
            )
          })}
        </div>
      </div>
      <p className="break-all font-mono text-sm" title={`Stored position: ${JSON.stringify(stored)}`}>
        {percent(position)}
      </p>
    </div>
  )
}
