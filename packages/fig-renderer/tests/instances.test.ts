import { expect, test } from "bun:test"
import type { NodeChange } from "fig-kiwi/schema-defs"
import { buildScene } from "../src/scene-data"
import { identity } from "../src/geometry"

const guid = (localID: number) => ({ sessionID: 1, localID })
const node = (id: number, type: NodeChange["type"], parent?: number): NodeChange => ({
  guid: guid(id), type, parentIndex: parent ? { guid: guid(parent), position: "!" } : undefined,
  transform: identity, size: { x: 100, y: 30 },
})

test("instances inherit source text styling and apply saved layout and text overrides independently", () => {
  const source = node(1, "SYMBOL")
  const text = { ...node(2, "TEXT", 1), textData: { characters: "RSVP", styleOverrideTable: [] },
    fillPaints: [{ type: "SOLID" as const, color: { r: 1, g: 1, b: 1, a: 1 } }] }
  const makeInstance = (id: number, label: string, x: number) => ({
    ...node(id, "INSTANCE"),
    transform: { ...identity, m02: 200 },
    symbolData: { symbolID: guid(1), symbolOverrides: [{
      guidPath: { guids: [guid(2)] }, textData: { characters: label },
    }] },
    derivedSymbolData: [{ guidPath: { guids: [guid(2)] },
      transform: { ...identity, m02: x, m12: 8 },
      derivedTextData: { glyphs: [{ commandsBlob: 0, fontSize: 16 }] },
    }],
  })
  const nodes = [source, text, makeInstance(3, "GO TO REGISTRY", 20), makeInstance(4, "OTHER", 40)]
  const before = JSON.stringify(nodes)
  const scene = buildScene({ nodeChanges: nodes, blobs: [{ bytes: new Uint8Array([1,0,0,0,0,0,0,0,0]) }] })
  const a = scene.byId.get("1:3")!.children[0]
  const b = scene.byId.get("1:4")!.children[0]
  expect(a.node.textData?.characters).toBe("GO TO REGISTRY")
  expect(b.node.textData?.characters).toBe("OTHER")
  expect(a.node.fillPaints).toEqual(text.fillPaints)
  expect(a.node.textData?.styleOverrideTable).toEqual([])
  expect(a.world.m02).toBe(220)
  expect(b.world.m02).toBe(240)
  expect(a.node.guid).toEqual(guid(3)) // Hit testing selects the owning instance.
  expect(a.id).not.toBe(b.id)
  expect(scene.paths.has(0)).toBe(true)
  expect(JSON.stringify(nodes)).toBe(before)
})

test("concrete children are not duplicated and cyclic or missing sources terminate", () => {
  const source = node(1, "SYMBOL")
  const recursive = { ...node(2, "INSTANCE", 1), symbolData: { symbolID: guid(1) } }
  const instance = { ...node(3, "INSTANCE"), symbolData: { symbolID: guid(1) } }
  const concrete = node(4, "TEXT", 3)
  const missing = { ...node(5, "INSTANCE"), symbolData: { symbolID: guid(99) } }
  const scene = buildScene({ nodeChanges: [source, recursive, instance, concrete, missing] })
  expect(scene.byId.get("1:3")!.children.map((child) => child.id)).toEqual(["1:4"])
  expect(scene.byId.get("1:5")!.children).toEqual([])
  expect(scene.byId.size).toBeLessThan(10)
})
