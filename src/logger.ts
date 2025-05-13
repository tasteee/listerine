const messagingPrefix = '[listerine]'
const warningEmoji = '⚠️'
const errorEmoji = '⛔'
const warningPrefix = `${warningEmoji} ${messagingPrefix}`
const errorPrefix = `${errorEmoji} ${messagingPrefix}`

export const createWarning = (message: string[]) => {
  return (...args: any[]) => {
    console.warn(warningPrefix, message.join('\n'), ...args)
  }
}

export const createError = (message: string[]) => {
  return (...args: any[]) => {
    console.error(errorPrefix, message.join('\n'), ...args)
  }
}

const logError = (message: string, ...args: any[]) => {
  console.error(errorPrefix, message, ...args)
}

const logWarning = (message: string, ...args: any[]) => {
  console.warn(warningPrefix, message, ...args)
}

export const logger = {
  createError,
  createWarning,
  logError,
  logWarning,
}
