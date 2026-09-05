import { commandByteRanges, networkByteRanges } from "../src/blob-ranges"
import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { readFigFile } from "fig-kiwi"
import type { NodeChange } from "fig-kiwi/schema-defs"
import {
  decodeCommands,
  decodeVectorNetwork,
  inspectCommands,
  inspectVectorNetwork,
  identity,
  inverse,
  multiply,
  point,
} from "../src/geometry"
import { buildScene, fitCamera, zoomCamera } from "../src/scene-data"

function commands(...instructions: [number, ...number[]][]) {
  const result = new Uint8Array(
    instructions.reduce((n, i) => n + 1 + (i.length - 1) * 4, 0)
  )
  const view = new DataView(result.buffer)
  let offset = 0
  for (const [op, ...values] of instructions) {
    result[offset++] = op
    for (const value of values) {
      view.setFloat32(offset, value, true)
      offset += 4
    }
  }
  return result
}

function node(
  id: number,
  parent?: number,
  extra: Partial<NodeChange> = {}
): NodeChange {
  return {
    guid: { sessionID: 0, localID: id },
    type: "FRAME",
    size: { x: 100, y: 100 },
    ...(parent !== undefined
      ? {
          parentIndex: {
            guid: { sessionID: 0, localID: parent },
            position: String(id),
          },
        }
      : {}),
    ...extra,
  }
}

describe("stored geometry", () => {
  test("decodes all path verbs, including glyph blobs with a leading close", () => {
    expect(
      decodeCommands(
        commands(
          [0],
          [1, 2, 3],
          [2, 4, 5],
          [3, 6, 7, 8, 9],
          [4, 10, 11, 12, 13, 14, 15],
          [0]
        )
      )
    ).toBe("M2 3 L4 5 Q6 7 8 9 C10 11 12 13 14 15 Z")
  })
  test("rejects unknown, truncated and nonfinite commands without partial paths", () => {
    const valid = commands([1, 2, 3], [2, 4, 5])
    expect(decodeCommands(valid.slice(0, -1))).toBeUndefined()
    expect(decodeCommands(new Uint8Array([8]))).toBeUndefined()
    expect(decodeCommands(commands([1, Infinity, 3]))).toBeUndefined()
  })
  test("handles byte views with a nonzero offset", () => {
    const wrapped = new Uint8Array([255, ...commands([1, 2, 3]), 255])
    expect(decodeCommands(wrapped.subarray(1, -1))).toBe("M2 3")
  })
  test("preserves byte offsets and leading close records for inspection", () => {
    const bytes = commands([0], [1, 1.25, -2.5], [4, 1, 2, 3, 4, 5, 6], [0])
    const wrapped = new Uint8Array([255, ...bytes, 255])
    const decoded = inspectCommands(wrapped.subarray(1, -1))!
    expect(decoded.path).toBe(decodeCommands(bytes)!)
    expect(
      decoded.commands.map((c) => [c.offset, c.byteLength, c.verb])
    ).toEqual([
      [0, 1, "Z"],
      [1, 9, "M"],
      [10, 25, "C"],
      [35, 1, "Z"],
    ])
    expect(decoded.commands[1].values).toEqual([1.25, -2.5])
    expect(inspectCommands(bytes.subarray(0, 34))).toBeUndefined()
  })
  test("decodes every cached path in the repository's exported circle fixture", () => {
    const file = readFigFile(
      readFileSync(
        new URL("../../fig-kiwi/data/blue-circle.fig", import.meta.url)
      )
    )
    const scene = buildScene(file.message)
    expect(scene.paths.size).toBeGreaterThan(0)
    expect(scene.invalidPaths.size).toBe(0)
    expect([...scene.paths.values()].every((d) => d.startsWith("M"))).toBe(true)
  })
  test("reads modern derived glyph data without measuring or laying out text", () => {
    const glyph = {
      commandsBlob: 0,
      position: { x: 37.25, y: 82 },
      fontSize: 24,
    }
    const scene = buildScene({
      nodeChanges: [
        {
          ...node(1),
          type: "TEXT",
          derivedTextData: { glyphs: [glyph, glyph] },
        } as NodeChange,
      ],
      blobs: [{ bytes: commands([1, 0, 0], [2, 0.5, 1], [0]) }],
    })
    expect(scene.paths.size).toBe(1)
    expect(scene.byId.get("0:1")?.node.derivedTextData?.glyphs?.[0]).toEqual(
      glyph
    )
  })
  test("reconstructs unordered/reversed network edges and tangent handles", () => {
    const bytes = new Uint8Array(12 + 3 * 12 + 3 * 28 + 24)
    const view = new DataView(bytes.buffer)
    let offset = 0
    const u = (n: number) => {
      view.setUint32(offset, n, true)
      offset += 4
    }
    const f = (n: number) => {
      view.setFloat32(offset, n, true)
      offset += 4
    }
    u(3)
    u(3)
    u(1)
    for (const [x, y] of [
      [0, 0],
      [100, 0],
      [0, 100],
    ]) {
      u(0)
      f(x)
      f(y)
    }
    // Edges 0 -> 1, 2 -> 1 (reversed), 2 -> 0.
    for (const [start, end, tx, ty, ex, ey] of [
      [0, 1, 10, 20, -10, 20],
      [2, 1, 0, 0, 0, 0],
      [2, 0, 0, 0, 0, 0],
    ]) {
      u(0)
      u(start)
      f(tx)
      f(ty)
      u(end)
      f(ex)
      f(ey)
    }
    u(1)
    u(1)
    u(3)
    u(0)
    u(2)
    u(1)
    expect(decodeVectorNetwork(bytes)?.fill).toBe(
      "M0 0 C10 20 90 20 100 0 L0 100 L0 0 Z"
    )
    // Preserve uninterpreted style words and exact record locations.
    view.setUint32(12, 0x10203040, true)
    view.setUint32(48, 9, true)
    const wrapped = new Uint8Array([255, ...bytes, 255])
    const inspected = inspectVectorNetwork(wrapped.subarray(1, -1))!
    expect(inspected.vertices[0]).toEqual({
      offset: 12,
      style: 0x10203040,
      x: 0,
      y: 0,
    })
    expect(inspected.segments[0]).toEqual({
      offset: 48,
      style: 9,
      start: 0,
      end: 1,
      tx: 10,
      ty: 20,
      ex: -10,
      ey: 20,
    })
    expect(inspected.regions).toEqual([
      { offset: 132, flags: 1, loops: [{ offset: 140, segments: [0, 2, 1] }] },
    ])
    const ranges = networkByteRanges(inspected)
    expect(ranges.map((r) => r.offset)).toEqual(
      Array.from({ length: bytes.length / 4 }, (_, i) => i * 4)
    )
    expect(ranges.every((r) => r.byteLength === 4)).toBe(true)
    expect(ranges.find((r) => r.offset === 12)?.description).toBe("270544960")
    expect(ranges.find((r) => r.offset === 56)).toMatchObject({
      label: "Segment 0 · start tangent X",
      description: "10",
    })
    expect(ranges.at(-1)).toMatchObject({
      label: "Region 0 · loop 0 · segment 2",
      description: "1",
    })
    expect(inspectVectorNetwork(new Uint8Array([...bytes, 0]))).toBeUndefined()
    expect(decodeVectorNetwork(bytes.slice(0, -1))).toBeUndefined()
    view.setUint32(12 + 3 * 12 + 4, 99, true)
    expect(decodeVectorNetwork(bytes)).toBeUndefined()
  })
})

describe("scene layout and camera", () => {
  test("composes rotated parent transforms and excludes hidden descendants from fit", () => {
    const scene = buildScene({
      nodeChanges: [
        node(0, undefined, { type: "CANVAS", size: undefined }),
        node(1, 0, {
          transform: { m00: 0, m01: -1, m02: 200, m10: 1, m11: 0, m12: 300 },
        }),
        node(2, 1, {
          size: { x: 20, y: 30 },
          transform: { ...identity, m02: 10, m12: 20 },
        }),
        node(3, 0, {
          visible: false,
          transform: { ...identity, m02: 1000000 },
        }),
        node(4, 3),
      ],
    })
    expect(scene.byId.get("0:2")?.bounds).toEqual({
      x: 150,
      y: 310,
      width: 30,
      height: 20,
    })
    expect(scene.byId.get("0:4")?.visible).toBe(false)
    expect(scene.pages[0].bounds).toEqual({
      x: 100,
      y: 300,
      width: 100,
      height: 100,
    })
  })
  test("frame clipping excludes overflow from page bounds; unclipped frames include it", () => {
    const nodes = [
      node(0, undefined, { type: "CANVAS", size: undefined }),
      node(1, 0),
      node(2, 1, { transform: { ...identity, m02: 500 } }),
    ]
    expect(buildScene({ nodeChanges: nodes }).pages[0].bounds?.width).toBe(100)
    nodes[1].frameMaskDisabled = true
    expect(buildScene({ nodeChanges: nodes }).pages[0].bounds?.width).toBe(600)
  })
  test("keeps pages separate", () => {
    const scene = buildScene({
      nodeChanges: [
        node(0, undefined, { type: "DOCUMENT", size: undefined }),
        node(1, 0, { type: "CANVAS", size: undefined }),
        node(2, 0, { type: "CANVAS", size: undefined }),
        node(3, 1),
        node(4, 2, { transform: { ...identity, m02: 9999 } }),
      ],
    })
    expect(scene.byId.get("0:3")?.pageId).toBe("0:1")
    expect(scene.pages[0].bounds?.x).toBe(0)
    expect(scene.pages[1].bounds?.x).toBe(9999)
  })
  test("inverse transforms round trip skew, translation and scale", () => {
    const matrix = { m00: 2, m01: 0.5, m02: 42, m10: 0.3, m11: 3, m12: -80 }
    const p = point(multiply(inverse(matrix)!, matrix), 12, 34)
    expect(p.x).toBeCloseTo(12)
    expect(p.y).toBeCloseTo(34)
    expect(inverse({ ...identity, m00: 0 })).toBeUndefined()
  })
  test("fits negative scene coordinates and preserves the point under the zoom cursor", () => {
    const camera = fitCamera(
      { x: -1000, y: -500, width: 2000, height: 1000 },
      800,
      600
    )
    expect(camera.x).toBe(400)
    expect(camera.y).toBe(300)
    const next = zoomCamera(camera, 1.5, 270, 185)
    expect((270 - next.x) / next.zoom).toBeCloseTo(
      (270 - camera.x) / camera.zoom
    )
    expect((185 - next.y) / next.zoom).toBeCloseTo(
      (185 - camera.y) / camera.zoom
    )
    expect(zoomCamera(camera, 1e20, 0, 0).zoom).toBe(256)
    expect(zoomCamera(camera, 1e-20, 0, 0).zoom).toBe(0.001)
  })
})

test("byte annotations retain opcode boundaries and decoded operands", () => {
  const decoded = inspectCommands(
    commands([0], [1, 2, 3], [3, 4, 5, 6, 7], [4, 1, 2, 3, 4, 5, 6], [0])
  )!
  const ranges = commandByteRanges(decoded)
  expect(ranges.map((r) => [r.offset, r.byteLength])).toEqual([
    [0, 1],
    [1, 9],
    [10, 17],
    [27, 25],
    [52, 1],
  ])
  expect(ranges[2]).toMatchObject({
    label: "Quadratic · opcode 3",
    description: "Control (4, 5) → end (6, 7)",
  })
})
