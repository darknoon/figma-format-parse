import type { GUID, NodeChange } from "fig-kiwi/schema-defs"
import { nodeId, type TreeNode } from "./hierarchy"

type Override = Partial<NodeChange> & { guidPath?: { guids?: GUID[] } }
type InstanceNode = NodeChange & { derivedSymbolData?: Override[] }
type Scope = { overrides: Override[]; prefix: string[] }

function merge(base: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const result = { ...base }
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || key === "guidPath") continue
    const previous = result[key]
    result[key] = value && previous && typeof value === "object" && typeof previous === "object"
      && !Array.isArray(value) && !Array.isArray(previous)
      && !ArrayBuffer.isView(value) && !ArrayBuffer.isView(previous)
      ? merge(previous as Record<string, unknown>, value as Record<string, unknown>) : value
  }
  return result
}

/** Instantiate source children for rendering only; inspector nodes remain untouched. */
export function expandInstances(tree: ReturnType<typeof import("./hierarchy").buildNodeTree>) {
  const expand = (item: TreeNode, scopes: Scope[], ancestry: Set<string>, owner?: GUID): TreeNode => {
    let node = item.node as InstanceNode & { guid: GUID }
    const sourceId = nodeId(node.guid)
    for (const scope of scopes) {
      const path = [...scope.prefix, sourceId].join("/")
      for (const patch of scope.overrides) {
        if (patch.guidPath?.guids?.map(nodeId).join("/") === path) {
          node = merge(node as unknown as Record<string, unknown>, patch as Record<string, unknown>) as unknown as typeof node
        }
      }
    }
    const result: TreeNode = { ...item, node: { ...node, guid: owner ?? node.guid }, children: [] }
    const symbolId = node.symbolData?.symbolID
    const source = symbolId && tree.byId.get(nodeId(symbolId))
    // Concrete children take precedence in exports that already materialize instances.
    if (node.type === "INSTANCE" && !item.children.length && source && ancestry.size < 64 && !ancestry.has(source.id)) {
      const overrides = [
        ...(node.symbolData?.symbolOverrides ?? []),
        ...(node.derivedSymbolData ?? []),
      ] as Override[]
      const nextScopes = [
        { overrides, prefix: [] },
        ...scopes.map((scope) => ({ ...scope, prefix: [...scope.prefix, sourceId] })),
      ]
      const nextAncestry = new Set(ancestry).add(source.id)
      result.children = source.children.map((child) => expand({
        ...child, id: `${item.id}/${child.id}`, parentId: item.id,
      }, nextScopes, nextAncestry, owner ?? node.guid))
    } else {
      result.children = item.children.map((child) => expand({
        ...child,
        id: owner ? `${item.id}/${child.id}` : child.id,
        parentId: item.id,
      }, scopes, ancestry, owner))
    }
    return result
  }
  return tree.roots.map((root) => expand(root, [], new Set()))
}
