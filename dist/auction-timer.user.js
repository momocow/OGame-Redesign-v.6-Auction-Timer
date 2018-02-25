// ==UserScript==
// @name           OGame Redesign (v.6): Auction Timer
// @author         MomoCow
// @namespace      https://github.com/momocow
// @version        3.0.0
// @description    Displays a countdown timer for the Auction in OGame 6.*
// @include        *.ogame*gameforge.com/game/index.php?page=*
//
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

(function () {
  if (document.location.href.indexOf('/game/index.php?') < 0) {
    return;
  }

  var NOT_SUPPORTED_ENV = '[Auction Timer] The script will not work on your browser since it is out-of-date.\n\nYou can either disable the script or update your browser.';

  var MAX_LOG_ENTRIES = 100;
  var MAX_DEP_TIMEOUT = 30000;
  var DEP_CHECK_PERIOD = 500;
  var DEP_LIST = {
    AUCTION: ['io', '$', 'localStorage', 'nodeParams', 'simpleCountdown', 'loca'],
    NON_AUCTION: ['$', 'localStorage', 'simpleCountdown']
  };

  var stringify = function stringify(obj) {
    return JSON.stringify(obj, null, 2);
  };

  var format = function format(f) {
    if (typeof f !== 'string') {
      var objects = new Array(arguments.length);
      for (var index = 0; index < arguments.length; index++) {
        objects[index] = stringify(arguments[index]);
      }
      return objects.join(' ');
    }

    if (arguments.length === 1) return f;

    var str = '';
    var a = 1;
    var lastPos = 0;
    for (var i = 0; i < f.length;) {
      if (f.charCodeAt(i) === 37 && i + 1 < f.length) {
        if (f.charCodeAt(i + 1) !== 37 && a >= arguments.length) {
          ++i;
          continue;
        }
        if (lastPos < i) {
          str += f.slice(lastPos, i);
        }
        switch (f.charCodeAt(i + 1)) {
          case 100:
            str += Number(arguments[a++]);
            break;
          case 105:
            str += parseInt(arguments[a++]);
            break;
          case 102:
            str += parseFloat(arguments[a++]);
            break;
          case 106:
            str += stringify(arguments[a++]);
            break;
          case 115:
            str += String(arguments[a++]);
            break;
          case 79:
            str += stringify(arguments[a++]);
            break;
          case 111:
            str += stringify(arguments[a++], { showHidden: true, depth: 4, showProxy: true });
            break;
          case 37:
            str += '%';
            break;
          default:
            str += '%';
            lastPos = i = i + 1;
            continue;
        }
        lastPos = i = i + 2;
        continue;
      }
      ++i;
    }
    if (lastPos === 0) {
      str = f;
    } else if (lastPos < f.length) {
      str += f.slice(lastPos);
    }
    while (a < arguments.length) {
      var x = arguments[a++];
      if (x === null || (typeof x === 'undefined' ? 'undefined' : _typeof(x)) !== 'object' && (typeof x === 'undefined' ? 'undefined' : _typeof(x)) !== 'symbol') {
        str += ' ' + x;
      } else {
        str += ' ' + stringify(x);
      }
    }
    return str;
  };

  var checkDependencies = function checkDependencies(scope, deps, cb, due) {
    due = due instanceof Date ? due : new Date(new Date().getTime() + MAX_DEP_TIMEOUT);

    var lacks = [];

    if (lacks.length === 0) {
      cb(null);
    } else if (lacks.length > 0) {
      if (new Date().getTime() <= due.getTime()) {
        setTimeout(checkDependencies.bind(undefined, cb, due), DEP_CHECK_PERIOD);
      } else {
        cb(new DependencyError('socket.io', 'Initialization timeout'));
      }
    }
  };

  var handleAuctionPage = function handleAuctionPage() {
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
        auctionTimer = new simpleCountdown($('#auctionTimer').get(0), secs, function () {
          $('#auctionTimer').text('');
        });
      }
      var mySock = new io.connect('/auctioneer', nodeParams);
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
          overflowAuctionTimer = new simpleCountdown($('#auctionTimer').get(0), 30, function () {
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
        auctionTimer = new simpleCountdown($('#auctionTimer').get(0), mins * 60, function () {
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
  };

  var handleNonAuctionPage = function handleNonAuctionPage() {
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
    var auctionTimer = new simpleCountdown($('#auctionTimer').get(0), Math.round((auctionEndTime - currentTime) / 1000), function () {
      $('#auctionTimer').text('');
    });
  };

  var main = function main() {
    if (document.location.href.indexOf('/game/index.php?page=traderOverview') >= 0) {
      checkDependencies(window, DEP_LIST.AUCTION, handleAuctionPage);
    } else if (document.getElementById('bar')) {
      checkDependencies(window, DEP_LIST.NON_AUCTION, handleNonAuctionPage);
    }
  };

  var DependencyError = function (_Error) {
    _inherits(DependencyError, _Error);

    function DependencyError(depName, reason) {
      _classCallCheck(this, DependencyError);

      var _this = _possibleConstructorReturn(this, (DependencyError.__proto__ || Object.getPrototypeOf(DependencyError)).call(this, 'Dependency check failed for \'' + depName + '\'. Reason: ' + reason));

      _this.name = 'DependencyError';
      return _this;
    }

    return DependencyError;
  }(Error);

  var GMLogger = function () {
    function GMLogger() {
      _classCallCheck(this, GMLogger);

      this._GM_key = '__logs__';
      this._cache = null;

      this._load();
    }

    _createClass(GMLogger, [{
      key: '_gc',
      value: function _gc() {}
    }, {
      key: '_log',
      value: function _log(level, args) {
        var time = new Date();
        var msg = format.apply(undefined, args);

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
        GM_setValue(this._GM_key, this._cache);
      }
    }, {
      key: 'debug',
      value: function debug() {
        if (arguments.length === 0) return;
        console.debug.apply(console, arguments);
        this._log('debug', arguments);
      }
    }, {
      key: 'info',
      value: function info() {
        if (arguments.length === 0) return;
        console.info.apply(console, arguments);
        this._log('info', arguments);
      }
    }, {
      key: 'warn',
      value: function warn() {
        if (arguments.length === 0) return;
        console.warn.apply(console, arguments);
        this._log('warn', arguments);
      }
    }, {
      key: 'error',
      value: function error() {
        if (arguments.length === 0) return;
        console.error.apply(console, arguments);
        this._log('error', arguments);
      }
    }]);

    return GMLogger;
  }();

  var LOG = new GMLogger();


  window.alert(NOT_SUPPORTED_ENV);

  try {
    main();
  } catch (e) {}
})();