import type { Message } from "fig-kiwi"
import type { GUID } from "fig-kiwi/schema-defs"
import type { Schema } from "kiwi-schema"

export interface BlobReference {
  guid?: GUID
  nodeName: string
  nodeIndex: number
  path: string
}

// These schema fields index Message.blobs. Offsets and blob hashes do not.
const referenceFields = new Set([
  "Image.dataBlob",
  "Glyph.commandsBlob",
  "VectorData.vectorNetworkBlob",
  "Path.commandsBlob",
])

export function indexBlobReferences(message: Message, schema: Schema) {
  const references = new Map<number, BlobReference[]>()
  const definitions = new Map(
    schema.definitions.map((definition) => [definition.name, definition])
  )
  const blobCount = message.blobs?.length ?? 0
  if (!blobCount) return references

  for (const [nodeIndex, node] of (message.nodeChanges ?? []).entries()) {
    const stack: Array<{ value: unknown; type: string; path: string }> = [
      { value: node, type: "NodeChange", path: "" },
    ]
    while (stack.length) {
      const { value, type, path } = stack.pop()!
      const definition = definitions.get(type)
      if (
        !definition ||
        !value ||
        typeof value !== "object" ||
        ArrayBuffer.isView(value)
      )
        continue
      for (const field of definition.fields) {
        const child = (value as Record<string, unknown>)[field.name]
        if (child === undefined || child === null) continue
        const childPath = path ? `${path}.${field.name}` : field.name
        if (
          referenceFields.has(`${type}.${field.name}`) &&
          field.type === "uint" &&
          !field.isArray
        ) {
          if (
            typeof child === "number" &&
            Number.isInteger(child) &&
            child >= 0 &&
            child < blobCount
          ) {
            const reference = {
              guid: node.guid,
              nodeName: node.name || "no name",
              nodeIndex,
              path: childPath,
            }
            const existing = references.get(child)
            if (existing) existing.push(reference)
            else references.set(child, [reference])
          }
        } else if (
          field.type &&
          definitions.has(field.type) &&
          field.type !== "Blob"
        ) {
          if (field.isArray && Array.isArray(child)) {
            for (let i = child.length - 1; i >= 0; i--) {
              stack.push({
                value: child[i],
                type: field.type,
                path: `${childPath}[${i}]`,
              })
            }
          } else if (!field.isArray) {
            stack.push({ value: child, type: field.type, path: childPath })
          }
        }
      }
    }
  }
  return references
}
