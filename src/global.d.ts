type AnyObjectT = Record<string, any>
type AnyFunctionT = (...args: any[]) => any
type AnyArrayT = any[]
type PrimitiveT = string | number | boolean | null | undefined

type TestT<T> = (item: T) => boolean
type QueryOptionsT = Record<string, any>
