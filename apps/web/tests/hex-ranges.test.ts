import { expect, test } from "bun:test"
import { hexPageRanges } from "../src/parser/hex-ranges"

test("retains command identity when a byte range crosses pages", () => {
  const range = {
    offset: 500,
    byteLength: 25,
    label: "Cubic · opcode 4",
    description: "Controls",
  }
  expect(hexPageRanges(0, 512, [range])).toEqual([
    { start: 0, end: 500 },
    { start: 500, end: 512, range },
  ])
  expect(hexPageRanges(512, 600, [range])).toEqual([
    { start: 512, end: 525, range },
    { start: 525, end: 600 },
  ])
})

test("preserves gaps and bytes without annotations", () => {
  expect(hexPageRanges(512, 517, [])).toEqual([{ start: 512, end: 517 }])
  expect(hexPageRanges(0, 0, [])).toEqual([])
  const ranges = [0, 20].map((offset) => ({
    offset,
    byteLength: 4,
    label: "Field",
    description: "0",
  }))
  expect(hexPageRanges(0, 30, ranges).map((p) => [p.start, p.end])).toEqual([
    [0, 4],
    [4, 20],
    [20, 24],
    [24, 30],
  ])
})
