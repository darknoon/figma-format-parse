import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  inspectCommands,
  inspectVectorNetwork,
  type DecodedVectorNetwork,
  type PathCommand,
} from "./geometry"
import {
  commandByteRanges,
  networkByteRanges,
  type BlobByteRange,
} from "./blob-ranges"
import { pathControls } from "./path-controls"
import "./blob-inspector.css"

export interface BlobInspectorProps {
  bytes: Uint8Array
  /** Choose from the field referencing the blob; arbitrary bytes are not sniffed. */
  kind: "path" | "vector-network" | "unknown"
  /** Glyph outlines use em coordinates with Y pointing up. */
  glyph?: boolean
  heading?: ReactNode
  referenceCount?: ReactNode
  renderType?: (type: "PATH" | "NET" | "GLYPH") => ReactNode
  references?: ReactNode
  /** Host-provided binary view keeps byte formatting consistent with the app. */
  renderBytes?: (
    bytes: Uint8Array,
    ranges: readonly BlobByteRange[]
  ) => ReactNode
  /** Host-provided lightbox keeps focus and dismissal behavior consistent. */
  renderDetails: (content: ReactNode, onClose: () => void) => ReactNode
}

export function BlobInspector(props: BlobInspectorProps) {
  const container = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const element = container.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "300px" }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={container} className="fig-blob">
      {visible ? (
        <DecodedBlob {...props} />
      ) : (
        <div className="fig-blob__placeholder">Blob preview</div>
      )}
    </div>
  )
}

function DecodedBlob({
  bytes,
  kind,
  glyph = false,
  heading,
  referenceCount,
  renderType,
  references,
  renderBytes,
  renderDetails,
}: BlobInspectorProps) {
  const commands = useMemo(
    () => (kind === "path" ? inspectCommands(bytes) : undefined),
    [bytes, kind]
  )
  const network = useMemo(
    () => (kind === "vector-network" ? inspectVectorNetwork(bytes) : undefined),
    [bytes, kind]
  )
  const [expanded, setExpanded] = useState(false)
  const ranges = useMemo(
    () =>
      !expanded
        ? []
        : commands
          ? commandByteRanges(commands)
          : network
            ? networkByteRanges(network)
            : [],
    [commands, network, expanded]
  )
  const decoded = !!(commands || network)
  const label = network
    ? "Network"
    : commands
      ? glyph
        ? "Glyph"
        : "Path"
      : "Binary"
  const overview = (showDetails: boolean) => (
    <div className="fig-blob__overview">
      {showDetails ? (
        decoded ? (
          <GeometryPreview
            path={commands?.path}
            commands={commands?.commands}
            network={network}
            glyph={glyph}
            expanded={showDetails}
            renderType={renderType}
          />
        ) : (
          <div className="fig-blob__placeholder">Binary</div>
        )
      ) : (
        <button
          className="fig-blob__open"
          aria-label={`Inspect ${label.toLowerCase()} blob`}
          aria-haspopup="dialog"
          onClick={() => setExpanded(true)}
        >
          {decoded ? (
            <GeometryPreview
              path={commands?.path}
              commands={commands?.commands}
              network={network}
              glyph={glyph}
              expanded={showDetails}
              renderType={renderType}
            />
          ) : (
            <div className="fig-blob__placeholder">Binary</div>
          )}
        </button>
      )}
      <div className="fig-blob__info">
        {showDetails && references && (
          <div className="fig-blob__references">{references}</div>
        )}
        {!showDetails && (
          <div className="fig-blob__heading">
            {heading}
            {referenceCount}
          </div>
        )}
      </div>
    </div>
  )
  return (
    <>
      {overview(false)}
      {expanded &&
        renderDetails(
          <div className="fig-blob fig-blob--expanded">
            {overview(true)}
            <BlobBytes heading={heading}>
              {!decoded && (
                <p className="fig-blob__note">
                  {kind === "unknown"
                    ? "No supported geometry format identified."
                    : "The blob could not be decoded completely."}
                </p>
              )}
              {renderBytes?.(bytes, ranges)}
            </BlobBytes>
          </div>,
          () => setExpanded(false)
        )}
    </>
  )
}

function BlobBytes({
  heading,
  children,
}: {
  heading: ReactNode
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <details
      className="fig-blob__detail-panel"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        Bytes <span className="fig-blob__byte-size">{heading}</span>
      </summary>
      {open && <div className="fig-blob__bytes">{children}</div>}
    </details>
  )
}

const number = (value: number) => String(Number(value.toPrecision(7)))
const pair = (x: number, y: number) => `(${number(x)}, ${number(y)})`

function GeometryPreview({
  path,
  commands,
  network,
  glyph,
  expanded,
  renderType,
}: {
  path?: string
  commands?: PathCommand[]
  network?: DecodedVectorNetwork
  glyph: boolean
  expanded: boolean
  renderType?: BlobInspectorProps["renderType"]
}) {
  const controls = useMemo(() => pathControls(commands ?? []), [commands])
  const drawing = useRef<SVGGElement>(null)
  const geometry = useRef<SVGGElement>(null)
  const [bounds, setBounds] = useState({ x: 0, y: 0, width: 100, height: 100 })
  const [beziers, setBeziers] = useState(false)
  const [radius, setRadius] = useState(1)
  const [copyState, setCopyState] = useState("Copy SVG")
  useEffect(() => {
    if (copyState === "Copy SVG") return
    const timeout = setTimeout(() => setCopyState("Copy SVG"), 2000)
    return () => clearTimeout(timeout)
  }, [copyState])
  const copySvg = async () => {
    const shape = geometry.current
    if (!shape) return
    try {
      const box = shape.getBBox()
      const padding = Math.max(box.width, box.height, 0.001) * 0.02
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      svg.setAttribute(
        "viewBox",
        `${box.x - padding} ${box.y - padding} ${box.width + padding * 2} ${box.height + padding * 2}`
      )
      // Keep em-space glyphs useful when pasted, while preserving saved coordinates in the viewBox.
      const exportScale = 256 / Math.max(box.width, box.height, 0.001)
      svg.setAttribute("width", String((box.width + padding * 2) * exportScale))
      svg.setAttribute(
        "height",
        String((box.height + padding * 2) * exportScale)
      )
      svg.append(shape.cloneNode(true))
      await navigator.clipboard.writeText(
        new XMLSerializer().serializeToString(svg)
      )
      setCopyState("Copied")
    } catch {
      setCopyState("Copy failed")
    }
  }
  useLayoutEffect(() => {
    const svg = drawing.current?.ownerSVGElement
    if (!svg) return
    const measure = () => {
      // A native dialog is initially hidden; measure again when it opens.
      if (!svg.getBoundingClientRect().width) return
      const box = drawing.current?.getBBox()
      if (!box || ![box.x, box.y, box.width, box.height].every(Number.isFinite))
        return
      const span = Math.max(box.width, box.height, 0.001)
      const padding = span * 0.08
      setBounds({
        x: box.x - padding,
        y: box.y - padding,
        width: box.width + padding * 2,
        height: box.height + padding * 2,
      })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(svg)
    measure()
    return () => observer.disconnect()
  }, [path, network, glyph, beziers])
  useLayoutEffect(() => {
    const svg = drawing.current?.ownerSVGElement
    if (!svg) return
    const measure = () => {
      const matrix = drawing.current?.getScreenCTM()
      if (!matrix) return
      const scale = Math.hypot(matrix.a, matrix.b)
      if (scale > 0) setRadius(3 / scale)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(svg)
    measure()
    return () => observer.disconnect()
  }, [bounds])
  const hasGeometry = !!(path || network?.stroke || network?.vertices.length)
  return (
    <div className="fig-blob__geometry">
      <span className="fig-blob__type">
        {renderType?.(network ? "NET" : glyph ? "GLYPH" : "PATH") ?? (
          <span className="fig-blob__type-label">
            {network ? "NET" : glyph ? "GLYPH" : "PATH"}
          </span>
        )}
      </span>
      {hasGeometry ? (
        <svg
          viewBox={`${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`}
          role="img"
          aria-label={
            network
              ? "Decoded vector network"
              : glyph
                ? "Decoded glyph outline"
                : "Decoded path geometry"
          }
        >
          <g ref={drawing}>
            <g ref={geometry}>
              <g transform={glyph ? "scale(1 -1)" : undefined}>
                <path
                  d={
                    network
                      ? network.regions.length
                        ? network.fill
                        : ""
                      : path
                  }
                  fill="#93c5fd"
                  fillRule={glyph ? "nonzero" : "evenodd"}
                />
                {network && !network.regions.length && (
                  <path
                    d={network.stroke}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                  />
                )}
                {network &&
                  !network.stroke &&
                  network.vertices.map((v, i) => (
                    <path key={i} d={`M${v.x} ${v.y}h0.001`} stroke="#2563eb" />
                  ))}
              </g>
            </g>
            <g transform={glyph ? "scale(1 -1)" : undefined}>
              {beziers && controls.lines.map(([a, b], i) => (
                <path key={`path-${i}`} d={`M${a.x} ${a.y}L${b.x} ${b.y}`}
                  stroke="#a855f7" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              ))}
              {beziers &&
                network?.segments.map((s, i) => {
                  const a = network.vertices[s.start],
                    b = network.vertices[s.end]
                  return (
                    <g key={i} stroke="#a855f7" fill="#a855f7" strokeWidth={1}>
                      <path
                        d={`M${a.x} ${a.y}l${s.tx} ${s.ty} M${b.x} ${b.y}l${s.ex} ${s.ey}`}
                        vectorEffect="non-scaling-stroke"
                      />
                    </g>
                  )
                })}
            </g>
          </g>
          <g transform={glyph ? "scale(1 -1)" : undefined}>
            {beziers && controls.handles.map((v, i) => (
              <circle key={`handle-${i}`} cx={v.x} cy={v.y} r={radius * 0.85}
                fill="white" stroke="#a855f7" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            ))}
            {beziers && controls.anchors.map((v, i) => (
              <rect key={`anchor-${i}`} x={v.x - radius} y={v.y - radius}
                width={radius * 2} height={radius * 2} fill="white" stroke="#2563eb"
                strokeWidth={1} vectorEffect="non-scaling-stroke" />
            ))}
            {beziers &&
              network?.segments.map((s, i) => {
                const a = network.vertices[s.start],
                  b = network.vertices[s.end]
                return (
                  <g key={i} fill="white" stroke="#a855f7" strokeWidth={1}>
                    {(s.tx !== 0 || s.ty !== 0) && (
                      <circle
                        cx={a.x + s.tx}
                        cy={a.y + s.ty}
                        r={radius * 0.85}
                        vectorEffect="non-scaling-stroke"
                      />
                    )}
                    {(s.ex !== 0 || s.ey !== 0) && (
                      <circle
                        cx={b.x + s.ex}
                        cy={b.y + s.ey}
                        r={radius * 0.85}
                        vectorEffect="non-scaling-stroke"
                      />
                    )}
                  </g>
                )
              })}
            {(beziers || (network && !network.segments.length)) &&
              network?.vertices.map((v, i) => (
                <rect
                  key={i}
                  x={v.x - radius}
                  y={v.y - radius}
                  width={radius * 2}
                  height={radius * 2}
                  fill="white"
                  stroke="#2563eb"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                >
                  <title>{`Vertex ${i} ${pair(v.x, v.y)}`}</title>
                </rect>
              ))}
          </g>
        </svg>
      ) : (
        <div className="fig-blob__placeholder">No drawable geometry</div>
      )}
      {expanded && hasGeometry && (
        <div className="fig-blob__preview-controls">
          {(network || controls.anchors.length > 0) && (
            <button
              type="button"
              aria-label="Show Bézier controls"
              title="Bézier controls"
              aria-pressed={beziers}
              onClick={() => setBeziers(!beziers)}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M4 18C4 4 20 4 20 18M4 18V5m16 13V5M6 5h12" />
                <circle cx="4" cy="5" r="2" fill="currentColor" stroke="none" />
                <circle
                  cx="20"
                  cy="5"
                  r="2"
                  fill="currentColor"
                  stroke="none"
                />
                <path d="M2 16h4v4H2zm16 0h4v4h-4z" fill="white" />
              </svg>
            </button>
          )}
          <button
            type="button"
            className="fig-blob__copy"
            onClick={copySvg}
            aria-live="polite"
          >
            {copyState}
          </button>
        </div>
      )}
    </div>
  )
}
