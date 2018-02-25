const { NOT_SUPPORTED_ENV } = require('./strings')

class DependencyError extends Error {
  constructor (depName, reason) {
    super(`Dependency check failed for '${depName}'. Reason: ${reason}`)
    this.name = 'DependencyError'
  }
}

class NotSupportedError extends Error {
  constructor () {
    super(`${NOT_SUPPORTED_ENV}`)
    this.name = 'NotSupportedError'
  }
}

module.exports = {
  DependencyError,
  NotSupportedError
}
