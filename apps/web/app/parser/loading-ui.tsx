"use client"
import { ProgressUpdate } from "./async-operation"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export function Loading({
  up,
  className,
}: {
  up: ProgressUpdate
  className?: string
}) {
  if (up.progress) {
    const value = (up.progress.current / up.progress.total) * 100
    return (
      <div className={cn("w-full max-w-sm", className)}>
        {up.message}
        <Progress value={value} />
      </div>
    )
  } else {
    return <div>{up.message}</div>
  }
}
