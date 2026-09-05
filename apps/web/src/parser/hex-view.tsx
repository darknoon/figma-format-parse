import { Fragment, useId, useMemo, useState } from "react"
import { hex } from "./hex"
import { hexPageRanges, type HexRange } from "./hex-ranges"
import { Button } from "@/components/ui/button"

const noRanges: readonly HexRange[] = []

export function HexView({
  bytes,
  ranges = noRanges,
}: {
  bytes: Uint8Array
  ranges?: readonly HexRange[]
}) {
  const [page, setPage] = useState(0)
  const [hover, setHover] = useState<{
    range: HexRange
    x: number
    y: number
  }>()
  const tooltipId = useId()
  const pageSize = 512
  const currentPage = Math.min(
    page,
    Math.max(0, Math.ceil(bytes.length / pageSize) - 1)
  )
  const start = currentPage * pageSize
  const end = Math.min(start + pageSize, bytes.length)
  const parts = useMemo(
    () =>
      hexPageRanges(start, end, ranges).map((part) => ({
        ...part,
        text: hex(bytes.subarray(part.start, part.end), " "),
      })),
    [bytes, ranges, start, end]
  )
  const describe = (range: HexRange, x: number, y: number) =>
    setHover({
      range,
      x: Math.max(8, Math.min(x, window.innerWidth - 328)),
      y: Math.max(8, Math.min(y + 20, window.innerHeight - 168)),
    })
  return (
    <div>
      <p
        className="break-words font-mono text-xs leading-relaxed text-gray-700 dark:text-gray-400"
        onMouseLeave={() => setHover(undefined)}
      >
        {parts.length
          ? parts.map(({ start, text, range }, i) => (
              <Fragment key={start}>
                {i > 0 && " "}
                {range ? (
                  <span
                    tabIndex={0}
                    data-byte-offset={range.offset}
                    aria-label={`${range.label}: ${range.description}`}
                    aria-describedby={
                      hover?.range === range ? tooltipId : undefined
                    }
                    className="rounded-xs hover:bg-blue-100 hover:text-blue-900 focus:bg-blue-100 focus:text-blue-900 focus:outline-none"
                    onMouseEnter={(event) =>
                      describe(range, event.clientX, event.clientY)
                    }
                    onFocus={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect()
                      describe(range, rect.left, rect.bottom)
                    }}
                    onBlur={() => setHover(undefined)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") setHover(undefined)
                    }}
                  >
                    {text}
                  </span>
                ) : (
                  text
                )}
              </Fragment>
            ))
          : "Empty"}
      </p>
      {hover && (
        <div
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none fixed z-50 w-80 rounded-md border bg-popover p-3 text-sm text-popover-foreground shadow-md"
          style={{ left: hover.x, top: hover.y }}
        >
          <div className="font-medium">{hover.range.label}</div>
          <div className="mt-1">{hover.range.description}</div>
          <div className="mt-1 text-muted-foreground">
            0x{hover.range.offset.toString(16)} · {hover.range.byteLength} bytes
          </div>
        </div>
      )}
      {bytes.length > pageSize && (
        <nav
          aria-label="Hex bytes pages"
          className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <span className="mr-auto">
            {start + 1}–{end} of {bytes.length.toLocaleString()} bytes
          </span>
          <Button
            size="sm"
            variant="ghost"
            disabled={!currentPage}
            onClick={() => {
              setHover(undefined)
              setPage(currentPage - 1)
            }}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={end === bytes.length}
            onClick={() => {
              setHover(undefined)
              setPage(currentPage + 1)
            }}
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  )
}
