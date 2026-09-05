import type { Message } from "fig-kiwi"
import type { Glyph, Matrix, NodeChange, TextData } from "fig-kiwi/schema-defs"
import { buildNodeTree, type TreeNode } from "./hierarchy"
import { expandInstances } from "./instances"
import {
  decodeCommands,
  decodeVectorNetwork,
  identity,
  multiply,
  point,
} from "./geometry"

// These fields are present in newer embedded schemas than the bundled typings.
export type SceneNode = NodeChange & {
  derivedTextData?: TextData & { glyphs?: (Glyph & { rotation?: number })[] }
}
export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}
export interface Camera {
  x: number
  y: number
  zoom: number
}
export interface SceneItem extends Omit<TreeNode, "node" | "children"> {
  node: SceneNode
  children: SceneItem[]
  world: Matrix
  bounds?: Bounds
  visible: boolean
  pageId?: string
}

export function union(
  a: Bounds | undefined,
  b: Bounds | undefined
): Bounds | undefined {
  if (!a) return b
  if (!b) return a
  const x = Math.min(a.x, b.x),
    y = Math.min(a.y, b.y)
  return {
    x,
    y,
    width: Math.max(a.x + a.width, b.x + b.width) - x,
    height: Math.max(a.y + a.height, b.y + b.height) - y,
  }
}

export function transformedBounds(
  m: Matrix,
  width: number,
  height: number
): Bounds {
  const corners = [
    point(m, 0, 0),
    point(m, width, 0),
    point(m, width, height),
    point(m, 0, height),
  ]
  const xs = corners.map((p) => p.x),
    ys = corners.map((p) => p.y)
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  }
}

export function clipsChildren(node: NodeChange) {
  return (
    ["FRAME", "SYMBOL", "INSTANCE", "RESPONSIVE_SET"].includes(
      node.type ?? ""
    ) && node.frameMaskDisabled !== true
  )
}

export function buildScene(message: Message) {
  const tree = buildNodeTree(message.nodeChanges ?? [])
  const byId = new Map<string, SceneItem>()
  const paths = new Map<number, string>()
  const invalidPaths = new Set<number>()
  const networks = new Map<string, { fill: string; stroke: string }>()
  const order: SceneItem[] = []
  const stack = expandInstances(tree)
    .map((item) => ({
      item,
      world: identity,
      visible: true,
      pageId: undefined as string | undefined,
    }))
    .reverse()
  while (stack.length) {
    const { item, world, visible, pageId } = stack.pop()!
    const node = item.node as SceneNode
    const current: SceneItem = {
      ...item,
      node,
      children: [],
      world: multiply(world, node.transform ?? identity),
      visible: visible && node.visible !== false && node.phase !== "REMOVED",
      pageId: node.type === "CANVAS" ? item.id : pageId,
    }
    if (
      node.size &&
      current.visible &&
      node.type !== "DOCUMENT" &&
      node.type !== "CANVAS"
    ) {
      current.bounds = transformedBounds(
        current.world,
        node.size.x,
        node.size.y
      )
    }
    const networkBlob = node.vectorData?.vectorNetworkBlob
    if (
      networkBlob !== undefined &&
      (!node.fillGeometry?.length || !node.strokeGeometry?.length)
    ) {
      const bytes = message.blobs?.[networkBlob]?.bytes
      const network = bytes && decodeVectorNetwork(bytes)
      if (network) networks.set(item.id, network)
    }
    byId.set(item.id, current)
    order.push(current)
    for (const path of [
      ...(node.fillGeometry ?? []),
      ...(node.strokeGeometry ?? []),
      ...((node.derivedTextData ?? node.textData)?.glyphs ?? []),
    ]) {
      const index = path.commandsBlob
      if (index === undefined || paths.has(index) || invalidPaths.has(index))
        continue
      const bytes = message.blobs?.[index]?.bytes
      const decoded = bytes && decodeCommands(bytes)
      if (decoded !== undefined) paths.set(index, decoded)
      else invalidPaths.add(index)
    }
    for (let i = item.children.length - 1; i >= 0; i--) {
      stack.push({
        item: item.children[i],
        world: current.world,
        visible: current.visible,
        pageId: current.pageId,
      })
    }
  }
  const roots: SceneItem[] = []
  for (const item of order) {
    const parent = item.parentId && byId.get(item.parentId)
    if (parent) parent.children.push(item)
    else roots.push(item)
  }
  for (let i = order.length - 1; i >= 0; i--) {
    const item = order[i]
    const parent = item.parentId && byId.get(item.parentId)
    if (parent && item.visible && !clipsChildren(parent.node))
      parent.bounds = union(parent.bounds, item.bounds)
  }
  const pages = order.filter(
    (item) =>
      item.node.type === "CANVAS" && item.node.name !== "Internal Only Canvas"
  )
  return { roots, byId, paths, networks, invalidPaths, pages, order }
}
export type Scene = ReturnType<typeof buildScene>

export function fitCamera(
  bounds: Bounds | undefined,
  width: number,
  height: number,
  maxZoom = 2
): Camera {
  if (!bounds || width <= 0 || height <= 0)
    return { x: width / 2, y: height / 2, zoom: 1 }
  const zoom = Math.max(
    0.001,
    Math.min(
      maxZoom,
      Math.max(1, width - 96) / Math.max(bounds.width, 1),
      Math.max(1, height - 96) / Math.max(bounds.height, 1)
    )
  )
  return {
    x: width / 2 - (bounds.x + bounds.width / 2) * zoom,
    y: height / 2 - (bounds.y + bounds.height / 2) * zoom,
    zoom,
  }
}

export function zoomCamera(
  camera: Camera,
  factor: number,
  x: number,
  y: number
): Camera {
  const zoom = Math.max(0.001, Math.min(256, camera.zoom * factor))
  const ratio = zoom / camera.zoom
  return { x: x - (x - camera.x) * ratio, y: y - (y - camera.y) * ratio, zoom }
}
