export function hex(bytes: Uint8Array, pad?: string): string {
  let hex = ""
  for (let i = 0; i < bytes.length; i++) {
    hex.length && pad && (hex += pad)
    hex += bytes[i].toString(16).padStart(2, "0")
  }
  return hex
}

export function replacerForHex(key: string, value: any) {
  if (value instanceof Uint8Array) {
    if (value.length === 20) return `sha1(${hex(value)})`
    if (value.length === 32) return `sha256(${hex(value)})`
    return `hex(${hex(value)})`
  }
  return value
}
