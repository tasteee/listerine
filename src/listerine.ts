import { ObjectWithId, QueryOptionsT, TestT, FilterKeyT } from './global'
import { filters, FILTER_KEYS } from './filters'
import { logger } from './logs'
import get from 'just-safe-get'

type EnhancedDataT<DataT> = DataT[] & {
  first: DataT
  last: DataT
}

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

function createLogicalOperatorHandler(operatorKey: 'or' | 'and') {
  const config = LOGICAL_OPERATOR_CONFIGS[operatorKey]
  const testMethodKey = config.testMethodKey as 'some' | 'every'

  return <DataT>(queryOptions: QueryOptionsT) => {
    const conditions = queryOptions[config.optionsKey] as QueryOptionsT[]
    const isArray = Array.isArray(conditions)
    if (!isArray) throw config.arrayError(queryOptions)

    const test = (item: DataT) => {
      return conditions[testMethodKey]((condition) => {
        // Recursively handle nested conditions.
        const tests = prepareQueryTests<DataT>(condition)
        return tests.every((test) => test(item))
      })
    }

    return [test]
  }
}

const handleOperatorOr = createLogicalOperatorHandler('or')
const handleOperatorAnd = createLogicalOperatorHandler('and')

export function prepareQueryTests<DataT>(queryOptions: QueryOptionsT, prefix: string = ''): TestT<DataT>[] {
  const tests: TestT<DataT>[] = []
  const hasOperatorOr = '$or' in queryOptions
  const hasOperatorAnd = '$and' in queryOptions

  // Handle logical operators at the top level
  if (hasOperatorOr && hasOperatorAnd) {
    // If both $or and $and exist at the same level, treat them as separate conditions
    // This creates an implicit AND between the $or and $and operations
    const orTests = handleOperatorOr<DataT>(queryOptions)
    const andTests = handleOperatorAnd<DataT>(queryOptions)
    tests.push(...orTests, ...andTests)
  } else if (hasOperatorOr) {
    return handleOperatorOr<DataT>(queryOptions)
  } else if (hasOperatorAnd) {
    return handleOperatorAnd<DataT>(queryOptions)
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
      if (!isValidFilterKey) throw logger.errors.invalidFilterKey({ queryOptions, filterKey })
      tests.push(filters[filterKey as FilterKeyT](actualKey, filterValue))
    }
  }

  return tests
}

function createEnhancedData<DataT>(target: DataT[]): EnhancedDataT<DataT> {
  if (!target.hasOwnProperty('first')) {
    Object.defineProperty(target, 'first', {
      get() {
        const firstItem = this[0]
        return firstItem
      },
    })
  }

  if (!target.hasOwnProperty('last')) {
    Object.defineProperty(target, 'last', {
      get() {
        const lastIndex = this.length - 1
        const lastItem = this[lastIndex]
        return lastItem
      },
    })
  }

  return target as EnhancedDataT<DataT>
}

function checkIfNonArrayObject(target: any) {
  const isArray = Array.isArray(target)
  const isObject = typeof target === 'object'
  return !isArray && isObject
}

type OptionsT = {
  strict?: boolean
  idKey?: string
}

const DEFAULT_OPTIONS = { strict: false, idKey: 'id' }

function getOptions(configOptions: OptionsT) {
  const options = { ...DEFAULT_OPTIONS, ...configOptions }
  return options
}

export const listerine = <DataT extends ObjectWithId>(target: DataT[], configOptions?: OptionsT) => {
  const initialEnhancedData = createEnhancedData<DataT>([...target])
  const options = getOptions(configOptions || {})
  logger.strict = options.strict

  function getDocumentId(document: ObjectWithId) {
    return get(document, options.idKey)
  }

  type DataWithoutIdT = Omit<DataT, 'id'>
  type DataKeyT = keyof DataT
  type SortFunctionT = (a: DataT, b: DataT) => number
  type EnhancedDataListT = EnhancedDataT<DataT>
  type TestListT = TestT<DataT>[]
  type DataListT = DataT[]
  type PartialDataT = Partial<DataT>
  type PartialDataListT = Partial<DataT>[]

  type SortOptionsT = {
    key: keyof DataT
    direction?: 'ascending' | 'descending'
  }

  class ListerineCollection {
    private enhancedData: EnhancedDataListT = initialEnhancedData

    set data(newData: DataT[]) {
      this.enhancedData = createEnhancedData<DataT>(newData)
    }

    get data(): EnhancedDataListT {
      return this.enhancedData
    }

    private getSortedData = (key: DataKeyT, direction?: string) => {
      const data = this.data as DataT[]

      return data.toSorted((a: DataT, b: DataT) => {
        const aValue = a[key]
        const bValue = b[key]
        const isStringA = typeof aValue === 'string'
        const isStringB = typeof bValue === 'string'
        const isDescending = direction === 'descending'

        // Handle different data types
        if (isStringA && isStringB) {
          if (isDescending) return bValue.localeCompare(aValue)
          return aValue.localeCompare(bValue)
        }

        // For numbers and other comparable types
        if (aValue < bValue) return isDescending ? 1 : -1
        if (aValue > bValue) return isDescending ? -1 : 1
        return 0
      })
    }

    private sortByKey = (key: DataKeyT) => {
      const sortedData = this.getSortedData(key, 'ascending')
      this.data = sortedData
    }

    private sortByOptions = (options: SortOptionsT) => {
      const direction = options.direction || 'ascending'
      const sortedData = this.getSortedData(options.key, direction)
      this.data = sortedData
    }

    private sortByFunction = (comparer: SortFunctionT) => {
      const data = this.data as DataT[]
      const sortedData = data.sort(comparer)
      this.data = sortedData
    }

    // Perform a query using a query object.
    private queryByQuery = (queryOptions: QueryOptionsT) => {
      const tests = prepareQueryTests(queryOptions)
      return this.getDocumentsThatPass(tests)
    }

    // Remove a document that matches the given id.
    private removeById = (id: string) => {
      this.data = this.getDocumentsWithoutIds([id])
    }

    // Update this.data to remove all documents with ids
    // found in the provided ids array.
    private removeByIds = (ids: string[]) => {
      this.data = this.getDocumentsWithoutIds(ids)
    }

    // Get the ids from the array of objects and then
    // update this.data to remove all documents with
    // corresponding ids
    private removeByObjects = (items: ObjectWithId[]) => {
      const ids = items.map(getDocumentId)
      this.removeByIds(ids)
    }

    // When remove is called with an array, determine if
    // we need to remove multiple documents by primitive ids from
    // the input array or by ids found on objects in the input array.
    private removeByArray = (input: string[] | DataT[]) => {
      const isInputEmpty = input.length === 0
      if (isInputEmpty) return this

      const isFirstItemString = typeof input[0] === 'string'
      const isFirstItemObject = checkIfNonArrayObject(input[0])
      const isInputValid = isFirstItemObject || isFirstItemString

      if (!isInputValid) {
        logger.errors.removeWithArray({ input })
        return this
      }

      if (isFirstItemString) this.removeByIds(input as string[])
      if (isFirstItemObject) this.removeByObjects(input as DataT[])

      return this
    }

    // Remove all documents that are matched by a query object.
    private removeByQuery = (queryOptions: QueryOptionsT) => {
      const tests = prepareQueryTests(queryOptions)
      this.data = this.getDocumentsThatFail(tests)
    }

    // Return all documents that pass every test provided.
    private getDocumentsThatPass = (tests: TestListT) => {
      return this.data.filter((item) => tests.every((test) => test(item)))
    }

    // Return all documents that fail every test provided.
    // Used for filtering out all documents that PASS every
    // test provided to match documents to be removed.
    private getDocumentsThatFail = (tests: TestListT) => {
      return this.data.filter((item) => !tests.every((test) => test(item)))
    }

    private getDocumentsWithIds = (ids: string[]) => {
      if (ids.length <= 10) {
        const documents = []
        const idsCount = ids.length

        for (const document of this.data) {
          const documentId = getDocumentId(document)
          const isMatch = ids.includes(documentId)
          if (!isMatch) continue

          documents.push(document)
          const docsCount = documents.length
          const areAllFound = docsCount === idsCount
          if (areAllFound) break
        }

        return documents
      }

      // For larger data sets, use Set for O(1) lookups.
      const idSet = new Set(ids)
      const documents = []

      for (const document of this.data) {
        const documentId = getDocumentId(document)
        const isMatch = idSet.has(documentId)
        if (isMatch) documents.push(document)

        // Early bailout when we've found all requested documents
        if (documents.length === ids.length) break
      }

      return documents
    }

    private getDocumentsWithoutIds = (ids: string[]) => {
      if (ids.length <= 10) {
        const documents = []
        const totalDocuments = this.data.length
        const idsCount = ids.length
        const remainingDocsCount = totalDocuments - idsCount

        for (const document of this.data) {
          const documentId = getDocumentId(document)
          const isMatch = !ids.includes(documentId)
          if (!isMatch) continue

          documents.push(document)
          const docsCount = documents.length
          const areAllFound = docsCount === remainingDocsCount
          if (areAllFound) break
        }

        return documents
      }

      // For larger data sets, use Set for O(1) lookups.
      const idSet = new Set(ids)
      const documents = []

      for (const document of this.data) {
        const documentId = getDocumentId(document)
        const isMatch = !idSet.has(documentId)
        if (isMatch) documents.push(document)
      }

      return documents
    }

    // When inserting a new document(s), if no id is provided,
    // listerine generates and applies one.
    private getDocumentWithIdEnsured = (item: DataWithoutIdT | DataT) => {
      const itemId = getDocumentId(item as DataT)
      const isIdValid = typeof itemId === 'string'
      if (isIdValid) return item as DataT
      const id = crypto.randomUUID()
      const itemWithId = { ...item, [options.idKey]: id }
      return itemWithId as DataT
    }

    private insertMultiple = (items: DataWithoutIdT[] | DataT[]) => {
      const documents = items.map(this.getDocumentWithIdEnsured)
      this.data = [...this.data, ...documents]
    }

    private insertOne = (item: DataWithoutIdT | DataT) => {
      const document = this.getDocumentWithIdEnsured(item)
      this.data = [...this.data, document]
    }

    // collection.sort examples:
    // collection.sort('name') // ascending by default
    // collection.sort({ key: 'name' }) // ascending by default
    // collection.sort({ key: 'name', direction: 'descending' })
    // collection.sort((a, b) => a.name.localeCompare(b.name))
    sort = (options: SortFunctionT | SortOptionsT | string) => {
      const isString = typeof options === 'string'
      const isFunction = typeof options === 'function'
      const isObject = typeof options === 'object'

      if (isString) this.sortByKey(options as DataKeyT)
      if (isFunction) this.sortByFunction(options as SortFunctionT)
      if (isObject) this.sortByOptions(options)
      return this
    }

    // collection.insert examples:
    // collection.insert({ id: '123', name: 'hannah' })
    // collection.insert([{ id: '123', name: 'hannah' }, { id: '234', name: 'taylor' }])
    insert = (items: DataWithoutIdT | DataWithoutIdT[] | DataT | DataT[]) => {
      const isArray = Array.isArray(items)
      const isObject = !isArray && typeof items === 'object'

      if (isArray) this.insertMultiple(items)
      if (isObject) this.insertOne(items)
      return this
    }

    // collection.remove examples:
    // collection.remove('some-id')
    // collection.remove(['some-id', 'other-id'])
    // collection.remove([{ id: 'some-id', ...unused }])
    // collection.remove([{ id: 'some-id', ...unused }, { id: 'other-id', ...unused }])
    // collection.remove({ isActive: true })
    // collection.remove({ name$: { $startsWith: 'H' } })
    // collection.remove({ $and:  [...] })
    // collection.remove({ $or:  [...] })
    // collection.remove({ $or:  [{ $and: [...], age$: { $isBetween: [15, 35] } }] })
    remove = (queryOptions: QueryOptionsT | string | string[]) => {
      const isArray = Array.isArray(queryOptions)
      const isString = typeof queryOptions === 'string'
      const isObject = !isArray && typeof queryOptions === 'object'

      if (isString) this.removeById(queryOptions)
      if (isArray) this.removeByArray(queryOptions)
      if (isObject) this.removeByQuery(queryOptions)

      return this
    }

    private updateByArray = (array: PartialDataListT | DataListT) => {
      const newDocuments = [...this.data]
      const totalUpdatesCount = array.length
      let updatedCount = 0

      const updatesMap = array.reduce((final, updateData) => {
        const { id, ...updates } = updateData
        final[id] = updates
        return final
      }, {} as any)

      for (let index = 0; index < newDocuments.length; index++) {
        const document = newDocuments[index]
        const documentId = getDocumentId(document)
        const updates = updatesMap[documentId]
        const isMatch = !!updates
        if (!isMatch) continue

        updatedCount += 1
        newDocuments[index] = { ...document, ...updates }
        const areAllUpdated = totalUpdatesCount === updatedCount
        if (areAllUpdated) break
      }

      this.data = newDocuments
    }

    private updateByObject = (item: PartialDataT | DataT) => {
      const newDocuments = [...this.data]
      const { id, ...updates } = item

      for (let index = 0; index < newDocuments.length; index++) {
        const document = newDocuments[index]
        const documentId = getDocumentId(document)
        const isMatch = documentId === id
        if (!isMatch) continue

        newDocuments[index] = { ...document, ...updates }
        break
      }

      this.data = newDocuments
    }

    update = (arg: PartialDataT | DataT | PartialDataListT | DataListT) => {
      const isArray = Array.isArray(arg)
      const isObject = !isArray && typeof arg === 'object'

      if (isArray) this.updateByArray(arg)
      if (isObject) this.updateByObject(arg)
      return this
    }

    // collection.query examples:
    // collection.query('some-id')
    // collection.query(['some-id', 'other-id'])
    // collection.query(123)
    // collection.query([123, 456])
    // collection.query({ isActive: true })
    // collection.query({ name$: { $startsWith: 'H' } })
    // collection.query({ $and:  [...] })
    // collection.query({ $or:  [...] })
    // collection.query({ $or:  [{ $and: [...], age$: { $isBetween: [15, 35] } }] })
    query = (queryOptions: QueryOptionsT | string | string[]) => {
      const isArray = Array.isArray(queryOptions)
      const isString = typeof queryOptions === 'string'
      const isObject = !isArray && typeof queryOptions === 'object'
      let queriedDocuments = [] as DataT[]

      if (isString) queriedDocuments = this.getDocumentsWithIds([queryOptions])
      if (isArray) queriedDocuments = this.getDocumentsWithIds(queryOptions)
      if (isObject) queriedDocuments = this.queryByQuery(queryOptions)

      return listerine<DataT>(queriedDocuments)
    }
  }

  const collection = new ListerineCollection()
  return collection
}
