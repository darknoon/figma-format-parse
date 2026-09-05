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
import "./blob-inspector.css"

export interface BlobInspectorProps {
  bytes: Uint8Array
  /** Choose from the field referencing the blob; arbitrary bytes are not sniffed. */
  kind: "path" | "vector-network" | "unknown"
  /** Glyph outlines use em coordinates with Y pointing up. */
  glyph?: boolean
  heading?: ReactNode
  references?: ReactNode | ((expanded: boolean) => ReactNode)
  /** Host-provided binary view keeps byte formatting consistent with the app. */
  renderBytes?: (bytes: Uint8Array) => ReactNode
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
  const [view, setView] = useState<"records" | "bytes">("records")
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
            network={network}
            glyph={glyph}
            expanded={showDetails}
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
              network={network}
              glyph={glyph}
              expanded={showDetails}
            />
          ) : (
            <div className="fig-blob__placeholder">Binary</div>
          )}
        </button>
      )}
      <div className="fig-blob__info">
        <div className="fig-blob__references">
          {typeof references === "function"
            ? references(showDetails)
            : references}
        </div>
        <div className="fig-blob__heading">{heading}</div>
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
            <div className="fig-blob__detail-panel">
              <div
                className="fig-blob__views"
                role="group"
                aria-label="Blob detail view"
              >
                {decoded && (
                  <button
                    aria-pressed={view === "records"}
                    onClick={() => setView("records")}
                  >
                    Records
                  </button>
                )}
                {renderBytes && (
                  <button
                    aria-pressed={view === "bytes" || !decoded}
                    onClick={() => setView("bytes")}
                  >
                    Bytes
                  </button>
                )}
              </div>
              {!decoded && (
                <p className="fig-blob__note">
                  {kind === "unknown"
                    ? "No supported geometry format identified."
                    : "The blob could not be decoded completely. It may be truncated or use an unsupported format."}
                </p>
              )}
              {view === "bytes" || !decoded ? (
                renderBytes?.(bytes)
              ) : (
                <>
                  <p className="fig-blob__note">
                    {commands
                      ? `One-byte opcodes, then little-endian float32 coordinates.${glyph ? " Glyph coordinates use em units with Y up." : ""}`
                      : "Little-endian uint32 integers and float32 coordinates. Offsets are hexadecimal byte positions."}
                  </p>
                  {commands && (
                    <RecordTable
                      label={`${commands.commands.length} commands`}
                      records={commands.commands}
                      columns={[
                        "#",
                        "Offset",
                        "Bytes",
                        "Command",
                        "Coordinates",
                      ]}
                      render={(command, index) => [
                        index,
                        offsetLabel(command.offset),
                        command.byteLength,
                        `${command.opcode} · ${verbNames[command.verb]}`,
                        commandCoordinates(command),
                      ]}
                    />
                  )}
                  {commands?.commands[0]?.verb === "Z" && (
                    <p className="fig-blob__note">
                      Leading Close commands have no active contour and do not
                      draw anything.
                    </p>
                  )}
                  {network && <NetworkRecords network={network} />}
                </>
              )}
            </div>
          </div>,
          () => setExpanded(false)
        )}
    </>
  )
}

const verbNames = {
  M: "Move",
  L: "Line",
  Q: "Quadratic",
  C: "Cubic",
  Z: "Close",
}
const number = (value: number) => String(Number(value.toPrecision(7)))
const pair = (x: number, y: number) => `(${number(x)}, ${number(y)})`
const offsetLabel = (offset: number) =>
  `0x${offset.toString(16).padStart(6, "0")}`

function commandCoordinates({ verb, values: v }: PathCommand) {
  if (verb === "Z") return "—"
  if (verb === "Q")
    return `control ${pair(v[0], v[1])} → end ${pair(v[2], v[3])}`
  if (verb === "C")
    return `c1 ${pair(v[0], v[1])} · c2 ${pair(v[2], v[3])} → end ${pair(v[4], v[5])}`
  return pair(v[0], v[1])
}

function GeometryPreview({
  path,
  network,
  glyph,
  expanded,
}: {
  path?: string
  network?: DecodedVectorNetwork
  glyph: boolean
  expanded: boolean
}) {
  const drawing = useRef<SVGGElement>(null)
  const [bounds, setBounds] = useState({ x: 0, y: 0, width: 100, height: 100 })
  const [vertices, setVertices] = useState(
    !!network && network.segments.length === 0
  )
  const [handles, setHandles] = useState(false)
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
  }, [path, network, glyph, handles])
  const radius = Math.max(bounds.width, bounds.height) / 160
  const hasGeometry = !!(path || network?.stroke || network?.vertices.length)
  return (
    <div className="fig-blob__geometry">
      <span className="fig-blob__type">
        {network ? "Network" : glyph ? "Glyph" : "Path"}
      </span>
      {expanded && network && (
        <div className="fig-blob__preview-controls">
          {network && (
            <>
              <label>
                <input
                  type="checkbox"
                  checked={vertices}
                  onChange={(e) => setVertices(e.target.checked)}
                />{" "}
                Vertices
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={handles}
                  onChange={(e) => setHandles(e.target.checked)}
                />{" "}
                Curve handles
              </label>
            </>
          )}
        </div>
      )}
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
            <g transform={glyph ? "scale(1 -1)" : undefined}>
              <path
                d={
                  network ? (network.regions.length ? network.fill : "") : path
                }
                fill="#dbeafe"
                fillRule={network ? "evenodd" : "nonzero"}
              />
              <path
                d={network?.stroke ?? path}
                fill="none"
                stroke="#2563eb"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
              {network &&
                !network.stroke &&
                network.vertices.map((v, i) => (
                  <path key={i} d={`M${v.x} ${v.y}h0.001`} stroke="#2563eb" />
                ))}
              {handles &&
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
            {vertices &&
              network?.vertices.map((v, i) => (
                <circle
                  key={i}
                  cx={v.x}
                  cy={v.y}
                  r={radius}
                  fill="white"
                  stroke="#2563eb"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                >
                  <title>{`Vertex ${i} ${pair(v.x, v.y)}`}</title>
                </circle>
              ))}
            {handles &&
              network?.segments.map((s, i) => {
                const a = network.vertices[s.start],
                  b = network.vertices[s.end]
                return (
                  <g key={i} fill="#a855f7">
                    {(s.tx !== 0 || s.ty !== 0) && (
                      <circle
                        cx={a.x + s.tx}
                        cy={a.y + s.ty}
                        r={radius * 0.65}
                      />
                    )}
                    {(s.ex !== 0 || s.ey !== 0) && (
                      <circle
                        cx={b.x + s.ex}
                        cy={b.y + s.ey}
                        r={radius * 0.65}
                      />
                    )}
                  </g>
                )
              })}
          </g>
        </svg>
      ) : (
        <div className="fig-blob__placeholder">No drawable geometry</div>
      )}
    </div>
  )
}

function NetworkRecords({ network: n }: { network: DecodedVectorNetwork }) {
  return (
    <>
      <table className="fig-blob__table">
        <caption>Header · 12 bytes</caption>
        <thead>
          <tr>
            <th>Offset</th>
            <th>Field</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {[
            [0, "Vertex count", n.vertices.length],
            [4, "Segment count", n.segments.length],
            [8, "Region count", n.regions.length],
          ].map(([offset, label, count]) => (
            <tr key={offset}>
              <td>{offsetLabel(offset as number)}</td>
              <td>{label}</td>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <RecordTable
        label="Vertices · 12 bytes each"
        records={n.vertices}
        columns={["Vertex", "Offset", "Style (raw)", "X", "Y"]}
        render={(v, i) => [
          i,
          offsetLabel(v.offset),
          v.style,
          number(v.x),
          number(v.y),
        ]}
      />
      <RecordTable
        label="Segments · 28 bytes each"
        records={n.segments}
        columns={[
          "Segment",
          "Offset",
          "Style (raw)",
          "Start → End",
          "Start tangent",
          "End tangent",
        ]}
        render={(s, i) => [
          i,
          offsetLabel(s.offset),
          s.style,
          `${s.start} → ${s.end}`,
          pair(s.tx, s.ty),
          pair(s.ex, s.ey),
        ]}
      />
      <p className="fig-blob__note">
        Tangents are offsets from their endpoint vertices. Style words and
        region flags are preserved raw; their full meaning is not decoded. The
        preview uses even-odd filling and does not apply corner rounding.
      </p>
      <RecordTable
        label="Regions"
        records={n.regions}
        columns={["Region", "Offset", "Flags (raw)", "Loop count"]}
        render={(r, i) => [
          i,
          offsetLabel(r.offset),
          offsetLabel(r.flags),
          r.loops.length,
        ]}
      />
      {n.regions.length > 0 && (
        <RecordTable
          label="Region loops"
          records={n.regions.flatMap((r, region) =>
            r.loops.map((loop, index) => ({ ...loop, region, index }))
          )}
          columns={["Region / Loop", "Offset", "Segments in stored order"]}
          render={(loop) => [
            `${loop.region} / ${loop.index}`,
            offsetLabel(loop.offset),
            <span className="fig-blob__indices">
              {loop.segments.join(", ") || "Empty loop"}
            </span>,
          ]}
        />
      )}
    </>
  )
}

function RecordTable<T>({
  label,
  columns,
  records,
  render,
}: {
  label: string
  columns: string[]
  records: readonly T[]
  render: (record: T, index: number) => ReactNode[]
}) {
  const [page, setPage] = useState(0)
  const size = 50
  return (
    <div className="fig-blob__records">
      <div className="fig-blob__table-scroll">
        <table className="fig-blob__table">
          <caption>{label}</caption>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.slice(page * size, (page + 1) * size).map((r, i) => (
              <tr key={page * size + i}>
                {render(r, page * size + i).map((value, c) => (
                  <td key={c}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!records.length && <p className="fig-blob__note">None</p>}
      </div>
      {records.length > size && (
        <Pager
          page={page}
          size={size}
          count={records.length}
          onChange={setPage}
          label={label}
        />
      )}
    </div>
  )
}

function Pager({
  page,
  size,
  count,
  onChange,
  label,
}: {
  page: number
  size: number
  count: number
  onChange: (page: number) => void
  label: string
}) {
  return (
    <nav className="fig-blob__pager" aria-label={`${label} pages`}>
      <span>
        {page * size + 1}–{Math.min((page + 1) * size, count)} of{" "}
        {count.toLocaleString()}
      </span>
      <button disabled={page === 0} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <button
        disabled={(page + 1) * size >= count}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </nav>
  )
}
