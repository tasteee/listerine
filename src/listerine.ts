import { FILTER_KEYS } from './constants'
import { filters } from './filters'

export function listerine<DataT = any>(target: DataT[]) {
  function prepareQueryTests(queryOptions: QueryOptionsT): TestT<DataT>[] {
    const tests: TestT<DataT>[] = []

    for (const [key, value] of Object.entries(queryOptions)) {
      const isFilterOptions = key.endsWith('$')
      const isDirectMatch = !key.endsWith('$')
      if (isDirectMatch) tests.push(filters.$equals(key, value))

      if (isFilterOptions) {
        const actualKey = key.slice(0, -1) as string
        const filterOptions = value as Record<string, any>

        for (const key in filterOptions) {
          const filterKey = key as keyof typeof filters
          const filterValue = filterOptions[key]
          if (!FILTER_KEYS.includes(key)) throw new Error(`Invalid filter name: ${key}`)
          tests.push(filters[filterKey](actualKey, filterValue))
        }
      }
    }

    return tests
  }

  function query(queryOptions: QueryOptionsT) {
    const tests = prepareQueryTests(queryOptions)
    const filtered = target.filter((item) => tests.every((test) => test(item)))
    return filtered
  }

  return {
    query,
  }
}
