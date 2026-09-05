import { useMemo, useState } from "react"
import { hex } from "./hex"
import { Button } from "@/components/ui/button"

export function HexView({ bytes }: { bytes: Uint8Array }) {
  const [page, setPage] = useState(0)
  const pageSize = 512
  const currentPage = Math.min(
    page,
    Math.max(0, Math.ceil(bytes.length / pageSize) - 1)
  )
  const start = currentPage * pageSize
  const end = Math.min(start + pageSize, bytes.length)
  const text = useMemo(
    () => hex(bytes.subarray(start, end), " "),
    [bytes, start, end]
  )
  return (
    <div>
      <p className="break-words font-mono text-xs leading-relaxed text-gray-700 dark:text-gray-400">
        {text || "Empty"}
      </p>
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
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={end === bytes.length}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  )
}
