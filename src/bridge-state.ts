// The authoritative bridge progress lives on the server; this mirrors the latest
// synced values so collision (scene.ts) and rendering (club-app.ts) read one source.
// `level` is how many chasms have been fully bridged (islands conquered).
let level = 0
let planks = 0
let locked = 0

export function bridgeLevel() {
  return level
}

export function bridgePlanks() {
  return planks
}

export function bridgeLocked() {
  return locked
}

export function setBridgeState(nextLevel: number, nextPlanks: number, nextLocked: number) {
  level = nextLevel
  planks = nextPlanks
  locked = nextLocked
}
