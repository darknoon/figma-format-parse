import { ByteBuffer, type Schema } from "kiwi-schema"
import type { HexRange } from "./hex-ranges"

/** Annotate the re-encoded node using its embedded schema, not bundled field IDs. */
export function kiwiRanges(schema: Schema, type: string, value: unknown, bytes: Uint8Array): HexRange[] {
  const definitions = new Map(schema.definitions.map((definition) => [definition.name, definition]))
  const buffer = new ByteBuffer()
  const ranges: HexRange[] = []
  const span = (label: string, description: string, write: () => void) => {
    const offset = buffer.length
    write()
    ranges.push({ offset, byteLength: buffer.length - offset, label, description })
  }
  const display = (value: unknown) => {
    const text = typeof value === "bigint" ? String(value) : JSON.stringify(value)
    return text.length > 240 ? `${text.slice(0, 237)}…` : text
  }
  const encode = (type: string, value: unknown, path: string, depth: number) => {
    if (depth > 128) throw new Error("Kiwi nesting limit")
    const definition = definitions.get(type)
    if (definition && definition.kind !== "ENUM") {
      const object = value as Record<string, unknown>
      for (const field of definition.fields) {
        if (field.isDeprecated || object[field.name] == null) continue
        const label = path ? `${path}.${field.name}` : field.name
        const fieldValue = object[field.name]
        if (definition.kind === "MESSAGE") {
          span(label, `Field tag ${field.value} · ${field.type}${field.isArray ? "[]" : ""}`, () => buffer.writeVarUint(field.value))
        }
        if (field.isArray) {
          const items = fieldValue as ArrayLike<unknown>
          span(label, `Array length · ${items.length} items`, () => buffer.writeVarUint(items.length))
          if (field.type === "byte") {
            span(label, `${items.length} byte values`, () => {
              for (let i = 0; i < items.length; i++) buffer.writeByte(items[i] as number)
            })
          } else {
            for (let i = 0; i < items.length; i++) encode(field.type!, items[i], `${label}[${i}]`, depth + 1)
          }
        } else encode(field.type!, fieldValue, label, depth + 1)
      }
      if (definition.kind === "MESSAGE") span(path || type, `End of ${type} · tag 0`, () => buffer.writeVarUint(0))
      return
    }
    const enumValue = definition?.fields.find((field) => field.name === value)?.value
    span(path, `${type} · ${display(value)}${enumValue === undefined ? "" : ` (${enumValue})`}`, () => {
      switch (type) {
        case "bool": buffer.writeByte(Number(value)); break
        case "byte": buffer.writeByte(value as number); break
        case "int": buffer.writeVarInt(value as number); break
        case "uint": buffer.writeVarUint(value as number); break
        case "float": buffer.writeVarFloat(value as number); break
        case "string": buffer.writeString(value as string); break
        case "int64": buffer.writeVarInt64(value as bigint); break
        case "uint64": buffer.writeVarUint64(value as bigint); break
        default:
          if (enumValue === undefined) throw new Error(`Unknown Kiwi type or enum: ${type}`)
          buffer.writeVarUint(enumValue)
      }
    })
  }
  try {
    encode(type, value, "", 0)
    const encoded = buffer.toUint8Array()
    // Never label bytes if the tracer differs from Kiwi's authoritative encoder.
    if (encoded.length !== bytes.length || encoded.some((byte, i) => byte !== bytes[i])) return []
    return ranges.filter((range) => range.byteLength > 0)
  } catch {
    return []
  }
}
