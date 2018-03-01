// ==UserScript==
// @name           OGame Redesign (v.6): Auction Timer
// @author         MomoCow
// @namespace      https://github.com/momocow
// @version        3.0.0
// @description    Displays a countdown timer for the Auction in OGame 6.*
// @include        *.ogame*gameforge.com/game/index.php?page=*
// @updateURL      https://raw.githubusercontent.com/momocow/OGame-Redesign-v.6-Auction-Timer/master/dist/auction-timer.meta.js
// @downloadURL    https://raw.githubusercontent.com/momocow/OGame-Redesign-v.6-Auction-Timer/master/dist/auction-timer.user.js
// @supportURL     https://github.com/momocow/OGame-Redesign-v.6-Auction-Timer/issues
// @run-at         document-body
// @grant          GM_getValue
// @grant          GM_setValue
// ==/UserScript==

/*****************************************************************************
 * Originaly developed by Vesselin
 * Currently developed by MomoCow after v3.0.0
 * Released under MIT
 *****************************************************************************/

/*****************************************************************************
 * Changelog
 * ### v3.0.0
 * - [Add] provide a more stateful timer
 * - [Changed] rewritten as a ES6 script with eslint `standard` coding style
 * - [Optmized] more stable dependency check
 *****************************************************************************/

/* jshint asi:true */

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var events = require('events');
var util = require('util');

var MAX_LOG_ENTRIES = 100;
var MAX_DEP_TIMEOUT = 30000;
var DEP_CHECK_PERIOD = 500;
var DEP_LIST = {
  AUCTION: ['io', '$', 'localStorage', 'nodeParams', 'simpleCountdown', 'loca'],
  NON_AUCTION: ['$', 'localStorage', 'simpleCountdown']
};

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
  if (typeof Array.isArray === 'function') {
    return Array.isArray(arr);
  }

  return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
  if (!obj || toStr.call(obj) !== '[object Object]') {
    return false;
  }

  var hasOwnConstructor = hasOwn.call(obj, 'constructor');
  var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');

  if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
    return false;
  }

  var key;
  for (key in obj) {}

  return typeof key === 'undefined' || hasOwn.call(obj, key);
};

var extend = function extend() {
  var options, name, src, copy, copyIsArray, clone;
  var target = arguments[0];
  var i = 1;
  var length = arguments.length;
  var deep = false;

  if (typeof target === 'boolean') {
    deep = target;
    target = arguments[1] || {};

    i = 2;
  }
  if (target == null || (typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== 'object' && typeof target !== 'function') {
    target = {};
  }

  for (; i < length; ++i) {
    options = arguments[i];

    if (options != null) {
      for (name in options) {
        src = target[name];
        copy = options[name];

        if (target !== copy) {
          if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && isArray(src) ? src : [];
            } else {
              clone = src && isPlainObject(src) ? src : {};
            }

            target[name] = extend(deep, clone, copy);
          } else if (typeof copy !== 'undefined') {
            target[name] = copy;
          }
        }
      }
    }
  }

  return target;
};

function Callable(property) {
  var func = this.constructor.prototype[property];
  var apply = function apply() {
    return func.apply(apply, arguments);
  };
  Object.setPrototypeOf(apply, this.constructor.prototype);
  Object.getOwnPropertyNames(func).forEach(function (p) {
    Object.defineProperty(apply, p, Object.getOwnPropertyDescriptor(func, p));
  });
  return apply;
}
Callable.prototype = Object.create(Function.prototype);

var SafeFunction = function (_Callable) {
  _inherits(SafeFunction, _Callable);

  function SafeFunction(fn, defaultReturn) {
    _classCallCheck(this, SafeFunction);

    if (typeof fn !== 'function') {
      throw new TypeError('fn\' is not a function.');
    }

    var _this = _possibleConstructorReturn(this, (SafeFunction.__proto__ || Object.getPrototypeOf(SafeFunction)).call(this, '__call__'));

    _this._fn = fn;
    _this._rtn = defaultReturn;

    extend(true, _this, new events.EventEmitter());
    return _this;
  }

  _createClass(SafeFunction, [{
    key: '__call__',
    value: function __call__() {
      try {
        return this._fn.apply(this, arguments);
      } catch (err) {
        this.emit('error', err);
        return this._rtn;
      }
    }
  }]);

  return SafeFunction;
}(Callable);

var NOT_SUPPORTED_ENV = '[Auction Timer] The script will not work on your browser since it is out-of-date.\n\nYou can either disable the script or update your browser to avoid the alert.';

var DependencyError = function (_Error) {
  _inherits(DependencyError, _Error);

  function DependencyError(depName, reason) {
    _classCallCheck(this, DependencyError);

    var _this2 = _possibleConstructorReturn(this, (DependencyError.__proto__ || Object.getPrototypeOf(DependencyError)).call(this, 'Dependency check failed for \'' + depName + '\'. Reason: ' + reason));

    _this2.name = 'DependencyError';
    return _this2;
  }

  return DependencyError;
}(Error);

var NotSupportedError = function (_Error2) {
  _inherits(NotSupportedError, _Error2);

  function NotSupportedError() {
    _classCallCheck(this, NotSupportedError);

    var _this3 = _possibleConstructorReturn(this, (NotSupportedError.__proto__ || Object.getPrototypeOf(NotSupportedError)).call(this, '' + NOT_SUPPORTED_ENV));

    _this3.name = 'NotSupportedError';
    return _this3;
  }

  return NotSupportedError;
}(Error);

GM_getValue = GM_getValue || function (key, defaultVal) {
  if (!window.localStorage && !window.localStorage.getItem) throw new NotSupportedError();

  var storage = window.localStorage.getItem(key);
  return storage === null ? defaultVal : storage;
};

GM_setValue = GM_setValue || function (key, val) {
  if (!window.localStorage && !window.localStorage.setItem) throw new NotSupportedError();

  window.localStorage.setItem(key, val);
};

var GMLogger = function () {
  function GMLogger(superObj, config) {
    _classCallCheck(this, GMLogger);

    extend(true, this, superObj);

    this._GM_key = '__logs__';
    this._MAX_LOG_ENTRIES = config.MAX_LOG_ENTRIES;
    this._cache = [];

    this._load();
  }

  _createClass(GMLogger, [{
    key: '_gc',
    value: function _gc() {
      if (this._cache.length > this._MAX_LOG_ENTRIES) {
        this._cache.splice(0, this._cache.length - this._MAX_LOG_ENTRIES);
      }
    }
  }, {
    key: '_log',
    value: function _log(level) {
      var time = new Date();

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var msg = util.format.apply(util, args);

      this._cache.push({
        time: time,
        level: level,
        msg: msg,
        toString: function toString() {
          return '[' + time + '][' + level + '] ' + msg;
        }
      });
    }
  }, {
    key: '_load',
    value: function _load() {
      this._cache = GM_getValue(this._GM_key, []);
    }
  }, {
    key: '_save',
    value: function _save() {
      this._gc();
      GM_setValue(this._GM_key, this._cache);
    }
  }, {
    key: 'debug',
    value: function debug() {
      var _console;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      (_console = console).debug.apply(_console, args);
      this._log.apply(this, ['debug'].concat(args));
    }
  }, {
    key: 'info',
    value: function info() {
      var _console2;

      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      if (arguments.length === 0) return;
      (_console2 = console).info.apply(_console2, args);
      this._log.apply(this, ['info'].concat(args));
    }
  }, {
    key: 'warn',
    value: function warn() {
      var _console3;

      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      if (arguments.length === 0) return;
      (_console3 = console).warn.apply(_console3, args);
      this._log.apply(this, ['warn'].concat(args));
    }
  }, {
    key: 'error',
    value: function error() {
      var _console4;

      for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      if (arguments.length === 0) return;
      (_console4 = console).error.apply(_console4, args);
      this._log.apply(this, ['error'].concat(args));
    }
  }]);

  return GMLogger;
}();

function getLogger() {
  try {
    return new GMLogger(console, { MAX_LOG_ENTRIES: MAX_LOG_ENTRIES });
  } catch (e) {
    if (e instanceof NotSupportedError) {
      window.alert(e.message);
    }
    return console;
  }
}

var LOG = getLogger();

function checkDependencies(scope, deps, cb, due) {
  due = due instanceof Date ? due : new Date(new Date().getTime() + MAX_DEP_TIMEOUT);

  var lacks = [];

  if (lacks.length === 0) {
    cb(null);
  } else if (lacks.length > 0) {
    if (new Date().getTime() <= due.getTime()) {
      var safeFn = new SafeFunction(checkDependencies.bind(undefined, cb, due));
      safeFn.on('error', function (err) {
        LOG.error(err);
      });

      setTimeout(safeFn, DEP_CHECK_PERIOD);
    } else {
      cb(new DependencyError('socket.io', 'Initialization timeout'));
    }
  }
}

var SimpleCountdown = simpleCountdown;

function changeTimeLeft(timer, timeLeft) {
  if ((typeof timer === 'undefined' ? 'undefined' : _typeof(timer)) !== 'object') {
    return;
  }
  var time = new Date();
  if (_typeof(timer.countdown) === 'object') {
    timer.countdown.startTime = time.getTime();
    timer.countdown.startLeftoverTime = timeLeft;
  } else if (_typeof(timer.countdownObject) === 'object') {
    timer.countdownObject.startTime = time.getTime();
    timer.countdownObject.startLeftoverTime = timeLeft;
  }
}

function handleAuction() {
  var createTimer = function createTimer() {
    var oldMins = -1;
    var first = false;
    var overflowAuctionTimer = null;
    var newMins = void 0,
        mins = void 0,
        secs = void 0,
        auctionTimer = void 0,
        auctionEndTime = void 0,
        currentTime = void 0;
    var uni = document.location.href.replace(/^https:\/\/([^/]+).+/, '$1');

    if ($('#auctionTimer').length) {
      return;
    }
    $('p.auction_info').next().before('<span id="auctionTimer" style="font-weight: bold; color: ' + $('p.auction_info span').css('color') + ';"></span>');
    if ($('#div_traderAuctioneer .left_header h2').text().indexOf(loca.auctionFinished) < 0) {
      auctionEndTime = localStorage.getItem(uni + '_auctionEndTime');
      auctionEndTime = auctionEndTime ? parseInt(auctionEndTime) : -1;
      currentTime = new Date().getTime();
      if (auctionEndTime >= currentTime) {
        secs = Math.round((auctionEndTime - currentTime) / 1000);
        oldMins = Math.ceil(secs / 60);
        first = false;
      } else {
        oldMins = parseInt($('p.auction_info').text().match(/\d+/g)[0]);
        secs = oldMins * 60;
        first = true;
      }
      mins = oldMins;
      auctionTimer = new SimpleCountdown($('#auctionTimer').get(0), secs, function () {
        $('#auctionTimer').text('');
      });
    }

    var mySock = io.connect('/auctioneer', nodeParams);
    var onConnect = new SafeFunction(function () {
      mySock.on('timeLeft', function (msg) {
        if ($('#div_traderAuctioneer .left_header h2').text().indexOf(loca.auctionFinished) >= 0) {
          first = true;
          localStorage.setItem(uni + '_auctionEndTime', '-1');
          return;
        }
        auctionEndTime = localStorage.getItem(uni + '_auctionEndTime');
        auctionEndTime = auctionEndTime ? parseInt(auctionEndTime) : -1;
        currentTime = new Date().getTime();
        /<b>\D+(\d+)/.exec(msg);
        newMins = parseInt(RegExp.$1);
        if (newMins === oldMins) {
          mins--;
          if (first) {
            first = false;
          } else if (auctionEndTime >= 0) {
            localStorage.setItem(uni + '_auctionEndTime', currentTime + mins * 60 * 1000);
          }
        } else {
          if (newMins > oldMins && auctionEndTime >= currentTime) {
            newMins = Math.round((auctionEndTime - currentTime) / (1000 * 60));
          }
          if (first) {
            first = false;
          } else if (oldMins >= 0) {
            localStorage.setItem(uni + '_auctionEndTime', currentTime + newMins * 60 * 1000);
          }
          oldMins = newMins;
          mins = newMins;
        }
        if (mins) {
          changeTimeLeft(auctionTimer, mins * 60);
        } else {
          overflowAuctionTimer = new SimpleCountdown($('#auctionTimer').get(0), 30, function () {
            $('#auctionTimer').text('');
          });
        }
        setTimeout(function () {
          $('#auctionTimer').css('color', $('p.auction_info span').css('color'));
        }, 100);
      });
      mySock.on('new auction', function (msg) {
        /<b>\D+(\d+)/.exec(msg.info);
        mins = parseInt(RegExp.$1);
        auctionTimer = new SimpleCountdown($('#auctionTimer').get(0), mins * 60, function () {
          $('#auctionTimer').text('');
        });
        overflowAuctionTimer = null;
        first = true;
        setTimeout(function () {
          $('#auctionTimer').css('color', $('p.auction_info span').css('color'));
        }, 100);
      });
      mySock.on('auction finished', function (msg) {
        changeTimeLeft(auctionTimer, 0);
        changeTimeLeft(overflowAuctionTimer, 0);
        first = true;
        localStorage.setItem(uni + '_auctionEndTime', '-1');
      });
    });

    onConnect.on('error', function (err) {
      LOG.error(err);
    });

    mySock.on('connect', onConnect).on('error', LOG.error.bind(LOG));
  };

  if (document.getElementById('div_traderAuctioneer')) {
    createTimer();
  } else {
    $(document).ajaxSuccess(function () {
      if ($('#auctionTimer').length === 0) {
        createTimer();
      }
    });
  }
}

var SimpleCountdown$1 = simpleCountdown;

function handleNonAuction() {
  var uni = document.location.href.replace(/^https:\/\/([^/]+).+/, '$1');
  var auctionEndTime = localStorage.getItem(uni + '_auctionEndTime');
  if (auctionEndTime == null) {
    return;
  }
  auctionEndTime = parseInt(auctionEndTime);
  var currentTime = new Date().getTime();
  if (auctionEndTime < currentTime) {
    return;
  }
  var clock = $('#OGameClock');
  if (clock.length <= 0) {
    clock = $('.OGameClock');
  }
  if (clock.length <= 0) {
    return;
  }
  clock.parent().append('<li id="auctionTimer" style="position: absolute; right: 125px;"></li>');
  var auctionTimer = new SimpleCountdown$1($('#auctionTimer').get(0), Math.round((auctionEndTime - currentTime) / 1000), function () {
    $('#auctionTimer').text('');
  });
}

(function () {
  if (document.location.href.indexOf('/game/index.php?') < 0) {
    return;
  }

  try {
    if (document.location.href.indexOf('/game/index.php?page=traderOverview') >= 0) {
      checkDependencies(window, DEP_LIST.AUCTION, handleAuction);
    } else if (document.getElementById('bar')) {
      checkDependencies(window, DEP_LIST.NON_AUCTION, handleNonAuction);
    }
  } catch (e) {
    LOG.error(e);
  }
})();
