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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF1Y3Rpb24tdGltZXIuanMiLCIuLi9zcmMvY29uZmlnLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2V4dGVuZC9pbmRleC5qcyIsIi4uL3V0aWwvZnVuY3Rpb24uanMiLCIuLi9zcmMvc3RyaW5ncy5qcyIsIi4uL3NyYy9lcnJvcnMuanMiLCIuLi9zcmMvbG9nZ2VyLmpzIiwiLi4vc3JjL2RlcGVuZGVuY3kuanMiLCIuLi9zcmMvaGFuZGxlci9hdWN0aW9uLmpzIiwiLi4vc3JjL2hhbmRsZXIvbm9uLWF1Y3Rpb24uanMiLCIuLi9zcmMvaW5kZXguanMiXSwibmFtZXMiOlsiZXZlbnRzIiwicmVxdWlyZSIsInV0aWwiLCJNQVhfTE9HX0VOVFJJRVMiLCJNQVhfREVQX1RJTUVPVVQiLCJERVBfQ0hFQ0tfUEVSSU9EIiwiREVQX0xJU1QiLCJBVUNUSU9OIiwiTk9OX0FVQ1RJT04iLCJoYXNPd24iLCJPYmplY3QiLCJwcm90b3R5cGUiLCJoYXNPd25Qcm9wZXJ0eSIsInRvU3RyIiwidG9TdHJpbmciLCJpc0FycmF5IiwiYXJyIiwiQXJyYXkiLCJjYWxsIiwiaXNQbGFpbk9iamVjdCIsIm9iaiIsImhhc093bkNvbnN0cnVjdG9yIiwiaGFzSXNQcm90b3R5cGVPZiIsImNvbnN0cnVjdG9yIiwia2V5IiwiZXh0ZW5kIiwib3B0aW9ucyIsIm5hbWUiLCJzcmMiLCJjb3B5IiwiY29weUlzQXJyYXkiLCJjbG9uZSIsInRhcmdldCIsImFyZ3VtZW50cyIsImkiLCJsZW5ndGgiLCJkZWVwIiwiQ2FsbGFibGUiLCJwcm9wZXJ0eSIsImZ1bmMiLCJhcHBseSIsInNldFByb3RvdHlwZU9mIiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsImZvckVhY2giLCJwIiwiZGVmaW5lUHJvcGVydHkiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJjcmVhdGUiLCJGdW5jdGlvbiIsIlNhZmVGdW5jdGlvbiIsImZuIiwiZGVmYXVsdFJldHVybiIsIlR5cGVFcnJvciIsIl9mbiIsIl9ydG4iLCJFdmVudEVtaXR0ZXIiLCJlcnIiLCJlbWl0IiwiTk9UX1NVUFBPUlRFRF9FTlYiLCJEZXBlbmRlbmN5RXJyb3IiLCJkZXBOYW1lIiwicmVhc29uIiwiRXJyb3IiLCJOb3RTdXBwb3J0ZWRFcnJvciIsIkdNX2dldFZhbHVlIiwiZGVmYXVsdFZhbCIsIndpbmRvdyIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJzdG9yYWdlIiwiR01fc2V0VmFsdWUiLCJ2YWwiLCJzZXRJdGVtIiwiR01Mb2dnZXIiLCJzdXBlck9iaiIsImNvbmZpZyIsIl9HTV9rZXkiLCJfTUFYX0xPR19FTlRSSUVTIiwiX2NhY2hlIiwiX2xvYWQiLCJzcGxpY2UiLCJsZXZlbCIsInRpbWUiLCJEYXRlIiwiYXJncyIsIm1zZyIsImZvcm1hdCIsInB1c2giLCJfZ2MiLCJkZWJ1ZyIsIl9sb2ciLCJpbmZvIiwid2FybiIsImVycm9yIiwiZ2V0TG9nZ2VyIiwiY29uc29sZSIsImUiLCJhbGVydCIsIm1lc3NhZ2UiLCJMT0ciLCJjaGVja0RlcGVuZGVuY2llcyIsInNjb3BlIiwiZGVwcyIsImNiIiwiZHVlIiwiZ2V0VGltZSIsImxhY2tzIiwic2FmZUZuIiwiYmluZCIsInVuZGVmaW5lZCIsIm9uIiwic2V0VGltZW91dCIsIlNpbXBsZUNvdW50ZG93biIsInNpbXBsZUNvdW50ZG93biIsImNoYW5nZVRpbWVMZWZ0IiwidGltZXIiLCJ0aW1lTGVmdCIsImNvdW50ZG93biIsInN0YXJ0VGltZSIsInN0YXJ0TGVmdG92ZXJUaW1lIiwiY291bnRkb3duT2JqZWN0IiwiaGFuZGxlQXVjdGlvbiIsImNyZWF0ZVRpbWVyIiwib2xkTWlucyIsImZpcnN0Iiwib3ZlcmZsb3dBdWN0aW9uVGltZXIiLCJuZXdNaW5zIiwibWlucyIsInNlY3MiLCJhdWN0aW9uVGltZXIiLCJhdWN0aW9uRW5kVGltZSIsImN1cnJlbnRUaW1lIiwidW5pIiwiZG9jdW1lbnQiLCJsb2NhdGlvbiIsImhyZWYiLCJyZXBsYWNlIiwiJCIsIm5leHQiLCJiZWZvcmUiLCJjc3MiLCJ0ZXh0IiwiaW5kZXhPZiIsImxvY2EiLCJhdWN0aW9uRmluaXNoZWQiLCJwYXJzZUludCIsIk1hdGgiLCJyb3VuZCIsImNlaWwiLCJtYXRjaCIsImdldCIsIm15U29jayIsImlvIiwiY29ubmVjdCIsIm5vZGVQYXJhbXMiLCJvbkNvbm5lY3QiLCJleGVjIiwiUmVnRXhwIiwiJDEiLCJnZXRFbGVtZW50QnlJZCIsImFqYXhTdWNjZXNzIiwiaGFuZGxlTm9uQXVjdGlvbiIsImNsb2NrIiwicGFyZW50IiwiYXBwZW5kIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7O0FBRUEsSUFBSUEsU0FBU0MsUUFBUSxRQUFSLENBQWI7QUFDQSxJQUFJQyxPQUFPRCxRQUFRLE1BQVIsQ0FBWDs7QUNITyxJQUFNRSxrQkFBa0IsR0FBeEI7QUFDUCxJQUFhQyxrQkFBa0IsS0FBL0I7QUFDQSxJQUFhQyxtQkFBbUIsR0FBaEM7QUFDQSxJQUFhQyxXQUFXO0FBQ3RCQyxXQUFTLENBQ1AsSUFETyxFQUVQLEdBRk8sRUFHUCxjQUhPLEVBSVAsWUFKTyxFQUtQLGlCQUxPLEVBTVAsTUFOTyxDQURhO0FBU3RCQyxlQUFhLENBQ1gsR0FEVyxFQUVYLGNBRlcsRUFHWCxpQkFIVztBQVRTLENBQXhCOztBQ0RBLElBQUlDLFNBQVNDLE9BQU9DLFNBQVAsQ0FBaUJDLGNBQTlCO0FBQ0EsSUFBSUMsUUFBUUgsT0FBT0MsU0FBUCxDQUFpQkcsUUFBN0I7O0FBRUEsSUFBSUMsVUFBVSxTQUFTQSxPQUFULENBQWlCQyxHQUFqQixFQUFzQjtBQUNuQyxNQUFJLE9BQU9DLE1BQU1GLE9BQWIsS0FBeUIsVUFBN0IsRUFBeUM7QUFDeEMsV0FBT0UsTUFBTUYsT0FBTixDQUFjQyxHQUFkLENBQVA7QUFDQTs7QUFFRCxTQUFPSCxNQUFNSyxJQUFOLENBQVdGLEdBQVgsTUFBb0IsZ0JBQTNCO0FBQ0EsQ0FORDs7QUFRQSxJQUFJRyxnQkFBZ0IsU0FBU0EsYUFBVCxDQUF1QkMsR0FBdkIsRUFBNEI7QUFDL0MsTUFBSSxDQUFDQSxHQUFELElB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RDtBQUNGLEtBSkQ7QUFLRDtBQUNGOztBQzNHRCxJQUFNVixvQkFBa0JDLGVBQXhCOztBQUVBLFNBQWdCZ0QsZ0JBQWhCLEdBQW9DO0FBQ2xDLE1BQUk3QixNQUFNQyxTQUFTQyxRQUFULENBQWtCQyxJQUFsQixDQUF1QkMsT0FBdkIsQ0FBK0Isc0JBQS9CLEVBQXVELElBQXZELENBQVY7QUFDQSxNQUFJTixpQkFBaUIvRCxhQUFhQyxPQUFiLENBQXFCZ0UsTUFBTSxpQkFBM0IsQ0FBckI7QUFDQSxNQUFJRixrQkFBa0IsSUFBdEIsRUFBNEI7QUFBRTtBQUFRO0FBQ3RDQSxtQkFBaUJlLFNBQVNmLGNBQVQsQ0FBakI7QUFDQSxNQUFJQyxjQUFjLElBQUloRCxJQUFKLEdBQVdzQixPQUFYLEVBQWxCO0FBQ0EsTUFBSXlCLGlCQUFpQkMsV0FBckIsRUFBa0M7QUFBRTtBQUFRO0FBQzVDLE1BQUkrQixRQUFRekIsRUFBRSxhQUFGLENBQVo7QUFDQSxNQUFJeUIsTUFBTS9ILE1BQU4sSUFBZ0IsQ0FBcEIsRUFBdUI7QUFBRStILFlBQVF6QixFQUFFLGFBQUYsQ0FBUjtBQUEwQjtBQUNuRCxNQUFJeUIsTUFBTS9ILE1BQU4sSUFBZ0IsQ0FBcEIsRUFBdUI7QUFBRTtBQUFRO0FBQ2pDK0gsUUFBTUMsTUFBTixHQUFlQyxNQUFmLENBQXNCLHVFQUF0QjtBQUNBLE1BQUluQyxlQUFlLElBQUlqQixpQkFBSixDQUFvQnlCLEVBQUUsZUFBRixFQUFtQmEsR0FBbkIsQ0FBdUIsQ0FBdkIsQ0FBcEIsRUFDakJKLEtBQUtDLEtBQUwsQ0FBVyxDQUFDakIsaUJBQWlCQyxXQUFsQixJQUFpQyxJQUE1QyxDQURpQixFQUVqQixZQUFZO0FBQUVNLE1BQUUsZUFBRixFQUFtQkksSUFBbkIsQ0FBd0IsRUFBeEI7QUFBNkIsR0FGMUIsQ0FBbkI7QUFHRDs7QUNaRCxDQUFDLFlBQVk7QUFFWCxNQUFJUixTQUFTQyxRQUFULENBQWtCQyxJQUFsQixDQUF1Qk8sT0FBdkIsQ0FBK0Isa0JBQS9CLElBQXFELENBQXpELEVBQTREO0FBQUU7QUFBUTs7QUFFdEUsTUFBSTtBQUNGLFFBQUlULFNBQVNDLFFBQVQsQ0FBa0JDLElBQWxCLENBQXVCTyxPQUF2QixDQUErQixxQ0FBL0IsS0FBeUUsQ0FBN0UsRUFBZ0Y7QUFDOUUxQyx3QkFBa0JsQyxNQUFsQixFQUEwQjVELFNBQVNDLE9BQW5DLEVBQTRDa0gsYUFBNUM7QUFDRCxLQUZELE1BRU8sSUFBSVksU0FBUzBCLGNBQVQsQ0FBd0IsS0FBeEIsQ0FBSixFQUFvQztBQUN6QzNELHdCQUFrQmxDLE1BQWxCLEVBQTBCNUQsU0FBU0UsV0FBbkMsRUFBZ0R5SixnQkFBaEQ7QUFDRDtBQUNGLEdBTkQsQ0FNRSxPQUFPakUsQ0FBUCxFQUFVO0FBQ1ZHLFFBQUlOLEtBQUosQ0FBVUcsQ0FBVjtBQUNEO0FBQ0YsQ0FiRCIsImZpbGUiOiIuLi8uLi8uLi8uLi8uLi9hdWN0aW9uLXRpbWVyLmpzIn0=