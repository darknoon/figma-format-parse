import type { PathCommand } from "./geometry"

type Point = { x: number; y: number }

/** Keep contour anchors and Bézier handles in the path's original coordinates. */
export function pathControls(commands: readonly PathCommand[]) {
  const anchors: Point[] = []
  const handles: Point[] = []
  const lines: [Point, Point][] = []
  let current: Point | undefined
  let start: Point | undefined
  for (const { verb, values } of commands) {
    const point = (i: number): Point => ({ x: values[i], y: values[i + 1] })
    if (verb === "Z") {
      current = start
      continue
    }
    if (verb === "M") {
      current = start = point(0)
      anchors.push(current)
      continue
    }
    if (!current) continue
    const end = point(values.length - 2)
    if (verb === "Q") {
      const control = point(0)
      handles.push(control)
      lines.push([current, control], [end, control])
    } else if (verb === "C") {
      const first = point(0), second = point(2)
      handles.push(first, second)
      lines.push([current, first], [end, second])
    }
    anchors.push(end)
    current = end
  }
  return { anchors, handles, lines }
}
