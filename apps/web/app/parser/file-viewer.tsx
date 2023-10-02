"use client"
import * as React from "react"
import { useMemo } from "react"

import { Schema, prettyPrintSchema } from "kiwi-schema"
import {
  CompiledSchema,
  FigmaMeta,
  Header,
  Message,
  ParsedFigmaArchive,
  ParsedFigmaHTML,
} from "fig-kiwi"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GUID, NodeChange } from "fig-kiwi/schema-defs"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { TypePill } from "./type-pill"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CodeView } from "./code-view"
import { hex, replacerForHex } from "./hex"
import { Button } from "@/components/ui/button"
import { compileSchema } from "kiwi-schema"

type FileContents = ParsedFigmaArchive | ParsedFigmaHTML

type NavSelection =
  | { type: "layer"; guid: GUID }
  | { type: "meta" }
  | { type: "misc" }
  | { type: "blobs" }
  | { type: "schema" }

export function FigmaFile({ data }: { data: FileContents }) {
  const [navSelection, setNavSelection] = useState<NavSelection>({
    type: "meta",
  })
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
  return (
    <div className="flex flex-row h-full min-h-screen max-h-screen">
      <ScrollArea className="max-w-sm min-h-screen border-r-gray-200 border-r">
        <Sidebar
          type={type}
          message={data.message}
          navSelection={navSelection}
          setNavSelection={setNavSelection}
        />
      </ScrollArea>
      <div className="flex-1 ">
        <ScrollArea className="h-full">
          <div className="p-8">
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
            {navSelection.type === "schema" && (
              <Schema schema={data.schema} header={data.header} />
            )}
            {navSelection.type === "blobs" && blobs && <Blobs blobs={blobs} />}
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
        </ScrollArea>
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
}: {
  type: "paste" | "file"
  message: Message
  navSelection: NavSelection
  setNavSelection: (navSelection: NavSelection) => void
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
        </ul>
      </div>
      <div>
        <h2 className="font-medium p-2 text-sm">Nodes</h2>
        <ol className="flex flex-col space-y-1 overflow-clip">
          {nodeChanges.map((n) => {
            if (!n.guid) return null
            const { guid, name, type } = n
            return (
              <SidebarItem
                key={formatGUID(guid)}
                selected={
                  navSelection.type === "layer" &&
                  formatGUID(navSelection.guid) === formatGUID(guid)
                }
                onClick={() => setNavSelection({ type: "layer", guid })}
                className="flex flex-row space-x-2"
              >
                <TypePill type={type || "?"} />
                <div className="text-ellipsis whitespace-nowrap flex-1">
                  {name || "no name"}
                </div>
              </SidebarItem>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

const SidebarItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement> & {
    selected: boolean
  }
>(({ className, selected, children, ...props }, ref) => {
  return (
    <li
      ref={ref}
      className={cn(
        className,
        "rounded-sm p-1 pl-2 pr-3",
        "hover:bg-gray-200 dark:hover:bg-gray-800",
        selected &&
          "bg-gray-200 dark:bg-gray-800 text-black dark: text-grey-200"
      )}
      {...props}
    >
      {children}
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
