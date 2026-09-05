import { useLayoutEffect, useId, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"

export function ImageLightbox({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useLayoutEffect(() => {
    const element = dialog.current!
    const trigger = document.activeElement
    element.showModal()
    return () => {
      element.close()
      if (trigger instanceof HTMLElement) trigger.focus()
    }
  }, [])

  return createPortal(
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-black/90 p-4 text-white backdrop:bg-black/60 sm:p-8"
    >
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 id={titleId} className="min-w-0 truncate text-sm font-medium">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close image"
            className="shrink-0 rounded-md p-2 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="m6 6 12 12M6 18 18 6" />
            </svg>
          </button>
        </div>
        <div
          className="flex min-h-0 flex-1 items-center justify-center"
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
        >
          {children}
        </div>
      </div>
    </dialog>,
    document.body
  )
}

export function ImagePreview({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Enlarge ${alt.toLowerCase()}`}
        aria-haspopup="dialog"
        className="w-fit cursor-zoom-in rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <img src={src} alt={alt} className="w-16" />
      </button>
      {open && (
        <ImageLightbox title={alt} onClose={() => setOpen(false)}>
          <img
            src={src}
            alt={alt}
            className="max-h-full max-w-full object-contain"
          />
        </ImageLightbox>
      )}
    </>
  )
}
