import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function PasteButton({
  onPaste,
}: {
  onPaste: (items: ClipboardItems) => void
}) {
  const [canPaste, setCanPaste] = useState(false)
  useEffect(() => {
    const ok =
      typeof "navigator" !== "undefined" &&
      !!navigator.clipboard &&
      "read" in navigator.clipboard
    setCanPaste(ok)
  }, [])

  return (
    <>
      <Button
        disabled={!canPaste}
        onClick={() => {
          if (navigator.clipboard && "read" in navigator.clipboard) {
            navigator.clipboard.read().then(onPaste)
          }
        }}
      >
        {/* command symbol -V */}
        <span className="text-sm">Paste ⌘V</span>
      </Button>
    </>
  )
}
