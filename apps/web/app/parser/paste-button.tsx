"use client"
import { Button } from "@/components/ui/button"

export function PasteButton({
  onPaste,
}: {
  onPaste: (items: ClipboardItems) => void
}) {
  const canPaste = !!navigator.clipboard && "read" in navigator.clipboard
  return (
    <>
      {canPaste ? (
        <Button
          onClick={() => {
            if (navigator.clipboard && "read" in navigator.clipboard) {
              navigator.clipboard.read().then(onPaste)
            }
          }}
        >
          {/* command symbol -V */}
          <span className="text-sm">Paste (⌘V)</span>
        </Button>
      ) : (
        <p>Paste (⌘V)</p>
      )}
    </>
  )
}
