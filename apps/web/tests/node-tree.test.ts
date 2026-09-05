import { describe, expect, test } from "bun:test"
import type { NodeChange } from "fig-kiwi/schema-defs"
import {
  buildNodeTree,
  treeKeyAction,
  visibleTreeRows,
  visibleHoverId,
} from "../src/parser/node-tree-data"

function node(id: number, parent?: number, position = "!"): NodeChange {
  return {
    guid: { sessionID: 0, localID: id },
    name: `Node ${id}`,
    ...(parent !== undefined && {
      parentIndex: { guid: { sessionID: 0, localID: parent }, position },
    }),
  }
}

describe("node hierarchy", () => {
  test("uses parent links and sibling positions instead of input order", () => {
    const { roots } = buildNodeTree([node(3, 1, "#"), node(2, 1, "!"), node(1)])
    expect(
      visibleTreeRows(roots, new Set(["0:1"])).map(
        ({ item, level, position, siblings }) => [
          item.id,
          level,
          position,
          siblings,
        ]
      )
    ).toEqual([
      ["0:1", 1, 1, 1],
      ["0:2", 2, 1, 2],
      ["0:3", 2, 2, 2],
    ])
  })

  test("keeps orphaned, cyclic, and self-parented nodes reachable", () => {
    const { roots, byId } = buildNodeTree([
      node(1, 99),
      node(2, 3),
      node(3, 2),
      node(4, 4),
      node(5, 3),
    ])
    const rows = visibleTreeRows(roots, new Set(byId.keys()))
    expect(rows.map(({ item }) => item.id).sort()).toEqual([
      "0:1",
      "0:2",
      "0:3",
      "0:4",
      "0:5",
    ])
  })

  test("ignores missing IDs and duplicate records without duplicating rows", () => {
    const { roots } = buildNodeTree([
      {},
      node(1),
      { ...node(1), name: "duplicate" },
    ])
    expect(roots).toHaveLength(1)
    expect(roots[0].node.name).toBe("Node 1")
  })

  test("handles deep trees without recursive traversal", () => {
    const { roots, byId } = buildNodeTree(
      Array.from({ length: 10000 }, (_, i) => node(i, i ? i - 1 : undefined))
    )
    expect(visibleTreeRows(roots, new Set(byId.keys()))).toHaveLength(10000)
  })
})

describe("tree navigation", () => {
  const { roots } = buildNodeTree([
    node(0),
    node(1, 0),
    node(2, 1),
    node(3, 0, "#"),
  ])
  const expanded = new Set(["0:0"])
  const rows = visibleTreeRows(roots, expanded)
  const action = (id: string, key: string) =>
    treeKeyAction(rows, expanded, id, key)

  test("up and down skip collapsed descendants and stop at the ends", () => {
    expect(action("0:1", "ArrowDown")).toEqual({ type: "focus", id: "0:3" })
    expect(action("0:3", "ArrowUp")).toEqual({ type: "focus", id: "0:1" })
    expect(action("0:0", "ArrowUp")).toEqual({ type: "focus", id: "0:0" })
    expect(action("0:3", "ArrowDown")).toEqual({ type: "focus", id: "0:3" })
  })

  test("right expands a closed branch, then moves into its first child", () => {
    expect(action("0:1", "ArrowRight")).toEqual({ type: "expand", id: "0:1" })
    const open = new Set(["0:0", "0:1"])
    expect(
      treeKeyAction(visibleTreeRows(roots, open), open, "0:1", "ArrowRight")
    ).toEqual({ type: "focus", id: "0:2" })
    expect(action("0:3", "ArrowRight")).toEqual({ type: "focus", id: "0:3" })
  })

  test("left collapses an open branch or moves to its parent", () => {
    expect(action("0:0", "ArrowLeft")).toEqual({ type: "collapse", id: "0:0" })
    expect(action("0:1", "ArrowLeft")).toEqual({ type: "focus", id: "0:0" })
    expect(action("0:3", "ArrowLeft")).toEqual({ type: "focus", id: "0:0" })
  })

  test("Home and End navigate visible rows; Tab remains native", () => {
    expect(action("0:1", "Home")).toEqual({ type: "focus", id: "0:0" })
    expect(action("0:0", "End")).toEqual({ type: "focus", id: "0:3" })
    expect(action("0:0", "Tab")).toBeUndefined()
    expect(treeKeyAction([], expanded, "0:0", "ArrowDown")).toBeUndefined()
  })
})

describe("canvas hover in the tree", () => {
  const tree = buildNodeTree([node(0), node(1, 0), node(2, 1), node(3, 2)])
  const visible = (expanded: Set<string>) =>
    new Set(visibleTreeRows(tree.roots, expanded).map(({ item }) => item.id))

  test("highlights the nearest visible ancestor without expanding the tree", () => {
    const expanded = new Set(["0:0", "0:1"])
    expect(visibleHoverId("0:3", tree.byId, visible(expanded))).toBe("0:2")
    expect([...expanded]).toEqual(["0:0", "0:1"])
    expect(visibleHoverId("0:3", tree.byId, visible(new Set(["0:0"])))).toBe(
      "0:1"
    )
  })

  test("uses the hovered row when visible and clears missing or absent hover", () => {
    const ids = visible(new Set(tree.byId.keys()))
    expect(visibleHoverId("0:3", tree.byId, ids)).toBe("0:3")
    expect(visibleHoverId(undefined, tree.byId, ids)).toBeUndefined()
    expect(visibleHoverId("9:9", tree.byId, ids)).toBeUndefined()
  })
})
