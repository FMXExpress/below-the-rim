const fps = 60
const shaderFramePeriod = fps * 120

export function frameAtTime(time: number) {
  return Math.floor(time * fps)
}

export function frameAtStamp(stamp: number) {
  return frameAtTime(stamp * 0.001)
}

export function shaderFrame(frame: number) {
  return frame % shaderFramePeriod
}
