/* global GM_addStyle */
import { EventEmitter } from 'events'

GM_addStyle(`
  .auc-timer-dialog-container {
    float: right;
    width: 280px;
    height: 0;
    z-index: 1000000;
    position: fixed;
    right: 0;
    bottom: 0;
    padding: 20px;
    overflow: hidden;
    transition: height: 0.5;
  }

  .auc-timer-dialog {
    width: 240px;
    margin-top: 8px;
    height: 0;
    padding: 20px;
    color: #ededed;
    font-size: 16px;
    cursor: pointer;
    position: relative;
    border-radius: 2px;
    opacity: 0;
    left: 300px;
    transition: height: 0.5, opacity 0.5s, left 0.5s;
  }

  .auc-timer-dialog.auc-timer-error {
    background-color: #c8181888;
  }

  .auc-timer-dialog.active {
    left: 0;
    height: auto;
    opacity: 1;
  }
`)

class DialogManager {
  constructor () {
    this._no = 0
    this._queue = []
    this._isBusy = false
    this._dialogs = {}

    this._container = document.body.appendChild(document.createElement('div'))
    this._container.classList.add('auc-timer-dialog-container')
  }

  _startProcessing () {
    if (this._isBusy) return

    this._isBusy = true
    this._processStep()
  }

  _processStep () {
    setTimeout(() => {
      const dialogMeta = this._queue.shift()
      this._container.style.height = (this._container.getBoundingClientRect().height - 40 + dialogMeta.box.height) + 'px'

      dialogMeta.show()

      if (this._queue.length > 0) {
        this._processStep()
      } else {
        this._isBusy = false
      }
    }, DialogManager.PROCESS_DELAY)
  }

  register (dialog, show) {
    if (!dialog.el) throw new Error('Dialog should have a \'el\' property.')

    this._container.appendChild(dialog.el)

    const dialogId = DialogManager.PREFIX + (this._no++)
    this._dialogs[dialogId] = dialog
    this._queue.push({ box: dialog.el.getBoundingClientRect(), show })
    this._startProcessing()
    return dialogId
  }

  unregister (dialogOrId, hide) {
    let prevDialog

    if (typeof dialogOrId === 'string') {
      prevDialog = this._dialogs[dialogOrId]
      delete this._dialogs[dialogOrId]
    } else {
      for (const DID of Object.keys(this._dialogs)) {
        if (this._dialogs[DID] === dialogOrId) {
          prevDialog = this._dialogs[DID]
          delete this._dialogs[DID]
        }
      }
    }

    hide()
    prevDialog.el.remove()
  }
}
DialogManager.PROCESS_DELAY = 500
DialogManager.PREFIX = 'auc-timer-dialog-'
DialogManager.INSTANCE = new DialogManager()

class Dialog extends EventEmitter {
  constructor (type, msg, options) {
    if (typeof type !== 'string') type = 'info'
    if (typeof msg !== 'string') msg = ''
    if (typeof options !== 'object') {
      options = { ttl: 5000, listeners: {} }
    }

    super()

    options.ttl = typeof options.ttl === 'number' ? options.ttl : 5000
    options.listeners = typeof options.listeners === 'object' ? options.listeners : {}
    this.options = options
    this._id = ''

    this.el = document.createElement('div')
    this.el.innerHTML = msg
    this.el.classList.add('auc-timer-dialog', 'auc-timer-' + type)
    this.el.addEventListener('animationend', () => {
      if (this.el.classList.contains('active')) this.emit('show')
      else this.emit('hide')
    })
    this.on('show', () => {
      setTimeout(() => {
        this.hide()
      }, this.options.ttl)
    })

    Object.keys(options.listeners).forEach((listener) => {
      this.el.addEventListener(listener, options.listeners[listener])
    })

    this.show()
  }

  show () {
    if (this._id) return

    this._id = DialogManager.INSTANCE.register(this, () => {
      this.el.classList.add('active')
    })
  }

  hide () {
    if (!this.el) return

    const _el = this.el
    DialogManager.INSTANCE.ungister(this._id, () => {
      _el.classList.remove('active')
    })

    delete this.el
  }
}

export function error (msg, options) {
  return new Dialog('error', msg, options)
}
