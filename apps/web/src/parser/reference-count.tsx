export function ReferenceCount({ count }: { count: number }) {
  const label = `${count} node reference${count === 1 ? "" : "s"}`
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground"
      aria-label={label}
      title={label}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 17 17 7M7 7h10v10" />
      </svg>
      {count}
    </span>
  )
}
