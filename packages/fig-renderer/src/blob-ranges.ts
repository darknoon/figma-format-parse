import type { DecodedCommands, DecodedVectorNetwork } from "./geometry"

/** Non-overlapping byte ranges, in file order, for the host's binary viewer. */
export interface BlobByteRange {
  offset: number
  byteLength: number
  label: string
  description: string
}

const number = (value: number) =>
  Number.isInteger(value) ? String(value) : String(Number(value.toPrecision(7)))
const pair = (x: number, y: number) => `(${number(x)}, ${number(y)})`
const verbs = { M: "Move", L: "Line", Q: "Quadratic", C: "Cubic", Z: "Close" }

export function commandByteRanges({
  commands,
}: DecodedCommands): BlobByteRange[] {
  return commands.map(({ offset, byteLength, opcode, verb, values: v }) => ({
    offset,
    byteLength,
    label: `${verbs[verb]} · opcode ${opcode}`,
    description:
      verb === "Z"
        ? "Close contour"
        : verb === "Q"
          ? `Control ${pair(v[0], v[1])} → end ${pair(v[2], v[3])}`
          : verb === "C"
            ? `Controls ${pair(v[0], v[1])}, ${pair(v[2], v[3])} → end ${pair(v[4], v[5])}`
            : pair(v[0], v[1]),
  }))
}

export function networkByteRanges(n: DecodedVectorNetwork): BlobByteRange[] {
  const ranges: BlobByteRange[] = []
  const field = (offset: number, label: string, value: number) =>
    ranges.push({ offset, byteLength: 4, label, description: number(value) })
  field(0, "Vertex count", n.vertices.length)
  field(4, "Segment count", n.segments.length)
  field(8, "Region count", n.regions.length)
  n.vertices.forEach((v, i) => {
    field(v.offset, `Vertex ${i} · style (raw)`, v.style)
    field(v.offset + 4, `Vertex ${i} · X`, v.x)
    field(v.offset + 8, `Vertex ${i} · Y`, v.y)
  })
  n.segments.forEach((s, i) => {
    field(s.offset, `Segment ${i} · style (raw)`, s.style)
    field(s.offset + 4, `Segment ${i} · start vertex`, s.start)
    field(s.offset + 8, `Segment ${i} · start tangent X`, s.tx)
    field(s.offset + 12, `Segment ${i} · start tangent Y`, s.ty)
    field(s.offset + 16, `Segment ${i} · end vertex`, s.end)
    field(s.offset + 20, `Segment ${i} · end tangent X`, s.ex)
    field(s.offset + 24, `Segment ${i} · end tangent Y`, s.ey)
  })
  n.regions.forEach((r, i) => {
    field(r.offset, `Region ${i} · flags (raw)`, r.flags)
    field(r.offset + 4, `Region ${i} · loop count`, r.loops.length)
    r.loops.forEach((loop, j) => {
      field(
        loop.offset,
        `Region ${i} · loop ${j} · segment count`,
        loop.segments.length
      )
      loop.segments.forEach((segment, k) =>
        field(
          loop.offset + 4 + k * 4,
          `Region ${i} · loop ${j} · segment ${k}`,
          segment
        )
      )
    })
  })
  return ranges
}
