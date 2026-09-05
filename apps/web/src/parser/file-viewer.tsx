import * as React from "react"
import { useMemo } from "react"

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
import { useState } from "react"
import { cn } from "@/lib/utils"
import { NodeTree } from "./node-tree"
import { CodeView } from "./code-view"
import { hex, replacerForHex } from "./hex"
import { Button } from "@/components/ui/button"
import { compileSchema } from "kiwi-schema"
import { ImagePreview } from "./image-lightbox"
import { ImageBrowser } from "./image-browser"

type FileContents = ParsedFigmaBlob | ParsedFigmaHTML

type NavSelection =
  | { type: "layer"; guid: GUID }
  | { type: "preview" }
  | { type: "meta" }
  | { type: "misc" }
  | { type: "blobs" }
  | { type: "images" }
  | { type: "schema" }

export function FigmaFile({ data }: { data: FileContents }) {
  const [navSelection, setNavSelection] = useState<NavSelection>(() => ({
    type: "meta" in data ? "meta" : data.preview ? "preview" : "misc",
  }))
  const node =
    navSelection.type === "layer" && selectedNode(data.message, navSelection)
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
  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <nav
        aria-label="File sections"
        className="h-full w-48 shrink-0 overflow-y-auto border-r-gray-200 border-r sm:w-64 lg:w-80"
      >
        <Sidebar
          type={type}
          message={data.message}
          navSelection={navSelection}
          setNavSelection={setNavSelection}
          imageCount={imageEntries?.length ?? 0}
        />
      </nav>
      <div className="min-w-0 flex-1">
        <div className="h-full overflow-y-auto">
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
            {navSelection.type === "preview" &&
              "preview" in data &&
              data.preview && (
                <Card>
                  <CardHeader>
                    <h2 className="text-lg tracking-tight">Preview</h2>
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

            {navSelection.type === "blobs" && blobs && <Blobs blobs={blobs} />}
            {navSelection.type === "images" && imageEntries && (
              <ImageBrowser entries={imageEntries} message={message} />
            )}
            {node && (
              <NodeContent
                node={node}
                schema={data.schema}
                href={
                  "meta" in data
                    ? figmaUrl(data.meta.fileKey, node.guid!)
                    : undefined
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Blobs({ blobs }: { blobs: Exclude<Message["blobs"], undefined> }) {
  return (
    <div className="flex flex-col space-y-4">
      {blobs.map((b, i) => (
        <Card key={i}>
          <CardHeader>
            <h2>
              Blob {i}{" "}
              <span className="font-medium">({b.bytes.length} bytes)</span>
            </h2>
          </CardHeader>
          <CardContent>
            <span className="font-mono font-xs text-gray-700 dark:text-gray-400">
              {hex(b.bytes, " ")}
            </span>
          </CardContent>
        </Card>
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
}: {
  type: "paste" | "file"
  message: Message
  navSelection: NavSelection
  setNavSelection: (navSelection: NavSelection) => void
  imageCount: number
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
          {type === "file" && (
            <SidebarItem
              onClick={() => setNavSelection({ type: "preview" })}
              selected={navSelection.type === "preview"}
            >
              Preview
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
          >
            Blobs
          </SidebarItem>
          {imageCount > 0 && (
            <SidebarItem
              onClick={() => setNavSelection({ type: "images" })}
              selected={navSelection.type === "images"}
            >
              Images ({imageCount})
            </SidebarItem>
          )}
        </ul>
      </div>
      <div>
        <h2 className="font-medium p-2 text-sm">Nodes</h2>
        <NodeTree
          nodes={nodeChanges}
          selected={navSelection.type === "layer" ? navSelection.guid : undefined}
          onSelect={(guid) => setNavSelection({ type: "layer", guid })}
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
          selected &&
            "bg-gray-200 dark:bg-gray-800 text-black dark: text-grey-200"
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
  schema,
  href,
}: {
  node: NodeChange
  schema: Schema
  href?: string
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

  const decoded = JSON.stringify(node, replacerForHex, 2)
  return (
    <Card>
      <CardHeader>
        <FigmaLink href={href} />
      </CardHeader>
      <CardContent>
        <h3>As JSON ({decoded.length} bytes)</h3>
        <CodeView>{decoded}</CodeView>
        {data && (
          <>
            <h3>As kiwi ({data.length} bytes)</h3>
            <p className="font-xs font-mono text-gray-700 dark:text-gray-400">
              {hex(data, " ")}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
