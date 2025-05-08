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
  const percent = up.progress
    ? (up.progress.current / up.progress.total) * 100
    : undefined
  return (
    <div
      className={cn(
        "w-full min-h-screen flex flex-col justify-center items-center",
        className
      )}
    >
      <div className="min-w-40 flex flex-col space-y-4 justify-center items-center">
        <p className="w-40 text-center">{up.message}</p>
        {percent && <Progress value={percent} className="w-40" />}
      </div>
    </div>
  )
}
