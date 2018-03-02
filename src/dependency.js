import { MAX_DEP_TIMEOUT, DEP_CHECK_PERIOD } from './config'
import { SafeFunction } from '../util/function'
import { DependencyError } from './errors'
import { LOG } from './logger'

export function checkDependencies (scope, deps, cb, due) {
  due = due instanceof Date ? due : new Date(new Date().getTime() + MAX_DEP_TIMEOUT)

  const lacks = []

  deps.forEach(dep => {
    if (!scope[dep]) {
      lacks.push(dep)
    }
  })

  if (lacks.length === 0) {
    cb(null)
  } else if (lacks.length > 0) {
    if (new Date().getTime() <= due.getTime()) { // effective
      const safeFn = new SafeFunction(checkDependencies.bind(undefined, scope, lacks, cb, due))
      safeFn.on('error', function (err) {
        LOG.error('Error occurs in #checkDependencies()')
        LOG.error(err)
      })

      setTimeout(safeFn, DEP_CHECK_PERIOD)
    } else { // expired
      cb(new DependencyError(lacks))
    }
  }
}
