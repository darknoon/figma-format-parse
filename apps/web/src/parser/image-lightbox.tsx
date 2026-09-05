import { useLayoutEffect, useId, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"

export function ImageLightbox({
  title,
  closeLabel = "Close image",
  onClose,
  children,
  footer,
}: {
  title: string
  closeLabel?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
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
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-8 text-foreground backdrop:bg-black/20"
    >
      <div
        className="flex h-full items-center justify-center"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
      >
        <div className="flex max-w-full flex-col items-center gap-3">
          <div
            className={`relative max-w-full rounded-lg bg-card text-card-foreground shadow-xl [&_img]:block [&_img]:rounded-lg [&_img]:max-w-[calc(100vw-4rem)] ${footer ? "[&_img]:max-h-[calc(100dvh-9rem)]" : "[&_img]:max-h-[calc(100dvh-4rem)]"}`}
          >
            <h2 id={titleId} className="sr-only">
              {title}
            </h2>
            {children}
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-card text-card-foreground shadow-md hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <svg
                width="16"
                height="16"
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
          {footer && (
            <div className="max-h-20 max-w-full overflow-auto rounded-3xl bg-card px-4 py-2 text-card-foreground shadow-lg">
              {footer}
            </div>
          )}
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
        className="w-fit cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
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
