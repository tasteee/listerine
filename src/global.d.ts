import { filters } from './filters'

export type AnyObjectT = Record<string, any>
export type AnyFunctionT = (...args: any[]) => any
export type AnyArrayT = any[]
export type PrimitiveT = string | number | boolean | null | undefined

export type QueryOptionsT = Record<string, any>
export type TestT<DataT> = (item: DataT) => boolean
export type FilterKeyT = keyof typeof filters

export type ObjectWithId = {
  id: string
}
