import { projectWallPointInto } from './projection.ts'
import type { ProjectedPoint, WallProjector } from './projection.ts'
import type { Vec3 } from './types.ts'

export function createChatUi(
  form: HTMLFormElement,
  input: HTMLInputElement,
  bubble: HTMLDivElement,
  position: Vec3,
) {
  let hideAt = 0
  let overlayX = Number.NaN
  let overlayY = Number.NaN
  const anchor: Vec3 = [0, 0, 0]
  const point: ProjectedPoint = { x: 0, y: 0 }

  return {
    open() {
      input.value = ''
      form.dataset.open = 'true'
      bubble.dataset.open = 'false'
      input.focus()
    },
    submit() {
      const text = input.value.trim()

      if (text) {
        bubble.textContent = text
        bubble.dataset.open = 'true'
        hideAt = performance.now() + 5000
      }

      form.dataset.open = 'false'
      input.blur()
    },
    update(projector: WallProjector, stamp: number) {
      if (form.dataset.open !== 'true' && bubble.dataset.open !== 'true') {
        return
      }

      anchor[0] = position[0]
      anchor[1] = position[1] + 1.05
      anchor[2] = position[2]
      projectWallPointInto(anchor, projector, point)
      const x = Math.round(point.x)
      const y = Math.round(point.y - 68)

      if (x !== overlayX || y !== overlayY) {
        overlayX = x
        overlayY = y
        form.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`
        bubble.style.transform = `translate(-50%, -100%) translate(${x}px, ${y - 8}px)`
      }

      if (bubble.dataset.open === 'true' && stamp > hideAt) {
        bubble.dataset.open = 'false'
      }
    },
  }
}
