// src/helpers.ts
import safeGet from 'just-safe-get'
import { logger } from './logs'

export const verifyNumberType = (target: unknown) => {
  const targetType = typeof target
  const isNumberType = targetType === 'number'
  const isNumber = !Number.isNaN(target)
  const isNotNaN = isNumber && isNumberType
  return isNumberType && isNotNaN
}

export const getTypeChecks = (target: unknown) => {
  const results = {} as any

  const targetType = typeof target
  results.isTruthy = !!target
  results.isBoolean = targetType === 'boolean'
  results.isNull = target === null
  results.isUndefined = target === undefined
  results.isNumber = verifyNumberType(target)
  results.isDate = target instanceof Date
  results.isRegex = target instanceof RegExp
  const isObjectType = typeof target === 'object'
  const prototype = Object.getPrototypeOf(target)
  const isPrototypeNull = prototype === null
  const isObjectPrototype = prototype === Object.prototype
  const isPrototypeObjectLike = isObjectPrototype || isPrototypeNull
  results.isObject = isObjectType && isPrototypeObjectLike

  return results
}

export const verifyPlainObject = (target: unknown) => {
  const isObjectType = typeof target === 'object'
  const isTruthy = !!target
  if (!isTruthy) return false
  if (!isObjectType) return false

  const isArray = Array.isArray(target)
  if (isArray) return false

  const isDate = target instanceof Date
  const isRegex = target instanceof RegExp
  if (isDate) return false
  if (isRegex) return false

  const prototype = Object.getPrototypeOf(target)
  const isPrototypeNull = prototype === null
  const isObjectPrototype = prototype === Object.prototype
  return isObjectPrototype || isPrototypeNull
}

export const get = (target: any, key: string) => {
  // const targetType = typeof target
  // const isArray = Array.isArray(target)
  // const isObject = !isArray && targetType === 'object'
  // const isInvalidTarget = !isArray && !isObject
  // if (isInvalidTarget) logger.errors.invalidGetTarget({ target, key, targetType })
  return safeGet(target, key)
}

export const toString = (value: string | number) => {
  const isNumber = typeof value === 'number'
  const isString = typeof value === 'string'
  const isFloat = isNumber && !Number.isInteger(value)

  if (isFloat) return
  if (isNumber) return String(value)
  if (isString) return value
  logger.errors.toStringConversion({ value })
  return value
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
