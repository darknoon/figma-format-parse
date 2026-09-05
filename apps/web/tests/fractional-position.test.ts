import { expect, test } from "bun:test"
import { decodePosition } from "../src/parser/fractional-position"

test("decodes printable ASCII digits as base-95 fractions", () => {
  expect(decodePosition("!")).toBe(1 / 95)
  expect(decodePosition('"')).toBe(2 / 95)
  expect(decodePosition("~")).toBe(94 / 95)
})

test("decodes multiple digits, including a leading zero digit", () => {
  expect(decodePosition("(WP")).toBeCloseTo(77473 / 857375, 15)
  expect(decodePosition(" !")).toBeCloseTo(1 / 9025, 15)
})

test("does not interpret missing, zero, or non-ASCII positions as valid fractions", () => {
  for (const position of ["", " ", "   ", "\n", "!\n", "\u007f", "é"]) {
    expect(decodePosition(position)).toBeUndefined()
  }
})

test("decimal display is approximate for positions beyond float precision", () => {
  const left = "O".repeat(20) + "!"
  const right = "O".repeat(20) + '"'
  expect(left < right).toBe(true)
  expect(decodePosition(left)).toBe(decodePosition(right))
})
