import type { GUID } from "fig-kiwi/schema-defs"

export function NodeReferenceLink({
  guid,
  title,
  onSelect,
}: {
  guid: GUID
  title?: string
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onSelect}
      className="inline-flex items-center gap-1 rounded-sm text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {guid.sessionID}:{guid.localID}
      <svg
        aria-hidden="true"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 17 17 7M7 7h10v10" />
      </svg>
    </button>
  )
}
