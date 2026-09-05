/** Shared layout for embedded image and geometry assets. */
export const assetGridClassName =
  "grid grid-cols-[repeat(auto-fill,minmax(min(100%,10rem),1fr))] gap-4"

// Keep the outer corner concentric with the inset rounded-md preview.
export const assetCardClassName =
  "min-w-0 rounded-[calc(var(--radius-md)+0.75rem+1px)] border bg-card p-3"
