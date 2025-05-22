import { FILTER_KEYS } from './filters'

const MESSAGING_PREFIX = '[listerine]'
const WARNING_EMOJI = '⚠️'
const ERROR_EMOJI = '⛔'
const WARNING_PREFIX = `${WARNING_EMOJI} ${MESSAGING_PREFIX}`
const ERROR_PREFIX = `${ERROR_EMOJI} ${MESSAGING_PREFIX}`

const messages = {
  arrayOneOfArray: () => [
    WARNING_PREFIX,
    'do not use $isOneOf filter on arrays.',
    '[0, 1, 2] $isOneOf [...etc] is not yet supported,',
    'use $isSubsetOf or $isSupersetOf instead.',
  ],

  subsetOnArray: () => [
    WARNING_PREFIX,
    'do not use $isSubsetOf or $isSupersetOf filter on non-array values.',
    'use $isOneOf instead to check if a singular value is one of many possible values.',
  ],

  supersetOnArray: () => [
    WARNING_PREFIX,
    'do not use $isSupersetOf filter on non-array values.',
    'use $isOneOf instead to check if a singular value is one of many possible values.',
  ],

  numericComparisonOnNonNumber: () => [
    WARNING_PREFIX,
    'do not use numeric filters on non-number values.',
    '(i.e $isGreaterThan, $isLessThan, $isGreaterThanOrEqualTo, $isLessThanOrEqualTo)',
  ],

  orRequiresArray: () => [ERROR_PREFIX, '$or operator requires an array of conditions'],

  andRequiresArray: () => [ERROR_PREFIX, '$and operator requires an array of conditions'],

  invalidFilterKey: (details: any) => [
    ERROR_PREFIX,
    `invalid filter key used: ${details.filterKey}`,
    `Valid filter keys: ${FILTER_KEYS.join(' ')}`,
  ],

  removeWithArray: (details: any) => [
    ERROR_PREFIX,
    `invalid array argument passed: .remove(${JSON.stringify(details.input)})`,
    'argument must be string[] | ObjectWithIdT[]',
    'i.e collection.remove([{ id: "foo", ...etc }, { id: "bar", ...etc }])',
    'or collection.remove(["foo", "bar"])',
    'or collection.remove([123, 765])',
  ],

  invalidGetTarget: (details: any) => [
    ERROR_PREFIX,
    `invalid target passed to get (safe-get): ${JSON.stringify(details.target)}`,
    'target must be either an array or an object',
  ],

  toStringConversion: (details: any) => [ERROR_PREFIX, ''],

  toNumberConversion: (details: any) => [ERROR_PREFIX, ''],
}

type MessagesKeyT = keyof typeof messages

// const createError = (options: any) => {
//   const { message, ...details } = options
//   const error = new Error(message) as any
//   error.details = details
//   return error
// }

const createLogger = (logType: 'log' | 'warn' | 'error') => {
  return (messagesKey: MessagesKeyT) => {
    return (details: any) => {
      const message = messages[messagesKey](details).join('\n')
      console[logType](message, { details })
    }
  }
}

const createChillLogger = createLogger('log')
const createWarningLogger = createLogger('warn')
const createErrorLogger = createLogger('error')

const warnings = {
  arrayOneOfArray: createWarningLogger('arrayOneOfArray'),
  subsetOnArray: createWarningLogger('subsetOnArray'),
  supersetOnArray: createWarningLogger('supersetOnArray'),
  numericComparisonOnNonNumber: createWarningLogger('numericComparisonOnNonNumber'),
}

const errors = {
  orRequiresArray: createErrorLogger('orRequiresArray'),
  andRequiresArray: createErrorLogger('andRequiresArray'),
  invalidFilterKey: createErrorLogger('invalidFilterKey'),
  removeWithArray: createErrorLogger('removeWithArray'),
  invalidGetTarget: createErrorLogger('invalidGetTarget'),
  toStringConversion: createErrorLogger('toStringConversion'),
  toNumberConversion: createErrorLogger('toNumberConversion'),
}

const logs = {}

export const logger = {
  logs,
  warnings,
  errors,
}
