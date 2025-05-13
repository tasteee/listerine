// src/helpers.ts
import safeGet from 'just-safe-get'

export const get = (target: any, key: string) => {
  return safeGet(target, key)
}

export const isSubsetOf = (subset: any[], superset: any[]): boolean => {
  return subset.every((elem) => superset.includes(elem))
}

export const isSupersetOf = (target: any[], values: any[]): boolean => {
  return values.every((val) => target.includes(val))
}

export const isEqual = (a: any, b: any): boolean => {
  if (a === b) return true

  // If one is null/undefined but not both (we already checked a === b)
  if (a === null || b === null || a === undefined || b === undefined) return false

  const isArrayA = Array.isArray(a)
  const isArrayB = Array.isArray(b)

  // Handle arrays
  if (isArrayA && isArrayB) {
    if (a.length !== b.length) return false

    return (a as any[]).every((val, idx) => {
      return isEqual(val, (b as any[])[idx])
    })
  }

  // Handle objects (but not arrays, which we've already handled)
  const isObjectA = typeof a === 'object' && !isArrayA
  const isObjectB = typeof b === 'object' && !isArrayB

  if (isObjectA && isObjectB) {
    const keysA = Object.keys(a as object)
    const keysB = Object.keys(b as object)

    if (keysA.length !== keysB.length) return false

    return keysA.every((key) => {
      return isEqual((a as any)[key], (b as any)[key])
    })
  }

  // Different types or primitives that didn't match the === check above
  return false
}
