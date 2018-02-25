/* globals $, localStorage, io, GM_getValue, GM_setValue */
/* globals nodeParams, simpleCountdown, loca */

(function () {
  // The following "if" is not really necessary but with it this script will work for Opera too
  if (document.location.href.indexOf('/game/index.php?') < 0) { return }

  // strings
  /**************************************/
  const NOT_SUPPORTED_ENV = `[Auction Timer] The script will not work on your browser since it is out-of-date.
\nYou can either disable the script or update your browser.`
  /**************************************/

  // inline config
  /**************************************/
  const MAX_LOG_ENTRIES = 100
  const MAX_DEP_TIMEOUT = 30000 // ms
  const DEP_CHECK_PERIOD = 500 // ms
  const DEP_LIST = {
    AUCTION: [
      'io',
      '$',
      'localStorage',
      'nodeParams',
      'simpleCountdown',
      'loca'
    ],
    NON_AUCTION: [
      '$',
      'localStorage',
      'simpleCountdown'
    ]
  }
  /**************************************/

  // utils
  /**************************************/
  const stringify = function (obj) {
    return JSON.stringify(obj, null, 2)
  }

  const format = function (f) {
    if (typeof f !== 'string') {
      const objects = new Array(arguments.length)
      for (var index = 0; index < arguments.length; index++) {
        objects[index] = stringify(arguments[index])
      }
      return objects.join(' ')
    }

    if (arguments.length === 1) return f

    var str = ''
    var a = 1
    var lastPos = 0
    for (var i = 0; i < f.length;) {
      if (f.charCodeAt(i) === 37/* '%' */ && i + 1 < f.length) {
        if (f.charCodeAt(i + 1) !== 37/* '%' */ && a >= arguments.length) {
          ++i
          continue
        }
        if (lastPos < i) { str += f.slice(lastPos, i) }
        switch (f.charCodeAt(i + 1)) {
          case 100: // 'd'
            str += Number(arguments[a++])
            break
          case 105: // 'i'
            str += parseInt(arguments[a++])
            break
          case 102: // 'f'
            str += parseFloat(arguments[a++])
            break
          case 106: // 'j'
            str += stringify(arguments[a++])
            break
          case 115: // 's'
            str += String(arguments[a++])
            break
          case 79: // 'O'
            str += stringify(arguments[a++])
            break
          case 111: // 'o'
            str += stringify(arguments[a++],
              { showHidden: true, depth: 4, showProxy: true })
            break
          case 37: // '%'
            str += '%'
            break
          default: // any other character is not a correct placeholder
            str += '%'
            lastPos = i = i + 1
            continue
        }
        lastPos = i = i + 2
        continue
      }
      ++i
    }
    if (lastPos === 0) { str = f } else if (lastPos < f.length) { str += f.slice(lastPos) }
    while (a < arguments.length) {
      const x = arguments[a++]
      if (x === null || (typeof x !== 'object' && typeof x !== 'symbol')) {
        str += ` ${x}`
      } else {
        str += ` ${stringify(x)}`
      }
    }
    return str
  }
  /**************************************/

  // functions
  /**************************************/
  const checkDependencies = function (scope, deps, cb, due) {
    due = due instanceof Date ? due : new Date(new Date().getTime() + MAX_DEP_TIMEOUT)

    const lacks = []

    if (lacks.length === 0) {
      cb(null)
    } else if (lacks.length > 0) {
      if (new Date().getTime() <= due.getTime()) { // effective
        setTimeout(checkDependencies.bind(undefined, cb, due), DEP_CHECK_PERIOD)
      } else { // expired
        cb(new DependencyError('socket.io', 'Initialization timeout'))
      }
    }
  }

  const handleAuctionPage = function () {
    let createTimer = function () {
      let oldMins = -1
      let first = false
      let overflowAuctionTimer = null
      let newMins, mins, secs, auctionTimer, auctionEndTime, currentTime
      let uni = document.location.href.replace(/^https:\/\/([^/]+).+/, '$1')
      function changeTimeLeft (timer, timeLeft) {
        if (typeof (timer) !== 'object') { return }
        let time = new Date()
        if (typeof (timer.countdown) === 'object') {
          timer.countdown.startTime = time.getTime()
          timer.countdown.startLeftoverTime = timeLeft
        } else if (typeof (timer.countdownObject) === 'object') {
          timer.countdownObject.startTime = time.getTime()
          timer.countdownObject.startLeftoverTime = timeLeft
        }
      }

      if ($('#auctionTimer').length) { return }
      $('p.auction_info').next().before('<span id="auctionTimer" style="font-weight: bold; color: ' + $('p.auction_info span').css('color') + ';"></span>')
      if ($('#div_traderAuctioneer .left_header h2').text().indexOf(loca.auctionFinished) < 0) {
        auctionEndTime = localStorage.getItem(uni + '_auctionEndTime')
        auctionEndTime = (auctionEndTime) ? parseInt(auctionEndTime) : -1
        currentTime = new Date().getTime()
        if (auctionEndTime >= currentTime) {
          secs = Math.round((auctionEndTime - currentTime) / 1000)
          oldMins = Math.ceil(secs / 60)
          first = false
        } else {
          oldMins = parseInt($('p.auction_info').text().match(/\d+/g)[0])
          secs = oldMins * 60
          first = true
        }
        mins = oldMins
        auctionTimer = new simpleCountdown($('#auctionTimer').get(0), secs, function () { $('#auctionTimer').text('') })
      }
      let mySock = new io.connect('/auctioneer', nodeParams)
      mySock.on('timeLeft', function (msg) {
        if ($('#div_traderAuctioneer .left_header h2').text().indexOf(loca.auctionFinished) >= 0) {
          first = true
          localStorage.setItem(uni + '_auctionEndTime', '-1')
          return
        }
        auctionEndTime = localStorage.getItem(uni + '_auctionEndTime')
        auctionEndTime = (auctionEndTime) ? parseInt(auctionEndTime) : -1
        currentTime = new Date().getTime();
        /<b>\D+(\d+)/.exec(msg)
        newMins = parseInt(RegExp.$1)
        if (newMins === oldMins) {
          mins--
          if (first) { first = false } else if (auctionEndTime >= 0) { localStorage.setItem(uni + '_auctionEndTime', currentTime + mins * 60 * 1000) }
        } else {
          if ((newMins > oldMins) && (auctionEndTime >= currentTime)) { newMins = Math.round((auctionEndTime - currentTime) / (1000 * 60)) }
          if (first) { first = false } else if (oldMins >= 0) { localStorage.setItem(uni + '_auctionEndTime', currentTime + newMins * 60 * 1000) }
          oldMins = newMins
          mins = newMins
        }
        if (mins) { changeTimeLeft(auctionTimer, mins * 60) } else { overflowAuctionTimer = new simpleCountdown($('#auctionTimer').get(0), 30, function () { $('#auctionTimer').text('') }) }
        setTimeout(function () {
          $('#auctionTimer').css('color', $('p.auction_info span').css('color'))
        }, 100)
      })
      mySock.on('new auction', function (msg) {
        /<b>\D+(\d+)/.exec(msg.info)
        mins = parseInt(RegExp.$1)
        auctionTimer = new simpleCountdown($('#auctionTimer').get(0), mins * 60, function () { $('#auctionTimer').text('') })
        overflowAuctionTimer = null
        first = true
        setTimeout(function () {
          $('#auctionTimer').css('color', $('p.auction_info span').css('color'))
        }, 100)
      })
      mySock.on('auction finished', function (msg) {
        changeTimeLeft(auctionTimer, 0)
        changeTimeLeft(overflowAuctionTimer, 0)
        first = true
        localStorage.setItem(uni + '_auctionEndTime', '-1')
      })
    }

    if (document.getElementById('div_traderAuctioneer')) {
      createTimer()
    } else {
      $(document).ajaxSuccess(function () {
        if ($('#auctionTimer').length === 0) {
          createTimer()
        }
      })
    }
  }

  const handleNonAuctionPage = function () {
    let uni = document.location.href.replace(/^https:\/\/([^/]+).+/, '$1')
    let auctionEndTime = localStorage.getItem(uni + '_auctionEndTime')
    if (auctionEndTime == null) { return }
    auctionEndTime = parseInt(auctionEndTime)
    let currentTime = new Date().getTime()
    if (auctionEndTime < currentTime) { return }
    let clock = $('#OGameClock')
    if (clock.length <= 0) { clock = $('.OGameClock') }
    if (clock.length <= 0) { return }
    clock.parent().append('<li id="auctionTimer" style="position: absolute; right: 125px;"></li>')
    let auctionTimer = new simpleCountdown($('#auctionTimer').get(0),
      Math.round((auctionEndTime - currentTime) / 1000),
      function () { $('#auctionTimer').text('') })
  }

  const main = function () {
    if (document.location.href.indexOf('/game/index.php?page=traderOverview') >= 0) {
      checkDependencies(window, DEP_LIST.AUCTION, handleAuctionPage)
    } else if (document.getElementById('bar')) {
      checkDependencies(window, DEP_LIST.NON_AUCTION, handleNonAuctionPage)
    }
  }
  /**************************************/

  // classes
  /**************************************/
  const DependencyError = class extends Error {
    constructor (depName, reason) {
      super(`Dependency check failed for '${depName}'. Reason: ${reason}`)
      this.name = 'DependencyError'
    }
  }

  /**
  * [SPEC] aim to be supported in most browsers for error handling
  */
  const GMLogger = class {
    constructor () {
      this._GM_key = '__logs__'
      this._cache = null

      // init
      this._load()
    }

    _gc () {

    }

    _log (level, args) {
      let time = new Date()
      let msg = format.apply(undefined, args)

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
      GM_setValue(this._GM_key, this._cache)
    }

    /**
     * @param {string} msg a message or template string
     * @param {...mixed} args arguments to format the template
     */
    debug () {
      if (arguments.length === 0) return
      console.debug.apply(console, arguments)
      this._log('debug', arguments)
    }

    /**
     * @param {string} msg a message or template string
     * @param {...mixed} args arguments to format the template
     */
    info () {
      if (arguments.length === 0) return
      console.info.apply(console, arguments)
      this._log('info', arguments)
    }

    /**
     * @param {string} msg a message or template string
     * @param {...mixed} args arguments to format the template
     */
    warn () {
      if (arguments.length === 0) return
      console.warn.apply(console, arguments)
      this._log('warn', arguments)
    }

    /**
     * @param {string} msg a message or template string
     * @param {...mixed} args arguments to format the template
     */
    error () {
      if (arguments.length === 0) return
      console.error.apply(console, arguments)
      this._log('error', arguments)
    }
  }
  /**************************************/

  // init
  /**************************************/
  const LOG = new GMLogger()
  /**************************************/

  window.alert(NOT_SUPPORTED_ENV)

  try {
    main()
  } catch (e) {
    // LOG.
  }
})()
