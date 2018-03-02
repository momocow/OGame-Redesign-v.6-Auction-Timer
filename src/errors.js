import { NOT_SUPPORTED_ENV } from './strings'

export class DependencyError extends Error {
  constructor (deps) {
    super(`Dependency check failed. Dependencies, ${deps.map(e => `"${e}"`).join(', ')}, are not found.`)
    this.name = 'DependencyError'
  }
}

export class NotSupportedError extends Error {
  constructor () {
    super(`${NOT_SUPPORTED_ENV}`)
    this.name = 'NotSupportedError'
  }
}
