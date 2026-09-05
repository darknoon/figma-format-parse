import { expect, test } from "bun:test"
import { jsonFieldRange } from "../src/parser/json-field-range"

test("highlights the exact array field among repeated blob references", () => {
  const json = JSON.stringify(
    {
      text: 'contains "commandsBlob": 4, [brackets] and {braces}',
      fillGeometry: [{ commandsBlob: 4 }],
      derivedTextData: { glyphs: [{ commandsBlob: 4 }, { commandsBlob: 7 }] },
    },
    null,
    2
  )
  const range = jsonFieldRange(json, "derivedTextData.glyphs[1].commandsBlob")!
  expect(json.slice(range.start, range.end)).toBe('"commandsBlob": 7')
  expect(jsonFieldRange(json, "missing.commandsBlob")).toBeUndefined()
})

test("finds a network reference without matching similar sibling keys", () => {
  const json = JSON.stringify(
    {
      vectorData: { vectorNetworkBlob: 21, normalizedSize: { x: 1, y: 2 } },
      vectorNetworkBlob: 8,
    },
    null,
    2
  )
  const range = jsonFieldRange(json, "vectorData.vectorNetworkBlob")!
  expect(json.slice(range.start, range.end)).toBe('"vectorNetworkBlob": 21')
})
