import { expect, test } from "bun:test"
import type { NodeChange } from "fig-kiwi/schema-defs"
import {
  responsiveBreakpoints,
  type SitesNode,
} from "../src/parser/responsive-set-data"

test("responsive sets list their live breakpoint frames in document order", () => {
  const set: NodeChange = {
    type: "RESPONSIVE_SET" as NodeChange["type"],
    guid: { sessionID: 1, localID: 394 },
  }
  const breakpoint = (
    id: number,
    position: string,
    extra: Partial<SitesNode> = {}
  ): SitesNode => ({
    type: "FRAME",
    guid: { sessionID: 1, localID: id },
    parentIndex: { guid: set.guid!, position },
    ...extra,
  })
  const desktop = breakpoint(395, "a", { isPrimaryBreakpoint: true })
  const tablet = breakpoint(419, "b", { isPrimaryBreakpoint: false })
  const mobile = breakpoint(443, "c", { isPrimaryBreakpoint: false })
  const nodes = [
    set,
    mobile,
    breakpoint(444, "d", { phase: "REMOVED" }),
    tablet,
    desktop,
    breakpoint(445, "e", { type: "TEXT" }),
  ]
  expect(
    responsiveBreakpoints(set, nodes).map((node) => [
      node.guid.localID,
      node.isPrimaryBreakpoint,
    ])
  ).toEqual([
    [395, true],
    [419, false],
    [443, false],
  ])
  expect(responsiveBreakpoints(desktop, nodes)).toEqual([])
})
