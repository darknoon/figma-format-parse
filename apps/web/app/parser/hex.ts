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
    return hex(value)
  }
  return value
}
