"use client"
import React, { useEffect, useReducer, useState } from "react"

export type ProgressUpdate = { message?: string; progress?: DefiniteProgress }

export interface DefiniteProgress {
  current: number
  total: number
}
export type GenT<Output> = AsyncGenerator<ProgressUpdate, Output>

export type LoaderState<Output> =
  | { status: "idle" }
  | {
      status: "loading"
      startTime: number
      message?: string
      progress?: DefiniteProgress
      operation: GenT<Output>
    }
  | { status: "done"; data: Output }
  | { status: "error"; error: Error }

export type AsyncOperationProps<
  Input,
  Output,
  Operation extends (input: Input) => AsyncGenerator<ProgressUpdate, Output>
> = {
  input: Input
  operation: Operation
  children: (state: LoaderState<Output>) => React.ReactNode
}

export default function AsyncOperation<
  Input,
  Output,
  Operation extends (input: Input) => AsyncGenerator<ProgressUpdate, Output>
>({
  input,
  operation,
  children,
}: AsyncOperationProps<Input, Output, Operation>) {
  const [state, setState] = useState<LoaderState<Output>>({ status: "idle" })
  const [lastInput, setLastInput] = useState<Input | null>(null)
  const [needsRerun, setNeedsRerun] = useState(false)
  useEffect(() => {
    if (lastInput === input) {
      return
    }
    setLastInput(input)
    if (state.status === "loading") {
      // TODO: support cancellation? We will return stale data
      setNeedsRerun(true)
      return
    }
    setNeedsRerun(false)
    const startTime = Date.now()
    const run = async () => {
      if ("loading" in state) {
        return
      }
      let result: Output | undefined
      try {
        const generator = operation(input)
        setState({
          status: "loading",
          startTime,
          operation: generator,
        })
        while (true) {
          const { value, done } = await generator.next(result)
          if (done) {
            setState(() => ({ status: "done", data: value }))
            return
          } else {
            console.info("progress", value)
            setState(() => ({
              status: "loading",
              startTime,
              message: value.message,
              progress: value.progress,
              operation: generator,
            }))
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          const _error = error
          setState(() => ({ status: "error", error: _error }))
        } else {
          throw error
        }
      }
    }
    run().then(() => {
      // Rerun if needed
    })
    // don't want state in here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, operation, state])

  return children(state)
}
