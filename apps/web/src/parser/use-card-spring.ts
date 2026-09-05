import { useLayoutEffect, useRef } from "react"
import { criticalSpring } from "./critical-spring"

export function useCardSpring(expanded: boolean) {
  const card = useRef<HTMLElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const motion = useRef({ position: 0, velocity: 0 })
  useLayoutEffect(() => {
    const element = card.current, panel = body.current, inner = content.current
    if (!element || !panel || !inner) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    let frame = 0
    let previous: number | undefined
    const target = expanded ? 1 : 0
    const draw = (now: number) => {
      frame = 0
      const seconds = previous === undefined ? 0 : (now - previous) / 1000
      previous = now
      motion.current = reduced.matches
        ? { position: target, velocity: 0 }
        : criticalSpring(motion.current.position, motion.current.velocity, target, seconds)
      const settled = Math.abs(motion.current.position - target) < 0.001 && Math.abs(motion.current.velocity) < 0.01
      if (settled) motion.current = { position: target, velocity: 0 }
      const progress = Math.max(0, Math.min(1, motion.current.position))
      const height = inner.getBoundingClientRect().height
      element.style.width = `${240 + progress * 24}px`
      panel.style.height = `${height * progress}px`
      panel.style.opacity = String(progress)
      if (!settled) frame = requestAnimationFrame(draw)
    }
    const start = () => {
      if (!frame) {
        previous = undefined
        frame = requestAnimationFrame(draw)
      }
    }
    const observer = new ResizeObserver(start)
    observer.observe(inner)
    reduced.addEventListener("change", start)
    start()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      reduced.removeEventListener("change", start)
    }
  }, [expanded])
  return { card, body, content }
}
