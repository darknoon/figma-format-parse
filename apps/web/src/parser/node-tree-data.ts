import type { TreeNode } from "fig-renderer/core"
export { buildNodeTree, nodeId } from "fig-renderer/core"
export type { TreeNode } from "fig-renderer/core"

export interface TreeRow {
  item: TreeNode
  level: number
  position: number
  siblings: number
}

/** Keep hover visible without opening or scrolling collapsed branches. */
export function visibleHoverId(
  id: string | undefined,
  byId: ReadonlyMap<string, TreeNode>,
  visibleIds: ReadonlySet<string>
) {
  while (id) {
    if (visibleIds.has(id)) return id
    id = byId.get(id)?.parentId
  }
}

export function visibleTreeRows(
  roots: TreeNode[],
  expanded: ReadonlySet<string>
) {
  const rows: TreeRow[] = []
  const stack: TreeRow[] = []
  function push(items: TreeNode[], level: number) {
    for (let i = items.length - 1; i >= 0; i--) {
      stack.push({
        item: items[i],
        level,
        position: i + 1,
        siblings: items.length,
      })
    }
  }
  push(roots, 1)
  while (stack.length) {
    const row = stack.pop()!
    rows.push(row)
    if (expanded.has(row.item.id)) push(row.item.children, row.level + 1)
  }
  return rows
}

export function treeKeyAction(
  rows: TreeRow[],
  expanded: ReadonlySet<string>,
  id: string,
  key: string
): { type: "focus" | "expand" | "collapse"; id: string } | undefined {
  const index = rows.findIndex((row) => row.item.id === id)
  if (index === -1) return
  const { item } = rows[index]
  switch (key) {
    case "ArrowDown":
      return {
        type: "focus",
        id: rows[Math.min(index + 1, rows.length - 1)].item.id,
      }
    case "ArrowUp":
      return { type: "focus", id: rows[Math.max(index - 1, 0)].item.id }
    case "Home":
      return { type: "focus", id: rows[0].item.id }
    case "End":
      return { type: "focus", id: rows[rows.length - 1].item.id }
    case "ArrowRight":
      if (item.children.length) {
        return expanded.has(id)
          ? { type: "focus", id: item.children[0].id }
          : { type: "expand", id }
      }
      return { type: "focus", id }
    case "ArrowLeft":
      return expanded.has(id) && item.children.length
        ? { type: "collapse", id }
        : { type: "focus", id: item.parentId ?? id }
    case "Enter":
    case " ":
      return { type: "focus", id }
  }
}
