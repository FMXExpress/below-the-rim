// The authoritative bridge progress lives on the server; this mirrors the latest
// synced values so collision (scene.ts) and rendering (club-app.ts) read one source.
let planks = 0
let locked = 0

export function bridgePlanks() {
  return planks
}

export function bridgeLocked() {
  return locked
}

export function setBridgeState(nextPlanks: number, nextLocked: number) {
  planks = nextPlanks
  locked = nextLocked
}
