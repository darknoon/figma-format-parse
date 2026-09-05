import { expect, test } from "bun:test"
import { compileSchema, parseSchema } from "kiwi-schema"
import { kiwiRanges } from "../src/parser/kiwi-ranges"

const schema = parseSchema(`
enum Kind { FIRST = 1; SECOND = 2; }
struct Point { float x; float y; }
message Child { string name = 1; }
message Sample {
  int signed = 1;
  uint unsigned = 2;
  bool enabled = 3;
  Kind kind = 4;
  Point point = 5;
  Child[] children = 6;
  byte[] data = 7;
  int64 large = 8;
  uint64 largest = 9;
}
`)
const compiled = compileSchema(schema) as { encodeSample: (value: unknown) => Uint8Array }
const value = {
  signed: -129, unsigned: 16384, enabled: true, kind: "SECOND",
  point: { x: 0.125, y: -2.5 }, children: [{ name: "héllo" }, {}],
  data: new Uint8Array([0, 128, 255]), large: -9007199254740993n, largest: 18446744073709551615n,
}

test("schema annotations cover every encoded byte and preserve nested field paths", () => {
  const bytes = compiled.encodeSample(value)
  const ranges = kiwiRanges(schema, "Sample", value, bytes)
  let end = 0
  for (const range of ranges) {
    expect(range.offset).toBe(end)
    end += range.byteLength
  }
  expect(end).toBe(bytes.length)
  expect(ranges.find((r) => r.label === "point.y")?.description).toBe("float · -2.5")
  expect(ranges.some((r) => r.label === "children[0].name" && r.description.includes("héllo"))).toBe(true)
  expect(ranges.some((r) => r.description === "Kind · \"SECOND\" (2)")).toBe(true)
  expect(ranges.some((r) => r.label === "children[1]" && r.description === "End of Child · tag 0")).toBe(true)
})

test("does not annotate mismatched bytes", () => {
  const bytes = compiled.encodeSample(value)
  bytes[0] ^= 1
  expect(kiwiRanges(schema, "Sample", value, bytes)).toEqual([])
})
