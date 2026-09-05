import type { GUID, NodeChange } from "fig-kiwi/schema-defs"

export interface TreeNode {
  id: string
  node: NodeChange & { guid: GUID }
  parentId?: string
  children: TreeNode[]
}

export interface TreeRow {
  item: TreeNode
  level: number
  position: number
  siblings: number
}

export function nodeId(guid: GUID) {
  return `${guid.sessionID}:${guid.localID}`
}

export function buildNodeTree(nodes: NodeChange[]) {
  const byId = new Map<string, TreeNode>()
  for (const node of nodes) {
    if (!node.guid || byId.has(nodeId(node.guid))) continue
    byId.set(nodeId(node.guid), {
      id: nodeId(node.guid),
      node: { ...node, guid: node.guid },
      children: [],
    })
  }
  for (const item of byId.values()) {
    const parent = item.node.parentIndex?.guid
    if (parent && byId.has(nodeId(parent))) item.parentId = nodeId(parent)
  }

  // Partial imports can lack parents. Break cycles too, keeping every node visible.
  const checked = new Set<string>()
  for (const item of byId.values()) {
    const path = new Set<string>()
    let current: TreeNode | undefined = item
    while (current && !checked.has(current.id)) {
      if (path.has(current.id)) {
        current.parentId = undefined
        break
      }
      path.add(current.id)
      current = current.parentId ? byId.get(current.parentId) : undefined
    }
    for (const id of path) checked.add(id)
  }

  const roots: TreeNode[] = []
  for (const item of byId.values()) {
    const parent = item.parentId ? byId.get(item.parentId) : undefined
    ;(parent ? parent.children : roots).push(item)
  }
  const sort = (items: TreeNode[]) =>
    items.sort((a, b) => {
      const left = a.node.parentIndex?.position ?? ""
      const right = b.node.parentIndex?.position ?? ""
      return left < right ? -1 : left > right ? 1 : 0
    })
  sort(roots)
  for (const item of byId.values()) sort(item.children)
  return { roots, byId }
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
