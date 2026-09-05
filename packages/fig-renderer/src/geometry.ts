import type { Matrix, NodeChange, Vector } from "fig-kiwi/schema-defs"

/** Figma's cached paths: byte opcode, followed by little-endian float32s.
 * Glyphs use the same format, in em units with Y pointing up.
 * Fail the entire path on unknown/truncated data instead of drawing corruption.
 */
export interface PathCommand {
  offset: number
  byteLength: number
  opcode: number
  verb: "Z" | "M" | "L" | "Q" | "C"
  values: number[]
}

export interface DecodedCommands {
  path: string
  commands: PathCommand[]
}

export function inspectCommands(
  bytes: Uint8Array
): DecodedCommands | undefined {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const commands: string[] = []
  const records: PathCommand[] = []
  const names = ["Z", "M", "L", "Q", "C"] as const
  const counts = [0, 2, 2, 4, 6]
  let offset = 0
  let started = false
  while (offset < bytes.length) {
    const start = offset
    const opcode = bytes[offset++]
    const count = counts[opcode]
    if (count === undefined || offset + count * 4 > bytes.length) return
    const values: number[] = []
    for (let i = 0; i < count; i++, offset += 4) {
      const value = view.getFloat32(offset, true)
      if (!Number.isFinite(value)) return
      values.push(value)
    }
    if (opcode === 1) started = true
    if (started) commands.push(names[opcode] + values.join(" "))
    records.push({
      offset: start,
      byteLength: offset - start,
      opcode,
      verb: names[opcode],
      values,
    })
  }
  return { path: commands.join(" "), commands: records }
}

export function decodeCommands(bytes: Uint8Array): string | undefined {
  return inspectCommands(bytes)?.path
}

export const identity: Matrix = {
  m00: 1,
  m01: 0,
  m02: 0,
  m10: 0,
  m11: 1,
  m12: 0,
}

export function multiply(a: Matrix, b: Matrix): Matrix {
  return {
    m00: a.m00 * b.m00 + a.m01 * b.m10,
    m01: a.m00 * b.m01 + a.m01 * b.m11,
    m02: a.m00 * b.m02 + a.m01 * b.m12 + a.m02,
    m10: a.m10 * b.m00 + a.m11 * b.m10,
    m11: a.m10 * b.m01 + a.m11 * b.m11,
    m12: a.m10 * b.m02 + a.m11 * b.m12 + a.m12,
  }
}

export function inverse(m: Matrix): Matrix | undefined {
  const det = m.m00 * m.m11 - m.m01 * m.m10
  if (Math.abs(det) < 1e-12) return
  return {
    m00: m.m11 / det,
    m01: -m.m01 / det,
    m02: (m.m01 * m.m12 - m.m11 * m.m02) / det,
    m10: -m.m10 / det,
    m11: m.m00 / det,
    m12: (m.m10 * m.m02 - m.m00 * m.m12) / det,
  }
}

export function point(m: Matrix, x: number, y: number): Vector {
  return { x: m.m00 * x + m.m01 * y + m.m02, y: m.m10 * x + m.m11 * y + m.m12 }
}

export function svgMatrix(m = identity) {
  return `matrix(${m.m00} ${m.m10} ${m.m01} ${m.m11} ${m.m02} ${m.m12})`
}

/** Primitive fallback when an export has no cached geometry. */
export function primitivePath(node: NodeChange): string {
  const { x: w = 0, y: h = 0 } = node.size ?? {}
  if (node.type === "LINE") return `M0 0 L${w} 0`
  if (node.type === "ELLIPSE") {
    const arc = node.arcData
    if (
      arc &&
      Math.abs(arc.endingAngle! - arc.startingAngle!) < Math.PI * 2 - 1e-5
    ) {
      const start = arc.startingAngle ?? 0,
        end = arc.endingAngle ?? Math.PI * 2
      const inner = arc.innerRadius ?? 0
      const p = (angle: number, radius: number) =>
        `${w / 2 + ((Math.cos(angle) * w) / 2) * radius} ${h / 2 + ((Math.sin(angle) * h) / 2) * radius}`
      const large = Math.abs(end - start) > Math.PI ? 1 : 0
      const sweep = end > start ? 1 : 0
      return (
        `M${p(start, 1)} A${w / 2} ${h / 2} 0 ${large} ${sweep} ${p(end, 1)} ` +
        (inner
          ? `L${p(end, inner)} A${(w / 2) * inner} ${(h / 2) * inner} 0 ${large} ${1 - sweep} ${p(start, inner)} Z`
          : `L${w / 2} ${h / 2} Z`)
      )
    }
    return `M0 ${h / 2} A${w / 2} ${h / 2} 0 1 0 ${w} ${h / 2} A${w / 2} ${h / 2} 0 1 0 0 ${h / 2} Z`
  }
  if (node.type === "REGULAR_POLYGON" || node.type === "STAR") {
    const count = Math.max(3, Math.min(1000, node.count ?? 5))
    const star = node.type === "STAR"
    const n = count * (star ? 2 : 1)
    return (
      Array.from({ length: n }, (_, i) => {
        const radius = star && i % 2 ? (node.starInnerScale ?? 0.382) : 1
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2
        return `${i ? "L" : "M"}${w / 2 + ((Math.cos(angle) * w) / 2) * radius} ${h / 2 + ((Math.sin(angle) * h) / 2) * radius}`
      }).join(" ") + " Z"
    )
  }
  const radius = Math.max(0, node.cornerRadius ?? 0)
  const corners = [
    node.rectangleTopLeftCornerRadius,
    node.rectangleTopRightCornerRadius,
    node.rectangleBottomRightCornerRadius,
    node.rectangleBottomLeftCornerRadius,
  ].map((r) => Math.max(0, Math.min(r ?? radius, w / 2, h / 2)))
  const [tl, tr, br, bl] = corners
  return `M${tl} 0 H${w - tr} Q${w} 0 ${w} ${tr} V${h - br} Q${w} ${h} ${w - br} ${h} H${bl} Q0 ${h} 0 ${h - bl} V${tl} Q0 0 ${tl} 0 Z`
}

/** Vector-network fallback for exports lacking cached fill/stroke paths.
 * Header counts; vertices (style, x, y); segments (style, start, tangent,
 * end, tangent); then regions containing lists of segment indices.
 * Cached paths remain preferable: they already include corner rounding/strokes.
 */
export interface NetworkVertex {
  offset: number
  style: number
  x: number
  y: number
}

export interface NetworkSegment {
  offset: number
  style: number
  start: number
  end: number
  tx: number
  ty: number
  ex: number
  ey: number
}

export interface NetworkRegion {
  offset: number
  flags: number
  loops: { offset: number; segments: number[] }[]
}

export interface DecodedVectorNetwork {
  fill: string
  stroke: string
  vertices: NetworkVertex[]
  segments: NetworkSegment[]
  regions: NetworkRegion[]
}

export function inspectVectorNetwork(
  bytes: Uint8Array
): DecodedVectorNetwork | undefined {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let offset = 0
  const u32 = () => {
    if (offset + 4 > bytes.length) throw new Error("Truncated network")
    const n = view.getUint32(offset, true)
    offset += 4
    return n
  }
  const f32 = () => {
    if (offset + 4 > bytes.length) throw new Error("Truncated network")
    const n = view.getFloat32(offset, true)
    offset += 4
    if (!Number.isFinite(n)) throw new Error("Invalid coordinate")
    return n
  }
  try {
    const vertexCount = u32(),
      segmentCount = u32(),
      regionCount = u32()
    if (12 + vertexCount * 12 + segmentCount * 28 > bytes.length) return
    const vertices = Array.from({ length: vertexCount }, () => {
      const start = offset
      const style = u32()
      return { offset: start, style, x: f32(), y: f32() }
    })
    const segments = Array.from({ length: segmentCount }, () => {
      const recordOffset = offset
      const style = u32()
      const start = u32(),
        tx = f32(),
        ty = f32(),
        end = u32(),
        ex = f32(),
        ey = f32()
      if (start >= vertexCount || end >= vertexCount)
        throw new Error("Invalid vertex")
      return { offset: recordOffset, style, start, end, tx, ty, ex, ey }
    })
    function contour(indices: number[]) {
      const remaining = new Set(indices)
      const adjacency = new Map<number, number[]>()
      for (const index of remaining) {
        const s = segments[index]
        if (!s) throw new Error("Invalid segment")
        for (const v of [s.start, s.end])
          adjacency.set(v, [...(adjacency.get(v) ?? []), index])
      }
      const commands: string[] = []
      while (remaining.size) {
        let index = remaining.values().next().value!
        let start = segments[index].start
        // Start an open chain at an endpoint when possible.
        const endPoint = [...adjacency].find(
          ([, edges]) => edges.filter((e) => remaining.has(e)).length === 1
        )
        if (endPoint) {
          start = endPoint[0]
          index = endPoint[1].find((e) => remaining.has(e))!
        }
        let current = start
        commands.push(`M${vertices[start].x} ${vertices[start].y}`)
        while (remaining.has(index)) {
          remaining.delete(index)
          const s = segments[index],
            forward = current === s.start
          const a = vertices[current],
            next = forward ? s.end : s.start,
            b = vertices[next]
          const tx = forward ? s.tx : s.ex,
            ty = forward ? s.ty : s.ey
          const ex = forward ? s.ex : s.tx,
            ey = forward ? s.ey : s.ty
          commands.push(
            tx || ty || ex || ey
              ? `C${a.x + tx} ${a.y + ty} ${b.x + ex} ${b.y + ey} ${b.x} ${b.y}`
              : `L${b.x} ${b.y}`
          )
          current = next
          if (current === start) {
            commands.push("Z")
            break
          }
          const edge = adjacency.get(current)?.find((e) => remaining.has(e))
          if (edge === undefined) break
          index = edge
        }
      }
      return commands.join(" ")
    }
    const fills: string[] = []
    const regions: NetworkRegion[] = []
    if (regionCount > bytes.length / 8) return
    for (let i = 0; i < regionCount; i++) {
      const region: NetworkRegion = { offset, flags: u32(), loops: [] }
      const loops = u32()
      if (loops > bytes.length / 4) return
      for (let j = 0; j < loops; j++) {
        const loopOffset = offset
        const count = u32()
        if (count > (bytes.length - offset) / 4) return
        const indices = Array.from({ length: count }, u32)
        region.loops.push({ offset: loopOffset, segments: indices })
        fills.push(contour(indices))
      }
      regions.push(region)
    }
    if (offset !== bytes.length) return
    const stroke = contour(segments.map((_, i) => i))
    return {
      fill: fills.length ? fills.join(" ") : stroke,
      stroke,
      vertices,
      segments,
      regions,
    }
  } catch {
    return
  }
}

export function decodeVectorNetwork(
  bytes: Uint8Array
): { fill: string; stroke: string } | undefined {
  const network = inspectVectorNetwork(bytes)
  if (network) return { fill: network.fill, stroke: network.stroke }
}
