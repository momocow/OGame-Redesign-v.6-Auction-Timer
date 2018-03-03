/* global GM_addStyle */
import { EventEmitter } from 'events'

const dialogContainer = document.body.appendChild(document.createElement('div'))
dialogContainer.classList.add('auc-timer-dialog-container')

class Dialog extends EventEmitter {
  constructor (type, msg, options) {
    if (typeof type !== 'string') type = 'info'
    if (typeof msg !== 'string') msg = ''
    if (typeof options !== 'object') {
      options = { ttl: 5000, listeners: {} }
    }

    super()

    // internal cache
    this._elListeners = {}

    options.ttl = typeof options.ttl === 'number' ? options.ttl : 5000
    options.listeners = typeof options.listeners === 'object' ? options.listeners : {}
    this.options = options
    this._id = ''
    this.isShown = false

    this.el = dialogContainer.appendChild(document.createElement('div'))
    this.msgList = this.el.appendChild(document.createElement('ul'))
    this.footer = this.el.appendChild(document.createElement('div'))
    this.append(msg)

    this.el.classList.add('auc-timer-dialog', 'auc-timer-' + type)
    this.el.addEventListener('click', () => {
      this.hide()
    })
    this.el.addEventListener('transitionend', (e) => {
      if (e.propertyName === 'opacity') {
        if (this.el.classList.contains('active')) {
          this.isShown = true
          this.emit('show')
        } else if (this.el.classList.contains('idle')) {
          this.emit('idle')
        } else {
          this.isShown = false
          this.emit('hide')
        }
      }
    })

    this.on('show', () => {
      setTimeout(() => {
        this.idle()
      }, this.options.ttl)
    }).on('hide', () => {
      dialogContainer.style.zIndex = -1000000
      this.clear()
    })

    Object.keys(options.listeners).forEach((listener) => {
      this.el.addEventListener(listener, options.listeners[listener])
    })
  }

  show () {
    if (this.el) {
      dialogContainer.style.zIndex = 1000000
      this.el.classList.remove('idle')
      this.el.classList.add('active')
    }
    return this
  }

  idle () {
    if (this.el) {
      this.el.classList.remove('active')
      this.el.classList.add('idle')
    }
    return this
  }

  hide () {
    if (this.el) {
      this.el.classList.remove('active', 'idle')
    }
    return this
  }

  clear () {
    this.msgList.innerHTML = ''
    this.footer.innerHTML = ''
  }

  append (msg) {
    if (msg) this.msgList.appendChild(document.createElement('li')).innerHTML = msg
    return this
  }

  onEl (event, cb) {
    if (this._elListeners[event]) return this

    this._elListeners[event] = cb
    this.el.addEventListener(event, cb)
    return this
  }

  unElAll () {
    Object.keys(this._elListeners).forEach((event) => {
      this.el.removeEventListener(event, this._elListeners[event])
    })
    return this
  }

  unEl (event) {
    this.el.removeEventListener(event, this._elListeners[event])
    return this
  }

  setFooter (msg) {
    this.footer.innerHTML = msg
    return this
  }
}

Dialog.SHOWUP_DELAY = 500
Dialog.TRANSITION_DURATION = 500

GM_addStyle(`
  .auc-timer-dialog-container {
    float: right;
    width: 280px;
    z-index: -1000000;
    position: fixed;
    right: 0;
    bottom: 20px;
    padding: 20px;
    overflow: hidden;
  }

  .auc-timer-dialog {
    width: 240px;
    margin-top: 8px;
    padding: 20px;
    color: #ededed;
    font-size: 16px;
    cursor: pointer;
    position: relative;
    border-radius: 2px;
    opacity: 0;
    left: 300px;
    -webkit-transition: opacity ${Dialog.TRANSITION_DURATION}ms, left ${Dialog.TRANSITION_DURATION}ms;
    transition: opacity ${Dialog.TRANSITION_DURATION}ms, left ${Dialog.TRANSITION_DURATION}ms;
  }

  .auc-timer-dialog>ul{
    list-style-type: square;
    position: relative;
    left: 10px;
  }

  .auc-timer-dialog.auc-timer-error {
    background-color: #c8181888;
  }

  .auc-timer-dialog.active {
    left: 0;
    opacity: 1;
  }

  .auc-timer-dialog.idle {
    left: 0;
    opacity: 0.5;
  }

  .auc-timer-dialog.idle:hover {
    opacity: 1;
  }
`)

export function hasDialogShown (type) {
  switch (type) {
    case 'error':
      return error.dialog && error.dialog.isShown
    default:
      return false
  }
}

export function error (msg, options) {
  error.dialog = error.dialog || new Dialog('error', '')
  error.dialog.append(msg)

  if (typeof options === 'function') {
    error.dialog.onEl('click', options)
  } else if (typeof options === 'object') {
    if (typeof options.click === 'function') {
      error.dialog.onEl('click', options.click)
    }

    if (typeof options.footer === 'string') {
      error.dialog.setFooter(options.footer)
    }
  } else if (typeof options === 'string') {
    error.dialog.setFooter(options)
  }

  setTimeout(function () {
    error.dialog.show()
  }, Dialog.SHOWUP_DELAY)

  return error.dialog
}
