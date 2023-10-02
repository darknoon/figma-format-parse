"use client"

import { Input } from "@/components/ui/input"
import { DragEvent, ClipboardEvent, useState, useEffect, useRef } from "react"

import {
  readHTMLMessage,
  readFigFile,
  ParsedFigmaHTML,
  ParsedFigmaArchive,
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
    } else if (e.clipboardData.getData("Text")) {
      // If there's text being pasted
      setPasteContent(e.clipboardData.getData("text/html"))
      setFile(null)
    }
  }

  async function onPasteButton(items: ClipboardItems) {
    const item = items.find((item) => item.types.includes("text/html"))
    if (!item) {
      return
    }
    const blob = await item.getType("text/html")
    // Convert blob to string
    const html = await blob.text()
    setPasteContent(html)
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
          {(state: LoaderState<ParsedFigmaHTML>) => (
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
  html: string
): AsyncGenerator<ProgressUpdate, ParsedFigmaHTML> {
  yield { message: "Reading HTML" }
  await smallDelay()
  const result = readHTMLMessage(html)
  yield { message: "Done" }
  await smallDelay()
  return result
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
