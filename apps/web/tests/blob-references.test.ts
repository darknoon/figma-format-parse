import { expect, test } from "bun:test"
import type { Message } from "fig-kiwi"
import { parseSchema } from "kiwi-schema"
import { indexBlobReferences } from "../src/parser/blob-references"

const schema = parseSchema(`
  message NodeChange {
    Path[] fillGeometry = 1;
    Path[] strokeGeometry = 2;
    VectorData vectorData = 3;
    Paint[] fillPaints = 4;
    Glyph[] glyphs = 5;
    NodeChange[] overrides = 6;
    uint opacity = 7;
    byte[] blobRef = 8;
    uint commandsBlob = 9;
  }
  message Path { uint commandsBlob = 1; uint styleID = 2; }
  message VectorData { uint vectorNetworkBlob = 1; }
  message Paint { Image image = 1; }
  message Image { uint dataBlob = 1; byte[] hash = 2; }
  message Glyph { uint commandsBlob = 1; }
`)
const guid = { sessionID: 1, localID: 2 }
const blobs = Array.from({ length: 3 }, () => ({
  bytes: new Uint8Array([0, 1, 2]),
}))

test("indexes blob zero and every supported reference field with an exact path", () => {
  const data = {
    blobs,
    nodeChanges: [
      {
        guid,
        name: "Shape",
        fillGeometry: [{ commandsBlob: 0 }, { commandsBlob: 1 }],
        strokeGeometry: [{ commandsBlob: 0 }],
        vectorData: { vectorNetworkBlob: 1 },
        fillPaints: [{ image: { dataBlob: 2 } }],
        glyphs: [{ commandsBlob: 2 }],
      },
    ],
  }
  const references = indexBlobReferences(data, schema)
  expect(
    references
      .get(0)
      ?.map(({ path }) => path)
      .sort()
  ).toEqual(["fillGeometry[0].commandsBlob", "strokeGeometry[0].commandsBlob"])
  expect(
    references
      .get(1)
      ?.map(({ path }) => path)
      .sort()
  ).toEqual(["fillGeometry[1].commandsBlob", "vectorData.vectorNetworkBlob"])
  expect(
    references
      .get(2)
      ?.map(({ path }) => path)
      .sort()
  ).toEqual(["fillPaints[0].image.dataBlob", "glyphs[0].commandsBlob"])
  expect(references.get(0)?.[0]).toMatchObject({
    guid,
    nodeName: "Shape",
    nodeIndex: 0,
  })
})

test("keeps every node referencing a shared blob, including identically named nodes", () => {
  const data = {
    blobs,
    nodeChanges: [1, 2].map((localID) => ({
      guid: { sessionID: 1, localID },
      name: "Vector",
      fillGeometry: [{ commandsBlob: 0 }],
    })),
  }
  expect(
    indexBlobReferences(data, schema)
      .get(0)
      ?.map(({ guid }) => guid?.localID)
  ).toEqual([1, 2])
})

test("nested overrides link to the enclosing inspectable node", () => {
  const data = {
    blobs,
    nodeChanges: [
      {
        guid,
        name: "Instance",
        overrides: [
          {
            guid: { sessionID: 9, localID: 9 },
            fillGeometry: [{ commandsBlob: 0 }],
          },
        ],
      },
    ],
  }
  expect(indexBlobReferences(data, schema).get(0)).toEqual([
    {
      guid,
      nodeName: "Instance",
      nodeIndex: 0,
      path: "overrides[0].fillGeometry[0].commandsBlob",
    },
  ])
})

test("ignores ordinary numbers, hashes, unknown fields, and invalid blob indices", () => {
  const data = {
    blobs,
    nodeChanges: [
      {
        guid,
        opacity: 0,
        commandsBlob: 0,
        unknown: { commandsBlob: 0 },
        blobRef: new Uint8Array([0, 1, 2]),
        fillGeometry: [
          { commandsBlob: -1 },
          { commandsBlob: 3 },
          { commandsBlob: 0.5 },
          { commandsBlob: NaN },
          { commandsBlob: "0" },
          { styleID: 0 },
        ],
        fillPaints: [{ image: { hash: new Uint8Array([0, 1, 2]) } }],
      },
    ],
  }
  expect(indexBlobReferences(data as unknown as Message, schema).size).toBe(0)
})

test("retains a readable location for a reference whose node has no GUID", () => {
  expect(
    indexBlobReferences(
      { blobs, nodeChanges: [{ fillGeometry: [{ commandsBlob: 0 }] }] },
      schema
    ).get(0)
  ).toEqual([
    {
      guid: undefined,
      nodeName: "no name",
      nodeIndex: 0,
      path: "fillGeometry[0].commandsBlob",
    },
  ])
  expect(indexBlobReferences({}, schema).size).toBe(0)
})
