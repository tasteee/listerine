// src/filters.ts
import { get, isEqual, isSubsetOf, isSupersetOf } from './helpers'
import { logger } from './logs'
import { TestT } from './global'

const $matches = <DataT>(key: string, target: string): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    return itemValue === target
  }
}

const $is = <DataT>(key: string, value: any): TestT<DataT> => {
  return (item: DataT) => $matches(key, value)(item)
}

const $isNot = <DataT>(key: string, value: any): TestT<DataT> => {
  return (item: DataT) => !$matches(key, value)(item)
}

const $equals = <DataT>(key: string, value: any): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    return isEqual(itemValue, value)
  }
}

const $doesNotEqual = <DataT>(key: string, value: any): TestT<DataT> => {
  return (item: DataT) => !$equals(key, value)(item)
}

// ex data: [{ food: 'burger' }, { food: 'pizza' }, { food: 'salad' }]
// { food$: { $isOneOf: ['burger', 'pizza'] } }
// would match: [{ food: 'burger' }, { food: 'pizza' }]
const $isOneOf = <DataT>(key: string, values: any[]): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    // Check if the item's value is one of the values in the array
    return values.some((val) => isEqual(itemValue, val))
  }
}

// 1. check to see if item[key] (array)is a subset of values array.
// 2. check to see if item[key] (single value) is in values array.
const $isIn = <DataT>(key: string, values: any[]): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)

    // If itemValue is not an array, check if it's included in values
    if (!Array.isArray(itemValue)) {
      return values.includes(itemValue)
    }

    // If itemValue is an array, check if it's a subset of values
    // (all elements in itemValue are present in values)
    return isSubsetOf(itemValue, values)
  }
}

// 1. check to see if item[key] (array) is not a subset of values array.
// 2. check to see if item[key] (single value) is not in values array.
const $isNotIn = <DataT>(key: string, values: any[]): TestT<DataT> => {
  return (item: DataT) => !$isIn(key, values)(item)
}

// 1. check to see if item[key] (single value) is not inside values array.
const $isNotOneOf = <DataT>(key: string, values: any[]): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    const isItemValueArray = Array.isArray(itemValue)

    if (isItemValueArray) {
      const warningData = { item, itemValue, key, $isNotOneOf: values }
      logger.warnings.arrayOneOfArray(warningData)
      return !$isOneOf(key, values)(item)
    }

    return !values.includes(itemValue)
  }
}

const $doesNotMatch = <DataT>(key: string, target: string): TestT<DataT> => {
  return (item: DataT) => !$matches(key, target)(item)
}

const $isGreaterThan = <DataT>(key: string, value: number): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    return typeof itemValue === 'number' && itemValue > value
  }
}

const $isLessThan = <DataT>(key: string, value: number): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    return typeof itemValue === 'number' && itemValue < value
  }
}

// 1. check to see if item[key] (number) is greater than or equal to value (number)
const $isGreaterThanOrEqualTo = <DataT>(key: string, value: number): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    const isItemValueNumber = typeof itemValue === 'number'

    if (!isItemValueNumber) {
      const warningData = { item, itemValue, key, $isGreaterThanOrEqualTovalue: value }
      logger.warnings.numericComparisonOnNonNumber(warningData)
      return false
    }

    return itemValue >= value
  }
}

const $isLessThanOrEqualTo = <DataT>(key: string, value: number): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    const isItemValueNumber = typeof itemValue === 'number'

    if (!isItemValueNumber) {
      const warningData = { item, itemValue, key, $isLessThanOrEqualTovalue: value }
      logger.warnings.numericComparisonOnNonNumber(warningData)
      return false
    }

    return itemValue <= value
  }
}

/**
 * Checks if the value at item[key] is not greater than the value
 */
const $isNotGreaterThan = <DataT>(key: string, value: number): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    const isItemValueNumber = typeof itemValue === 'number'

    if (!isItemValueNumber) {
      const warningData = { item, itemValue, key, $isNotGreaterThanvalue: value }
      logger.warnings.numericComparisonOnNonNumber(warningData)
      return false
    }

    return itemValue <= value
  }
}

const $isNotLessThan = <DataT>(key: string, value: number): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    const isItemValueNumber = typeof itemValue === 'number'

    if (!isItemValueNumber) {
      const warningData = { item, itemValue, key, $isNotLessThanvalue: value }
      logger.warnings.numericComparisonOnNonNumber(warningData)
      return false
    }

    return itemValue >= value
  }
}

const $isNotGreaterThanOrEqualTo = <DataT>(key: string, value: number): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    const isItemValueNumber = typeof itemValue === 'number'

    if (!isItemValueNumber) {
      const warningData = { item, itemValue, key, $isNotGreaterThanOrEqualTovalue: value }
      logger.warnings.numericComparisonOnNonNumber(warningData)
      return false
    }

    return itemValue !== value && itemValue < value
  }
}

const $isNotLessThanOrEqualTo = <DataT>(key: string, value: number): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    const isItemValueNumber = typeof itemValue === 'number'

    if (!isItemValueNumber) {
      const warningData = { item, itemValue, key, $isNotLessThanOrEqualTovalue: value }
      logger.warnings.numericComparisonOnNonNumber(warningData)
      return false
    }

    return itemValue !== value && itemValue > value
  }
}

// String and array content filters
// if item[key] is a string and value is a string, check if item[key] includes value
// if item[key] is an array and value is a primitive, check if item[key] includes value
// if item[key] is an array and value is an array, check if item[key] contains all of the values
const $contains = <DataT>(key: string, value: any): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    const isItemValueString = typeof itemValue === 'string'
    const isValueString = typeof value === 'string'

    if (isItemValueString && isValueString) return itemValue.includes(String(value))

    const isItemValueArray = Array.isArray(itemValue)
    if (isItemValueArray) {
      const isValueArray = Array.isArray(value)

      if (isValueArray) {
        // Check if itemValue contains ALL values in the value array
        return value.every((val) => itemValue.includes(val))
      } else {
        // If value is a primitive, check if it's in the array
        return itemValue.includes(value)
      }
    }

    return false
  }
}

// if item[key] is a string and value is a string, check if item[key] does not include value
// if item[key] is an array and value is a primitive, check if item[key] does not include value
// if item[key] is an array and value is an array, check if item[key] does not contain ANY of the values
// ex data: [{ tags: ['tall', 'strong'] }, { tags: ['strong', 'cute'] }, { tags: ['short', 'smart', 'cute', 'fast'] }]
// ex: { tags$: { $doesNotContain: 'cute' } }
// ex: { tags$: { $doesNotContain: ['cute', 'fast'] } }
const $doesNotContain = <DataT>(key: string, value: any): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    const isItemValueString = typeof itemValue === 'string'
    const isValueString = typeof value === 'string'

    if (isItemValueString && isValueString) return !itemValue.includes(String(value))

    const isItemValueArray = Array.isArray(itemValue)
    if (isItemValueArray) {
      const isValueArray = Array.isArray(value)

      if (isValueArray) {
        // Check if itemValue does not contain ANY values in the value array
        return !value.some((val) => itemValue.includes(val))
      } else {
        // If value is a primitive, check if it's not in the array
        return !itemValue.includes(value)
      }
    }

    return true
  }
}

const $containsAll = <DataT>(key: string, values: any[]): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    if (!Array.isArray(itemValue)) return false
    return values.every((searchItem) => itemValue.some((item) => isEqual(item, searchItem)))
  }
}

const $containsSome = <DataT>(key: string, values: any[]): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    if (!Array.isArray(itemValue)) return false
    return values.some((searchItem) => itemValue.some((item) => isEqual(item, searchItem)))
  }
}

// If item[key] is an array and value is primitive, check if item[key][0] === value
// If item[key] is an array and value is an array, check if item[key] starts with values
// If item[key] is an array and value is an object, check if item[key][0] equals value
const $startsWith = <DataT>(key: string, value: any): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    const isItemValueString = typeof itemValue === 'string'
    const isValueString = typeof value === 'string'
    if (isItemValueString && isValueString) return itemValue.startsWith(value)

    const isItemValueArray = Array.isArray(itemValue)
    const isValueArray = Array.isArray(value)
    const isValueBoolean = typeof value === 'boolean'
    const isValueNumber = typeof value === 'number'
    const isValuePrimitive = isValueBoolean || isValueNumber || isValueString

    if (isItemValueArray) {
      if (isValueArray) {
        const valueLength = value.length
        const startingItemValueItems = itemValue.slice(0, valueLength)
        return value.every((item, index) => item === startingItemValueItems[index])
      }

      if (isValuePrimitive) {
        const firstItemValueItem = itemValue[0]
        return firstItemValueItem === value
      }
    }

    return false
  }
}

const $endsWith = <DataT>(key: string, value: any): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)

    if (typeof itemValue === 'string' && typeof value === 'string') {
      return itemValue.endsWith(value)
    }

    if (Array.isArray(itemValue)) {
      if (typeof value === 'string') {
        // Check if the last element of the array equals the string value
        return itemValue.length > 0 && itemValue[itemValue.length - 1] === value
      }

      if (Array.isArray(value)) {
        if (value.length > itemValue.length) return false

        const offset = itemValue.length - value.length
        return value.every((val, idx) => isEqual(val, itemValue[offset + idx]))
      }
    }

    return false
  }
}

const $doesNotStartWith = <DataT>(key: string, value: any): TestT<DataT> => {
  return (item: DataT) => !$startsWith(key, value)(item)
}

const $doesNotEndWith = <DataT>(key: string, value: any): TestT<DataT> => {
  return (item: DataT) => !$endsWith(key, value)(item)
}

const $isLongerThan = <DataT>(key: string, length: number): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    return (typeof itemValue === 'string' || Array.isArray(itemValue)) && itemValue.length > length
  }
}

const $isShorterThan = <DataT>(key: string, length: number): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    return (typeof itemValue === 'string' || Array.isArray(itemValue)) && itemValue.length < length
  }
}

const $isNotLongerThan = <DataT>(key: string, length: number): TestT<DataT> => {
  return (item: DataT) => !$isLongerThan(key, length)(item)
}

const $isNotShorterThan = <DataT>(key: string, length: number): TestT<DataT> => {
  return (item: DataT) => !$isShorterThan(key, length)(item)
}

const $exists = <DataT>(key: string, value: any): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    const isUndefined = itemValue === undefined
    const isNull = itemValue === null
    if (value === true) return !isUndefined && !isNull
    if (value === false) return isUndefined || isNull
    return !isUndefined && !isNull
  }
}

const $isEmpty = <DataT>(key: string, value: any): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)

    // Handle null and undefined
    const isUndefined = itemValue === undefined
    const isNull = itemValue === null
    const isNullish = isUndefined || isNull

    if (isNullish) return value === true

    // Handle empty string
    const isEmptyString = itemValue === ''
    if (isEmptyString) return value === true

    // Handle empty array
    const isEmptyArray = Array.isArray(itemValue) && itemValue.length === 0
    if (isEmptyArray) return value === true

    // Handle empty object
    const isEmptyObject = typeof itemValue === 'object' && !Array.isArray(itemValue) && Object.keys(itemValue).length === 0
    if (isEmptyObject) return value === true

    // If we get here, the value is NOT empty
    return value === false
  }
}

const $isBetween = <DataT>(key: string, [min, max]: [number, number]): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    return typeof itemValue === 'number' && itemValue >= min && itemValue <= max
  }
}

const $isNotBetween = <DataT>(key: string, [min, max]: [number, number]): TestT<DataT> => {
  return (item: DataT) => !$isBetween(key, [min, max])(item)
}

const $doesNotExist = <DataT>(key: string, value: any): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    const isUndefined = itemValue === undefined
    const isNull = itemValue === null
    if (value === true) return isUndefined || isNull
    if (value === false) return !isUndefined && !isNull
    return isUndefined || isNull
  }
}

const $isNotEmpty = <DataT>(key: string, value: any): TestT<DataT> => {
  return (item: DataT) => !$isEmpty(key, value)(item)
}

const $isSubsetOf = <DataT>(key: string, values: any[]): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    const isItemValueString = typeof itemValue === 'string'

    if (isItemValueString) {
      const warningData = { item, itemValue, key, $isSupersetOf: values }
      logger.warnings.subsetOnArray(warningData)
      return false
    }

    const isItemValueArray = Array.isArray(itemValue)
    if (!isItemValueArray && !isItemValueString) return false
    return isSubsetOf(itemValue as any[], values)
  }
}

const $isSupersetOf = <DataT>(key: string, values: any[]): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = get(item, key)
    const isItemValueString = typeof itemValue === 'string'

    if (isItemValueString) {
      const warningData = { item, itemValue, key, $isSupersetOfvalues: values }
      logger.warnings.supersetOnArray(warningData)
      return false
    }

    const isItemValueArray = Array.isArray(itemValue)
    if (!isItemValueArray && !isItemValueString) return false
    return isSupersetOf(itemValue as any[], values)
  }
}

export const filters = {
  $is,
  $isNot,

  $isBetween,
  $isNotBetween,

  $equals,
  $doesNotEqual,

  $isIn,
  $isNotIn,
  $isSubsetOf,
  $isSupersetOf,

  $isOneOf,
  $isNotOneOf,

  $matches,
  $doesNotMatch,
  $isGreaterThan,
  $isLessThan,
  $isGreaterThanOrEqualTo,
  $isLessThanOrEqualTo,
  $isNotGreaterThan,
  $isNotLessThan,
  $isNotGreaterThanOrEqualTo,
  $isNotLessThanOrEqualTo,
  $contains,
  $containsAll,
  $containsSome,
  $doesNotContain,
  $startsWith,
  $endsWith,
  $doesNotStartWith,
  $doesNotEndWith,
  $isLongerThan,
  $isShorterThan,
  $isNotLongerThan,
  $isNotShorterThan,
  $exists,
  $isEmpty,
  $doesNotExist,
  $isNotEmpty,
}

export const FILTER_KEYS = Object.keys(filters)
