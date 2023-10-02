"use client"
import * as React from "react"
import { useMemo } from "react"
import cl100k_base from "tiktoken/encoders/cl100k_base.json"

import { fromByteArray } from "base64-js"

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
import AsyncOperation, { LoaderState, GenT } from "./async-operation"

type FileContents = ParsedFigmaArchive | ParsedFigmaHTML

type NavSelection =
  | { type: "layer"; guid: GUID }
  | { type: "preview" }
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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt=""
                        src={`data:image/png;base64,${fromByteArray(
                          data.preview
                        )}`}
                        className="w-16"
                      />
                    </div>
                  </CardContent>
                </Card>
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
  const decodedNotPretty = JSON.stringify(node, replacerForHex, undefined)

  return (
    <div className="flex flex-col space-y-4">
      <Card>
        <CardHeader>
          <FigmaLink href={href} />
          {node.name && <h2 className="text-lg tracking-tight">{node.name}</h2>}
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <h3>As JSON ({decoded.length} bytes)</h3>
        </CardHeader>
        <CardContent>
          <CodeView>{decoded}</CodeView>
        </CardContent>
      </Card>
      {data && (
        <Card>
          <CardHeader>
            <h3>As kiwi ({data.length} bytes)</h3>
          </CardHeader>
          <CardContent>
            <p className="font-xs font-mono text-gray-700 dark:text-gray-400">
              {hex(data, " ")}
            </p>
          </CardContent>
        </Card>
      )}
      <AsyncOperation input={decodedNotPretty} operation={tokenize}>
        {(state: LoaderState<[Uint32Array, string[]]>) => (
          <>
            {state.status == "loading" && (
              <p>
                {state.message} {state.progress?.current}/
                {state.progress?.total}
              </p>
            )}
            {state.status == "done" && (
              <Tokens
                text={decodedNotPretty}
                tokens={state.data[0]}
                detokenized={state.data[1]}
              />
            )}
            {state.status === "error" && (
              <div>token error: {state.error.message}</div>
            )}
          </>
        )}
      </AsyncOperation>
    </div>
  )
}

import type { Tiktoken } from "tiktoken/lite"
let _encoding: Tiktoken | undefined

function Tokens({
  text,
  tokens,
  detokenized,
}: {
  text: string
  tokens: Uint32Array
  detokenized: string[]
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | undefined>()
  return (
    <Card>
      <CardHeader>
        <h3>
          For GPT <span>({tokens.length} tokens)</span>
        </h3>
      </CardHeader>

      <CardContent>
        <div
          onMouseLeave={(e) => setHoveredIndex(undefined)}
          className="flex flex-col space-y-4"
        >
          <p className="font-xs font-mono text-gray-700 dark:text-gray-400">
            {detokenized.map((s, i) => (
              <span
                key={`tk${s}${i}`}
                onMouseEnter={(e) => setHoveredIndex(i)}
                className={cn(
                  "break-all",
                  "rounded-sm",
                  (!hoveredIndex || hoveredIndex === i) &&
                    COLORS[i % COLORS.length]
                )}
              >
                {s.replaceAll("\n", "\\n")}
              </span>
            ))}
          </p>
          <p className="font-xs font-mono text-gray-700 dark:text-gray-400">
            {Array.from(tokens).map((t, i) => (
              <span key={`tki${t}${i}`}>
                <span
                  onMouseEnter={(e) => setHoveredIndex(i)}
                  className={cn(
                    "rounded-sm",
                    (!hoveredIndex || hoveredIndex === i) &&
                      COLORS[i % COLORS.length]
                  )}
                >
                  {t.toString(10)}
                </span>
                {", "}
              </span>
            ))}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

async function loadEncoding(): Promise<Tiktoken> {
  if (_encoding) return _encoding
  const { Tiktoken } = await import("tiktoken/lite")
  const encoding = new Tiktoken(
    cl100k_base.bpe_ranks,
    cl100k_base.special_tokens,
    cl100k_base.pat_str
  )
  _encoding = encoding
  return encoding
}

async function* tokenize(text: string): GenT<[Uint32Array, string[]]> {
  yield { message: "Loading tiktoken (WASM)" }
  const encoding = await loadEncoding()
  yield { message: "Encoding data" }
  const tokens = encoding.encode(text)
  yield { message: "Done" }
  await smallDelay()
  yield { message: "Decoding tokens" }
  const textDecoder = new TextDecoder()
  await smallDelay()
  const strs = Array.from(tokens).map((t) => {
    const bytes = encoding.decode_single_token_bytes(t)
    return textDecoder.decode(bytes)
  })

  return [tokens, strs]
}

// via https://github.com/dqbd/tiktokenizer/blob/cea57c454f38001a91873c944cee6a9b8e2a0610/src/sections/TokenViewer.tsx#L7C1-L8C1
const COLORS = [
  "bg-sky-200",
  "bg-amber-200",
  "bg-blue-200",
  "bg-green-200",
  "bg-orange-200",
  "bg-cyan-200",
  "bg-gray-200",
  "bg-purple-200",
  "bg-indigo-200",
  "bg-lime-200",
  "bg-rose-200",
  "bg-violet-200",
  "bg-yellow-200",
  "bg-emerald-200",
  "bg-zinc-200",
  "bg-red-200",
  "bg-fuchsia-200",
  "bg-pink-200",
  "bg-teal-200",
]

async function smallDelay() {
  return new Promise((resolve) => setTimeout(resolve, 50))
}
