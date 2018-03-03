/* global GM_addStyle, $ */
import { format } from 'util'

import { MAX_LOG_ENTRIES } from './config'
import { NotSupportedError } from './errors'
import { error as promptError, hasDialogShown } from './ui/dialog'

const EMPTY_LOGS = 'No logs available for the current filter.'

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

GM_addStyle(`
  .auc-timer-logger {
    width: 585px;
    height: calc((100vh - 300px) * 0.9);
    background-color: #00000077;
    padding-left: 65px;
    padding-top: calc((100vh - 300px) * 0.05);
  }

  .auc-timer-logger.hidden {
    display: none;
  }

  .auc-timer-logger-logs {
    width: 520px;
    height: 80%;
    background-color: #b3c3cb;
    border: 1px solid #668599;
    border-bottom-color: #d3d9de;
    border-radius: 3px;
    box-shadow: inset 0 1px 3px 0 #454f54;
    font-size: 14px;
    font-family: Arial,Helvetica,sans-serif;
    min-height: 130px;
    padding: 5px;
    overflow-y: auto;
  }

  .auc-timer-logger-fn {
    width: 246px;
    height: 20px;
    cursor: pointer;
    border-radius: 4px;
    color: white;
    text-align: center;
    padding: 10px;
    font-size: 16px;
  }

  .auc-timer-logger-copy {
    display: inline-block;
    background-color: #0058a277;
  }

  .auc-timer-logger-copy:hover {
    background-color: #7cc3ff77;
  }

  .auc-timer-logger-reset {
    display: inline-block;
    background-color: #e4353577;
  }

  .auc-timer-logger-reset:hover {
    background-color: #ffa5a577;
  }

  .auc-timer-logger-info {
    color: green;
  }

  .auc-timer-logger-warn {
    color: #d88720;
  }

  .auc-timer-logger-debug {
    color: grey;
  }

  .auc-timer-logger-error {
    font-wieght: 500;
    color: red;
  }

  hr.auc-timer-logger-sep {
    margin-top: 4px;
    margin-bottom: 4px;
  }

  .auc-timer-copyzone {
    position: absolute;
    left: -10000px;
    top: -10000px;
  }

  .auc-timer-logger-filter {
    width: 160px;
  }
`)

class GMLogEntry {
  constructor (time, level, msg) {
    this.time = time
    this.level = level
    this.msg = msg
  }

  toHTML () {
    return `<div class="auc-timer-logger-${this.level}">[${this.time}][${this.level}] ${this.msg}</div>`
  }

  toString () {
    return `[${this.time}][${this.level}] ${this.msg}`
  }
}

class GMLogger {
  constructor (config) {
    this.constructor.prototype.prototype = console.prototype

    this._GM_key = '__logs__'
    this._state_key = '__state__'
    this._MAX_LOG_ENTRIES = config.MAX_LOG_ENTRIES
    this._cache = []
    this.level = 'error'
    this.isShown = false

    this.content = null
    this.menuBtn = document.getElementById('menuTable').appendChild(document.createElement('li'))
    const menuAnchor = this.menuBtn.appendChild(document.createElement('a'))
    menuAnchor.href = 'javascript:void(0)'
    menuAnchor.innerHTML = '<span class="textlabel">Auc. Timer</span>'
    menuAnchor.classList.add('menubutton')
    menuAnchor.addEventListener('click', () => {
      if (this.isShown) {
        this.closePanel()
      } else {
        this.showPanel()
      }
    })

    // init
    this._load()
  }

  setLevel (level) {
    this.level = level
  }

  showPanel () {
    let logsDisplay

    if (!this.content) {
      this.content = document.getElementById('contentWrapper').appendChild(document.createElement('div'))
      this.content.classList.add('auc-timer-logger')

      const logFilterLabel = this.content.appendChild(document.createElement('label'))
      logFilterLabel.htmlFor = 'auc-timer-logfilter'
      logFilterLabel.innerHTML = 'Log Level: &nbsp;&nbsp;&nbsp;'

      const logFilter = logFilterLabel.appendChild(document.createElement('select'))
      logFilter.id = 'auc-timer-logfilter'
      logFilter.classList.add('auc-timer-logger-filter')
      logFilter.innerHTML = `
        <option class="" value="debug" ${this.level === 'debug' ? 'selected' : ''}>DEBUG</option>
        <option class="" value="info" ${this.level === 'info' ? 'selected' : ''}>INFO</option>
        <option class="" value="warn" ${this.level === 'warn' ? 'selected' : ''}>WARN</option>
        <option class="" value="error" ${this.level === 'error' ? 'selected' : ''}>ERROR</option>
        <option class="" value="off" ${this.level === 'off' ? 'selected' : ''}>OFF</option>
      `

      try {
        $(logFilter).ogameDropDown().on('change', () => {
          this.level = $(logFilter).val()
          GM_setValue(this._state_key, { level: this.level })
          this.loadLogs(logsDisplay)
        })
      } catch (err) {
        console.error(err)
      }

      logsDisplay = this.content.appendChild(document.createElement('div'))
      logsDisplay.classList.add('auc-timer-logger-logs')

      const resetBtn = this.content.appendChild(document.createElement('div'))
      resetBtn.classList.add('auc-timer-logger-reset', 'auc-timer-logger-fn')
      resetBtn.innerHTML = 'Reset'
      resetBtn.addEventListener('click', () => {
        this._cache = []
        this._save()
        this.loadLogs(logsDisplay)
      })

      const copyBtn = this.content.appendChild(document.createElement('div'))
      copyBtn.classList.add('auc-timer-logger-copy', 'auc-timer-logger-fn')
      copyBtn.innerHTML = 'Copy'
      copyBtn.addEventListener('click', () => {
        const copyzone = document.body.appendChild(document.createElement('textarea'))
        copyzone.classList.add('auc-timer-copyzone')
        copyzone.value = this._cache.filter((entry) => {
          return GMLogger.levelMap[entry.level] >= GMLogger.levelMap[this.level]
        }).join('\n').trim() || EMPTY_LOGS
        copyzone.select()
        document.execCommand('copy')
      })
    } else {
      logsDisplay = this.content.childNodes[1]
    }

    // load logs
    this.loadLogs(logsDisplay)

    logsDisplay.scrollTop = logsDisplay.scrollHeight

    this.content.classList.remove('hidden')

    let originalContent = document.getElementById('inhalt') || document.getElementById('content')
    originalContent.style.display = 'none'
    this.isShown = true
  }

  loadLogs (logsDisplay) {
    let logs = this._cache.filter((entry) => {
      return GMLogger.levelMap[entry.level] >= GMLogger.levelMap[this.level]
    }).map((entry) => {
      return entry.toHTML()
    }).join('<hr class="auc-timer-logger-sep">')

    logsDisplay.innerHTML = logs.trim() ? logs : '<div style="color:grey;pointer-events: none;">' + EMPTY_LOGS + '</div>'
  }

  closePanel () {
    if (this.content && !this.content.classList.contains('hidden')) {
      this.content.classList.add('hidden')
      let originalContent = document.getElementById('inhalt') || document.getElementById('content')
      originalContent.style.display = 'block'
    }

    this.isShown = false
  }

  _gc () {
    if (this._cache.length > this._MAX_LOG_ENTRIES) {
      this._cache.splice(0, this._cache.length - this._MAX_LOG_ENTRIES)
    }
  }

  _log (level, ...args) {
    let time = new Date()
    let msg = format(...args)

    this._cache.push(new GMLogEntry(time, level, msg))

    this._save()

    if (level === 'error' && !hasDialogShown('error')) {
      promptError('Error occurs.', {
        click: () => {
          this.showPanel()
        },
        footer: '(Click to view details)'
      })
    }
  }

  _load () {
    this.level = GM_getValue(this._state_key, {}).level || 'error'
    this._cache = GM_getValue(this._GM_key, []).map((rawEntry) => {
      return rawEntry.match(/^\[(.*?)\]\[(.*?)\] (.*)$/)
    }).filter((matchedEntry) => {
      return matchedEntry !== null
    }).map((matchedEntry) => {
      return new GMLogEntry(new Date(matchedEntry[1]), matchedEntry[2], matchedEntry[3])
    })
  }

  _save () {
    this._gc()
    GM_setValue(this._GM_key, this._cache.map((entry) => {
      return entry.toString()
    }))
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

GMLogger.levelMap = {
  'debug': 0,
  'info': 10,
  'warn': 20,
  'error': 30,
  'off': 40
}

function getLogger () {
  try {
    return new GMLogger({ MAX_LOG_ENTRIES })
  } catch (e) {
    if (e instanceof NotSupportedError) {
      window.alert(e.message)
    }
    return console
  }
}

export const LOG = getLogger()
