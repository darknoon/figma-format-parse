import * as React from "react"
import { useLayoutEffect, useMemo, useRef, useState } from "react"

import { fromByteArray } from "base64-js"

import type { Schema } from "kiwi-schema"
import { prettyPrintSchema } from "kiwi-schema"
import {
  CompiledSchema,
  FigmaMeta,
  Header,
  Message,
  ParsedFigmaHTML,
} from "fig-kiwi"
import type { ParsedFigmaBlob } from "fig-kiwi/blob"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GUID, NodeChange } from "fig-kiwi/schema-defs"
import { cn } from "@/lib/utils"
import { NodeTree } from "./node-tree"
import { CodeView } from "./code-view"
import { replacerForHex } from "./hex"
import { HexView } from "./hex-view"
import { Button } from "@/components/ui/button"
import { compileSchema } from "kiwi-schema"
import { ImagePreview } from "./image-lightbox"
import { ImageBrowser } from "./image-browser"
import { imageAssets } from "./image-assets"
import { indexBlobReferences } from "./blob-references"
import { FigmaRenderer } from "fig-renderer"
import { SiblingPosition } from "./sibling-position"
import { SplitView } from "@/components/split-view"
import { useViewerNavigation, type NavSelection } from "./use-viewer-navigation"
import { BlobContent } from "./blob-content"
import { assetCardClassName, assetGridClassName } from "./asset-gallery"

type FileContents = ParsedFigmaBlob | ParsedFigmaHTML

export function FigmaFile({ data }: { data: FileContents }) {
  const [navSelection, setNavSelection] = useViewerNavigation(data)
  const [sceneSelection, setSceneSelection] = useState<GUID>()
  const [sceneHover, setSceneHover] = useState<GUID>()
  const [focusRequest, setFocusRequest] = useState(0)
  const content = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    content.current?.scrollTo({ top: 0, left: 0 })
  }, [navSelection])
  const node =
    navSelection.type === "layer" && selectedNode(data.message, navSelection)
  const parentGuid =
    node && node.parentIndex
      ? selectedNode(data.message, {
          type: "layer",
          guid: node.parentIndex.guid,
        })?.guid
      : undefined
  const { message } = data
  const {
    nodeChanges = [],
    isCut,
    pasteID,
    pasteFileKey,
    pasteBranchSourceFileKey,
    pasteIsPartiallyOutsideEnclosingFrame,
    pastePageId,
    pasteEditorType,
    blobs,
    ...rest
  } = message
  const type = "meta" in data ? "paste" : "file"
  const imageEntries = "imageEntries" in data ? data.imageEntries : undefined
  const assets = useMemo(
    () => imageAssets(imageEntries ?? [], message),
    [imageEntries, message]
  )
  return (
    <SplitView
      sidebar={
        <nav aria-label="File sections" className="h-full overflow-y-auto">
          <Sidebar
            type={type}
            message={data.message}
            navSelection={navSelection}
            setNavSelection={setNavSelection}
            imageCount={assets.length}
            hasThumbnail={"preview" in data && !!data.preview}
            hovered={navSelection.type === "preview" ? sceneHover : undefined}
            selected={
              navSelection.type === "layer"
                ? navSelection.guid
                : navSelection.type === "preview"
                  ? sceneSelection
                  : undefined
            }
            onSelect={(guid) => {
              setSceneSelection(guid)
              if (navSelection.type === "preview") {
                setFocusRequest((value) => value + 1)
              } else {
                setNavSelection({ type: "layer", guid })
              }
            }}
          />
        </nav>
      }
    >
      {navSelection.type === "preview" ? (
        <FigmaRenderer
          message={message}
          imageEntries={imageEntries}
          selected={sceneSelection}
          focusRequest={focusRequest}
          onSelect={setSceneSelection}
          onHover={setSceneHover}
        />
      ) : (
        <div ref={content} className="h-full overflow-y-auto">
          <div className="p-4 sm:p-8">
            {navSelection.type === "meta" && "meta" in data && (
              <FigmaPasteInfo
                meta={data.meta}
                more={{
                  pasteEditorType,
                  pasteID,
                  pastePageId,
                  pasteFileKey,
                  pasteBranchSourceFileKey,
                  pasteIsPartiallyOutsideEnclosingFrame,
                  isCut,
                }}
              />
            )}
            {navSelection.type === "misc" && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg tracking-tight">Misc</h2>
                </CardHeader>
                <CardContent>
                  <CodeView>{JSON.stringify(rest, replacerForHex, 2)}</CodeView>
                </CardContent>
              </Card>
            )}
            {navSelection.type === "schema" && "header" in data && (
              <Schema schema={data.schema} header={data.header} />
            )}
            {navSelection.type === "thumbnail" &&
              "preview" in data &&
              data.preview && (
                <Card>
                  <CardHeader>
                    <h2 className="text-lg tracking-tight">
                      Exported thumbnail
                    </h2>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-4">
                      <p className="text-xs text-gray-700 dark:text-gray-400">
                        {data.preview.length} bytes
                      </p>
                      <ImagePreview
                        alt="File preview"
                        src={`data:image/png;base64,${fromByteArray(
                          data.preview
                        )}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

            {navSelection.type === "blobs" && blobs && (
              <Blobs
                message={message}
                schema={data.schema}
                onSelect={(guid, index, path) =>
                  setNavSelection({
                    type: "layer",
                    guid,
                    blob: { index, path },
                  })
                }
              />
            )}
            {navSelection.type === "images" && imageEntries && (
              <ImageBrowser
                assets={assets}
                onSelect={(guid) => {
                  setSceneSelection(guid)
                  setNavSelection({ type: "layer", guid })
                }}
              />
            )}
            {node && (
              <NodeContent
                node={node}
                nodes={data.message.nodeChanges}
                schema={data.schema}
                onSelect={(guid) => {
                  setSceneSelection(guid)
                  setNavSelection({ type: "layer", guid })
                }}
                onOpenParent={
                  parentGuid
                    ? () => {
                        setSceneSelection(parentGuid)
                        setNavSelection({ type: "layer", guid: parentGuid })
                      }
                    : undefined
                }
                blobReference={
                  navSelection.type === "layer" ? navSelection.blob : undefined
                }
                href={
                  "meta" in data
                    ? figmaUrl(data.meta.fileKey, node.guid!)
                    : undefined
                }
              />
            )}
          </div>
        </div>
      )}
    </SplitView>
  )
}

function Blobs({
  message,
  schema,
  onSelect,
}: {
  message: Message
  schema: Schema
  onSelect: (guid: GUID, blob: number, path: string) => void
}) {
  const references = useMemo(
    () => indexBlobReferences(message, schema),
    [message, schema]
  )
  return (
    <div className={assetGridClassName}>
      {message.blobs?.map((b, i) => (
        <section
          key={i}
          aria-label={`Blob ${i}`}
          className={assetCardClassName}
        >
          <BlobContent
            bytes={b.bytes}
            index={i}
            references={references.get(i)}
            onSelect={onSelect}
          />
        </section>
      ))}
    </div>
  )
}

type PasteMore = Pick<
  Message,
  | "pasteID"
  | "isCut"
  | "pastePageId"
  | "pasteEditorType"
  | "pasteFileKey"
  | "pasteBranchSourceFileKey"
  | "pasteIsPartiallyOutsideEnclosingFrame"
>

function FigmaPasteInfo({ meta, more }: { meta: FigmaMeta; more: PasteMore }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg tracking-tight">Paste Info</h2>
        <FigmaLink href={figmaUrl(meta.fileKey, undefined)} />
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="fileKey">File Key</Label>
          <Input id="fileKey" value={meta.fileKey} readOnly />
        </div>
        <div>
          <Label htmlFor="dataType">Data Type</Label>
          <Input id="dataType" value={meta.dataType} readOnly />
        </div>
        <div>
          <Label htmlFor="pasteID">Paste ID</Label>
          <Input id="pasteID" value={meta.pasteID} readOnly />
        </div>
        <div>
          <Label htmlFor="pasteFileKey">Paste File Key</Label>
          <Input id="pasteFileKey" value={more.pasteFileKey ?? ""} readOnly />
        </div>
        <div>
          <Label htmlFor="pasteBranchSourceFileKey">Branch Source File</Label>
          <Input
            id="pasteBranchSourceFileKey"
            value={more.pasteBranchSourceFileKey ?? ""}
            readOnly
          />
        </div>
      </CardContent>
    </Card>
  )
}

function selectedNode(message: Message, navSelection: NavSelection) {
  if (navSelection.type === "layer") {
    return message.nodeChanges?.find(
      (n) =>
        n.guid &&
        navSelection.guid &&
        formatGUID(n.guid) === formatGUID(navSelection.guid)
    )
  }
}

function Sidebar({
  type,
  message,
  navSelection,
  setNavSelection,
  imageCount,
  hasThumbnail,
  selected,
  hovered,
  onSelect,
}: {
  type: "paste" | "file"
  message: Message
  navSelection: NavSelection
  setNavSelection: (navSelection: NavSelection) => void
  imageCount: number
  hasThumbnail: boolean
  selected?: GUID
  hovered?: GUID
  onSelect: (guid: GUID) => void
}) {
  const { nodeChanges = [] } = message
  return (
    <div className="p-2 h-full flex flex-col space-y-8">
      <div>
        <h2 className="font-medium p-2 text-sm">Metadata</h2>
        <ul className="flex flex-col space-y-1">
          {type === "paste" && (
            <SidebarItem
              onClick={() => setNavSelection({ type: "meta" })}
              selected={navSelection.type === "meta"}
            >
              Paste Info
            </SidebarItem>
          )}
          <SidebarItem
            onClick={() => setNavSelection({ type: "preview" })}
            selected={navSelection.type === "preview"}
          >
            Preview
          </SidebarItem>
          {hasThumbnail && (
            <SidebarItem
              onClick={() => setNavSelection({ type: "thumbnail" })}
              selected={navSelection.type === "thumbnail"}
            >
              Thumbnail
            </SidebarItem>
          )}
          <SidebarItem
            onClick={() => setNavSelection({ type: "schema" })}
            selected={navSelection.type === "schema"}
          >
            Schema
          </SidebarItem>
          <SidebarItem
            onClick={() => setNavSelection({ type: "misc" })}
            selected={navSelection.type === "misc"}
          >
            Misc
          </SidebarItem>
          <SidebarItem
            onClick={() => setNavSelection({ type: "blobs" })}
            selected={navSelection.type === "blobs"}
            className="flex items-center justify-between gap-2"
          >
            <span>Blobs</span>
            <span className="min-w-6 rounded-full bg-background/70 px-2 py-0.5 text-center text-xs tabular-nums text-muted-foreground">
              {message.blobs?.length ?? 0}
            </span>
          </SidebarItem>
          {imageCount > 0 && (
            <SidebarItem
              onClick={() => setNavSelection({ type: "images" })}
              selected={navSelection.type === "images"}
              className="flex items-center justify-between gap-2"
            >
              <span>Images</span>
              <span className="min-w-6 rounded-full bg-background/70 px-2 py-0.5 text-center text-xs tabular-nums text-muted-foreground">
                {imageCount}
              </span>
            </SidebarItem>
          )}
        </ul>
      </div>
      <div>
        <h2 className="font-medium p-2 text-sm">Nodes</h2>
        <NodeTree
          nodes={nodeChanges}
          selected={selected}
          hovered={hovered}
          focusSelection={navSelection.type !== "preview"}
          onSelect={onSelect}
        />
      </div>
    </div>
  )
}

const SidebarItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    selected: boolean
  }
>(({ className, selected, children, ...props }, ref) => {
  return (
    <li>
      <button
        type="button"
        ref={ref}
        aria-current={selected ? "page" : undefined}
        className={cn(
          className,
          "w-full rounded-sm p-1 pl-2 pr-3 text-left focus-visible:outline-2 focus-visible:-outline-offset-2",
          "hover:bg-gray-200 dark:hover:bg-gray-800",
          selected && "bg-gray-200 text-foreground dark:bg-gray-800"
        )}
        {...props}
      >
        {children}
      </button>
    </li>
  )
})

SidebarItem.displayName = "SidebarItem"

function Schema({ schema, header }: { schema: Schema; header: Header }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg tracking-tight">
          Schema <span className="text-gray-500">{header.version}</span>
        </h2>
        <pre className="text-xs text-muted-foreground">
          {JSON.stringify(header.prelude)}
        </pre>
      </CardHeader>
      <CardContent>
        <CodeView>{prettyPrintSchema(schema)}</CodeView>
      </CardContent>
    </Card>
  )
}

function formatGUID(guid: GUID) {
  return `${guid.sessionID}:${guid.localID}`
}

function figmaUrl(fileKey: string, guid?: GUID) {
  const name = "Untitled"
  const nid = guid ? `?node-id=${formatGUID(guid)}` : ""
  return `https://www.figma.com/file/${fileKey}/${name}${nid}`
}

function FigmaLink({ href, name }: { href?: string; name?: string }) {
  if (!href) return null
  return (
    <a href={href} target="_blank" rel="noreferrer" className="underlin mb-2">
      <Button>{name ? `Open ${name} in Figma ->` : `Open in Figma ->`}</Button>
    </a>
  )
}

function NodeContent({
  node,
  nodes,
  schema,
  href,
  blobReference,
  onOpenParent,
  onSelect,
}: {
  node: NodeChange
  nodes?: NodeChange[]
  schema: Schema
  href?: string
  blobReference?: { index: number; path: string }
  onOpenParent?: () => void
  onSelect: (guid: GUID) => void
}) {
  const compiledSchema: CompiledSchema = useMemo(() => {
    const compiledSchema = compileSchema(schema) as CompiledSchema
    console.log("compiled schema", compiledSchema)
    return compiledSchema
  }, [schema])
  const data = useMemo(() => {
    if (!node.guid) return
    return compiledSchema.encodeNodeChange(node)
  }, [node, compiledSchema])

  const { name, type, guid, parentIndex, phase, ...properties } = node
  const decoded = JSON.stringify(properties, replacerForHex, 2)
  const summary = [
    { label: "Type", value: type ?? "—" },
    { label: "GUID", value: guid ? formatGUID(guid) : "—" },
    { label: "Phase", value: phase ?? "—" },
    {
      label: "Parent GUID",
      value: parentIndex ? (
        onOpenParent ? (
          <button
            type="button"
            onClick={onOpenParent}
            aria-label={`Open parent node ${formatGUID(parentIndex.guid)}`}
            className="inline-flex items-center gap-1 rounded-sm text-left underline underline-offset-2 hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {formatGUID(parentIndex.guid)}
            <svg
              aria-hidden="true"
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </button>
        ) : (
          formatGUID(parentIndex.guid)
        )
      ) : (
        "None"
      ),
    },
  ]
  return (
    <Card>
      <CardHeader className="sticky top-0 z-10 rounded-t-lg border-b bg-card">
        <h2 className="break-words text-lg tracking-tight">
          {name || "no name"}
        </h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 pt-3 text-sm">
          {summary.map(({ label, value }) => (
            <div key={label} className="min-w-0">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="break-all font-mono">{value}</dd>
            </div>
          ))}
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Parent position</dt>
            <dd>
              <SiblingPosition node={node} nodes={nodes} onSelect={onSelect} />
            </dd>
          </div>
        </dl>
        {blobReference && (
          <p className="text-sm text-muted-foreground">
            Blob {blobReference.index} is referenced at{" "}
            <code className="break-all">{blobReference.path}</code>.
          </p>
        )}
        <FigmaLink href={href} />
      </CardHeader>
      <CardContent className="pt-6">
        <h3>Other fields as JSON ({decoded.length} characters)</h3>
        <CodeView>{decoded}</CodeView>
        {data && (
          <>
            <h3>As kiwi ({data.length} bytes)</h3>
            <HexView bytes={data} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
