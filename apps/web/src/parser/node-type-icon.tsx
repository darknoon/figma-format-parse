import type { ReactNode } from "react"

const shapes: Record<string, ReactNode> = {
  DOCUMENT: <><path d="M4 1.5h5L12 5v9.5H4z" /><path d="M9 1.5V5h3M6 8h4M6 10.5h4" /></>,
  CANVAS: <path d="M4 1.5h8v13H4z" />,
  FRAME: <path d="M5 1v14M11 1v14M1 5h14M1 11h14" />,
  GROUP: <rect x="2.5" y="2.5" width="11" height="11" strokeDasharray="2 2" />,
  SECTION: <path d="M2 4h5l1.5-2H14v12H2z" />,
  RESPONSIVE_SET: <><rect x="1.5" y="2.5" width="9" height="9" rx=".5" /><rect x="11.5" y="6.5" width="3" height="7" rx=".5" /><path d="M4 14h4" /></>,
  TEXT: <path d="M2.5 4V2.5h11V4M8 2.5v11M5.5 13.5h5" />,
  RECTANGLE: <rect x="2.5" y="2.5" width="11" height="11" />,
  ROUNDED_RECTANGLE: <rect x="2.5" y="2.5" width="11" height="11" rx="2" />,
  ELLIPSE: <circle cx="8" cy="8" r="5.5" />,
  LINE: <path d="m2.5 13.5 11-11" />,
  REGULAR_POLYGON: <path d="m8 2 6 11H2z" />,
  STAR: <path d="m8 1.5 2 4.2 4.5.7-3.2 3.2.7 4.6-4-2.2-4 2.2.7-4.6-3.2-3.2 4.5-.7z" />,
  VECTOR: <><path d="m3 12 4-9 6 8z" /><path d="M1.5 10.5h3v3h-3zM5.5 1.5h3v3h-3zM11.5 9.5h3v3h-3z" fill="currentColor" stroke="none" /></>,
  BOOLEAN_OPERATION: <><path d="M8 3H2v7h6z" /><path d="M8 6h6v7H7v-3" /></>,
  SYMBOL: <path d="m8 1.5 6.5 6.5L8 14.5 1.5 8z" fill="currentColor" stroke="none" />,
  INSTANCE: <path d="m8 1.5 6.5 6.5L8 14.5 1.5 8z" />,
  SLICE: <path d="M5 1v10h10M1 5h10v10" strokeDasharray="2 2" />,
  MEDIA: <><rect x="2" y="2" width="12" height="12" rx="1" /><circle cx="5.5" cy="5.5" r="1" /><path d="m2 12 4-4 3 3 2-2 3 3" /></>,
}

export const nodeIconTypes = Object.keys(shapes)

export function NodeTypeIcon({ type }: { type: string }) {
  return (
    <span title={type.replace(/_/g, " ").toLowerCase()} className={`mr-2 flex h-5 w-4 items-center justify-center ${type === "SYMBOL" || type === "INSTANCE" ? "text-purple-500" : "text-muted-foreground"}`}>
      <svg role="img" aria-label={type} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        {shapes[type] ?? <rect x="2.5" y="2.5" width="11" height="11" rx="1" />}
      </svg>
    </span>
  )
}
