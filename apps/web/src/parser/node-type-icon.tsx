import type { ReactNode } from "react"

const shapes: Record<string, ReactNode> = {
  DOCUMENT: <><rect x="3" y="2" width="10" height="12" rx="1.5" /><path d="M6 2v12" /></>,
  CANVAS: <path d="M3.5 2h6L13 5.5V14H3.5zM9.5 2v3.5H13" />,
  FRAME: <path d="M5 1v14M11 1v14M1 5h14M1 11h14" />,
  GROUP: <path d="M6 2.5H2.5V6m7.5-3.5h3.5V6m0 4v3.5H10m-4 0H2.5V10" />,
  SECTION: <path d="M2 3h4.5l2 2H14v8H2z" />,
  RESPONSIVE_SET: <><path d="M7.5 12.5h-5v-10h11v4" /><rect x="9.5" y="8.5" width="4" height="5" rx=".5" /></>,
  TEXT: <path d="M2.5 4V2.5h11V4M8 2.5v11M5.5 13.5h5" />,
  ROUNDED_RECTANGLE: <rect x="2.5" y="2.5" width="11" height="11" rx="2" />,
  ELLIPSE: <circle cx="8" cy="8" r="5.5" />,
  LINE: <path d="m2.5 13.5 11-11" />,
  REGULAR_POLYGON: <path d="m8 2 6 11H2z" />,
  STAR: <path d="m8 1.5 2 4.2 4.5.7-3.2 3.2.7 4.6-4-2.2-4 2.2.7-4.6-3.2-3.2 4.5-.7z" />,
  VECTOR: <><path d="M4 11.5C4 5 12 11 12 4.5" /><rect x="2.5" y="11.5" width="3" height="3" /><rect x="10.5" y="1.5" width="3" height="3" /></>,
  BOOLEAN_OPERATION: <path d="M2.5 2.5h7v4h4v7h-7v-4h-4z" fill="currentColor" fillOpacity=".15" />,
  SYMBOL: <path d="m8 1.5 6.5 6.5L8 14.5 1.5 8z" fill="currentColor" stroke="none" />,
  INSTANCE: <path d="m8 1.5 6.5 6.5L8 14.5 1.5 8z" />,
  SLICE: <path d="M5 1.5v9.5h9.5M1.5 5H11v9.5" />,
  MEDIA: <><rect x="2" y="2" width="12" height="12" rx="1" /><circle cx="5.5" cy="5.5" r="1" /><path d="m2 12 4-4 3 3 2-2 3 3" /></>,
}

export const nodeIconTypes = Object.keys(shapes)

export function NodeTypeIcon({ type }: { type: string }) {
  return (
    <span title={type.replace(/_/g, " ").toLowerCase()} className={`mr-2 flex h-5 w-4 items-center justify-center ${type === "SYMBOL" || type === "INSTANCE" ? "text-purple-500" : "text-muted-foreground"}`}>
      <svg role="img" aria-label={type} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        {shapes[type === "RECTANGLE" ? "ROUNDED_RECTANGLE" : type] ?? <rect x="2.5" y="2.5" width="11" height="11" rx="1" />}
      </svg>
    </span>
  )
}
