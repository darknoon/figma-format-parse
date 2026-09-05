export interface HexRange {
  offset: number
  byteLength: number
  label: string
  description: string
}

/** Clip annotations to a page while preserving every byte, including gaps. */
export function hexPageRanges(
  start: number,
  end: number,
  ranges: readonly HexRange[]
) {
  const parts: { start: number; end: number; range?: HexRange }[] = []
  let cursor = start
  for (const range of ranges) {
    const lo = Math.max(cursor, range.offset)
    const hi = Math.min(end, range.offset + range.byteLength)
    if (lo >= end) break
    if (hi <= lo) continue
    if (cursor < lo) parts.push({ start: cursor, end: lo })
    parts.push({ start: lo, end: hi, range })
    cursor = hi
  }
  if (cursor < end) parts.push({ start: cursor, end })
  return parts
}
