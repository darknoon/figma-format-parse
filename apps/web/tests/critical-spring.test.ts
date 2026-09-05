import { expect, test } from "bun:test"
import { criticalSpring } from "../src/parser/critical-spring"

test("critical spring is frame-rate independent and settles without overshoot", () => {
  let state = { position: 0, velocity: 0 }
  for (let i = 0; i < 60; i++) {
    const previous = state.position
    state = criticalSpring(state.position, state.velocity, 1, 1 / 60)
    expect(state.position).toBeGreaterThanOrEqual(previous)
    expect(state.position).toBeLessThanOrEqual(1)
  }
  expect(state.position).toBeCloseTo(1, 6)
  const singleStep = criticalSpring(0, 0, 1, 1)
  expect(state.position).toBeCloseTo(singleStep.position, 12)
})

test("retargeting preserves instantaneous position and velocity", () => {
  const moving = criticalSpring(0, 0, 1, 0.08)
  expect(moving.velocity).toBeGreaterThan(0)
  expect(criticalSpring(moving.position, moving.velocity, 0, 0)).toEqual(moving)
  const settled = criticalSpring(moving.position, moving.velocity, 0, 1)
  expect(settled.position).toBeCloseTo(0, 6)
})
