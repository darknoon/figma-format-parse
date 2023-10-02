"use client"

import { Input } from "@/components/ui/input"
import { DragEvent, ClipboardEvent, useState, useEffect, useRef } from "react"
import { toByteArray } from "base64-js"

import {
  readHTMLMessage,
  readFigFile,
  ParsedFigmaHTML,
  ParsedFigmaArchive,
  readMultiplayerMessage,
  ParsedRawKiwi,
} from "fig-kiwi"
import AsyncOperation, { LoaderState, ProgressUpdate } from "./async-operation"
import { PasteButton } from "./paste-button"
import { FigmaFile } from "./file-viewer"
import { Loading } from "./loading-ui"

export default function AcceptInput() {
  const [file, setFile] = useState<File | null>(null)
  const [pasteContent, setPasteContent] = useState<string | null>(null)

  function onDrop<E extends DragEvent>(e: E) {
    e.preventDefault()
    setFile(e.dataTransfer.files[0])
  }

  function onPaste<E extends ClipboardEvent>(e: E) {
    console.log("onPaste", e.clipboardData)
    e.preventDefault()

    // If there's a file being pasted
    if (e.clipboardData.files.length) {
      setFile(e.clipboardData.files[0])
      setPasteContent(null)
    } else if (e.clipboardData.types.includes("text/html")) {
      // If there's text being pasted
      setPasteContent(e.clipboardData.getData("text/html"))
      setFile(null)
    } else if (e.clipboardData.types.includes("text/plain")) {
      setPasteContent(e.clipboardData.getData("text/plain"))
      setFile(null)
    }
  }

  async function onPasteButton(items: ClipboardItems) {
    const htmlItem = items.find((item) => item.types.includes("text/html"))
    const plainItem = items.find((item) => item.types.includes("text/plain"))
    if (!htmlItem && !plainItem) {
      console.error("No HTML or plain text found", items)
      throw new Error("No HTML or plain text found")
    }
    const blob = htmlItem
      ? await htmlItem.getType("text/html")
      : await plainItem!.getType("text/plain")
    // Convert blob to string
    const text = await blob.text()
    setPasteContent(text)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length) {
      setFile(e.target.files[0])
    }
  }

  const hasContent = file || pasteContent

  return (
    <>
      {file ? (
        <AsyncOperation input={file} operation={parseFile}>
          {(state: LoaderState<ParsedFigmaArchive>) => (
            <>
              {state.status == "loading" && <Loading up={state} />}
              {state.status === "done" && <FigmaFile data={state.data} />}
              {state.status === "error" && (
                <ErrorRecovery error={state.error} />
              )}
            </>
          )}
        </AsyncOperation>
      ) : null}
      {pasteContent ? (
        <AsyncOperation input={pasteContent} operation={parseClipboard}>
          {(state: LoaderState<ParsedFigmaHTML | ParsedRawKiwi>) => (
            <>
              {state.status == "loading" && <Loading up={state} />}
              {state.status === "done" && <FigmaFile data={state.data} />}
              {state.status === "error" && (
                <ErrorRecovery error={state.error} />
              )}
            </>
          )}
        </AsyncOperation>
      ) : null}
      {!hasContent && (
        <div
          onDrop={onDrop}
          onPaste={onPaste}
          onDragOver={(e) => e.preventDefault()} // Required to make droppable area
          className="flex min-h-screen flex-col items-center justify-between p-24 w-full"
        >
          <div className="border-2 border-dashed border-gray-400 rounded-xl align-center gap-4 flex flex-col items-center max-w-sm">
            <div className="p-8">
              <PasteButton onPaste={onPasteButton} />
            </div>
            <p>or</p>
            <div className="p-8">
              <Input id="file" type="file" onChange={onFileChange} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Your data is processed locally in the browser
          </p>
        </div>
      )}
    </>
  )
}

async function smallDelay() {
  return new Promise((resolve) => setTimeout(resolve, 50))
}

async function* parseFile(
  file: File
): AsyncGenerator<ProgressUpdate, ParsedFigmaArchive> {
  yield {
    message: "Reading file into array buffer",
    progress: { current: 0, total: 3 },
  }
  await smallDelay()
  const ab = await file.arrayBuffer()
  yield { message: "Creating byte array", progress: { current: 1, total: 3 } }
  await smallDelay()
  const bytes = new Uint8Array(ab)
  yield { message: "Parsing figma file", progress: { current: 2, total: 3 } }
  await smallDelay()
  const result = readFigFile(bytes)
  yield { message: "Done", progress: { current: 3, total: 3 } }
  await smallDelay()
  return result
}
async function* parseClipboard(
  text: string
): AsyncGenerator<ProgressUpdate, ParsedFigmaHTML | ParsedRawKiwi> {
  console.log("parseClipboard", text)
  if (looksLikeFigPaste(text)) {
    yield { message: "Reading HTML" }
    await smallDelay()
    const result = readHTMLMessage(text)
    yield { message: "Done" }
    await smallDelay()
    return result
  } else if (looksLikeBase64(text)) {
    yield { message: "Decoding base64" }
    await smallDelay()
    const bytes = toByteArray(text)
    yield { message: "Parsing figma file" }
    await smallDelay()
    const result = readMultiplayerMessage(bytes)
    yield { message: "Done" }
    await smallDelay()
    return result
  } else {
    throw new Error("Not HTML or Base64 data")
  }
}

function looksLikeFigPaste(html: string) {
  return html.includes("<!--(figma)")
}

function looksLikeBase64(html: string) {
  return /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/.test(
    html
  )
}

function ErrorRecovery({ error }: { error: Error }) {
  return (
    <div>
      <p>There was an error parsing your data</p>
      <p>{typeof error}</p>
      <p className="text-sm text-muted-foreground">{error.message}</p>
    </div>
  )
}
