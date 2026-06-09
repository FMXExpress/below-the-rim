export type TurnBasis = {
  cos: number
  sin: number
}

type CachedTurnBasis = TurnBasis & {
  turn: number
}

export function createObjectTurnBasisCache<T extends object>() {
  const cache = new WeakMap<T, CachedTurnBasis>()

  return function turnBasis(object: T, turn: number): TurnBasis {
    const cached = cache.get(object)

    if (cached?.turn === turn) {
      return cached
    }

    const next = {
      cos: Math.cos(turn),
      sin: Math.sin(turn),
      turn,
    }

    cache.set(object, next)

    return next
  }
}

export function createTurnBasisCache() {
  let cached: CachedTurnBasis = { cos: 1, sin: 0, turn: 0 }

  return function turnBasis(turn: number): TurnBasis {
    if (cached.turn === turn) {
      return cached
    }

    cached = {
      cos: Math.cos(turn),
      sin: Math.sin(turn),
      turn,
    }

    return cached
  }
}
