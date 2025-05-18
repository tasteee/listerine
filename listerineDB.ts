import { listerine } from 'listerine'
import fs from 'fs'

type ListerineDBOptionsT<DataT> = {
  filePath: string
  shouldHandleDates?: boolean
  defaultData?: DataT[]
}

export const listerineDB = <DataT>(options: ListerineDBOptionsT<DataT>) => {
  const doesFileExist = fs.exists
}
