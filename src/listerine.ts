import { QueryConfigT, OptionsT, EnhancedDataT, TestT, FilterKeyT } from './global'
import { filters, FILTER_KEYS } from './filters'
import { logger } from './logs'
import { get } from './helpers'

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
  return <DataT>(queryOptions: QueryConfigT) => {
    const conditions = queryOptions[config.optionsKey] as QueryConfigT[]
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

export function prepareQueryTests<DataT>(queryOptions: QueryConfigT, prefix: string = ''): TestT<DataT>[] {
  const tests: TestT<DataT>[] = []
  const hasOperatorOr = '$or' in queryOptions
  const hasOperatorAnd = '$and' in queryOptions
  const hasBothOperators = hasOperatorOr && hasOperatorAnd

  // Handle logical operators at the top level.
  if (hasBothOperators) {
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

const DEFAULT_OPTIONS = {
  idKey: 'id' as const,
}

function getOptions<IdKeyT extends string>(configOptions: Partial<OptionsT<IdKeyT>>): OptionsT<IdKeyT> {
  const options = { ...configOptions }
  options.idKey = (options.idKey || DEFAULT_OPTIONS.idKey) as IdKeyT
  return options as OptionsT<IdKeyT>
}

type DataWithoutIdT<DataT, IdKeyT extends keyof DataT> = Omit<DataT, IdKeyT>
type SortFunctionT<DataT> = (a: DataT, b: DataT) => number
type SortOptionsT<DataT> = {
  key: keyof DataT
  direction?: 'ascending' | 'descending'
}

class ListerineCollection<IdKeyT extends string = 'id', DataT extends Record<IdKeyT, string> = Record<IdKeyT, string>> {
  private enhancedData: EnhancedDataT<DataT>
  private options: OptionsT<IdKeyT>
  private idKey: IdKeyT

  constructor(target: DataT[], options?: OptionsT<IdKeyT>) {
    this.idKey = (options?.idKey ?? 'id') as IdKeyT
    this.options = getOptions(options || {})
    this.data = target
    this.enhancedData = this.data
  }

  set data(newData: DataT[]) {
    this.enhancedData = createEnhancedData<DataT>(newData)
  }

  get data(): EnhancedDataT<DataT> {
    return this.enhancedData
  }

  private getDocumentId = (document: DataT): string => {
    return get(document, this.idKey as string) as string
  }

  private getSortedData = (key: keyof DataT, direction?: string) => {
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

  private sortByKey = (key: keyof DataT) => {
    const sortedData = this.getSortedData(key, 'ascending')
    this.data = sortedData
  }

  private sortByOptions = (options: SortOptionsT<DataT>) => {
    const direction = options.direction || 'ascending'
    const sortedData = this.getSortedData(options.key, direction)
    this.data = sortedData
  }

  private sortByFunction = (comparer: SortFunctionT<DataT>) => {
    const data = this.data as DataT[]
    const sortedData = data.sort(comparer)
    this.data = sortedData
  }

  // Perform a query using a query object.
  private queryByQuery = (queryOptions: QueryConfigT) => {
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
  private removeByObjects = (items: DataT[]) => {
    const ids = items.map(this.getDocumentId)
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
  private removeByQuery = (queryOptions: QueryConfigT) => {
    const tests = prepareQueryTests(queryOptions)
    this.data = this.getDocumentsThatFail(tests)
  }

  // Return all documents that pass every test provided.
  private getDocumentsThatPass = (tests: TestT<DataT>[]) => {
    return this.data.filter((item) => tests.every((test) => test(item)))
  }

  // Return all documents that fail every test provided.
  // Used for filtering out all documents that PASS every
  // test provided to match documents to be removed.
  private getDocumentsThatFail = (tests: TestT<DataT>[]) => {
    return this.data.filter((item) => !tests.every((test) => test(item)))
  }

  private getDocumentsWithIds = (ids: string[]) => {
    if (ids.length <= 10) {
      const documents = []
      const idsCount = ids.length
      for (const document of this.data) {
        const documentId = this.getDocumentId(document)
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
      const documentId = this.getDocumentId(document)
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
        const documentId = this.getDocumentId(document)
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
      const documentId = this.getDocumentId(document)
      const isMatch = !idSet.has(documentId)
      if (isMatch) documents.push(document)
    }
    return documents
  }

  // When inserting a new document(s), if no id is provided,
  // listerine generates and applies one.
  private getDocumentWithIdEnsured = (item: DataWithoutIdT<DataT, IdKeyT> | DataT): DataT => {
    const itemId = this.getDocumentId(item as DataT)
    const isIdValid = typeof itemId === 'string'
    if (isIdValid) return item as DataT

    const id = crypto.randomUUID()
    const idKey = this.options.idKey!
    const itemWithId = { ...item, [idKey]: id } as DataT
    return itemWithId
  }

  private insertMultiple = (items: (DataWithoutIdT<DataT, IdKeyT> | DataT)[]) => {
    const documents = items.map(this.getDocumentWithIdEnsured)
    this.data = [...this.data, ...documents]
  }

  private insertOne = (item: DataWithoutIdT<DataT, IdKeyT> | DataT) => {
    const document = this.getDocumentWithIdEnsured(item)
    this.data = [...this.data, document]
  }

  sort = (options: SortFunctionT<DataT> | SortOptionsT<DataT> | string) => {
    const isString = typeof options === 'string'
    const isFunction = typeof options === 'function'
    const isObject = typeof options === 'object'

    if (isString) this.sortByKey(options as keyof DataT)
    if (isFunction) this.sortByFunction(options as SortFunctionT<DataT>)
    if (isObject) this.sortByOptions(options)

    return this
  }

  insert = (items: DataWithoutIdT<DataT, IdKeyT> | (DataWithoutIdT<DataT, IdKeyT> | DataT)[] | DataT | DataT[]) => {
    const isArray = Array.isArray(items)
    const isObject = !isArray && typeof items === 'object'

    if (isArray) this.insertMultiple(items)
    if (isObject) this.insertOne(items)

    return this
  }

  remove = (queryOptions: QueryConfigT | string | string[]) => {
    const isArray = Array.isArray(queryOptions)
    const isString = typeof queryOptions === 'string'
    const isObject = !isArray && typeof queryOptions === 'object'

    if (isString) this.removeById(queryOptions)
    if (isArray) this.removeByArray(queryOptions)
    if (isObject) this.removeByQuery(queryOptions)

    return this
  }

  private updateByArray = (array: Partial<DataT>[]) => {
    const newDocuments = [...this.data]
    const totalUpdatesCount = array.length
    let updatedCount = 0

    const updatesMap = array.reduce(
      (final, updateData) => {
        const documentId = this.getDocumentId(updateData as DataT)
        const { [this.idKey]: _, ...updates } = updateData
        final[documentId] = updates
        return final
      },
      {} as Record<string, any>,
    )

    for (let index = 0; index < newDocuments.length; index++) {
      const document = newDocuments[index]
      const documentId = this.getDocumentId(document)
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

  private updateByObject = (item: Partial<DataT>) => {
    const newDocuments = [...this.data]
    const documentId = this.getDocumentId(item as DataT)
    const { [this.idKey]: _, ...updates } = item

    for (let index = 0; index < newDocuments.length; index++) {
      const document = newDocuments[index]
      const currentDocumentId = this.getDocumentId(document)
      const isMatch = currentDocumentId === documentId
      if (!isMatch) continue

      newDocuments[index] = { ...document, ...updates }
      break
    }

    this.data = newDocuments
  }

  update = (arg: Partial<DataT> | Partial<DataT>[]) => {
    const isArray = Array.isArray(arg)
    const isObject = !isArray && typeof arg === 'object'

    if (isArray) this.updateByArray(arg)
    if (isObject) this.updateByObject(arg)

    return this
  }

  query = (queryOptions: QueryConfigT | string | string[]) => {
    const isArray = Array.isArray(queryOptions)
    const isString = typeof queryOptions === 'string'
    const isObject = !isArray && typeof queryOptions === 'object'

    let queriedDocuments = [] as DataT[]

    if (isString) queriedDocuments = this.getDocumentsWithIds([queryOptions])
    if (isArray) queriedDocuments = this.getDocumentsWithIds(queryOptions)
    if (isObject) queriedDocuments = this.queryByQuery(queryOptions)

    return listerine<IdKeyT, DataT>(queriedDocuments, this.options)
  }
}

// Function overloads for better type inference
export function listerine<DataT extends Record<'id', string>>(target: DataT[], options?: OptionsT<'id'>): ListerineCollection<'id', DataT>

export function listerine<IdKeyT extends string, DataT extends Record<IdKeyT, string>>(
  target: DataT[],
  options?: OptionsT<IdKeyT>, // Remove the & { idKey: IdKeyT } requirement
): ListerineCollection<IdKeyT, DataT>

export function listerine<IdKeyT extends string = 'id', DataT extends Record<IdKeyT, string> = Record<IdKeyT, string>>(
  target: DataT[],
  options?: OptionsT<IdKeyT>,
): ListerineCollection<IdKeyT, DataT> {
  const collection = new ListerineCollection<IdKeyT, DataT>(target, options)
  return collection
}
