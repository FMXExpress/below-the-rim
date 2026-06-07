import type { Vec3 } from './types.ts'

export type TurnBasis = {
  cos: number
  sin: number
}

export function handSideSign(hand: Vec3, torso: Vec3, sideX: number, sideZ: number) {
  return (hand[0] - torso[0]) * sideX + (hand[2] - torso[2]) * sideZ >= 0 ? 1 : -1
}
