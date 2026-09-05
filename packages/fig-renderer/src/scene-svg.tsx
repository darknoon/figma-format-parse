import { memo, type CSSProperties, type ReactNode } from "react"
import type { NodeChange, Paint, Path } from "fig-kiwi/schema-defs"
import {
  identity,
  inverse,
  multiply,
  primitivePath,
  svgMatrix,
} from "./geometry"
import {
  clipsChildren,
  transformedBounds,
  type Scene,
  type SceneItem,
  type SceneNode,
} from "./scene-data"
import { imageKey, type LoadedImage } from "./scene-images"

import { cssColor } from "./color"

function blend(mode?: string): CSSProperties["mixBlendMode"] {
  return (
    !mode || mode === "PASS_THROUGH" || mode === "NORMAL"
      ? "normal"
      : mode.toLowerCase().replace(/_/g, "-")
  ) as CSSProperties["mixBlendMode"]
}

interface RenderContext {
  scene: Scene
  images: Map<string, LoadedImage>
  prefix: string
}
const pathId = (ctx: RenderContext, index: number) =>
  `${ctx.prefix}-path-${index}`

function Geometry({
  node,
  paths,
  ctx,
  fallback = true,
}: {
  node: SceneNode
  paths?: Path[]
  ctx: RenderContext
  fallback?: boolean
}) {
  const valid = paths?.filter(
    (p) => p.commandsBlob !== undefined && ctx.scene.paths.has(p.commandsBlob)
  )
  if (valid?.length)
    return (
      <>
        {valid.map((p, i) => (
          <use
            key={i}
            href={`#${pathId(ctx, p.commandsBlob!)}`}
            fillRule={p.windingRule === "ODD" ? "evenodd" : "nonzero"}
          />
        ))}
      </>
    )
  return fallback ? <path d={primitivePath(node)} /> : null
}

function PaintDef({
  paint,
  node,
  id,
  ctx,
}: {
  paint: Paint
  node: SceneNode
  id: string
  ctx: RenderContext
}) {
  const { x: width = 1, y: height = 1 } = node.size ?? {}
  if (paint.type?.startsWith("GRADIENT")) {
    // Stored paint transforms map normalized node coordinates into paint space.
    const transform = multiply(
      { ...identity, m00: width, m11: height },
      inverse(paint.transform ?? identity) ?? identity
    )
    const stops = paint.stops?.map((stop, i) => (
      <stop
        key={i}
        offset={Math.max(0, Math.min(1, stop.position))}
        stopColor={cssColor(stop.color)}
      />
    ))
    if (paint.type === "GRADIENT_LINEAR")
      return (
        <linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0.5"
          x2="1"
          y2="0.5"
          gradientTransform={svgMatrix(transform)}
        >
          {stops}
        </linearGradient>
      )
    return (
      <radialGradient
        id={id}
        gradientUnits="userSpaceOnUse"
        cx="0.5"
        cy="0.5"
        r="0.5"
        gradientTransform={svgMatrix(transform)}
      >
        {stops}
      </radialGradient>
    )
  }
  if (paint.type === "IMAGE") {
    const image =
      ctx.images.get(imageKey(paint.image) ?? "") ??
      ctx.images.get(imageKey(paint.imageThumbnail) ?? "")
    if (!image)
      return (
        <pattern id={id} width={16} height={16} patternUnits="userSpaceOnUse">
          <rect width={16} height={16} fill="#e4e7ec" />
          <path d="M0 0H8V8H0ZM8 8H16V16H8Z" fill="#d3d8e0" />
        </pattern>
      )
    if (paint.imageScaleMode === "TILE") {
      const scale = paint.scale ?? 1
      const w = (paint.originalImageWidth ?? image.width) * scale
      const h = (paint.originalImageHeight ?? image.height) * scale
      return (
        <pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width={Math.max(1, w)}
          height={Math.max(1, h)}
          patternTransform={`rotate(${paint.rotation ?? 0})`}
        >
          <image href={image.url} width={w} height={h} />
        </pattern>
      )
    }
    const stretch = paint.imageScaleMode === "STRETCH"
    const transform = stretch
      ? svgMatrix(
          multiply(
            { ...identity, m00: width, m11: height },
            inverse(paint.transform ?? identity) ?? identity
          )
        )
      : undefined
    return (
      <pattern
        id={id}
        patternUnits="userSpaceOnUse"
        width={Math.max(1, width)}
        height={Math.max(1, height)}
      >
        <image
          href={image.url}
          width={stretch ? 1 : width}
          height={stretch ? 1 : height}
          transform={transform}
          preserveAspectRatio={
            stretch
              ? "none"
              : paint.imageScaleMode === "FIT"
                ? "xMidYMid meet"
                : "xMidYMid slice"
          }
        />
      </pattern>
    )
  }
  return null
}

function Painted({
  node,
  paints,
  id,
  ctx,
  children,
  stroke = false,
}: {
  node: SceneNode
  paints?: Paint[]
  id: string
  ctx: RenderContext
  children: ReactNode
  stroke?: boolean
}) {
  return (
    <>
      {paints?.map((paint, i) => {
        if (paint.visible === false || paint.opacity === 0) return null
        const paintId = `${id}-${i}`
        const value =
          !paint.type || paint.type === "SOLID"
            ? cssColor(paint.color)
            : `url(#${paintId})`
        return (
          <g
            key={i}
            opacity={paint.opacity ?? 1}
            style={{ mixBlendMode: blend(paint.blendMode) }}
            fill={stroke ? "none" : value}
            stroke={stroke ? value : undefined}
            strokeWidth={stroke ? (node.strokeWeight ?? 1) : undefined}
            strokeLinecap={
              node.strokeCap === "ROUND"
                ? "round"
                : node.strokeCap === "SQUARE"
                  ? "square"
                  : "butt"
            }
            strokeLinejoin={
              node.strokeJoin?.toLowerCase() as
                | "round"
                | "bevel"
                | "miter"
                | undefined
            }
            strokeMiterlimit={node.miterLimit}
            strokeDasharray={stroke ? node.dashPattern?.join(" ") : undefined}
          >
            <defs>
              <PaintDef paint={paint} node={node} id={paintId} ctx={ctx} />
            </defs>
            {children}
          </g>
        )
      })}
    </>
  )
}

function TextShape({
  node,
  id,
  ctx,
}: {
  node: SceneNode
  id: string
  ctx: RenderContext
}) {
  const data = node.derivedTextData ?? node.textData
  const styles = node.textData?.styleOverrideTable ?? []
  // Paint one group per style, sharing glyph definitions across the entire file.
  const styleIds = new Set(data?.glyphs?.map((g) => g.styleID ?? 0))
  return (
    <g aria-label={node.textData?.characters}>
      {[...styleIds].map((styleId) => {
        const style: NodeChange = {
          ...node,
          ...styles.find((s) => s.styleID === styleId),
        }
        const glyphs = data?.glyphs
          ?.filter((g) => (g.styleID ?? 0) === styleId)
          .map((glyph, i) => {
            if (
              glyph.commandsBlob === undefined ||
              !ctx.scene.paths.has(glyph.commandsBlob)
            )
              return null
            const size = glyph.fontSize ?? style.fontSize ?? 12
            const rotation = (glyph as { rotation?: number }).rotation ?? 0
            return (
              <use
                key={i}
                href={`#${pathId(ctx, glyph.commandsBlob)}`}
                transform={`translate(${glyph.position?.x ?? 0} ${glyph.position?.y ?? 0}) rotate(${(rotation * 180) / Math.PI}) scale(${size} ${-size})`}
              />
            )
          })
        return (
          <g key={styleId}>
            <Painted
              node={node}
              paints={style.fillPaints ?? [{ type: "SOLID" }]}
              id={`${id}-text-${styleId}`}
              ctx={ctx}
            >
              {glyphs}
            </Painted>
          </g>
        )
      })}
      {data?.decorations?.map((decoration, i) => {
        const style =
          styles.find((s) => s.styleID === decoration.styleID) ?? node
        return (
          <Painted
            key={i}
            node={node}
            paints={style.fillPaints ?? node.fillPaints}
            id={`${id}-dec-${i}`}
            ctx={ctx}
          >
            {decoration.rects?.map((r, j) => (
              <rect key={j} x={r.x} y={r.y} width={r.w} height={r.h} />
            ))}
          </Painted>
        )
      })}
      {!data?.glyphs?.length && node.textData?.characters && (
        <title>
          Text outlines are absent in this export: {node.textData.characters}
        </title>
      )}
    </g>
  )
}

function EffectDef({ node, id }: { node: SceneNode; id: string }) {
  const effects = node.effects?.filter(
    (e) =>
      e.visible !== false &&
      ["DROP_SHADOW", "FOREGROUND_BLUR", "INNER_SHADOW"].includes(e.type ?? "")
  )
  if (!effects?.length) return null
  const shadows = effects.filter((e) => e.type === "DROP_SHADOW")
  const blur = effects.find((e) => e.type === "FOREGROUND_BLUR")
  const inner = effects.filter((e) => e.type === "INNER_SHADOW")
  return (
    <filter
      id={id}
      x="-100%"
      y="-100%"
      width="300%"
      height="300%"
      colorInterpolationFilters="sRGB"
    >
      {shadows.map((e, i) => (
        <Shadow key={i} effect={e} index={i} />
      ))}
      <feMerge result="shadowed">
        {shadows.map((_, i) => (
          <feMergeNode key={i} in={`shadow${i}`} />
        ))}
        <feMergeNode in="SourceGraphic" />
      </feMerge>
      {inner.map((e, i) => (
        <InnerShadow key={i} effect={e} index={i} />
      ))}
      {blur && <feGaussianBlur stdDeviation={(blur.radius ?? 0) / 2} />}
    </filter>
  )
}

function Shadow({
  effect: e,
  index: i,
}: {
  effect: NonNullable<NodeChange["effects"]>[number]
  index: number
}) {
  return (
    <>
      {e.spread ? (
        <feMorphology
          in="SourceAlpha"
          operator={e.spread > 0 ? "dilate" : "erode"}
          radius={Math.abs(e.spread)}
          result={`spread${i}`}
        />
      ) : null}
      <feGaussianBlur
        in={e.spread ? `spread${i}` : "SourceAlpha"}
        stdDeviation={(e.radius ?? 0) / 2}
        result={`shadowBlur${i}`}
      />
      <feOffset
        in={`shadowBlur${i}`}
        dx={e.offset?.x ?? 0}
        dy={e.offset?.y ?? 0}
        result={`shadowOffset${i}`}
      />
      <feFlood floodColor={cssColor(e.color)} result={`shadowColor${i}`} />
      <feComposite
        in={`shadowColor${i}`}
        in2={`shadowOffset${i}`}
        operator="in"
        result={`shadow${i}`}
      />
    </>
  )
}

function InnerShadow({
  effect: e,
  index: i,
}: {
  effect: NonNullable<NodeChange["effects"]>[number]
  index: number
}) {
  return (
    <>
      <feOffset
        in="SourceAlpha"
        dx={e.offset?.x ?? 0}
        dy={e.offset?.y ?? 0}
        result={`offset${i}`}
      />
      <feGaussianBlur
        in={`offset${i}`}
        stdDeviation={(e.radius ?? 0) / 2}
        result={`blur${i}`}
      />
      <feComposite
        in="SourceAlpha"
        in2={`blur${i}`}
        operator="out"
        result={`inside${i}`}
      />
      <feFlood floodColor={cssColor(e.color)} result={`color${i}`} />
      <feComposite
        in={`color${i}`}
        in2={`inside${i}`}
        operator="in"
        result={`inner${i}`}
      />
      <feMerge result={`composite${i}`}>
        <feMergeNode in={i ? `composite${i - 1}` : "shadowed"} />
        <feMergeNode in={`inner${i}`} />
      </feMerge>
    </>
  )
}

function NodeShape({ item, ctx }: { item: SceneItem; ctx: RenderContext }) {
  const { node } = item
  const id = `${ctx.prefix}-${item.id.replace(":", "-")}`
  if (node.type === "TEXT") return <TextShape node={node} id={id} ctx={ctx} />
  const fallback = ![
    "VECTOR",
    "BOOLEAN_OPERATION",
    "GROUP",
    "DOCUMENT",
    "CANVAS",
  ].includes(node.type ?? "")
  const network = ctx.scene.networks.get(item.id)
  const normalized = node.vectorData?.normalizedSize
  const networkScale = `scale(${normalized?.x ? (node.size?.x ?? normalized.x) / normalized.x : 1} ${normalized?.y ? (node.size?.y ?? normalized.y) / normalized.y : 1})`
  const fills =
    !node.fillGeometry?.length && network ? (
      <path d={network.fill} transform={networkScale} fillRule="evenodd" />
    ) : (
      <Geometry
        node={node}
        paths={node.fillGeometry}
        ctx={ctx}
        fallback={fallback}
      />
    )
  const hasStrokeGeometry = node.strokeGeometry?.some(
    (p) => p.commandsBlob !== undefined && ctx.scene.paths.has(p.commandsBlob)
  )
  return (
    <>
      <Painted node={node} paints={node.fillPaints} id={`${id}-fill`} ctx={ctx}>
        {fills}
      </Painted>
      <Painted
        node={node}
        paints={node.strokePaints}
        id={`${id}-stroke`}
        ctx={ctx}
        stroke={!hasStrokeGeometry}
      >
        {hasStrokeGeometry ? (
          <Geometry
            node={node}
            paths={node.strokeGeometry}
            ctx={ctx}
            fallback={false}
          />
        ) : network ? (
          <path d={network.stroke} transform={networkScale} />
        ) : (
          fills
        )}
      </Painted>
    </>
  )
}

function Siblings({ items, ctx }: { items: SceneItem[]; ctx: RenderContext }) {
  const groups: ReactNode[] = []
  let masked: ReactNode[] | undefined
  for (const item of items) {
    if (!item.visible) continue
    if (item.node.mask) {
      const id = `${ctx.prefix}-mask-${item.id.replace(":", "-")}`
      masked = []
      const bounds = transformedBounds(
        item.node.transform ?? identity,
        item.node.size?.x ?? 1,
        item.node.size?.y ?? 1
      )
      const outline =
        item.node.maskIsOutline ||
        (item.node as SceneNode & { maskType?: string }).maskType === "VECTOR"
      groups.push(
        <g key={id}>
          <defs>
            <mask
              id={id}
              maskUnits="userSpaceOnUse"
              x={bounds.x}
              y={bounds.y}
              width={Math.max(1, bounds.width)}
              height={Math.max(1, bounds.height)}
              style={{ maskType: "alpha" }}
            >
              <g
                transform={svgMatrix(item.node.transform)}
                opacity={item.node.opacity ?? 1}
                fill="white"
              >
                {outline ? (
                  <Geometry
                    node={item.node}
                    paths={item.node.fillGeometry}
                    ctx={ctx}
                  />
                ) : (
                  <NodeShape item={item} ctx={ctx} />
                )}
              </g>
            </mask>
          </defs>
          <g mask={`url(#${id})`}>{masked}</g>
        </g>
      )
    } else {
      const element = <NodeView key={item.id} item={item} ctx={ctx} />
      if (masked) masked.push(element)
      else groups.push(element)
    }
  }
  return <>{groups}</>
}

function NodeView({ item, ctx }: { item: SceneItem; ctx: RenderContext }) {
  if (!item.visible) return null
  const { node } = item
  const id = `${ctx.prefix}-${item.id.replace(":", "-")}`
  const clip = clipsChildren(node)
  const hasEffects = node.effects?.some(
    (e) =>
      e.visible !== false &&
      ["DROP_SHADOW", "FOREGROUND_BLUR", "INNER_SHADOW"].includes(e.type ?? "")
  )
  const boolean =
    node.type === "BOOLEAN_OPERATION" && !!node.fillGeometry?.length
  return (
    <g
      data-scene-node={item.id}
      transform={svgMatrix(node.transform)}
      opacity={node.opacity ?? 1}
      style={{
        mixBlendMode: blend(node.blendMode),
        isolation: node.blendMode === "PASS_THROUGH" ? undefined : "isolate",
      }}
    >
      <title>{node.name || node.type}</title>
      <defs>
        {clip && (
          <clipPath id={`${id}-clip`}>
            <path d={primitivePath(node)} />
          </clipPath>
        )}
        {hasEffects && <EffectDef node={node} id={`${id}-effect`} />}
      </defs>
      <g filter={hasEffects ? `url(#${id}-effect)` : undefined}>
        <NodeShape item={item} ctx={ctx} />
        <g clipPath={clip ? `url(#${id}-clip)` : undefined}>
          {!boolean && <Siblings items={item.children} ctx={ctx} />}
        </g>
      </g>
    </g>
  )
}

export const SceneDrawing = memo(function SceneDrawing({
  scene,
  roots,
  images,
  prefix,
}: RenderContext & { roots: SceneItem[] }) {
  const ctx = { scene, images, prefix }
  return (
    <>
      <defs>
        {[...scene.paths].map(([index, d]) => (
          <path id={pathId(ctx, index)} key={index} d={d} />
        ))}
      </defs>
      <Siblings items={roots} ctx={ctx} />
    </>
  )
})
