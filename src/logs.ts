import { logger } from './logger'

const arrayOneOfArray = [
  'do not use $isOneOf filter on arrays.',
  '[0, 1, 2] $isOneOf [...etc] is not yet supported,',
  'use $isSubsetOf or $isSupersetOf instead.',
]

const supersetOnArray = [
  'do not use $isSubsetOf or $isSupersetOf filter on non-array values.',
  'use $isOneOf instead to check if a singular value is one of many possible values.',
]

const subsetOnArray = [
  'do not use $isSupersetOf filter on non-array values.',
  'use $isOneOf instead to check if a singular value is one of many possible values.',
]

const numericComparisonOnNonNumber = [
  'do not use numeric filters on non-number values.',
  '(i.e $isGreaterThan, $isLessThan, $isGreaterThanOrEqualTo, $isLessThanOrEqualTo)',
]

export const warnings = {
  arrayOneOfArray: logger.createWarning(arrayOneOfArray),
  subsetOnArray: logger.createWarning(subsetOnArray),
  supersetOnArray: logger.createWarning(supersetOnArray),
  numericComparisonOnNonNumber: logger.createWarning(numericComparisonOnNonNumber),
}

export const logs = {
  warnings,
}
