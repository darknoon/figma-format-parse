"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

export const CodeView = React.forwardRef<
  HTMLPreElement,
  React.HTMLAttributes<HTMLPreElement>
>(({ className, ...props }, ref) => (
  <pre ref={ref} className={cn("text-s p-2", className)} {...props} />
))
CodeView.displayName = "CodeView"
