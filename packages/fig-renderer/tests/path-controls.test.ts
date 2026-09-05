import { expect, test } from "bun:test"
import { pathControls } from "../src/path-controls"
import type { PathCommand } from "../src/geometry"

const command = (verb: PathCommand["verb"], ...values: number[]): PathCommand =>
  ({ verb, values, offset: 0, byteLength: 0, opcode: 0 })

test("quadratic and cubic handles attach to the correct contour anchors", () => {
  const controls = pathControls([
    command("Z"), command("L", 99, 99), // No active contour.
    command("M", 0, 0), command("Q", 1, 2, 3, 0),
    command("C", 4, 1, 5, 1, 6, 0), command("Z"),
    command("Q", -1, 2, -3, 0), // Closing resets the current point.
    command("M", 10, 10), command("L", 11, 10),
  ])
  expect(controls.handles).toEqual([
    { x: 1, y: 2 }, { x: 4, y: 1 }, { x: 5, y: 1 }, { x: -1, y: 2 },
  ])
  expect(controls.lines).toEqual([
    [{ x: 0, y: 0 }, { x: 1, y: 2 }],
    [{ x: 3, y: 0 }, { x: 1, y: 2 }],
    [{ x: 3, y: 0 }, { x: 4, y: 1 }],
    [{ x: 6, y: 0 }, { x: 5, y: 1 }],
    [{ x: 0, y: 0 }, { x: -1, y: 2 }],
    [{ x: -3, y: 0 }, { x: -1, y: 2 }],
  ])
  expect(controls.anchors).toHaveLength(6)
})
