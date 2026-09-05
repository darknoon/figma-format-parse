import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { Message } from "fig-kiwi"
import type { FigmaImageEntry } from "fig-kiwi/blob"
import type { GUID } from "fig-kiwi/schema-defs"
import { nodeId } from "./hierarchy"
import { svgMatrix } from "./geometry"
import {
  buildScene,
  fitCamera,
  union,
  zoomCamera,
  type Camera,
  type Bounds,
} from "./scene-data"
import { useSceneImages } from "./scene-images"
import { SceneDrawing } from "./scene-svg"
import { cssColor } from "./color"
import "./renderer.css"

export interface FigmaRendererProps {
  message: Message
  imageEntries?: FigmaImageEntry[]
  selected?: GUID
  /** Increment to reveal the selected node, e.g. after a tree click. */
  focusRequest?: number
  onSelect?: (guid?: GUID) => void
  /** Reports the layer under the pointer independently of selection. */
  onHover?: (guid?: GUID) => void
}

export function FigmaRenderer({
  message,
  imageEntries,
  selected,
  focusRequest = 0,
  onSelect,
  onHover,
}: FigmaRendererProps) {
  const scene = useMemo(() => buildScene(message), [message])
  const [pageId, setPageId] = useState(
    () => scene.pages.find((p) => p.children.length)?.id ?? scene.pages[0]?.id
  )
  const page = pageId ? scene.byId.get(pageId) : undefined
  const roots = useMemo(
    () => (page ? page.children : scene.roots),
    [page, scene]
  )
  const items = useMemo(
    () => scene.order.filter((item) => !pageId || item.pageId === pageId),
    [scene, pageId]
  )
  const bounds = useMemo(
    () =>
      roots.reduce(
        (b, item) => union(b, item.visible ? item.bounds : undefined),
        undefined as Bounds | undefined
      ),
    [roots]
  )
  const { images, failed, pending } = useSceneImages(
    items,
    message,
    imageEntries
  )
  const prefix = useId().replace(/:/g, "")
  const selectedId = selected && nodeId(selected)
  const selectedItem = selectedId ? scene.byId.get(selectedId) : undefined
  const [hoveredId, setHoveredId] = useState<string>()
  const hoverId = useRef<string | undefined>(undefined)
  const hoveredItem = hoveredId ? scene.byId.get(hoveredId) : undefined
  const updateHover = useCallback(
    (id?: string) => {
      if (hoverId.current === id) return
      hoverId.current = id
      setHoveredId(id)
      onHover?.(id ? scene.byId.get(id)?.node.guid : undefined)
    },
    [onHover, scene]
  )
  useEffect(() => {
    updateHover()
    return () => onHover?.(undefined)
  }, [pageId, updateHover, onHover])
  const viewport = useRef<HTMLDivElement>(null)
  const cameraGroup = useRef<SVGGElement>(null)
  const camera = useRef<Camera>({ x: 0, y: 0, zoom: 1 })
  const [zoom, setZoom] = useState(1)
  const frame = useRef(0)
  const dimensions = useRef({ width: 0, height: 0 })
  const drag = useRef<
    { pointer: number; x: number; y: number; origin: Camera } | undefined
  >(undefined)
  const appliedFocus = useRef(0)
  const space = useRef(false)
  const [panning, setPanning] = useState(false)
  const [zoomMenuOpen, setZoomMenuOpen] = useState(false)
  const zoomMenu = useRef<HTMLDivElement>(null)
  const zoomMenuButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!zoomMenuOpen) return
    const close = (event: PointerEvent) => {
      if (!zoomMenu.current?.contains(event.target as Node))
        setZoomMenuOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setZoomMenuOpen(false)
        zoomMenuButton.current?.focus()
      }
    }
    document.addEventListener("pointerdown", close)
    document.addEventListener("keydown", escape)
    return () => {
      document.removeEventListener("pointerdown", close)
      document.removeEventListener("keydown", escape)
    }
  }, [zoomMenuOpen])

  const moveCamera = useCallback(
    (next: Camera) => {
      updateHover()
      camera.current = next
      if (frame.current) return
      frame.current = requestAnimationFrame(() => {
        frame.current = 0
        const c = camera.current
        cameraGroup.current?.setAttribute(
          "transform",
          `translate(${c.x} ${c.y}) scale(${c.zoom})`
        )
        setZoom(c.zoom)
      })
    },
    [updateHover]
  )

  const fit = useCallback(
    (selection = false) => {
      const { width, height } = dimensions.current
      moveCamera(
        fitCamera(
          selection ? (selectedItem?.bounds ?? bounds) : bounds,
          width,
          height
        )
      )
    },
    [bounds, selectedItem, moveCamera]
  )

  useLayoutEffect(() => {
    const element = viewport.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const old = dimensions.current
      dimensions.current = { width, height }
      if (!old.width) moveCamera(fitCamera(bounds, width, height))
      else
        moveCamera({
          ...camera.current,
          x: camera.current.x + (width - old.width) / 2,
          y: camera.current.y + (height - old.height) / 2,
        })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [bounds, moveCamera])

  useEffect(() => {
    const { width, height } = dimensions.current
    moveCamera(fitCamera(bounds, width, height))
  }, [bounds, moveCamera])

  // Tree selection switches pages and reveals the corresponding scene node.
  // Canvas clicks only change selection, leaving the camera where it is.
  useEffect(() => {
    if (!selectedItem || !focusRequest || focusRequest === appliedFocus.current)
      return
    if (selectedItem.pageId && selectedItem.pageId !== pageId) {
      setPageId(selectedItem.pageId)
      return
    }
    const { width, height } = dimensions.current
    appliedFocus.current = focusRequest
    moveCamera(fitCamera(selectedItem.bounds, width, height))
  }, [focusRequest, selectedItem, pageId, moveCamera])

  useEffect(() => {
    const element = viewport.current
    if (!element) return
    const wheel = (event: WheelEvent) => {
      event.preventDefault()
      const rect = element.getBoundingClientRect()
      const delta =
        event.deltaY *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rect.height : 1)
      moveCamera(
        zoomCamera(
          camera.current,
          Math.exp(-Math.max(-200, Math.min(200, delta)) * 0.002),
          event.clientX - rect.left,
          event.clientY - rect.top
        )
      )
    }
    const release = () => {
      space.current = false
      drag.current = undefined
      setPanning(false)
      updateHover()
    }
    element.addEventListener("wheel", wheel, { passive: false })
    window.addEventListener("blur", release)
    return () => {
      element.removeEventListener("wheel", wheel)
      window.removeEventListener("blur", release)
      cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [moveCamera, updateHover])

  const zoomAtCenter = (factor: number) =>
    moveCamera(
      zoomCamera(
        camera.current,
        factor,
        dimensions.current.width / 2,
        dimensions.current.height / 2
      )
    )
  const buttonClass = "fig-renderer__button"
  return (
    <section className="fig-renderer" aria-label="Scene preview">
      {pending > 0 && (
        <span role="status" className="fig-renderer__status">
          Loading images…
        </span>
      )}
      {pending === 0 && failed > 0 && (
        <span role="status" className="fig-renderer__status">
          {failed} unavailable images
        </span>
      )}
      <div
        className="fig-renderer__navigation"
        role="group"
        aria-label="Preview navigation"
      >
        <button
          className={buttonClass}
          aria-label="Zoom out"
          onClick={() => zoomAtCenter(1 / 1.25)}
        >
          −
        </button>
        <div ref={zoomMenu} className="fig-renderer__zoom-menu">
          <button
            ref={zoomMenuButton}
            className={`${buttonClass} fig-renderer__zoom`}
            aria-label="Zoom options"
            aria-expanded={zoomMenuOpen}
            onClick={() => setZoomMenuOpen(!zoomMenuOpen)}
          >
            {Number((zoom * 100).toFixed(zoom < 0.1 ? 1 : 0))}%
          </button>
          {zoomMenuOpen && (
            <div className="fig-renderer__zoom-options">
              <button
                className={buttonClass}
                onClick={() => {
                  fit()
                  setZoomMenuOpen(false)
                }}
              >
                Fit page <kbd>⇧1</kbd>
              </button>
              <button
                className={buttonClass}
                disabled={!selectedItem?.bounds}
                onClick={() => {
                  fit(true)
                  setZoomMenuOpen(false)
                }}
              >
                Fit selection <kbd>⇧2</kbd>
              </button>
              <button
                className={buttonClass}
                onClick={() => {
                  zoomAtCenter(1 / camera.current.zoom)
                  setZoomMenuOpen(false)
                }}
              >
                100%
              </button>
            </div>
          )}
        </div>
        <button
          className={buttonClass}
          aria-label="Zoom in"
          onClick={() => zoomAtCenter(1.25)}
        >
          +
        </button>
      </div>
      <div
        ref={viewport}
        tabIndex={0}
        role="region"
        aria-label="Design canvas"
        className="fig-renderer__viewport"
        style={{
          background: cssColor(
            page?.node.backgroundColor ?? { r: 0.94, g: 0.945, b: 0.955, a: 1 }
          ),
          cursor: panning ? "grabbing" : "default",
          touchAction: "none",
        }}
        onAuxClick={(event) => {
          if (event.button === 1) event.preventDefault()
        }}
        onPointerDown={(event) => {
          if (event.button === 1 || (event.button === 0 && space.current)) {
            updateHover()
            event.preventDefault()
            event.currentTarget.focus({ preventScroll: true })
            event.currentTarget.setPointerCapture(event.pointerId)
            drag.current = {
              pointer: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              origin: camera.current,
            }
            setPanning(true)
          } else if (event.button === 0) {
            event.currentTarget.focus({ preventScroll: true })
            const target = event.target as Element
            const id = target
              .closest("[data-scene-node]")
              ?.getAttribute("data-scene-node")
            onSelect?.(id ? scene.byId.get(id)?.node.guid : undefined)
          }
        }}
        onPointerMove={(event) => {
          const d = drag.current
          if (d?.pointer === event.pointerId)
            moveCamera({
              ...d.origin,
              x: d.origin.x + event.clientX - d.x,
              y: d.origin.y + event.clientY - d.y,
            })
          else if (!d && event.pointerType !== "touch") {
            const target = event.target as Element
            updateHover(
              target
                .closest("[data-scene-node]")
                ?.getAttribute("data-scene-node") ?? undefined
            )
          }
        }}
        onPointerLeave={() => updateHover()}
        onPointerUp={(event) => {
          if (drag.current?.pointer === event.pointerId) {
            drag.current = undefined
            setPanning(false)
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
        }}
        onPointerCancel={() => {
          updateHover()
          drag.current = undefined
          setPanning(false)
        }}
        onLostPointerCapture={() => {
          drag.current = undefined
          setPanning(false)
        }}
        onKeyDown={(event) => {
          if (event.code === "Space") {
            event.preventDefault()
            space.current = true
          } else if (event.shiftKey && event.code === "Digit1") {
            event.preventDefault()
            fit()
          } else if (event.shiftKey && event.code === "Digit2") {
            event.preventDefault()
            fit(true)
          } else if (event.key === "+" || event.key === "=") {
            event.preventDefault()
            zoomAtCenter(1.25)
          } else if (event.key === "-") {
            event.preventDefault()
            zoomAtCenter(1 / 1.25)
          } else if (event.key === "Escape") onSelect?.(undefined)
        }}
        onKeyUp={(event) => {
          if (event.code === "Space") space.current = false
        }}
        onBlur={() => {
          space.current = false
        }}
      >
        <svg className="fig-renderer__svg" aria-label="Rendered Figma scene">
          <g ref={cameraGroup}>
            <SceneDrawing
              scene={scene}
              roots={roots}
              images={images}
              prefix={prefix}
            />
            {hoveredItem?.visible &&
              hoveredId !== selectedId &&
              hoveredItem.pageId === pageId &&
              hoveredItem.node.size && (
                <g
                  data-hovered-node={hoveredId}
                  pointerEvents="none"
                  transform={svgMatrix(hoveredItem.world)}
                >
                  <rect
                    width={hoveredItem.node.size.x}
                    height={hoveredItem.node.size.y}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              )}
            {selectedItem?.visible &&
              selectedItem.pageId === pageId &&
              selectedItem.node.size && (
                <g
                  pointerEvents="none"
                  transform={svgMatrix(selectedItem.world)}
                >
                  <rect
                    width={selectedItem.node.size.x}
                    height={selectedItem.node.size.y}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              )}
          </g>
        </svg>
        {!bounds && (
          <div className="fig-renderer__empty">
            This page has no visible layers.
          </div>
        )}
      </div>
    </section>
  )
}
