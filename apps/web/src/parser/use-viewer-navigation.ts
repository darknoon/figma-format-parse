import { useCallback, useLayoutEffect, useState } from "react"
import type { ParsedFigmaHTML } from "fig-kiwi"
import type { ParsedFigmaBlob } from "fig-kiwi/blob"
import type { GUID } from "fig-kiwi/schema-defs"

import { hasImageReferences } from "./image-assets"

type FileContents = ParsedFigmaBlob | ParsedFigmaHTML

export type NavSelection =
  | { type: "layer"; guid: GUID; blob?: { index: number; path: string } }
  | { type: "preview" }
  | { type: "meta" }
  | { type: "misc" }
  | { type: "blobs" }
  | { type: "images" }
  | { type: "schema" }

function selectionHash(selection: NavSelection) {
  const params = new URLSearchParams({ view: selection.type })
  if (selection.type === "layer") {
    params.set("node", `${selection.guid.sessionID}:${selection.guid.localID}`)
    if (selection.blob) {
      params.set("blob", String(selection.blob.index))
      params.set("path", selection.blob.path)
    }
  }
  return `#${params}`
}

function readSelection(hash: string, data: FileContents): NavSelection {
  const params = new URLSearchParams(hash.slice(1))
  const view = params.get("view")
  switch (view) {
    case "layer": {
      const id = params.get("node")
      const node = data.message.nodeChanges?.find(
        ({ guid }) => guid && `${guid.sessionID}:${guid.localID}` === id
      )
      if (!node?.guid) break
      const selection: NavSelection = { type: "layer", guid: node.guid }
      const blob = params.get("blob")
      const path = params.get("path")
      if (
        blob &&
        /^\d+$/.test(blob) &&
        path &&
        data.message.blobs?.[Number(blob)]
      ) {
        selection.blob = { index: Number(blob), path }
      }
      return selection
    }
    case "meta":
      if ("meta" in data) return { type: view }
      break
    case "preview":
      return { type: view }
    case "thumbnail":
    case "images":
      if (
        ("preview" in data && data.preview?.length) ||
        ("imageEntries" in data && data.imageEntries?.length) ||
        hasImageReferences(data.message)
      )
        return { type: "images" }
      break
    case "blobs":
    case "schema":
    case "misc":
      return { type: view }
  }
  return { type: "preview" }
}

export function useViewerNavigation(data: FileContents) {
  const [selection, setSelection] = useState(() =>
    readSelection(window.location.hash, data)
  )

  useLayoutEffect(() => {
    function restore() {
      const next = readSelection(window.location.hash, data)
      const hash = selectionHash(next)
      // Seed the initial entry and repair stale links without adding history.
      if (window.location.hash !== hash) {
        window.history.replaceState(window.history.state, "", hash)
      }
      setSelection((previous) =>
        selectionHash(previous) === hash ? previous : next
      )
    }

    restore()
    window.addEventListener("popstate", restore)
    window.addEventListener("hashchange", restore)
    return () => {
      window.removeEventListener("popstate", restore)
      window.removeEventListener("hashchange", restore)
    }
  }, [data])

  const navigate = useCallback(
    (next: NavSelection) => {
      const resolved = readSelection(selectionHash(next), data)
      const hash = selectionHash(resolved)
      if (window.location.hash === hash) return
      // Only the location is stored; the parsed document and assets stay in memory.
      window.history.pushState(null, "", hash)
      setSelection(resolved)
    },
    [data]
  )

  return [selection, navigate] as const
}
