import { filters } from './filters'

// TODO: Beef up QueryT to give the dev
// type safety and hints when building query configs.
export type QueryT = Record<string, any>

export type TestT<DataT> = (item: DataT) => boolean
export type FilterKeyT = keyof typeof filters

export type ObjectWithId<IdKeyT extends string = 'id'> = {
  [K in IdKeyT]: string
}

export type EnhancedDataT<DataT> = DataT[] & {
  first: DataT
  last: DataT
}

export type DataWithoutIdT<DataT> = Omit<DataT, 'id'>
export type RecordWithIdT = Record<'id', string>
