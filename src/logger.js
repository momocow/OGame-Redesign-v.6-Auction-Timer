const { format } = require('util')
const { NotSupportedError } = require('./errors')

/* eslint-disable */
GM_getValue = GM_getValue || function (key, defaultVal) {
  if (!window.localStorage && !window.localStorage.getItem) throw new NotSupportedError()

  const storage = window.localStorage.getItem(key)
  return storage === null ? defaultVal : storage
}

GM_setValue = GM_setValue || function (key, val) {
  if (!window.localStorage && !window.localStorage.setItem) throw new NotSupportedError()

  window.localStorage.setItem(key, val)
}
/* eslint-enable */

class GMLogger {
  constructor (config) {
    this._GM_key = '__logs__'
    this._MAX_LOG_ENTRIES = config.MAX_LOG_ENTRIES
    this._cache = []

    // init
    this._load()
  }

  _gc () {
    if (this._cache.length > this._MAX_LOG_ENTRIES) {
      this._cache.splice(0, this._cache.length - this._MAX_LOG_ENTRIES)
    }
  }

  _log (level, ...args) {
    let time = new Date()
    let msg = format(...args)

    this._cache.push({
      time,
      level,
      msg,
      toString () {
        return `[${time}][${level}] ${msg}`
      }
    })
  }

  _load () {
    this._cache = GM_getValue(this._GM_key, [])
  }

  _save () {
    this._gc()
    GM_setValue(this._GM_key, this._cache)
  }

  /**
   * @param {string} msg a message or template string
   * @param {...mixed} args arguments to format the template
   */
  debug (...args) {
    console.debug(...args)
    this._log('debug', ...args)
  }

  /**
   * @param {string} msg a message or template string
   * @param {...mixed} args arguments to format the template
   */
  info (...args) {
    if (arguments.length === 0) return
    console.info(...args)
    this._log('info', ...args)
  }

  /**
   * @param {string} msg a message or template string
   * @param {...mixed} args arguments to format the template
   */
  warn (...args) {
    if (arguments.length === 0) return
    console.warn(...args)
    this._log('warn', ...args)
  }

  /**
   * @param {string} msg a message or template string
   * @param {...mixed} args arguments to format the template
   */
  error (...args) {
    if (arguments.length === 0) return
    console.error(...args)
    this._log('error', ...args)
  }
}

module.exports = {
  GMLogger
}
