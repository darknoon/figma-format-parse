"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

export const CodeView = React.forwardRef<
  HTMLPreElement,
  React.HTMLAttributes<HTMLPreElement>
>(({ className, ...props }, ref) => (
  <pre
    ref={ref}
    className={cn(
      "text-xs border-gray-100 dark:border-bg-gray-800 border rounded-md p-2",
      className
    )}
    {...props}
  />
))
CodeView.displayName = "CodeView"
