import { filters } from './filters'

export type AnyObjectT = Record<string, any>
export type AnyFunctionT = (...args: any[]) => any
export type AnyArrayT = any[]
export type PrimitiveT = string | number | boolean | null | undefined

// TODO: Beef up QueryConfigT to give the dev
// type safety and hints when building query configs.
export type QueryConfigT = Record<string, any>

export type TestT<DataT> = (item: DataT) => boolean
export type FilterKeyT = keyof typeof filters

export type ObjectWithId<IdKeyT extends string = 'id'> = {
  [K in IdKeyT]: string
}

export type EnhancedDataT<DataT> = DataT[] & {
  first: DataT
  last: DataT
}

export type OptionsT<IdKeyT extends string = 'id'> = {
  idKey?: IdKeyT
}
