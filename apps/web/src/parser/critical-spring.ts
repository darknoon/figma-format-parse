/** Exact critically damped solution; retargeting preserves position and velocity. */
export function criticalSpring(position: number, velocity: number, target: number, seconds: number, frequency = 24) {
  const displacement = position - target
  const coefficient = velocity + frequency * displacement
  const decay = Math.exp(-frequency * seconds)
  return {
    position: target + (displacement + coefficient * seconds) * decay,
    velocity: (velocity - frequency * coefficient * seconds) * decay,
  }
}
