import { NOT_SUPPORTED_ENV } from './strings'

export class DependencyError extends Error {
  constructor (depName, reason) {
    super(`Dependency check failed for '${depName}'. Reason: ${reason}`)
    this.name = 'DependencyError'
  }
}

export class NotSupportedError extends Error {
  constructor () {
    super(`${NOT_SUPPORTED_ENV}`)
    this.name = 'NotSupportedError'
  }
}
