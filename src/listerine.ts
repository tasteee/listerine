import safeGet from 'just-safe-get'
import { logger } from './logger'

// TODO: Beef up QueryT to give the dev
// type safety and hints when building query configs.
// For example, collection.find({ isActive: true })
// should make TS say "HEY THAT COLLECTION'S TYPE"
// doesnt have isActive property... or { age$: { $equals: 25 } }
// would alert the dev if the collection's data type did
// not have age property or if age is not a number...

export type QueryT = Record<string, any>
export type TestT<DataT> = (item: DataT) => boolean
export type FilterKeyT = keyof typeof filters
export type RecordWithIdT = Record<'id', string>

const getValue = (target: any, key: string) => {
  return safeGet(target, key)
}

const isSubsetOf = (subset: any[], superset: any[]): boolean => {
  return subset.every((element) => superset.includes(element))
}

const isSupersetOf = (target: any[], values: any[]): boolean => {
  return values.every((value) => target.includes(value))
}

const isEqual = (a: any, b: any): boolean => {
  if (a === b) return true

  // If one is null/undefined but not both (we already checked a === b)
  if (a === null || b === null || a === undefined || b === undefined) return false

  const isArrayA = Array.isArray(a)
  const isArrayB = Array.isArray(b)

  // Handle arrays
  if (isArrayA && isArrayB) {
    if (a.length !== b.length) return false
    return (a as any[]).every((value, index) => {
      return isEqual(value, (b as any[])[index])
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

const $matches = <DataT>(key: string, target: string): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = getValue(item, key)
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
    const itemValue = getValue(item, key)
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
    const itemValue = getValue(item, key)
    // Check if the item's value is one of the values in the array
    return values.some((value) => isEqual(itemValue, value))
  }
}

// 1. check to see if item[key] (array) is a subset of values array.
// 2. check to see if item[key] (single value) is in values array.
const $isIn = <DataT>(key: string, values: any[]): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = getValue(item, key)

    // If itemValue is not an array, check if it's included in values
    if (!Array.isArray(itemValue)) {
      return values.includes(itemValue)
    }

    // If itemValue is an array, check if it's a subset of values
    // (all elements in itemValue are present in values)
    const passes = isSubsetOf(itemValue, values)
    return passes
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
    const itemValue = getValue(item, key)
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
    const itemValue = getValue(item, key)
    return typeof itemValue === 'number' && itemValue > value
  }
}

const $isLessThan = <DataT>(key: string, value: number): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = getValue(item, key)
    return typeof itemValue === 'number' && itemValue < value
  }
}

// 1. check to see if item[key] (number) is greater than or equal to value (number)
const $isGreaterThanOrEqualTo = <DataT>(key: string, value: number): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = getValue(item, key)
    const isItemValueNumber = typeof itemValue === 'number'
    if (!isItemValueNumber) return false
    return itemValue >= value
  }
}

const $isLessThanOrEqualTo = <DataT>(key: string, value: number): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = getValue(item, key)
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
    const itemValue = getValue(item, key)
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
    const itemValue = getValue(item, key)
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
    const itemValue = getValue(item, key)
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
    const itemValue = getValue(item, key)
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
    const itemValue = getValue(item, key)
    const isItemValueString = typeof itemValue === 'string'
    const isValueString = typeof value === 'string'

    if (isItemValueString && isValueString) return itemValue.includes(String(value))

    const isItemValueArray = Array.isArray(itemValue)

    if (isItemValueArray) {
      const isValueArray = Array.isArray(value)

      if (isValueArray) {
        // Check if itemValue contains ALL values in the value array
        return value.every((valueItem) => itemValue.includes(valueItem))
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
    const itemValue = getValue(item, key)
    const isItemValueString = typeof itemValue === 'string'
    const isValueString = typeof value === 'string'

    if (isItemValueString && isValueString) return !itemValue.includes(String(value))

    const isItemValueArray = Array.isArray(itemValue)

    if (isItemValueArray) {
      const isValueArray = Array.isArray(value)

      if (isValueArray) {
        // Check if itemValue does not contain ANY values in the value array
        return !value.some((valueItem) => itemValue.includes(valueItem))
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
    const itemValue = getValue(item, key)

    if (!Array.isArray(itemValue)) return false

    return values.every((searchItem) => itemValue.some((item) => isEqual(item, searchItem)))
  }
}

const $containsSome = <DataT>(key: string, values: any[]): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = getValue(item, key)

    if (!Array.isArray(itemValue)) return false

    return values.some((searchItem) => itemValue.some((item) => isEqual(item, searchItem)))
  }
}

// If item[key] is an array and value is primitive, check if item[key][0] === value
// If item[key] is an array and value is an array, check if item[key] starts with values
// If item[key] is an array and value is an object, check if item[key][0] equals value
const $startsWith = <DataT>(key: string, value: any): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = getValue(item, key)
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
    const itemValue = getValue(item, key)

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
        return value.every((valueItem, index) => isEqual(valueItem, itemValue[offset + index]))
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
    const itemValue = getValue(item, key)
    return (typeof itemValue === 'string' || Array.isArray(itemValue)) && itemValue.length > length
  }
}

const $isShorterThan = <DataT>(key: string, length: number): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = getValue(item, key)
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
    const itemValue = getValue(item, key)
    const isUndefined = itemValue === undefined
    const isNull = itemValue === null

    if (value === true) return !isUndefined && !isNull
    if (value === false) return isUndefined || isNull

    return !isUndefined && !isNull
  }
}

const $isEmpty = <DataT>(key: string, value: any): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = getValue(item, key)

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

const $isBetween = <DataT>(key: string, [minimum, maximum]: [number, number]): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = getValue(item, key)
    return typeof itemValue === 'number' && itemValue >= minimum && itemValue <= maximum
  }
}

const $isNotBetween = <DataT>(key: string, [minimum, maximum]: [number, number]): TestT<DataT> => {
  return (item: DataT) => !$isBetween(key, [minimum, maximum])(item)
}

const $doesNotExist = <DataT>(key: string, value: any): TestT<DataT> => {
  return (item: DataT) => {
    const itemValue = getValue(item, key)
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
  const isArray = Array.isArray(values)
  if (!isArray) console.error('[listerine]non-array passed to $isSubsetOf', { [key]: values })

  return (item: DataT) => {
    const itemValue = getValue(item, key)
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
  const isArray = Array.isArray(values)
  if (!isArray) console.error('[listerine]non-array passed to $isSupersetOf', { [key]: values })

  return (item: DataT) => {
    const itemValue = getValue(item, key)
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

const filters = {
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
const LOGICAL_OPERATOR_KEYS = ['$or', '$and']

const LOGICAL_OPERATOR_CONFIGS = {
  or: {
    optionsKey: '$or',
    testMethodKey: 'some',
    arrayError: logger.errors.orRequiresArray,
  },
  and: {
    optionsKey: '$and',
    testMethodKey: 'every',
    arrayError: logger.errors.andRequiresArray,
  },
}

export const listerine = <DataT extends RecordWithIdT>(data: DataT[]) => {
  const createLogicalOperatorHandler = (operatorKey: 'or' | 'and') => {
    const config = LOGICAL_OPERATOR_CONFIGS[operatorKey]
    const testMethodKey = config.testMethodKey as 'some' | 'every'

    return (queryOptions: QueryT) => {
      const conditions = queryOptions[config.optionsKey] as QueryT[]
      const isArray = Array.isArray(conditions)

      if (!isArray) throw config.arrayError(queryOptions)

      const test = (item: DataT) => {
        return conditions[testMethodKey]((condition) => {
          // Recursively handle nested conditions.
          const tests = prepareQueryTests(condition)
          return tests.every((currentTest) => currentTest(item))
        })
      }

      return [test]
    }
  }

  const handleOperatorOr = createLogicalOperatorHandler('or')
  const handleOperatorAnd = createLogicalOperatorHandler('and')

  const prepareQueryTests = (queryOptions: QueryT, prefix: string = ''): TestT<DataT>[] => {
    const tests: TestT<DataT>[] = []
    const hasOperatorOr = '$or' in queryOptions
    const hasOperatorAnd = '$and' in queryOptions
    const hasBothOperators = hasOperatorOr && hasOperatorAnd

    // Handle logical operators at the top level.
    if (hasBothOperators) {
      // If both $or and $and exist at the same level, treat them as separate conditions
      // This creates an implicit AND between the $or and $and operations
      const orTests = handleOperatorOr(queryOptions)
      const andTests = handleOperatorAnd(queryOptions)
      tests.push(...orTests, ...andTests)
    } else if (hasOperatorOr) {
      return handleOperatorOr(queryOptions)
    } else if (hasOperatorAnd) {
      return handleOperatorAnd(queryOptions)
    }

    const entries = Object.entries(queryOptions)

    // Handle non-logical operators
    for (const [key, value] of entries) {
      // Skip logical operators (handled above)
      if (LOGICAL_OPERATOR_KEYS.includes(key)) continue

      const isValueNull = value === null
      const isValueArray = Array.isArray(value)
      const isValueObject = typeof value === 'object'
      const keyIndicatesFilter = key.endsWith('$')

      // Check if value is a nested object and, if so,
      // recursively process nested object with updated prefix
      if (!isValueNull && !keyIndicatesFilter && !isValueArray && isValueObject) {
        const nestedPrefix = prefix ? `${prefix}.${key}` : key
        const nestedTests = prepareQueryTests(value, nestedPrefix)
        tests.push(...nestedTests)
        continue
      }

      const getFixedFilterKey = () => `${prefix ? prefix + '.' : ''}${key.slice(0, -1)}`
      const getStandardKey = () => `${prefix ? prefix + '.' : ''}${key}`
      const actualKey = keyIndicatesFilter ? getFixedFilterKey() : getStandardKey()

      if (!keyIndicatesFilter) {
        tests.push(filters.$equals(actualKey, value))
        continue
      }

      const filterOptions = value as Record<string, any>
      for (const filterKey in filterOptions) {
        const filterValue = filterOptions[filterKey]
        const isValidFilterKey = FILTER_KEYS.includes(filterKey)

        if (!isValidFilterKey) {
          throw logger.errors.invalidFilterKey({ queryOptions, filterKey })
        }

        tests.push(filters[filterKey as FilterKeyT](actualKey, filterValue))
      }
    }

    return tests
  }

  const getDocumentsThatPass = (tests: TestT<DataT>[]) => {
    return data.filter((item) => tests.every((test) => test(item)))
  }

  const getDocumentsWithIds = (ids: string[]) => {
    const idSet = new Set(ids)
    const documents = [] as DataT[]

    for (const document of data) {
      const isMatch = idSet.has(document.id)
      if (isMatch) documents.push(document)
      if (documents.length === ids.length) break
    }

    return documents
  }

  const find = (query: QueryT): DataT[] => {
    const tests = prepareQueryTests(query)
    const documents = getDocumentsThatPass(tests)
    return documents
  }

  const findById = (id: string): DataT => {
    const documents = getDocumentsWithIds([id])
    return documents[0]
  }

  const findByIds = (ids: string[]): DataT[] => {
    const documents = getDocumentsWithIds(ids)
    return documents
  }

  const findOne = (query: QueryT): DataT => {
    const tests = prepareQueryTests(query)
    const documents = getDocumentsThatPass(tests)
    return documents[0]
  }

  return {
    find,
    findById,
    findByIds,
    findOne,
  }
}
