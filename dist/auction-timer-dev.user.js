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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhlYWRlci5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbImRvY3VtZW50IiwibG9jYXRpb24iLCJocmVmIiwiaW5kZXhPZiIsIk5PVF9TVVBQT1JURURfRU5WIiwiTUFYX0xPR19FTlRSSUVTIiwiTUFYX0RFUF9USU1FT1VUIiwiREVQX0NIRUNLX1BFUklPRCIsIkRFUF9MSVNUIiwiQVVDVElPTiIsIk5PTl9BVUNUSU9OIiwic3RyaW5naWZ5Iiwib2JqIiwiSlNPTiIsImZvcm1hdCIsImYiLCJvYmplY3RzIiwiQXJyYXkiLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJpbmRleCIsImpvaW4iLCJzdHIiLCJhIiwibGFzdFBvcyIsImkiLCJjaGFyQ29kZUF0Iiwic2xpY2UiLCJOdW1iZXIiLCJwYXJzZUludCIsInBhcnNlRmxvYXQiLCJTdHJpbmciLCJzaG93SGlkZGVuIiwiZGVwdGgiLCJzaG93UHJveHkiLCJ4IiwiY2hlY2tEZXBlbmRlbmNpZXMiLCJzY29wZSIsImRlcHMiLCJjYiIsImR1ZSIsIkRhdGUiLCJnZXRUaW1lIiwibGFja3MiLCJzZXRUaW1lb3V0IiwiYmluZCIsInVuZGVmaW5lZCIsIkRlcGVuZGVuY3lFcnJvciIsImhhbmRsZUF1Y3Rpb25QYWdlIiwiY3JlYXRlVGltZXIiLCJvbGRNaW5zIiwiZmlyc3QiLCJvdmVyZmxvd0F1Y3Rpb25UaW1lciIsIm5ld01pbnMiLCJtaW5zIiwic2VjcyIsImF1Y3Rpb25UaW1lciIsImF1Y3Rpb25FbmRUaW1lIiwiY3VycmVudFRpbWUiLCJ1bmkiLCJyZXBsYWNlIiwiY2hhbmdlVGltZUxlZnQiLCJ0aW1lciIsInRpbWVMZWZ0IiwidGltZSIsImNvdW50ZG93biIsInN0YXJ0VGltZSIsInN0YXJ0TGVmdG92ZXJUaW1lIiwiY291bnRkb3duT2JqZWN0IiwiJCIsIm5leHQiLCJiZWZvcmUiLCJjc3MiLCJ0ZXh0IiwibG9jYSIsImF1Y3Rpb25GaW5pc2hlZCIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJNYXRoIiwicm91bmQiLCJjZWlsIiwibWF0Y2giLCJzaW1wbGVDb3VudGRvd24iLCJnZXQiLCJteVNvY2siLCJpbyIsImNvbm5lY3QiLCJub2RlUGFyYW1zIiwib24iLCJtc2ciLCJzZXRJdGVtIiwiZXhlYyIsIlJlZ0V4cCIsIiQxIiwiaW5mbyIsImdldEVsZW1lbnRCeUlkIiwiYWpheFN1Y2Nlc3MiLCJoYW5kbGVOb25BdWN0aW9uUGFnZSIsImNsb2NrIiwicGFyZW50IiwiYXBwZW5kIiwibWFpbiIsIndpbmRvdyIsImRlcE5hbWUiLCJyZWFzb24iLCJuYW1lIiwiRXJyb3IiLCJHTUxvZ2dlciIsIl9HTV9rZXkiLCJfY2FjaGUiLCJfbG9hZCIsImxldmVsIiwiYXJncyIsImFwcGx5IiwicHVzaCIsInRvU3RyaW5nIiwiR01fZ2V0VmFsdWUiLCJHTV9zZXRWYWx1ZSIsImNvbnNvbGUiLCJkZWJ1ZyIsIl9sb2ciLCJ3YXJuIiwiZXJyb3IiLCJMT0ciLCJhbGVydCIsImUiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUN6QkEsQ0FBQyxZQUFZO0FBRVgsTUFBSUEsU0FBU0MsUUFBVCxDQUFrQkMsSUFBbEIsQ0FBdUJDLE9BQXZCLENBQStCLGtCQUEvQixJQUFxRCxDQUF6RCxFQUE0RDtBQUFFO0FBQVE7O0FBSXRFLE1BQU1DLG9LQUFOOztBQU1BLE1BQU1DLGtCQUFrQixHQUF4QjtBQUNBLE1BQU1DLGtCQUFrQixLQUF4QjtBQUNBLE1BQU1DLG1CQUFtQixHQUF6QjtBQUNBLE1BQU1DLFdBQVc7QUFDZkMsYUFBUyxDQUNQLElBRE8sRUFFUCxHQUZPLEVBR1AsY0FITyxFQUlQLFlBSk8sRUFLUCxpQkFMTyxFQU1QLE1BTk8sQ0FETTtBQVNmQyxpQkFBYSxD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QVIsQ0FBY1QsS0FBZCxDQUFvQkssT0FBcEIsRUFBNkJwRyxTQUE3QjtBQUNBLGFBQUtzRyxJQUFMLENBQVUsT0FBVixFQUFtQnRHLFNBQW5CO0FBQ0Q7QUF6RUc7O0FBQUE7QUFBQSxLQUFOOztBQStFQSxNQUFNeUcsTUFBTSxJQUFJaEIsUUFBSixFQUFaOzs7QUFHQUwsU0FBT3NCLEtBQVAsQ0FBYXhILGlCQUFiOztBQUVBLE1BQUk7QUFDRmlHO0FBQ0QsR0FGRCxDQUVFLE9BQU93QixDQUFQLEVBQVUsQ0FFWDtBQUNGLENBeFZEIiwiZmlsZSI6ImF1Y3Rpb24tdGltZXItZGV2LnVzZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyA9PVVzZXJTY3JpcHQ9PVxyXG4vLyBAbmFtZSAgICAgICAgICAgT0dhbWUgUmVkZXNpZ24gKHYuNik6IEF1Y3Rpb24gVGltZXJcclxuLy8gQGF1dGhvciAgICAgICAgIE1vbW9Db3dcclxuLy8gQG5hbWVzcGFjZSAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9tb21vY293XHJcbi8vIEB2ZXJzaW9uICAgICAgICB7e1ZFUlNJT059fVxyXG4vLyBAZGVzY3JpcHRpb24gICAgRGlzcGxheXMgYSBjb3VudGRvd24gdGltZXIgZm9yIHRoZSBBdWN0aW9uIGluIE9HYW1lIDYuKlxyXG4vLyBAaW5jbHVkZSAgICAgICAgKi5vZ2FtZSpnYW1lZm9yZ2UuY29tL2dhbWUvaW5kZXgucGhwP3BhZ2U9KlxyXG4vL1xyXG4vLyBAcnVuLWF0ICAgICAgICAgZG9jdW1lbnQtYm9keVxyXG4vLyBAZ3JhbnQgICAgICAgICAgR01fZ2V0VmFsdWVcclxuLy8gQGdyYW50ICAgICAgICAgIEdNX3NldFZhbHVlXHJcbi8vID09L1VzZXJTY3JpcHQ9PVxyXG5cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAqIE9yaWdpbmFseSBkZXZlbG9wZWQgYnkgVmVzc2VsaW5cclxuICogQ3VycmVudGx5IGRldmVsb3BlZCBieSBNb21vQ293IGFmdGVyIHYzLjAuMFxyXG4gKiBSZWxlYXNlZCB1bmRlciBNSVRcclxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAqIENoYW5nZWxvZ1xyXG4gKiAjIyMgdjMuMC4wXHJcbiAqIC0gW0FkZF0gcHJvdmlkZSBhIG1vcmUgc3RhdGVmdWwgdGltZXJcclxuICogLSBbQ2hhbmdlZF0gcmV3cml0dGVuIGFzIGEgRVM2IHNjcmlwdCB3aXRoIGVzbGludCBgc3RhbmRhcmRgIGNvZGluZyBzdHlsZVxyXG4gKiAtIFtPcHRtaXplZF0gbW9yZSBzdGFibGUgZGVwZW5kZW5jeSBjaGVja1xyXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG4vKiBqc2hpbnQgYXNpOnRydWUgKi9cclxuIiwiLyogZ2xvYmFscyAkLCBsb2NhbFN0b3JhZ2UsIGlvLCBHTV9nZXRWYWx1ZSwgR01fc2V0VmFsdWUgKi9cclxuLyogZ2xvYmFscyBub2RlUGFyYW1zLCBzaW1wbGVDb3VudGRvd24sIGxvY2EgKi9cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgLy8gVGhlIGZvbGxvd2luZyBcImlmXCIgaXMgbm90IHJlYWxseSBuZWNlc3NhcnkgYnV0IHdpdGggaXQgdGhpcyBzY3JpcHQgd2lsbCB3b3JrIGZvciBPcGVyYSB0b29cclxuICBpZiAoZG9jdW1lbnQubG9jYXRpb24uaHJlZi5pbmRleE9mKCcvZ2FtZS9pbmRleC5waHA/JykgPCAwKSB7IHJldHVybiB9XHJcblxyXG4gIC8vIHN0cmluZ3NcclxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgY29uc3QgTk9UX1NVUFBPUlRFRF9FTlYgPSBgW0F1Y3Rpb24gVGltZXJdIFRoZSBzY3JpcHQgd2lsbCBub3Qgd29yayBvbiB5b3VyIGJyb3dzZXIgc2luY2UgaXQgaXMgb3V0LW9mLWRhdGUuXHJcblxcbllvdSBjYW4gZWl0aGVyIGRpc2FibGUgdGhlIHNjcmlwdCBvciB1cGRhdGUgeW91ciBicm93c2VyLmBcclxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG4gIC8vIGlubGluZSBjb25maWdcclxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgY29uc3QgTUFYX0xPR19FTlRSSUVTID0gMTAwXHJcbiAgY29uc3QgTUFYX0RFUF9USU1FT1VUID0gMzAwMDAgLy8gbXNcclxuICBjb25zdCBERVBfQ0hFQ0tfUEVSSU9EID0gNTAwIC8vIG1zXHJcbiAgY29uc3QgREVQX0xJU1QgPSB7XHJcbiAgICBBVUNUSU9OOiBbXHJcbiAgICAgICdpbycsXHJcbiAgICAgICckJyxcclxuICAgICAgJ2xvY2FsU3RvcmFnZScsXHJcbiAgICAgICdub2RlUGFyYW1zJyxcclxuICAgICAgJ3NpbXBsZUNvdW50ZG93bicsXHJcbiAgICAgICdsb2NhJ1xyXG4gICAgXSxcclxuICAgIE5PTl9BVUNUSU9OOiBbXHJcbiAgICAgICckJyxcclxuICAgICAgJ2xvY2FsU3RvcmFnZScsXHJcbiAgICAgICdzaW1wbGVDb3VudGRvd24nXHJcbiAgICBdXHJcbiAgfVxyXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuXHJcbiAgLy8gdXRpbHNcclxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgY29uc3Qgc3RyaW5naWZ5ID0gZnVuY3Rpb24gKG9iaikge1xyXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iaiwgbnVsbCwgMilcclxuICB9XHJcblxyXG4gIGNvbnN0IGZvcm1hdCA9IGZ1bmN0aW9uIChmKSB7XHJcbiAgICBpZiAodHlwZW9mIGYgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIGNvbnN0IG9iamVjdHMgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aClcclxuICAgICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGFyZ3VtZW50cy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICBvYmplY3RzW2luZGV4XSA9IHN0cmluZ2lmeShhcmd1bWVudHNbaW5kZXhdKVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSByZXR1cm4gZlxyXG5cclxuICAgIHZhciBzdHIgPSAnJ1xyXG4gICAgdmFyIGEgPSAxXHJcbiAgICB2YXIgbGFzdFBvcyA9IDBcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZi5sZW5ndGg7KSB7XHJcbiAgICAgIGlmIChmLmNoYXJDb2RlQXQoaSkgPT09IDM3LyogJyUnICovICYmIGkgKyAxIDwgZi5sZW5ndGgpIHtcclxuICAgICAgICBpZiAoZi5jaGFyQ29kZUF0KGkgKyAxKSAhPT0gMzcvKiAnJScgKi8gJiYgYSA+PSBhcmd1bWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICArK2lcclxuICAgICAgICAgIGNvbnRpbnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChsYXN0UG9zIDwgaSkgeyBzdHIgKz0gZi5zbGljZShsYXN0UG9zLCBpKSB9XHJcbiAgICAgICAgc3dpdGNoIChmLmNoYXJDb2RlQXQoaSArIDEpKSB7XHJcbiAgICAgICAgICBjYXNlIDEwMDogLy8gJ2QnXHJcbiAgICAgICAgICAgIHN0ciArPSBOdW1iZXIoYXJndW1lbnRzW2ErK10pXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICBjYXNlIDEwNTogLy8gJ2knXHJcbiAgICAgICAgICAgIHN0ciArPSBwYXJzZUludChhcmd1bWVudHNbYSsrXSlcclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgIGNhc2UgMTAyOiAvLyAnZidcclxuICAgICAgICAgICAgc3RyICs9IHBhcnNlRmxvYXQoYXJndW1lbnRzW2ErK10pXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICBjYXNlIDEwNjogLy8gJ2onXHJcbiAgICAgICAgICAgIHN0ciArPSBzdHJpbmdpZnkoYXJndW1lbnRzW2ErK10pXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICBjYXNlIDExNTogLy8gJ3MnXHJcbiAgICAgICAgICAgIHN0ciArPSBTdHJpbmcoYXJndW1lbnRzW2ErK10pXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICBjYXNlIDc5OiAvLyAnTydcclxuICAgICAgICAgICAgc3RyICs9IHN0cmluZ2lmeShhcmd1bWVudHNbYSsrXSlcclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgIGNhc2UgMTExOiAvLyAnbydcclxuICAgICAgICAgICAgc3RyICs9IHN0cmluZ2lmeShhcmd1bWVudHNbYSsrXSxcclxuICAgICAgICAgICAgICB7IHNob3dIaWRkZW46IHRydWUsIGRlcHRoOiA0LCBzaG93UHJveHk6IHRydWUgfSlcclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgIGNhc2UgMzc6IC8vICclJ1xyXG4gICAgICAgICAgICBzdHIgKz0gJyUnXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICBkZWZhdWx0OiAvLyBhbnkgb3RoZXIgY2hhcmFjdGVyIGlzIG5vdCBhIGNvcnJlY3QgcGxhY2Vob2xkZXJcclxuICAgICAgICAgICAgc3RyICs9ICclJ1xyXG4gICAgICAgICAgICBsYXN0UG9zID0gaSA9IGkgKyAxXHJcbiAgICAgICAgICAgIGNvbnRpbnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxhc3RQb3MgPSBpID0gaSArIDJcclxuICAgICAgICBjb250aW51ZVxyXG4gICAgICB9XHJcbiAgICAgICsraVxyXG4gICAgfVxyXG4gICAgaWYgKGxhc3RQb3MgPT09IDApIHsgc3RyID0gZiB9IGVsc2UgaWYgKGxhc3RQb3MgPCBmLmxlbmd0aCkgeyBzdHIgKz0gZi5zbGljZShsYXN0UG9zKSB9XHJcbiAgICB3aGlsZSAoYSA8IGFyZ3VtZW50cy5sZW5ndGgpIHtcclxuICAgICAgY29uc3QgeCA9IGFyZ3VtZW50c1thKytdXHJcbiAgICAgIGlmICh4ID09PSBudWxsIHx8ICh0eXBlb2YgeCAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIHggIT09ICdzeW1ib2wnKSkge1xyXG4gICAgICAgIHN0ciArPSBgICR7eH1gXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc3RyICs9IGAgJHtzdHJpbmdpZnkoeCl9YFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3RyXHJcbiAgfVxyXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuXHJcbiAgLy8gZnVuY3Rpb25zXHJcbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gIGNvbnN0IGNoZWNrRGVwZW5kZW5jaWVzID0gZnVuY3Rpb24gKHNjb3BlLCBkZXBzLCBjYiwgZHVlKSB7XHJcbiAgICBkdWUgPSBkdWUgaW5zdGFuY2VvZiBEYXRlID8gZHVlIDogbmV3IERhdGUobmV3IERhdGUoKS5nZXRUaW1lKCkgKyBNQVhfREVQX1RJTUVPVVQpXHJcblxyXG4gICAgY29uc3QgbGFja3MgPSBbXVxyXG5cclxuICAgIGlmIChsYWNrcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgY2IobnVsbClcclxuICAgIH0gZWxzZSBpZiAobGFja3MubGVuZ3RoID4gMCkge1xyXG4gICAgICBpZiAobmV3IERhdGUoKS5nZXRUaW1lKCkgPD0gZHVlLmdldFRpbWUoKSkgeyAvLyBlZmZlY3RpdmVcclxuICAgICAgICBzZXRUaW1lb3V0KGNoZWNrRGVwZW5kZW5jaWVzLmJpbmQodW5kZWZpbmVkLCBjYiwgZHVlKSwgREVQX0NIRUNLX1BFUklPRClcclxuICAgICAgfSBlbHNlIHsgLy8gZXhwaXJlZFxyXG4gICAgICAgIGNiKG5ldyBEZXBlbmRlbmN5RXJyb3IoJ3NvY2tldC5pbycsICdJbml0aWFsaXphdGlvbiB0aW1lb3V0JykpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IGhhbmRsZUF1Y3Rpb25QYWdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgbGV0IGNyZWF0ZVRpbWVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBsZXQgb2xkTWlucyA9IC0xXHJcbiAgICAgIGxldCBmaXJzdCA9IGZhbHNlXHJcbiAgICAgIGxldCBvdmVyZmxvd0F1Y3Rpb25UaW1lciA9IG51bGxcclxuICAgICAgbGV0IG5ld01pbnMsIG1pbnMsIHNlY3MsIGF1Y3Rpb25UaW1lciwgYXVjdGlvbkVuZFRpbWUsIGN1cnJlbnRUaW1lXHJcbiAgICAgIGxldCB1bmkgPSBkb2N1bWVudC5sb2NhdGlvbi5ocmVmLnJlcGxhY2UoL15odHRwczpcXC9cXC8oW14vXSspLisvLCAnJDEnKVxyXG4gICAgICBmdW5jdGlvbiBjaGFuZ2VUaW1lTGVmdCAodGltZXIsIHRpbWVMZWZ0KSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiAodGltZXIpICE9PSAnb2JqZWN0JykgeyByZXR1cm4gfVxyXG4gICAgICAgIGxldCB0aW1lID0gbmV3IERhdGUoKVxyXG4gICAgICAgIGlmICh0eXBlb2YgKHRpbWVyLmNvdW50ZG93bikgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICB0aW1lci5jb3VudGRvd24uc3RhcnRUaW1lID0gdGltZS5nZXRUaW1lKClcclxuICAgICAgICAgIHRpbWVyLmNvdW50ZG93bi5zdGFydExlZnRvdmVyVGltZSA9IHRpbWVMZWZ0XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgKHRpbWVyLmNvdW50ZG93bk9iamVjdCkgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICB0aW1lci5jb3VudGRvd25PYmplY3Quc3RhcnRUaW1lID0gdGltZS5nZXRUaW1lKClcclxuICAgICAgICAgIHRpbWVyLmNvdW50ZG93bk9iamVjdC5zdGFydExlZnRvdmVyVGltZSA9IHRpbWVMZWZ0XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoJCgnI2F1Y3Rpb25UaW1lcicpLmxlbmd0aCkgeyByZXR1cm4gfVxyXG4gICAgICAkKCdwLmF1Y3Rpb25faW5mbycpLm5leHQoKS5iZWZvcmUoJzxzcGFuIGlkPVwiYXVjdGlvblRpbWVyXCIgc3R5bGU9XCJmb250LXdlaWdodDogYm9sZDsgY29sb3I6ICcgKyAkKCdwLmF1Y3Rpb25faW5mbyBzcGFuJykuY3NzKCdjb2xvcicpICsgJztcIj48L3NwYW4+JylcclxuICAgICAgaWYgKCQoJyNkaXZfdHJhZGVyQXVjdGlvbmVlciAubGVmdF9oZWFkZXIgaDInKS50ZXh0KCkuaW5kZXhPZihsb2NhLmF1Y3Rpb25GaW5pc2hlZCkgPCAwKSB7XHJcbiAgICAgICAgYXVjdGlvbkVuZFRpbWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh1bmkgKyAnX2F1Y3Rpb25FbmRUaW1lJylcclxuICAgICAgICBhdWN0aW9uRW5kVGltZSA9IChhdWN0aW9uRW5kVGltZSkgPyBwYXJzZUludChhdWN0aW9uRW5kVGltZSkgOiAtMVxyXG4gICAgICAgIGN1cnJlbnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgICAgICBpZiAoYXVjdGlvbkVuZFRpbWUgPj0gY3VycmVudFRpbWUpIHtcclxuICAgICAgICAgIHNlY3MgPSBNYXRoLnJvdW5kKChhdWN0aW9uRW5kVGltZSAtIGN1cnJlbnRUaW1lKSAvIDEwMDApXHJcbiAgICAgICAgICBvbGRNaW5zID0gTWF0aC5jZWlsKHNlY3MgLyA2MClcclxuICAgICAgICAgIGZpcnN0ID0gZmFsc2VcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgb2xkTWlucyA9IHBhcnNlSW50KCQoJ3AuYXVjdGlvbl9pbmZvJykudGV4dCgpLm1hdGNoKC9cXGQrL2cpWzBdKVxyXG4gICAgICAgICAgc2VjcyA9IG9sZE1pbnMgKiA2MFxyXG4gICAgICAgICAgZmlyc3QgPSB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1pbnMgPSBvbGRNaW5zXHJcbiAgICAgICAgYXVjdGlvblRpbWVyID0gbmV3IHNpbXBsZUNvdW50ZG93bigkKCcjYXVjdGlvblRpbWVyJykuZ2V0KDApLCBzZWNzLCBmdW5jdGlvbiAoKSB7ICQoJyNhdWN0aW9uVGltZXInKS50ZXh0KCcnKSB9KVxyXG4gICAgICB9XHJcbiAgICAgIGxldCBteVNvY2sgPSBuZXcgaW8uY29ubmVjdCgnL2F1Y3Rpb25lZXInLCBub2RlUGFyYW1zKVxyXG4gICAgICBteVNvY2sub24oJ3RpbWVMZWZ0JywgZnVuY3Rpb24gKG1zZykge1xyXG4gICAgICAgIGlmICgkKCcjZGl2X3RyYWRlckF1Y3Rpb25lZXIgLmxlZnRfaGVhZGVyIGgyJykudGV4dCgpLmluZGV4T2YobG9jYS5hdWN0aW9uRmluaXNoZWQpID49IDApIHtcclxuICAgICAgICAgIGZpcnN0ID0gdHJ1ZVxyXG4gICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odW5pICsgJ19hdWN0aW9uRW5kVGltZScsICctMScpXHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgYXVjdGlvbkVuZFRpbWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh1bmkgKyAnX2F1Y3Rpb25FbmRUaW1lJylcclxuICAgICAgICBhdWN0aW9uRW5kVGltZSA9IChhdWN0aW9uRW5kVGltZSkgPyBwYXJzZUludChhdWN0aW9uRW5kVGltZSkgOiAtMVxyXG4gICAgICAgIGN1cnJlbnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgLzxiPlxcRCsoXFxkKykvLmV4ZWMobXNnKVxyXG4gICAgICAgIG5ld01pbnMgPSBwYXJzZUludChSZWdFeHAuJDEpXHJcbiAgICAgICAgaWYgKG5ld01pbnMgPT09IG9sZE1pbnMpIHtcclxuICAgICAgICAgIG1pbnMtLVxyXG4gICAgICAgICAgaWYgKGZpcnN0KSB7IGZpcnN0ID0gZmFsc2UgfSBlbHNlIGlmIChhdWN0aW9uRW5kVGltZSA+PSAwKSB7IGxvY2FsU3RvcmFnZS5zZXRJdGVtKHVuaSArICdfYXVjdGlvbkVuZFRpbWUnLCBjdXJyZW50VGltZSArIG1pbnMgKiA2MCAqIDEwMDApIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKChuZXdNaW5zID4gb2xkTWlucykgJiYgKGF1Y3Rpb25FbmRUaW1lID49IGN1cnJlbnRUaW1lKSkgeyBuZXdNaW5zID0gTWF0aC5yb3VuZCgoYXVjdGlvbkVuZFRpbWUgLSBjdXJyZW50VGltZSkgLyAoMTAwMCAqIDYwKSkgfVxyXG4gICAgICAgICAgaWYgKGZpcnN0KSB7IGZpcnN0ID0gZmFsc2UgfSBlbHNlIGlmIChvbGRNaW5zID49IDApIHsgbG9jYWxTdG9yYWdlLnNldEl0ZW0odW5pICsgJ19hdWN0aW9uRW5kVGltZScsIGN1cnJlbnRUaW1lICsgbmV3TWlucyAqIDYwICogMTAwMCkgfVxyXG4gICAgICAgICAgb2xkTWlucyA9IG5ld01pbnNcclxuICAgICAgICAgIG1pbnMgPSBuZXdNaW5zXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtaW5zKSB7IGNoYW5nZVRpbWVMZWZ0KGF1Y3Rpb25UaW1lciwgbWlucyAqIDYwKSB9IGVsc2UgeyBvdmVyZmxvd0F1Y3Rpb25UaW1lciA9IG5ldyBzaW1wbGVDb3VudGRvd24oJCgnI2F1Y3Rpb25UaW1lcicpLmdldCgwKSwgMzAsIGZ1bmN0aW9uICgpIHsgJCgnI2F1Y3Rpb25UaW1lcicpLnRleHQoJycpIH0pIH1cclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICQoJyNhdWN0aW9uVGltZXInKS5jc3MoJ2NvbG9yJywgJCgncC5hdWN0aW9uX2luZm8gc3BhbicpLmNzcygnY29sb3InKSlcclxuICAgICAgICB9LCAxMDApXHJcbiAgICAgIH0pXHJcbiAgICAgIG15U29jay5vbignbmV3IGF1Y3Rpb24nLCBmdW5jdGlvbiAobXNnKSB7XHJcbiAgICAgICAgLzxiPlxcRCsoXFxkKykvLmV4ZWMobXNnLmluZm8pXHJcbiAgICAgICAgbWlucyA9IHBhcnNlSW50KFJlZ0V4cC4kMSlcclxuICAgICAgICBhdWN0aW9uVGltZXIgPSBuZXcgc2ltcGxlQ291bnRkb3duKCQoJyNhdWN0aW9uVGltZXInKS5nZXQoMCksIG1pbnMgKiA2MCwgZnVuY3Rpb24gKCkgeyAkKCcjYXVjdGlvblRpbWVyJykudGV4dCgnJykgfSlcclxuICAgICAgICBvdmVyZmxvd0F1Y3Rpb25UaW1lciA9IG51bGxcclxuICAgICAgICBmaXJzdCA9IHRydWVcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICQoJyNhdWN0aW9uVGltZXInKS5jc3MoJ2NvbG9yJywgJCgncC5hdWN0aW9uX2luZm8gc3BhbicpLmNzcygnY29sb3InKSlcclxuICAgICAgICB9LCAxMDApXHJcbiAgICAgIH0pXHJcbiAgICAgIG15U29jay5vbignYXVjdGlvbiBmaW5pc2hlZCcsIGZ1bmN0aW9uIChtc2cpIHtcclxuICAgICAgICBjaGFuZ2VUaW1lTGVmdChhdWN0aW9uVGltZXIsIDApXHJcbiAgICAgICAgY2hhbmdlVGltZUxlZnQob3ZlcmZsb3dBdWN0aW9uVGltZXIsIDApXHJcbiAgICAgICAgZmlyc3QgPSB0cnVlXHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odW5pICsgJ19hdWN0aW9uRW5kVGltZScsICctMScpXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXZfdHJhZGVyQXVjdGlvbmVlcicpKSB7XHJcbiAgICAgIGNyZWF0ZVRpbWVyKClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICQoZG9jdW1lbnQpLmFqYXhTdWNjZXNzKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoJCgnI2F1Y3Rpb25UaW1lcicpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgY3JlYXRlVGltZXIoKVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IGhhbmRsZU5vbkF1Y3Rpb25QYWdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgbGV0IHVuaSA9IGRvY3VtZW50LmxvY2F0aW9uLmhyZWYucmVwbGFjZSgvXmh0dHBzOlxcL1xcLyhbXi9dKykuKy8sICckMScpXHJcbiAgICBsZXQgYXVjdGlvbkVuZFRpbWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh1bmkgKyAnX2F1Y3Rpb25FbmRUaW1lJylcclxuICAgIGlmIChhdWN0aW9uRW5kVGltZSA9PSBudWxsKSB7IHJldHVybiB9XHJcbiAgICBhdWN0aW9uRW5kVGltZSA9IHBhcnNlSW50KGF1Y3Rpb25FbmRUaW1lKVxyXG4gICAgbGV0IGN1cnJlbnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIGlmIChhdWN0aW9uRW5kVGltZSA8IGN1cnJlbnRUaW1lKSB7IHJldHVybiB9XHJcbiAgICBsZXQgY2xvY2sgPSAkKCcjT0dhbWVDbG9jaycpXHJcbiAgICBpZiAoY2xvY2subGVuZ3RoIDw9IDApIHsgY2xvY2sgPSAkKCcuT0dhbWVDbG9jaycpIH1cclxuICAgIGlmIChjbG9jay5sZW5ndGggPD0gMCkgeyByZXR1cm4gfVxyXG4gICAgY2xvY2sucGFyZW50KCkuYXBwZW5kKCc8bGkgaWQ9XCJhdWN0aW9uVGltZXJcIiBzdHlsZT1cInBvc2l0aW9uOiBhYnNvbHV0ZTsgcmlnaHQ6IDEyNXB4O1wiPjwvbGk+JylcclxuICAgIGxldCBhdWN0aW9uVGltZXIgPSBuZXcgc2ltcGxlQ291bnRkb3duKCQoJyNhdWN0aW9uVGltZXInKS5nZXQoMCksXHJcbiAgICAgIE1hdGgucm91bmQoKGF1Y3Rpb25FbmRUaW1lIC0gY3VycmVudFRpbWUpIC8gMTAwMCksXHJcbiAgICAgIGZ1bmN0aW9uICgpIHsgJCgnI2F1Y3Rpb25UaW1lcicpLnRleHQoJycpIH0pXHJcbiAgfVxyXG5cclxuICBjb25zdCBtYWluID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKGRvY3VtZW50LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignL2dhbWUvaW5kZXgucGhwP3BhZ2U9dHJhZGVyT3ZlcnZpZXcnKSA+PSAwKSB7XHJcbiAgICAgIGNoZWNrRGVwZW5kZW5jaWVzKHdpbmRvdywgREVQX0xJU1QuQVVDVElPTiwgaGFuZGxlQXVjdGlvblBhZ2UpXHJcbiAgICB9IGVsc2UgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYXInKSkge1xyXG4gICAgICBjaGVja0RlcGVuZGVuY2llcyh3aW5kb3csIERFUF9MSVNULk5PTl9BVUNUSU9OLCBoYW5kbGVOb25BdWN0aW9uUGFnZSlcclxuICAgIH1cclxuICB9XHJcbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuICAvLyBjbGFzc2VzXHJcbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gIGNvbnN0IERlcGVuZGVuY3lFcnJvciA9IGNsYXNzIGV4dGVuZHMgRXJyb3Ige1xyXG4gICAgY29uc3RydWN0b3IgKGRlcE5hbWUsIHJlYXNvbikge1xyXG4gICAgICBzdXBlcihgRGVwZW5kZW5jeSBjaGVjayBmYWlsZWQgZm9yICcke2RlcE5hbWV9Jy4gUmVhc29uOiAke3JlYXNvbn1gKVxyXG4gICAgICB0aGlzLm5hbWUgPSAnRGVwZW5kZW5jeUVycm9yJ1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBbU1BFQ10gYWltIHRvIGJlIHN1cHBvcnRlZCBpbiBtb3N0IGJyb3dzZXJzIGZvciBlcnJvciBoYW5kbGluZ1xyXG4gICovXHJcbiAgY29uc3QgR01Mb2dnZXIgPSBjbGFzcyB7XHJcbiAgICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAgIHRoaXMuX0dNX2tleSA9ICdfX2xvZ3NfXydcclxuICAgICAgdGhpcy5fY2FjaGUgPSBudWxsXHJcblxyXG4gICAgICAvLyBpbml0XHJcbiAgICAgIHRoaXMuX2xvYWQoKVxyXG4gICAgfVxyXG5cclxuICAgIF9nYyAoKSB7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIF9sb2cgKGxldmVsLCBhcmdzKSB7XHJcbiAgICAgIGxldCB0aW1lID0gbmV3IERhdGUoKVxyXG4gICAgICBsZXQgbXNnID0gZm9ybWF0LmFwcGx5KHVuZGVmaW5lZCwgYXJncylcclxuXHJcbiAgICAgIHRoaXMuX2NhY2hlLnB1c2goe1xyXG4gICAgICAgIHRpbWUsXHJcbiAgICAgICAgbGV2ZWwsXHJcbiAgICAgICAgbXNnLFxyXG4gICAgICAgIHRvU3RyaW5nICgpIHtcclxuICAgICAgICAgIHJldHVybiBgWyR7dGltZX1dWyR7bGV2ZWx9XSAke21zZ31gXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIF9sb2FkICgpIHtcclxuICAgICAgdGhpcy5fY2FjaGUgPSBHTV9nZXRWYWx1ZSh0aGlzLl9HTV9rZXksIFtdKVxyXG4gICAgfVxyXG5cclxuICAgIF9zYXZlICgpIHtcclxuICAgICAgR01fc2V0VmFsdWUodGhpcy5fR01fa2V5LCB0aGlzLl9jYWNoZSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtc2cgYSBtZXNzYWdlIG9yIHRlbXBsYXRlIHN0cmluZ1xyXG4gICAgICogQHBhcmFtIHsuLi5taXhlZH0gYXJncyBhcmd1bWVudHMgdG8gZm9ybWF0IHRoZSB0ZW1wbGF0ZVxyXG4gICAgICovXHJcbiAgICBkZWJ1ZyAoKSB7XHJcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm5cclxuICAgICAgY29uc29sZS5kZWJ1Zy5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpXHJcbiAgICAgIHRoaXMuX2xvZygnZGVidWcnLCBhcmd1bWVudHMpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbXNnIGEgbWVzc2FnZSBvciB0ZW1wbGF0ZSBzdHJpbmdcclxuICAgICAqIEBwYXJhbSB7Li4ubWl4ZWR9IGFyZ3MgYXJndW1lbnRzIHRvIGZvcm1hdCB0aGUgdGVtcGxhdGVcclxuICAgICAqL1xyXG4gICAgaW5mbyAoKSB7XHJcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm5cclxuICAgICAgY29uc29sZS5pbmZvLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cylcclxuICAgICAgdGhpcy5fbG9nKCdpbmZvJywgYXJndW1lbnRzKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1zZyBhIG1lc3NhZ2Ugb3IgdGVtcGxhdGUgc3RyaW5nXHJcbiAgICAgKiBAcGFyYW0gey4uLm1peGVkfSBhcmdzIGFyZ3VtZW50cyB0byBmb3JtYXQgdGhlIHRlbXBsYXRlXHJcbiAgICAgKi9cclxuICAgIHdhcm4gKCkge1xyXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXHJcbiAgICAgIGNvbnNvbGUud2Fybi5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpXHJcbiAgICAgIHRoaXMuX2xvZygnd2FybicsIGFyZ3VtZW50cylcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtc2cgYSBtZXNzYWdlIG9yIHRlbXBsYXRlIHN0cmluZ1xyXG4gICAgICogQHBhcmFtIHsuLi5taXhlZH0gYXJncyBhcmd1bWVudHMgdG8gZm9ybWF0IHRoZSB0ZW1wbGF0ZVxyXG4gICAgICovXHJcbiAgICBlcnJvciAoKSB7XHJcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm5cclxuICAgICAgY29uc29sZS5lcnJvci5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpXHJcbiAgICAgIHRoaXMuX2xvZygnZXJyb3InLCBhcmd1bWVudHMpXHJcbiAgICB9XHJcbiAgfVxyXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuXHJcbiAgLy8gaW5pdFxyXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICBjb25zdCBMT0cgPSBuZXcgR01Mb2dnZXIoKVxyXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuXHJcbiAgd2luZG93LmFsZXJ0KE5PVF9TVVBQT1JURURfRU5WKVxyXG5cclxuICB0cnkge1xyXG4gICAgbWFpbigpXHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgLy8gTE9HLlxyXG4gIH1cclxufSkoKVxyXG4iXX0=
