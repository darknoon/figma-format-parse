import type { GUID, NodeChange } from "fig-kiwi/schema-defs"
import { buildNodeTree, nodeId } from "fig-renderer/core"

// Sites fields come from the file's embedded schema, not the bundled schema.
export type SitesNode = NodeChange & {
  isPrimaryBreakpoint?: boolean
  responsiveSetSettings?: {
    title?: string
    scalingMode?: string
    scalingMinLayoutWidth?: number
    scalingMaxLayoutWidth?: number
  }
}

export function responsiveBreakpoints(node: NodeChange, nodes: NodeChange[]) {
  if ((node.type as string) !== "RESPONSIVE_SET" || !node.guid) return []
  return (buildNodeTree(nodes).byId.get(nodeId(node.guid))?.children ?? [])
    .filter(({ node }) => node.type === "FRAME" && node.phase !== "REMOVED")
    .map(({ node }) => node as SitesNode & { guid: GUID })
}
