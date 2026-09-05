import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

export function SplitView({ sidebar, children }: {
  sidebar: ReactNode
  children: ReactNode
}) {
  const container = useRef<HTMLDivElement>(null)
  const drag = useRef<{ pointerId: number; offset: number } | null>(null)
  const sidebarId = useId()
  const [containerWidth, setContainerWidth] = useState(0)
  const [preferredWidth, setPreferredWidth] = useState<number>()
  const [dragging, setDragging] = useState(false)

  useLayoutEffect(() => {
    const element = container.current!
    const measure = () => setContainerWidth(element.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const minWidth = Math.min(160, containerWidth / 2)
  const maxWidth = Math.max(minWidth, Math.min(640, containerWidth - 241))
  const defaultWidth = containerWidth >= 1024 ? 320 : containerWidth >= 640 ? 256 : 192
  const clamp = (width: number) => Math.min(maxWidth, Math.max(minWidth, width))
  const width = clamp(preferredWidth ?? defaultWidth)

  function endDrag() {
    drag.current = null
    setDragging(false)
  }

  return (
    <div ref={container} className={cn("flex h-dvh w-full overflow-hidden", dragging && "select-none cursor-col-resize")}>
      <div id={sidebarId} className="h-full w-48 shrink-0 overflow-hidden sm:w-64 lg:w-80" style={containerWidth ? { width } : undefined}>
        {sidebar}
      </div>
      <div
        role="separator"
        aria-label="Resize sidebar"
        aria-orientation="vertical"
        aria-controls={sidebarId}
        aria-valuemin={Math.round(minWidth)}
        aria-valuemax={Math.round(maxWidth)}
        aria-valuenow={Math.round(width)}
        aria-valuetext={`${Math.round(width)} pixels`}
        tabIndex={0}
        title="Drag to resize sidebar. Double-click to reset."
        className={cn("relative z-20 w-px shrink-0 cursor-col-resize touch-none bg-border hover:bg-blue-600 focus-visible:bg-blue-600 focus-visible:outline-none", dragging && "bg-blue-600")}
        onPointerDown={(event) => {
          if (event.button !== 0 || drag.current) return
          event.preventDefault()
          event.currentTarget.focus()
          event.currentTarget.setPointerCapture(event.pointerId)
          drag.current = {
            pointerId: event.pointerId,
            offset: event.clientX - container.current!.getBoundingClientRect().left - width,
          }
          setDragging(true)
        }}
        onPointerMove={(event) => {
          if (drag.current?.pointerId !== event.pointerId) return
          setPreferredWidth(clamp(event.clientX - container.current!.getBoundingClientRect().left - drag.current.offset))
        }}
        onPointerUp={(event) => {
          if (drag.current?.pointerId !== event.pointerId) return
          event.currentTarget.releasePointerCapture(event.pointerId)
          endDrag()
        }}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        onDoubleClick={() => setPreferredWidth(undefined)}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 64 : 16
          if (event.key === "ArrowLeft") setPreferredWidth(clamp(width - step))
          else if (event.key === "ArrowRight") setPreferredWidth(clamp(width + step))
          else if (event.key === "Home") setPreferredWidth(minWidth)
          else if (event.key === "End") setPreferredWidth(maxWidth)
          else return
          event.preventDefault()
        }}
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
      </div>
      <div className="h-full min-w-0 flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
