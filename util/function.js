import extend from 'extend'
import { EventEmitter } from 'events'

export function Callable (property) {
  const func = this.constructor.prototype[property]
  const apply = function () { return func.apply(apply, arguments) }
  Object.setPrototypeOf(apply, this.constructor.prototype)
  Object.getOwnPropertyNames(func).forEach(function (p) {
    Object.defineProperty(apply, p, Object.getOwnPropertyDescriptor(func, p))
  })
  return apply
}
Callable.prototype = Object.create(Function.prototype)

export class SafeFunction extends Callable {
  constructor (fn, defaultReturn) {
    if (typeof fn !== 'function') {
      throw new TypeError(`fn' is not a function.`)
    }

    super('__call__')

    this._fn = fn
    this._rtn = defaultReturn

    extend(true, this, new EventEmitter())
  }

  __call__ (...args) {
    try {
      return this._fn(...args)
    } catch (err) {
      this.emit('error', err)
      return this._rtn
    }
  }
}
