import { reserveFloats } from './character-geometry.ts'
import type { VertexWriter } from './character-geometry.ts'
import { addBox } from './geometry.ts'
import {
  bridgeCenterX,
  bridgeDeckY,
  bridgeHalfWidth,
  bridgeMilestone,
  bridgePlankDepth,
  bridgeRimZ,
  maxBridgePlanks,
} from './scene-data.ts'
import type { Vec3, Vertex } from './types.ts'

const woodColor: Vec3 = [0.36, 0.22, 0.1]
const woodDark: Vec3 = [0.24, 0.14, 0.06]
const woodPost: Vec3 = [0.28, 0.17, 0.07]
const ropeColor: Vec3 = [0.5, 0.42, 0.24]
const enemyBody: Vec3 = [0.05, 0.04, 0.07]
const enemyEye: Vec3 = [1, 0.16, 0.72]
const enemyClimbDepth = 5
const boxVertexCount = 36
const boxFloats = boxVertexCount * 11

export function buildBridgeVertices(planks: number, locked: number): Vertex[] {
  const target: Vertex[] = []
  const halfWidth = bridgeHalfWidth

  for (let i = 0; i < planks; i++) {
    const z = bridgeRimZ + (i + 0.5) * bridgePlankDepth
    const deck = i < locked ? woodDark : woodColor

    addBox(target, bridgeCenterX, bridgeDeckY, z, halfWidth * 2, 0.12, bridgePlankDepth * 0.86, deck, 0)
    addBox(target, bridgeCenterX - halfWidth, bridgeDeckY + 0.42, z, 0.08, 0.08, bridgePlankDepth, ropeColor, 0)
    addBox(target, bridgeCenterX + halfWidth, bridgeDeckY + 0.42, z, 0.08, 0.08, bridgePlankDepth, ropeColor, 0)
  }

  for (const z of postSeams(planks)) {
    addBox(target, bridgeCenterX - halfWidth, bridgeDeckY + 0.5, z, 0.12, 1, 0.12, woodPost, 0)
    addBox(target, bridgeCenterX + halfWidth, bridgeDeckY + 0.5, z, 0.12, 1, 0.12, woodPost, 0)
  }

  return target
}

// Anchor posts at the rim, at each locked milestone seam, and at the working tip.
function postSeams(planks: number): number[] {
  const seams = [bridgeRimZ]

  for (let m = bridgeMilestone; m <= planks; m += bridgeMilestone) {
    seams.push(bridgeRimZ + m * bridgePlankDepth)
  }
  if (planks > 0) {
    const tip = bridgeRimZ + planks * bridgePlankDepth

    if (!seams.includes(tip)) {
      seams.push(tip)
    }
  }

  return seams
}

export type BridgeEnemy = {
  side: number
  offset: number
  rise: number
  speed: number
  gnaw: number
}

// Cliff-dwellers climb out of the mist at the working tip whenever there are
// unlocked planks to tear down. They are decoration driven by the shared state;
// the actual teardown is decided by the server (and shown when the count drops).
export function createBridgeEnemies() {
  const enemies: BridgeEnemy[] = []

  function update(delta: number, planks: number, locked: number) {
    const vulnerable = planks > locked && planks < maxBridgePlanks
    const wanted = vulnerable ? Math.min(planks - locked, 4) : 0

    while (enemies.length < wanted) {
      enemies.push({
        side: enemies.length % 2 === 0 ? -1 : 1,
        offset: (Math.random() - 0.5) * bridgePlankDepth,
        rise: 0,
        speed: 0.45 + Math.random() * 0.4,
        gnaw: Math.random() * Math.PI * 2,
      })
    }
    while (enemies.length > wanted) {
      enemies.pop()
    }

    for (const enemy of enemies) {
      enemy.rise = Math.min(1, enemy.rise + enemy.speed * delta)
      enemy.gnaw += delta * 9
    }
  }

  return { enemies, update }
}

export function writeBridgeEnemiesGeometry(target: VertexWriter, enemies: BridgeEnemy[], frontZ: number) {
  reserveFloats(target, enemies.length * boxFloats * 2)

  const climbBottom = bridgeDeckY - enemyClimbDepth

  for (const enemy of enemies) {
    const z = frontZ - 0.25 + enemy.offset
    const x = bridgeCenterX + enemy.side * (bridgeHalfWidth + 0.12)
    const y = climbBottom + (bridgeDeckY - climbBottom) * enemy.rise
    const shake = enemy.rise >= 1 ? Math.sin(enemy.gnaw) * 0.05 : 0

    writeBox(target, x, y + 0.3 + shake, z, 0.34, 0.5, 0.34, enemyBody, 0)
    writeBox(target, x - enemy.side * 0.1, y + 0.46 + shake, z, 0.16, 0.08, 0.2, enemyEye, 3)
  }
}

function writeBox(
  writer: VertexWriter,
  cx: number,
  cy: number,
  cz: number,
  width: number,
  height: number,
  depth: number,
  color: Vec3,
  glow: number,
) {
  const data = writer.data
  const x0 = cx - width / 2
  const x1 = cx + width / 2
  const y0 = cy - height / 2
  const y1 = cy + height / 2
  const z0 = cz - depth / 2
  const z1 = cz + depth / 2
  let offset = writer.length

  function vertex(x: number, y: number, z: number) {
    data[offset] = x
    data[offset + 1] = y
    data[offset + 2] = z
    data[offset + 3] = color[0]
    data[offset + 4] = color[1]
    data[offset + 5] = color[2]
    data[offset + 6] = glow
    data[offset + 7] = 0
    data[offset + 8] = 0
    data[offset + 9] = 0
    data[offset + 10] = 0
    offset += 11
  }

  function quad(
    ax: number, ay: number, az: number,
    bx: number, by: number, bz: number,
    cx2: number, cy2: number, cz2: number,
    dx: number, dy: number, dz: number,
  ) {
    vertex(ax, ay, az)
    vertex(bx, by, bz)
    vertex(cx2, cy2, cz2)
    vertex(ax, ay, az)
    vertex(cx2, cy2, cz2)
    vertex(dx, dy, dz)
  }

  quad(x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1)
  quad(x1, y0, z0, x0, y0, z0, x0, y1, z0, x1, y1, z0)
  quad(x0, y0, z0, x0, y0, z1, x0, y1, z1, x0, y1, z0)
  quad(x1, y0, z1, x1, y0, z0, x1, y1, z0, x1, y1, z1)
  quad(x0, y1, z1, x1, y1, z1, x1, y1, z0, x0, y1, z0)
  quad(x0, y0, z0, x1, y0, z0, x1, y0, z1, x0, y0, z1)

  writer.length = offset
}
