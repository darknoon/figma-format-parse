import type { GUID, NodeChange } from "fig-kiwi/schema-defs"

export interface TreeNode {
  id: string
  node: NodeChange & { guid: GUID }
  parentId?: string
  children: TreeNode[]
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
