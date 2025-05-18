import { FILTER_KEYS } from './constants'
import { filters } from './filters'
import { invalidFilterKey, validFilterKeys } from './logs'

// Define proper types for the package
type QueryOptionsT = Record<string, any>
type TestT<DataT> = (item: DataT) => boolean
type FilterKeyT = keyof typeof filters

const errors = {
  orRequiresArray(query: any) {
    const message = '[listerine] $or operator requires an array of conditions'
    const errorLog = { message, query }
    console.error(errorLog)
    return new Error(message)
  },

  andRequiresArray(query: any) {
    const message = '[listerine] $and operator requires an array of conditions'
    const errorLog = { message, query }
    console.error(errorLog)
    return new Error(message)
  },

  invalidFilterKey(query: any, filterKey: string) {
    const message = `[listerine] invalid filter key used: ${filterKey}. Valid filter keys: ${validFilterKeys}`
    const errorLog = { message, query, filterKey }
    console.error(errorLog)
    return new Error(message)
  },
}

export function listerine<DataT extends Object = any>(data: DataT[]) {
  type KeyT = keyof DataT

  function prepareQueryTests(queryOptions: QueryOptionsT, prefix: string = ''): TestT<DataT>[] {
    if ('$or' in queryOptions) {
      const orConditions = queryOptions.$or as QueryOptionsT[]
      const isOrArry = Array.isArray(orConditions)
      if (!isOrArry) throw errors.orRequiresArray(queryOptions)

      // If any condition passes, the OR condition passes
      const test = (item: DataT) => {
        return orConditions.some((condition) => {
          const tests = prepareQueryTests(condition)
          return tests.every((test) => test(item))
        })
      }

      // Return a single test that handles $or logic.
      return [test]
    }

    if ('$and' in queryOptions) {
      const andConditions = queryOptions.$and as QueryOptionsT[]
      const isAndArray = Array.isArray(andConditions)
      if (!isAndArray) throw errors.andRequiresArray(queryOptions)

      // All conditions must pass for the AND condition to pass
      const test = (item: DataT) => {
        return andConditions.every((condition) => {
          const tests = prepareQueryTests(condition)
          return tests.every((test) => test(item))
        })
      }

      // Return a single test that handles $or logic.
      return [test]
    }

    // Process standard conditions (non-logical operators)
    const tests: TestT<DataT>[] = []

    for (const [key, value] of Object.entries(queryOptions)) {
      // Skip logical operators (we handled them above)
      if (key === '$or' || key === '$and') continue

      // Check if value is a nested object (not null, not array, and not a primitive)
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !key.endsWith('$')) {
        // Recursively process nested object with updated prefix
        const nestedPrefix = prefix ? `${prefix}.${key}` : key
        const nestedTests = prepareQueryTests(value, nestedPrefix)
        tests.push(...nestedTests)
        continue
      }

      const isFilterOptions = key.endsWith('$')
      const actualKey = isFilterOptions ? `${prefix ? prefix + '.' : ''}${key.slice(0, -1)}` : `${prefix ? prefix + '.' : ''}${key}`

      if (!isFilterOptions) {
        tests.push(filters.$equals(actualKey, value))
      } else {
        const filterOptions = value as Record<string, any>

        for (const filterKey in filterOptions) {
          const filterValue = filterOptions[filterKey]
          const isValidFilterKey = FILTER_KEYS.includes(filterKey)
          if (!isValidFilterKey) throw errors.invalidFilterKey(queryOptions, filterKey)
          tests.push(filters[filterKey as FilterKeyT](actualKey, filterValue))
        }
      }
    }

    return tests
  }

  // Properly type the sort function to return a number as required by Array.sort()
  type SortFunctionT = (a: DataT, b: DataT) => number

  // Define the sort options with correct properties
  type SortOptionsT = {
    key: keyof DataT
    direction: 'ascending' | 'descending'
  }

  // Union type for the sort argument
  type SortArgT = SortFunctionT | SortOptionsT

  function sort(options: SortArgT) {
    const isFunction = typeof options === 'function'

    if (isFunction) {
      const sorter = options as SortFunctionT
      const sortedData = [...data].sort(sorter)
      return listerine(sortedData)
    }

    const sortOptions = options as SortOptionsT
    const sortedData = [...data].sort((a, b) => {
      const key = sortOptions.key
      const aValue = a[key]
      const bValue = b[key]
      const isStringA = typeof aValue === 'string'
      const isStringB = typeof bValue === 'string'
      const isAscending = sortOptions.direction === 'ascending'

      // Handle different data types
      if (isStringA && isStringB) {
        return isAscending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      // For numbers and other comparable types
      if (aValue < bValue) return isAscending ? -1 : 1
      if (aValue > bValue) return isAscending ? 1 : -1
      return 0
    })

    return listerine(sortedData)
  }

  type SelectorFunctionT = (item: DataT) => any

  function select(arg: KeyT[] | SelectorFunctionT) {
    const isSelectorFunction = typeof arg === 'function'
    const isSelectorArray = Array.isArray(arg)

    if (isSelectorArray) {
      const keys = arg as KeyT[]

      const dataWithSelectedKeys = data.map((item: DataT) => {
        return keys.reduce((final, key: KeyT) => {
          if (item.hasOwnProperty(key)) final[key] = item[key]
          return final
        }, {} as Partial<DataT>) as DataT
      })

      return listerine(dataWithSelectedKeys)
    }

    if (isSelectorFunction) {
      const selector = arg as SelectorFunctionT

      const selectedData = data.map((item: DataT) => {
        return selector(item)
      })

      return listerine(selectedData)
    }
  }

  function query(queryOptions: QueryOptionsT) {
    const tests = prepareQueryTests(queryOptions)
    const filtered = data.filter((item) => tests.every((test) => test(item)))
    return listerine(filtered)
  }

  return {
    data,
    sort,
    select,
    query,
  }
}
