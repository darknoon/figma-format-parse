import type { Color } from "fig-kiwi/schema-defs"

export function cssColor(color?: Color) {
  if (!color) return "#000"
  return `rgba(${color.r * 255},${color.g * 255},${color.b * 255},${color.a ?? 1})`
}
