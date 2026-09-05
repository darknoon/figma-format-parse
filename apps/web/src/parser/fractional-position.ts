// Figma stores an implicit "0." followed by base-95 digits (ASCII space to ~).
// https://www.figma.com/blog/realtime-editing-of-ordered-sequences/#fractional-indexing
// For display only: long positions can round to the same floating-point value.
// Keep comparing the original strings when sorting siblings.
export function decodePosition(position: string): number | undefined {
  if (!position || /[^ -~]/.test(position) || !/[^ ]/.test(position)) {
    return undefined
  }

  let value = 0
  for (let i = position.length - 1; i >= 0; i--) {
    value = (position.charCodeAt(i) - 32 + value) / 95
  }
  return value
}
