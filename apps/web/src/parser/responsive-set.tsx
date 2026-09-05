import type { GUID, NodeChange } from "fig-kiwi/schema-defs"
import { nodeId } from "fig-renderer/core"
import { responsiveBreakpoints, type SitesNode } from "./responsive-set-data"
import { NodeReferenceLink } from "./node-reference-link"

export function ResponsiveSetInfo({
  node,
  nodes,
  onSelect,
}: {
  node: NodeChange
  nodes: NodeChange[]
  onSelect: (guid: GUID) => void
}) {
  if ((node.type as string) !== "RESPONSIVE_SET") return null
  const settings = (node as SitesNode).responsiveSetSettings
  const breakpoints = responsiveBreakpoints(node, nodes)
  return (
    <section
      aria-label="Responsive set"
      className="mb-6 space-y-4 border-b pb-6 text-sm"
    >
      <h3 className="font-medium">Responsive set</h3>
      {settings?.title && <p>{settings.title}</p>}
      {settings && (
        <dl className="flex flex-wrap gap-x-8 gap-y-3">
          {settings.scalingMode && (
            <div>
              <dt className="text-muted-foreground">Scaling</dt>
              <dd>
                {settings.scalingMode === "REFLOW"
                  ? "Reflow"
                  : settings.scalingMode}
              </dd>
            </div>
          )}
          {settings.scalingMinLayoutWidth !== undefined &&
            settings.scalingMaxLayoutWidth !== undefined && (
              <div>
                <dt className="text-muted-foreground">Layout width</dt>
                <dd>
                  {settings.scalingMinLayoutWidth}–
                  {settings.scalingMaxLayoutWidth} px
                </dd>
              </div>
            )}
        </dl>
      )}
      <div className="space-y-2">
        <h4 className="font-medium">Breakpoints</h4>
        <ul className="space-y-2">
          {breakpoints.map((breakpoint) => (
            <li
              key={nodeId(breakpoint.guid)}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1"
            >
              <span>{breakpoint.name || "Breakpoint"}</span>
              <NodeReferenceLink
                guid={breakpoint.guid}
                onSelect={() => onSelect(breakpoint.guid)}
              />
              {breakpoint.size && (
                <span className="text-muted-foreground">
                  {breakpoint.size.x} px
                </span>
              )}
              {breakpoint.isPrimaryBreakpoint && (
                <span className="rounded-full bg-blue-100 px-2 text-blue-800">
                  Primary
                </span>
              )}
            </li>
          ))}
        </ul>
        {!breakpoints.length && (
          <p className="text-muted-foreground">
            No breakpoints included in this selection.
          </p>
        )}
      </div>
    </section>
  )
}
