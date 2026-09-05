import { useLayoutEffect, useMemo, useRef, useState } from "react"
import type { GUID, NodeChange } from "fig-kiwi/schema-defs"
import { cn } from "@/lib/utils"
import { TypePill } from "./type-pill"
import {
  buildNodeTree,
  nodeId,
  treeKeyAction,
  visibleTreeRows,
  visibleHoverId,
} from "./node-tree-data"

export function NodeTree({
  nodes,
  selected,
  hovered,
  onSelect,
  focusSelection = true,
}: {
  nodes: NodeChange[]
  selected?: GUID
  hovered?: GUID
  focusSelection?: boolean
  onSelect: (guid: GUID) => void
}) {
  const tree = useMemo(() => buildNodeTree(nodes), [nodes])
  const [expanded, setExpanded] = useState(
    () =>
      new Set(
        [...tree.byId.values()]
          .filter(
            ({ node }) => node.type === "DOCUMENT" || node.type === "CANVAS"
          )
          .map(({ id }) => id)
      )
  )
  const [focused, setFocused] = useState<string>()
  const elements = useRef(new Map<string, HTMLDivElement>())
  const rows = useMemo(
    () => visibleTreeRows(tree.roots, expanded),
    [tree, expanded]
  )
  const selectedId = selected && nodeId(selected)
  const visibleIds = useMemo(
    () => new Set(rows.map(({ item }) => item.id)),
    [rows]
  )
  const hoveredId = visibleHoverId(
    hovered && nodeId(hovered),
    tree.byId,
    visibleIds
  )

  // Backlinks can select a node inside a collapsed branch.
  useLayoutEffect(() => {
    if (!selectedId) return
    setExpanded((previous) => {
      const next = new Set(previous)
      let parentId = tree.byId.get(selectedId)?.parentId
      while (parentId) {
        next.add(parentId)
        parentId = tree.byId.get(parentId)?.parentId
      }
      return next.size === previous.size ? previous : next
    })
    setFocused(selectedId)
  }, [selectedId, tree])

  useLayoutEffect(() => {
    if (!selectedId) return
    const element = elements.current.get(selectedId)
    if (focusSelection) element?.focus({ preventScroll: true })
    element?.scrollIntoView({ block: "nearest", inline: "nearest" })
  }, [selectedId, rows, focusSelection])

  const tabStop =
    rows.find(({ item }) => item.id === focused)?.item.id ?? rows[0]?.item.id

  function focusNode(id: string) {
    const item = tree.byId.get(id)
    if (!item) return
    setFocused(id)
    const element = elements.current.get(id)
    element?.focus({ preventScroll: true })
    element?.scrollIntoView({ block: "nearest", inline: "nearest" })
    onSelect(item.node.guid)
  }

  function setOpen(id: string, open: boolean) {
    setExpanded((previous) => {
      const next = new Set(previous)
      if (open) next.add(id)
      else next.delete(id)
      return next
    })
    focusNode(id)
  }

  if (!rows.length) {
    return <p className="px-2 text-sm text-muted-foreground">No nodes</p>
  }

  return (
    <div role="tree" aria-label="Nodes" className="space-y-1">
      {rows.map(({ item, level, position, siblings }) => {
        const hasChildren = item.children.length > 0
        const open = expanded.has(item.id)
        const name = item.node.name || "no name"
        return (
          <div
            key={item.id}
            ref={(element) => {
              if (element) elements.current.set(item.id, element)
              else elements.current.delete(item.id)
            }}
            role="treeitem"
            aria-label={name}
            aria-level={level}
            aria-posinset={position}
            aria-setsize={siblings}
            aria-expanded={hasChildren ? open : undefined}
            aria-selected={item.id === selectedId}
            data-hovered={item.id === hoveredId ? "true" : undefined}
            tabIndex={item.id === tabStop ? 0 : -1}
            onFocus={() => setFocused(item.id)}
            onClick={() => focusNode(item.id)}
            onKeyDown={(event) => {
              if (
                event.altKey ||
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey
              )
                return
              const action = treeKeyAction(rows, expanded, item.id, event.key)
              if (!action) return
              event.preventDefault()
              event.stopPropagation()
              if (action.type === "focus") focusNode(action.id)
              else setOpen(action.id, action.type === "expand")
            }}
            style={{ paddingLeft: 4 + (level - 1) * 16 }}
            className={cn(
              "flex min-w-0 cursor-default items-center rounded-sm py-1 pr-2 hover:bg-gray-200 dark:hover:bg-gray-800 focus-visible:outline-2 focus-visible:-outline-offset-2",
              item.id === selectedId &&
                "bg-gray-200 text-foreground dark:bg-gray-800",
              item.id === hoveredId && "ring-1 ring-inset ring-blue-500"
            )}
          >
            {hasChildren ? (
              <button
                type="button"
                tabIndex={-1}
                aria-label={`${open ? "Collapse" : "Expand"} ${name}`}
                onClick={(event) => {
                  event.stopPropagation()
                  setOpen(item.id, !open)
                }}
                className="mr-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm hover:bg-gray-300 dark:hover:bg-gray-700"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className={open ? "rotate-90" : undefined}
                  aria-hidden="true"
                >
                  <path d="m4 2 4 4-4 4" />
                </svg>
              </button>
            ) : (
              <span className="mr-1 w-5 shrink-0" />
            )}
            <span className="shrink-0">
              <TypePill type={item.node.type || "?"} />
            </span>
            <span className="min-w-0 flex-1 truncate" title={name}>
              {name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
