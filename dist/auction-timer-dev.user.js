// ==UserScript==
// @name           OGame Redesign (v.6): Auction Timer
// @author         MomoCow
// @namespace      https://github.com/momocow
// @version        3.0.3
// @description    Displays a countdown timer for the Auction in OGame 6.*
// @include        *.ogame*gameforge.com/game/index.php?page=*
// @updateURL      https://raw.githubusercontent.com/momocow/OGame-Redesign-v.6-Auction-Timer/master/dist/auction-timer.meta.js
// @downloadURL    https://raw.githubusercontent.com/momocow/OGame-Redesign-v.6-Auction-Timer/master/dist/auction-timer.user.js
// @supportURL     https://github.com/momocow/OGame-Redesign-v.6-Auction-Timer/issues
// @run-at         document-idle
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_addStyle
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

var MAX_LOG_ENTRIES = 500;
var MAX_DEP_TIMEOUT = 10000;
var DEP_CHECK_PERIOD = 500;
var DEP_LIST = {
  AUCTION: ['io', '$', 'nodeParams', 'simpleCountdown', 'loca'],
  NON_AUCTION: ['$', 'simpleCountdown']
};

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var defineProperty = Object.defineProperty;
var gOPD = Object.getOwnPropertyDescriptor;

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

var setProperty = function setProperty(target, options) {
  if (defineProperty && options.name === '__proto__') {
    defineProperty(target, options.name, {
      enumerable: true,
      configurable: true,
      value: options.newValue,
      writable: true
    });
  } else {
    target[options.name] = options.newValue;
  }
};

var getProperty = function getProperty(obj, name) {
  if (name === '__proto__') {
    if (!hasOwn.call(obj, name)) {
      return void 0;
    } else if (gOPD) {
      return gOPD(obj, name).value;
    }
  }

  return obj[name];
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
        src = getProperty(target, name);
        copy = getProperty(options, name);

        if (target !== copy) {
          if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && isArray(src) ? src : [];
            } else {
              clone = src && isPlainObject(src) ? src : {};
            }

            setProperty(target, { name: name, newValue: extend(deep, clone, copy) });
          } else if (typeof copy !== 'undefined') {
            setProperty(target, { name: name, newValue: copy });
          }
        }
      }
    }
  }

  return target;
};

var domain;

function EventHandlers() {}
EventHandlers.prototype = Object.create(null);

function EventEmitter() {
  EventEmitter.init.call(this);
}

EventEmitter.EventEmitter = EventEmitter;

EventEmitter.usingDomains = false;

EventEmitter.prototype.domain = undefined;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

EventEmitter.defaultMaxListeners = 10;

EventEmitter.init = function () {
  this.domain = null;
  if (EventEmitter.usingDomains) {
    if (domain.active && !(this instanceof domain.Domain)) {
      this.domain = domain.active;
    }
  }

  if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
    this._events = new EventHandlers();
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n)) throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined) return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

function emitNone(handler, isFn, self) {
  if (isFn) handler.call(self);else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i) {
      listeners[i].call(self);
    }
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn) handler.call(self, arg1);else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i) {
      listeners[i].call(self, arg1);
    }
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn) handler.call(self, arg1, arg2);else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i) {
      listeners[i].call(self, arg1, arg2);
    }
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn) handler.call(self, arg1, arg2, arg3);else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i) {
      listeners[i].call(self, arg1, arg2, arg3);
    }
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn) handler.apply(self, args);else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i) {
      listeners[i].apply(self, args);
    }
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events, domain;
  var needDomainExit = false;
  var doError = type === 'error';

  events = this._events;
  if (events) doError = doError && events.error == null;else if (!doError) return false;

  domain = this.domain;

  if (doError) {
    er = arguments[1];
    if (domain) {
      if (!er) er = new Error('Uncaught, unspecified "error" event');
      er.domainEmitter = this;
      er.domain = domain;
      er.domainThrown = false;
      domain.emit('error', er);
    } else if (er instanceof Error) {
      throw er;
    } else {
      var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler) return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;

    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++) {
        args[i - 1] = arguments[i];
      }emitMany(handler, isFn, this, args);
  }

  if (needDomainExit) domain.exit();

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = new EventHandlers();
    target._eventsCount = 0;
  } else {
    if (events.newListener) {
      target.emit('newListener', type, listener.listener ? listener.listener : listener);

      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      existing = events[type] = prepend ? [listener, existing] : [existing, listener];
    } else {
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' + existing.length + ' ' + type + ' listeners added. ' + 'Use emitter.setMaxListeners() to increase limit');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        emitWarning(w);
      }
    }
  }

  return target;
}
function emitWarning(e) {
  typeof console.warn === 'function' ? console.warn(e) : console.log(e);
}
EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener = function prependListener(type, listener) {
  return _addListener(this, type, listener, true);
};

function _onceWrap(target, type, listener) {
  var fired = false;
  function g() {
    target.removeListener(type, g);
    if (!fired) {
      fired = true;
      listener.apply(target, arguments);
    }
  }
  g.listener = listener;
  return g;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
  if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');
  this.prependListener(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.removeListener = function removeListener(type, listener) {
  var list, events, position, i, originalListener;

  if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');

  events = this._events;
  if (!events) return this;

  list = events[type];
  if (!list) return this;

  if (list === listener || list.listener && list.listener === listener) {
    if (--this._eventsCount === 0) this._events = new EventHandlers();else {
      delete events[type];
      if (events.removeListener) this.emit('removeListener', type, list.listener || listener);
    }
  } else if (typeof list !== 'function') {
    position = -1;

    for (i = list.length; i-- > 0;) {
      if (list[i] === listener || list[i].listener && list[i].listener === listener) {
        originalListener = list[i].listener;
        position = i;
        break;
      }
    }

    if (position < 0) return this;

    if (list.length === 1) {
      list[0] = undefined;
      if (--this._eventsCount === 0) {
        this._events = new EventHandlers();
        return this;
      } else {
        delete events[type];
      }
    } else {
      spliceOne(list, position);
    }

    if (events.removeListener) this.emit('removeListener', type, originalListener || listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
  var listeners, events;

  events = this._events;
  if (!events) return this;

  if (!events.removeListener) {
    if (arguments.length === 0) {
      this._events = new EventHandlers();
      this._eventsCount = 0;
    } else if (events[type]) {
      if (--this._eventsCount === 0) this._events = new EventHandlers();else delete events[type];
    }
    return this;
  }

  if (arguments.length === 0) {
    var keys = Object.keys(events);
    for (var i = 0, key; i < keys.length; ++i) {
      key = keys[i];
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = new EventHandlers();
    this._eventsCount = 0;
    return this;
  }

  listeners = events[type];

  if (typeof listeners === 'function') {
    this.removeListener(type, listeners);
  } else if (listeners) {
    do {
      this.removeListener(type, listeners[listeners.length - 1]);
    } while (listeners[0]);
  }

  return this;
};

EventEmitter.prototype.listeners = function listeners(type) {
  var evlistener;
  var ret;
  var events = this._events;

  if (!events) ret = [];else {
    evlistener = events[type];
    if (!evlistener) ret = [];else if (typeof evlistener === 'function') ret = [evlistener.listener || evlistener];else ret = unwrapListeners(evlistener);
  }

  return ret;
};

EventEmitter.listenerCount = function (emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
    list[i] = list[k];
  }list.pop();
}

function arrayClone(arr, i) {
  var copy = new Array(i);
  while (i--) {
    copy[i] = arr[i];
  }return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

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

    extend(true, _this, new EventEmitter());
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

  function DependencyError(deps) {
    _classCallCheck(this, DependencyError);

    var _this2 = _possibleConstructorReturn(this, (DependencyError.__proto__ || Object.getPrototypeOf(DependencyError)).call(this, 'Dependency check failed. Dependencies, ' + deps.map(function (e) {
      return '"' + e + '"';
    }).join(', ') + ', are not found.'));

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

var global$1 = typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};

var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
var inited = false;
function init() {
  inited = true;
  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }

  revLookup['-'.charCodeAt(0)] = 62;
  revLookup['_'.charCodeAt(0)] = 63;
}

function toByteArray(b64) {
  if (!inited) {
    init();
  }
  var i, j, l, tmp, placeHolders, arr;
  var len = b64.length;

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4');
  }

  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

  arr = new Arr(len * 3 / 4 - placeHolders);

  l = placeHolders > 0 ? len - 4 : len;

  var L = 0;

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
    arr[L++] = tmp >> 16 & 0xFF;
    arr[L++] = tmp >> 8 & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  if (placeHolders === 2) {
    tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
    arr[L++] = tmp & 0xFF;
  } else if (placeHolders === 1) {
    tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
    arr[L++] = tmp >> 8 & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  return arr;
}

function tripletToBase64(num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
}

function encodeChunk(uint8, start, end) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
    output.push(tripletToBase64(tmp));
  }
  return output.join('');
}

function fromByteArray(uint8) {
  if (!inited) {
    init();
  }
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3;
  var output = '';
  var parts = [];
  var maxChunkLength = 16383;
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
  }

  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    output += lookup[tmp >> 2];
    output += lookup[tmp << 4 & 0x3F];
    output += '==';
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    output += lookup[tmp >> 10];
    output += lookup[tmp >> 4 & 0x3F];
    output += lookup[tmp << 2 & 0x3F];
    output += '=';
  }

  parts.push(output);

  return parts.join('');
}

function read(buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? nBytes - 1 : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];

  i += d;

  e = s & (1 << -nBits) - 1;
  s >>= -nBits;
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : (s ? -1 : 1) * Infinity;
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
}

function write(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  var i = isLE ? 0 : nBytes - 1;
  var d = isLE ? 1 : -1;
  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = e << mLen | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128;
}

var toString = {}.toString;

var isArray$1 = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

var INSPECT_MAX_BYTES = 50;

Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined ? global$1.TYPED_ARRAY_SUPPORT : true;

function kMaxLength() {
  return Buffer.TYPED_ARRAY_SUPPORT ? 0x7fffffff : 0x3fffffff;
}

function createBuffer(that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length');
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    that = new Uint8Array(length);
    that.__proto__ = Buffer.prototype;
  } else {
    if (that === null) {
      that = new Buffer(length);
    }
    that.length = length;
  }

  return that;
}

function Buffer(arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length);
  }

  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error('If encoding is specified then the first argument must be a string');
    }
    return allocUnsafe(this, arg);
  }
  return from(this, arg, encodingOrOffset, length);
}

Buffer.poolSize = 8192;
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype;
  return arr;
};

function from(that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number');
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length);
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset);
  }

  return fromObject(that, value);
}

Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length);
};

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype;
  Buffer.__proto__ = Uint8Array;
}

function assertSize(size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number');
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative');
  }
}

function alloc(that, size, fill, encoding) {
  assertSize(size);
  if (size <= 0) {
    return createBuffer(that, size);
  }
  if (fill !== undefined) {
    return typeof encoding === 'string' ? createBuffer(that, size).fill(fill, encoding) : createBuffer(that, size).fill(fill);
  }
  return createBuffer(that, size);
}

Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding);
};

function allocUnsafe(that, size) {
  assertSize(size);
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0;
    }
  }
  return that;
}

Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size);
};

Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size);
};

function fromString(that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8';
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding');
  }

  var length = byteLength(string, encoding) | 0;
  that = createBuffer(that, length);

  var actual = that.write(string, encoding);

  if (actual !== length) {
    that = that.slice(0, actual);
  }

  return that;
}

function fromArrayLike(that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0;
  that = createBuffer(that, length);
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255;
  }
  return that;
}

function fromArrayBuffer(that, array, byteOffset, length) {
  array.byteLength;

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds');
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds');
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array);
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset);
  } else {
    array = new Uint8Array(array, byteOffset, length);
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    that = array;
    that.__proto__ = Buffer.prototype;
  } else {
    that = fromArrayLike(that, array);
  }
  return that;
}

function fromObject(that, obj) {
  if (internalIsBuffer(obj)) {
    var len = checked(obj.length) | 0;
    that = createBuffer(that, len);

    if (that.length === 0) {
      return that;
    }

    obj.copy(that, 0, 0, len);
    return that;
  }

  if (obj) {
    if (typeof ArrayBuffer !== 'undefined' && obj.buffer instanceof ArrayBuffer || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0);
      }
      return fromArrayLike(that, obj);
    }

    if (obj.type === 'Buffer' && isArray$1(obj.data)) {
      return fromArrayLike(that, obj.data);
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.');
}

function checked(length) {
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + kMaxLength().toString(16) + ' bytes');
  }
  return length | 0;
}
Buffer.isBuffer = isBuffer;
function internalIsBuffer(b) {
  return !!(b != null && b._isBuffer);
}

Buffer.compare = function compare(a, b) {
  if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
    throw new TypeError('Arguments must be Buffers');
  }

  if (a === b) return 0;

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) return -1;
  if (y < x) return 1;
  return 0;
};

Buffer.isEncoding = function isEncoding(encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true;
    default:
      return false;
  }
};

Buffer.concat = function concat(list, length) {
  if (!isArray$1(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers');
  }

  if (list.length === 0) {
    return Buffer.alloc(0);
  }

  var i;
  if (length === undefined) {
    length = 0;
    for (i = 0; i < list.length; ++i) {
      length += list[i].length;
    }
  }

  var buffer = Buffer.allocUnsafe(length);
  var pos = 0;
  for (i = 0; i < list.length; ++i) {
    var buf = list[i];
    if (!internalIsBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers');
    }
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

function byteLength(string, encoding) {
  if (internalIsBuffer(string)) {
    return string.length;
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength;
  }
  if (typeof string !== 'string') {
    string = '' + string;
  }

  var len = string.length;
  if (len === 0) return 0;

  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len;
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length;
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2;
      case 'hex':
        return len >>> 1;
      case 'base64':
        return base64ToBytes(string).length;
      default:
        if (loweredCase) return utf8ToBytes(string).length;
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}
Buffer.byteLength = byteLength;

function slowToString(encoding, start, end) {
  var loweredCase = false;

  if (start === undefined || start < 0) {
    start = 0;
  }

  if (start > this.length) {
    return '';
  }

  if (end === undefined || end > this.length) {
    end = this.length;
  }

  if (end <= 0) {
    return '';
  }

  end >>>= 0;
  start >>>= 0;

  if (end <= start) {
    return '';
  }

  if (!encoding) encoding = 'utf8';

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end);

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end);

      case 'ascii':
        return asciiSlice(this, start, end);

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end);

      case 'base64':
        return base64Slice(this, start, end);

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end);

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
        encoding = (encoding + '').toLowerCase();
        loweredCase = true;
    }
  }
}

Buffer.prototype._isBuffer = true;

function swap(b, n, m) {
  var i = b[n];
  b[n] = b[m];
  b[m] = i;
}

Buffer.prototype.swap16 = function swap16() {
  var len = this.length;
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits');
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1);
  }
  return this;
};

Buffer.prototype.swap32 = function swap32() {
  var len = this.length;
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits');
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3);
    swap(this, i + 1, i + 2);
  }
  return this;
};

Buffer.prototype.swap64 = function swap64() {
  var len = this.length;
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits');
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7);
    swap(this, i + 1, i + 6);
    swap(this, i + 2, i + 5);
    swap(this, i + 3, i + 4);
  }
  return this;
};

Buffer.prototype.toString = function toString() {
  var length = this.length | 0;
  if (length === 0) return '';
  if (arguments.length === 0) return utf8Slice(this, 0, length);
  return slowToString.apply(this, arguments);
};

Buffer.prototype.equals = function equals(b) {
  if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer');
  if (this === b) return true;
  return Buffer.compare(this, b) === 0;
};

Buffer.prototype.inspect = function inspect() {
  var str = '';
  var max = INSPECT_MAX_BYTES;
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
    if (this.length > max) str += ' ... ';
  }
  return '<Buffer ' + str + '>';
};

Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
  if (!internalIsBuffer(target)) {
    throw new TypeError('Argument must be a Buffer');
  }

  if (start === undefined) {
    start = 0;
  }
  if (end === undefined) {
    end = target ? target.length : 0;
  }
  if (thisStart === undefined) {
    thisStart = 0;
  }
  if (thisEnd === undefined) {
    thisEnd = this.length;
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index');
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0;
  }
  if (thisStart >= thisEnd) {
    return -1;
  }
  if (start >= end) {
    return 1;
  }

  start >>>= 0;
  end >>>= 0;
  thisStart >>>= 0;
  thisEnd >>>= 0;

  if (this === target) return 0;

  var x = thisEnd - thisStart;
  var y = end - start;
  var len = Math.min(x, y);

  var thisCopy = this.slice(thisStart, thisEnd);
  var targetCopy = target.slice(start, end);

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i];
      y = targetCopy[i];
      break;
    }
  }

  if (x < y) return -1;
  if (y < x) return 1;
  return 0;
};

function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
  if (buffer.length === 0) return -1;

  if (typeof byteOffset === 'string') {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff;
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000;
  }
  byteOffset = +byteOffset;
  if (isNaN(byteOffset)) {
    byteOffset = dir ? 0 : buffer.length - 1;
  }

  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
  if (byteOffset >= buffer.length) {
    if (dir) return -1;else byteOffset = buffer.length - 1;
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0;else return -1;
  }

  if (typeof val === 'string') {
    val = Buffer.from(val, encoding);
  }

  if (internalIsBuffer(val)) {
    if (val.length === 0) {
      return -1;
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
  } else if (typeof val === 'number') {
    val = val & 0xFF;
    if (Buffer.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
  }

  throw new TypeError('val must be string, number or Buffer');
}

function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
  var indexSize = 1;
  var arrLength = arr.length;
  var valLength = val.length;

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase();
    if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1;
      }
      indexSize = 2;
      arrLength /= 2;
      valLength /= 2;
      byteOffset /= 2;
    }
  }

  function read$$1(buf, i) {
    if (indexSize === 1) {
      return buf[i];
    } else {
      return buf.readUInt16BE(i * indexSize);
    }
  }

  var i;
  if (dir) {
    var foundIndex = -1;
    for (i = byteOffset; i < arrLength; i++) {
      if (read$$1(arr, i) === read$$1(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i;
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
      } else {
        if (foundIndex !== -1) i -= i - foundIndex;
        foundIndex = -1;
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
    for (i = byteOffset; i >= 0; i--) {
      var found = true;
      for (var j = 0; j < valLength; j++) {
        if (read$$1(arr, i + j) !== read$$1(val, j)) {
          found = false;
          break;
        }
      }
      if (found) return i;
    }
  }

  return -1;
}

Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1;
};

Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
};

Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
};

function hexWrite(buf, string, offset, length) {
  offset = Number(offset) || 0;
  var remaining = buf.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = Number(length);
    if (length > remaining) {
      length = remaining;
    }
  }

  var strLen = string.length;
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string');

  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(parsed)) return i;
    buf[offset + i] = parsed;
  }
  return i;
}

function utf8Write(buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
}

function asciiWrite(buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length);
}

function latin1Write(buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length);
}

function base64Write(buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length);
}

function ucs2Write(buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
}

Buffer.prototype.write = function write$$1(string, offset, length, encoding) {
  if (offset === undefined) {
    encoding = 'utf8';
    length = this.length;
    offset = 0;
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset;
    length = this.length;
    offset = 0;
  } else if (isFinite(offset)) {
    offset = offset | 0;
    if (isFinite(length)) {
      length = length | 0;
      if (encoding === undefined) encoding = 'utf8';
    } else {
      encoding = length;
      length = undefined;
    }
  } else {
    throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
  }

  var remaining = this.length - offset;
  if (length === undefined || length > remaining) length = remaining;

  if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds');
  }

  if (!encoding) encoding = 'utf8';

  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length);

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length);

      case 'ascii':
        return asciiWrite(this, string, offset, length);

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length);

      case 'base64':
        return base64Write(this, string, offset, length);

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length);

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
};

Buffer.prototype.toJSON = function toJSON() {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  };
};

function base64Slice(buf, start, end) {
  if (start === 0 && end === buf.length) {
    return fromByteArray(buf);
  } else {
    return fromByteArray(buf.slice(start, end));
  }
}

function utf8Slice(buf, start, end) {
  end = Math.min(buf.length, end);
  var res = [];

  var i = start;
  while (i < end) {
    var firstByte = buf[i];
    var codePoint = null;
    var bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint;

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte;
          }
          break;
        case 2:
          secondByte = buf[i + 1];
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint;
            }
          }
      }
    }

    if (codePoint === null) {
      codePoint = 0xFFFD;
      bytesPerSequence = 1;
    } else if (codePoint > 0xFFFF) {
      codePoint -= 0x10000;
      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
      codePoint = 0xDC00 | codePoint & 0x3FF;
    }

    res.push(codePoint);
    i += bytesPerSequence;
  }

  return decodeCodePointsArray(res);
}

var MAX_ARGUMENTS_LENGTH = 0x1000;

function decodeCodePointsArray(codePoints) {
  var len = codePoints.length;
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints);
  }

  var res = '';
  var i = 0;
  while (i < len) {
    res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
  }
  return res;
}

function asciiSlice(buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F);
  }
  return ret;
}

function latin1Slice(buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i]);
  }
  return ret;
}

function hexSlice(buf, start, end) {
  var len = buf.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i]);
  }
  return out;
}

function utf16leSlice(buf, start, end) {
  var bytes = buf.slice(start, end);
  var res = '';
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  }
  return res;
}

Buffer.prototype.slice = function slice(start, end) {
  var len = this.length;
  start = ~~start;
  end = end === undefined ? len : ~~end;

  if (start < 0) {
    start += len;
    if (start < 0) start = 0;
  } else if (start > len) {
    start = len;
  }

  if (end < 0) {
    end += len;
    if (end < 0) end = 0;
  } else if (end > len) {
    end = len;
  }

  if (end < start) end = start;

  var newBuf;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end);
    newBuf.__proto__ = Buffer.prototype;
  } else {
    var sliceLen = end - start;
    newBuf = new Buffer(sliceLen, undefined);
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start];
    }
  }

  return newBuf;
};

function checkOffset(offset, ext, length) {
  if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint');
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
}

Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }

  return val;
};

Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length);
  }

  var val = this[offset + --byteLength];
  var mul = 1;
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul;
  }

  return val;
};

Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  return this[offset];
};

Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] | this[offset + 1] << 8;
};

Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] << 8 | this[offset + 1];
};

Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
};

Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
};

Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val;
};

Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var i = byteLength;
  var mul = 1;
  var val = this[offset + --i];
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val;
};

Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  if (!(this[offset] & 0x80)) return this[offset];
  return (0xff - this[offset] + 1) * -1;
};

Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset] | this[offset + 1] << 8;
  return val & 0x8000 ? val | 0xFFFF0000 : val;
};

Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset + 1] | this[offset] << 8;
  return val & 0x8000 ? val | 0xFFFF0000 : val;
};

Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
};

Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
};

Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, true, 23, 4);
};

Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, false, 23, 4);
};

Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, true, 52, 8);
};

Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, false, 52, 8);
};

function checkInt(buf, value, offset, ext, max, min) {
  if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
  if (offset + ext > buf.length) throw new RangeError('Index out of range');
}

Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var mul = 1;
  var i = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = value / mul & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var i = byteLength - 1;
  var mul = 1;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = value / mul & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  this[offset] = value & 0xff;
  return offset + 1;
};

function objectWriteUInt16(buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & 0xff << 8 * (littleEndian ? i : 1 - i)) >>> (littleEndian ? i : 1 - i) * 8;
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2;
};

Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 8;
    this[offset + 1] = value & 0xff;
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2;
};

function objectWriteUInt32(buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = value >>> (littleEndian ? i : 3 - i) * 8 & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = value >>> 24;
    this[offset + 2] = value >>> 16;
    this[offset + 1] = value >>> 8;
    this[offset] = value & 0xff;
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4;
};

Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 0xff;
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4;
};

Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = 0;
  var mul = 1;
  var sub = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = (value / mul >> 0) - sub & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = byteLength - 1;
  var mul = 1;
  var sub = 0;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = (value / mul >> 0) - sub & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  if (value < 0) value = 0xff + value + 1;
  this[offset] = value & 0xff;
  return offset + 1;
};

Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2;
};

Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 8;
    this[offset + 1] = value & 0xff;
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2;
};

Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
    this[offset + 2] = value >>> 16;
    this[offset + 3] = value >>> 24;
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4;
};

Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (value < 0) value = 0xffffffff + value + 1;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 0xff;
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4;
};

function checkIEEE754(buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range');
  if (offset < 0) throw new RangeError('Index out of range');
}

function writeFloat(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }
  write(buf, value, offset, littleEndian, 23, 4);
  return offset + 4;
}

Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert);
};

Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert);
};

function writeDouble(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }
  write(buf, value, offset, littleEndian, 52, 8);
  return offset + 8;
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert);
};

Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.copy = function copy(target, targetStart, start, end) {
  if (!start) start = 0;
  if (!end && end !== 0) end = this.length;
  if (targetStart >= target.length) targetStart = target.length;
  if (!targetStart) targetStart = 0;
  if (end > 0 && end < start) end = start;

  if (end === start) return 0;
  if (target.length === 0 || this.length === 0) return 0;

  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds');
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds');
  if (end < 0) throw new RangeError('sourceEnd out of bounds');

  if (end > this.length) end = this.length;
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start;
  }

  var len = end - start;
  var i;

  if (this === target && start < targetStart && targetStart < end) {
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start];
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start];
    }
  } else {
    Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
  }

  return len;
};

Buffer.prototype.fill = function fill(val, start, end, encoding) {
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start;
      start = 0;
      end = this.length;
    } else if (typeof end === 'string') {
      encoding = end;
      end = this.length;
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0);
      if (code < 256) {
        val = code;
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string');
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding);
    }
  } else if (typeof val === 'number') {
    val = val & 255;
  }

  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index');
  }

  if (end <= start) {
    return this;
  }

  start = start >>> 0;
  end = end === undefined ? this.length : end >>> 0;

  if (!val) val = 0;

  var i;
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val;
    }
  } else {
    var bytes = internalIsBuffer(val) ? val : utf8ToBytes(new Buffer(val, encoding).toString());
    var len = bytes.length;
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len];
    }
  }

  return this;
};

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

function base64clean(str) {
  str = stringtrim(str).replace(INVALID_BASE64_RE, '');

  if (str.length < 2) return '';

  while (str.length % 4 !== 0) {
    str = str + '=';
  }
  return str;
}

function stringtrim(str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
}

function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(string, units) {
  units = units || Infinity;
  var codePoint;
  var length = string.length;
  var leadSurrogate = null;
  var bytes = [];

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i);

    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      if (!leadSurrogate) {
        if (codePoint > 0xDBFF) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue;
        } else if (i + 1 === length) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue;
        }

        leadSurrogate = codePoint;

        continue;
      }

      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        leadSurrogate = codePoint;
        continue;
      }

      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
    } else if (leadSurrogate) {
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
    }

    leadSurrogate = null;

    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break;
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break;
      bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break;
      bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break;
      bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
    } else {
      throw new Error('Invalid code point');
    }
  }

  return bytes;
}

function asciiToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    byteArray.push(str.charCodeAt(i) & 0xFF);
  }
  return byteArray;
}

function utf16leToBytes(str, units) {
  var c, hi, lo;
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break;

    c = str.charCodeAt(i);
    hi = c >> 8;
    lo = c % 256;
    byteArray.push(lo);
    byteArray.push(hi);
  }

  return byteArray;
}

function base64ToBytes(str) {
  return toByteArray(base64clean(str));
}

function blitBuffer(src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if (i + offset >= dst.length || i >= src.length) break;
    dst[i + offset] = src[i];
  }
  return i;
}

function isnan(val) {
  return val !== val;
}

function isBuffer(obj) {
  return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj));
}

function isFastBuffer(obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj);
}

function isSlowBuffer(obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0));
}

if (typeof global$1.setTimeout === 'function') {}
if (typeof global$1.clearTimeout === 'function') {}

var performance = global$1.performance || {};
var performanceNow = performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow || function () {
  return new Date().getTime();
};

var formatRegExp = /%[sdj%]/g;
function format(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function (x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s':
        return String(args[i++]);
      case '%d':
        return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
}

function inspect(obj, opts) {
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };

  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    ctx.showHidden = opts;
  } else if (opts) {
    _extend(ctx, opts);
  }

  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}

inspect.colors = {
  'bold': [1, 22],
  'italic': [3, 23],
  'underline': [4, 24],
  'inverse': [7, 27],
  'white': [37, 39],
  'grey': [90, 39],
  'black': [30, 39],
  'blue': [34, 39],
  'cyan': [36, 39],
  'green': [32, 39],
  'magenta': [35, 39],
  'red': [31, 39],
  'yellow': [33, 39]
};

inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',

  'regexp': 'red'
};

function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\x1B[' + inspect.colors[style][0] + 'm' + str + '\x1B[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}

function stylizeNoColor(str, styleType) {
  return str;
}

function arrayToHash(array) {
  var hash = {};

  array.forEach(function (val, idx) {
    hash[val] = true;
  });

  return hash;
}

function formatValue(ctx, value, recurseTimes) {
  if (ctx.customInspect && value && isFunction(value.inspect) && value.inspect !== inspect && !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  if (isError(value) && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '',
      array = false,
      braces = ['{', '}'];

  if (isArray$2(value)) {
    array = true;
    braces = ['[', ']'];
  }

  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function (key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}

function formatPrimitive(ctx, value) {
  if (isUndefined(value)) return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '').replace(/'/g, "\\'").replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value)) return ctx.stylize('' + value, 'number');
  if (isBoolean(value)) return ctx.stylize('' + value, 'boolean');

  if (isNull(value)) return ctx.stylize('null', 'null');
}

function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}

function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function (key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
    }
  });
  return output;
}

function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function (line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function (line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}

function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function (prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] + (base === '' ? '' : base + '\n ') + ' ' + output.join(',\n  ') + ' ' + braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}

function isArray$2(ar) {
  return Array.isArray(ar);
}

function isBoolean(arg) {
  return typeof arg === 'boolean';
}

function isNull(arg) {
  return arg === null;
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isString(arg) {
  return typeof arg === 'string';
}

function isUndefined(arg) {
  return arg === void 0;
}

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}

function isObject(arg) {
  return (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'object' && arg !== null;
}

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}

function isError(e) {
  return isObject(e) && (objectToString(e) === '[object Error]' || e instanceof Error);
}

function isFunction(arg) {
  return typeof arg === 'function';
}

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

function _extend(origin, add) {
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var dialogContainer = document.body.appendChild(document.createElement('div'));
dialogContainer.classList.add('auc-timer-dialog-container');

var Dialog = function (_EventEmitter) {
  _inherits(Dialog, _EventEmitter);

  function Dialog(type, msg, options) {
    _classCallCheck(this, Dialog);

    if (typeof type !== 'string') type = 'info';
    if (typeof msg !== 'string') msg = '';
    if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object') {
      options = { ttl: 5000, listeners: {} };
    }

    var _this4 = _possibleConstructorReturn(this, (Dialog.__proto__ || Object.getPrototypeOf(Dialog)).call(this));

    _this4._elListeners = {};

    options.ttl = typeof options.ttl === 'number' ? options.ttl : 5000;
    options.listeners = _typeof(options.listeners) === 'object' ? options.listeners : {};
    _this4.options = options;
    _this4._id = '';
    _this4.isShown = false;

    _this4.el = dialogContainer.appendChild(document.createElement('div'));
    _this4.msgList = _this4.el.appendChild(document.createElement('ul'));
    _this4.footer = _this4.el.appendChild(document.createElement('div'));
    _this4.append(msg);

    _this4.el.classList.add('auc-timer-dialog', 'auc-timer-' + type);
    _this4.el.addEventListener('click', function () {
      _this4.hide();
    });
    _this4.el.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'opacity') {
        if (_this4.el.classList.contains('active')) {
          _this4.isShown = true;
          _this4.emit('show');
        } else if (_this4.el.classList.contains('idle')) {
          _this4.emit('idle');
        } else {
          _this4.isShown = false;
          _this4.emit('hide');
        }
      }
    });

    _this4.on('show', function () {
      setTimeout(function () {
        _this4.idle();
      }, _this4.options.ttl);
    }).on('hide', function () {
      dialogContainer.style.zIndex = -1000000;
      _this4.clear();
    });

    Object.keys(options.listeners).forEach(function (listener) {
      _this4.el.addEventListener(listener, options.listeners[listener]);
    });
    return _this4;
  }

  _createClass(Dialog, [{
    key: 'show',
    value: function show() {
      if (this.el) {
        dialogContainer.style.zIndex = 1000000;
        this.el.classList.remove('idle');
        this.el.classList.add('active');
      }
      return this;
    }
  }, {
    key: 'idle',
    value: function idle() {
      if (this.el) {
        this.el.classList.remove('active');
        this.el.classList.add('idle');
      }
      return this;
    }
  }, {
    key: 'hide',
    value: function hide() {
      if (this.el) {
        this.el.classList.remove('active', 'idle');
      }
      return this;
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.msgList.innerHTML = '';
      this.footer.innerHTML = '';
    }
  }, {
    key: 'append',
    value: function append(msg) {
      if (msg) this.msgList.appendChild(document.createElement('li')).innerHTML = msg;
      return this;
    }
  }, {
    key: 'onEl',
    value: function onEl(event, cb) {
      if (this._elListeners[event]) return this;

      this._elListeners[event] = cb;
      this.el.addEventListener(event, cb);
      return this;
    }
  }, {
    key: 'unElAll',
    value: function unElAll() {
      var _this5 = this;

      Object.keys(this._elListeners).forEach(function (event) {
        _this5.el.removeEventListener(event, _this5._elListeners[event]);
      });
      return this;
    }
  }, {
    key: 'unEl',
    value: function unEl(event) {
      this.el.removeEventListener(event, this._elListeners[event]);
      return this;
    }
  }, {
    key: 'setFooter',
    value: function setFooter(msg) {
      this.footer.innerHTML = msg;
      return this;
    }
  }]);

  return Dialog;
}(EventEmitter);

Dialog.SHOWUP_DELAY = 500;
Dialog.TRANSITION_DURATION = 500;

GM_addStyle('\n  .auc-timer-dialog-container {\n    float: right;\n    width: 280px;\n    z-index: -1000000;\n    position: fixed;\n    right: 0;\n    bottom: 20px;\n    padding: 20px;\n    overflow: hidden;\n  }\n\n  .auc-timer-dialog {\n    width: 240px;\n    margin-top: 8px;\n    padding: 20px;\n    color: #ededed;\n    font-size: 16px;\n    cursor: pointer;\n    position: relative;\n    border-radius: 2px;\n    opacity: 0;\n    left: 300px;\n    -webkit-transition: opacity ' + Dialog.TRANSITION_DURATION + 'ms, left ' + Dialog.TRANSITION_DURATION + 'ms;\n    transition: opacity ' + Dialog.TRANSITION_DURATION + 'ms, left ' + Dialog.TRANSITION_DURATION + 'ms;\n  }\n\n  .auc-timer-dialog>ul{\n    list-style-type: square;\n    position: relative;\n    left: 10px;\n  }\n\n  .auc-timer-dialog.auc-timer-error {\n    background-color: #c8181888;\n  }\n\n  .auc-timer-dialog.active {\n    left: 0;\n    opacity: 1;\n  }\n\n  .auc-timer-dialog.idle {\n    left: 0;\n    opacity: 0.5;\n  }\n\n  .auc-timer-dialog.idle:hover {\n    opacity: 1;\n  }\n');

function hasDialogShown(type) {
  switch (type) {
    case 'error':
      return error.dialog && error.dialog.isShown;
    default:
      return false;
  }
}

function error(msg, options) {
  error.dialog = error.dialog || new Dialog('error', '');
  error.dialog.append(msg);

  if (typeof options === 'function') {
    error.dialog.onEl('click', options);
  } else if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
    if (typeof options.click === 'function') {
      error.dialog.onEl('click', options.click);
    }

    if (typeof options.footer === 'string') {
      error.dialog.setFooter(options.footer);
    }
  } else if (typeof options === 'string') {
    error.dialog.setFooter(options);
  }

  setTimeout(function () {
    error.dialog.show();
  }, Dialog.SHOWUP_DELAY);

  return error.dialog;
}

var EMPTY_LOGS = 'No logs available for the current filter.';

GM_getValue = GM_getValue || function (key, defaultVal) {
  if (!window.localStorage && !window.localStorage.getItem) throw new NotSupportedError();

  var storage = window.localStorage.getItem(key);
  return storage === null ? defaultVal : storage;
};

GM_setValue = GM_setValue || function (key, val) {
  if (!window.localStorage && !window.localStorage.setItem) throw new NotSupportedError();

  window.localStorage.setItem(key, val);
};


GM_addStyle('\n  .auc-timer-logger {\n    width: 585px;\n    height: calc((100vh - 300px) * 0.9);\n    background-color: #00000077;\n    padding-left: 65px;\n    padding-top: calc((100vh - 300px) * 0.05);\n  }\n\n  .auc-timer-logger.hidden {\n    display: none;\n  }\n\n  .auc-timer-logger-logs {\n    width: 520px;\n    height: 80%;\n    background-color: #b3c3cb;\n    border: 1px solid #668599;\n    border-bottom-color: #d3d9de;\n    border-radius: 3px;\n    box-shadow: inset 0 1px 3px 0 #454f54;\n    font-size: 14px;\n    font-family: Arial,Helvetica,sans-serif;\n    min-height: 130px;\n    padding: 5px;\n    overflow-y: auto;\n  }\n\n  .auc-timer-logger-fn {\n    width: 246px;\n    height: 20px;\n    cursor: pointer;\n    border-radius: 4px;\n    color: white;\n    text-align: center;\n    padding: 10px;\n    font-size: 16px;\n  }\n\n  .auc-timer-logger-copy {\n    display: inline-block;\n    background-color: #0058a277;\n  }\n\n  .auc-timer-logger-copy:hover {\n    background-color: #7cc3ff77;\n  }\n\n  .auc-timer-logger-reset {\n    display: inline-block;\n    background-color: #e4353577;\n  }\n\n  .auc-timer-logger-reset:hover {\n    background-color: #ffa5a577;\n  }\n\n  .auc-timer-logger-info {\n    color: green;\n  }\n\n  .auc-timer-logger-warn {\n    color: #d88720;\n  }\n\n  .auc-timer-logger-debug {\n    color: grey;\n  }\n\n  .auc-timer-logger-error {\n    font-wieght: 500;\n    color: red;\n  }\n\n  hr.auc-timer-logger-sep {\n    margin-top: 4px;\n    margin-bottom: 4px;\n  }\n\n  .auc-timer-copyzone {\n    position: absolute;\n    left: -10000px;\n    top: -10000px;\n  }\n\n  .auc-timer-logger-filter {\n    width: 160px;\n  }\n');

var GMLogEntry = function () {
  function GMLogEntry(time, level, msg) {
    _classCallCheck(this, GMLogEntry);

    this.time = time;
    this.level = level;
    this.msg = msg;
  }

  _createClass(GMLogEntry, [{
    key: 'toHTML',
    value: function toHTML() {
      return '<div class="auc-timer-logger-' + this.level + '">[' + this.time + '][' + this.level + '] ' + this.msg + '</div>';
    }
  }, {
    key: 'toString',
    value: function toString() {
      return '[' + this.time + '][' + this.level + '] ' + this.msg;
    }
  }]);

  return GMLogEntry;
}();

var GMLogger = function () {
  function GMLogger(config) {
    var _this6 = this;

    _classCallCheck(this, GMLogger);

    this.constructor.prototype.prototype = console.prototype;

    this._GM_key = '__logs__';
    this._state_key = '__state__';
    this._MAX_LOG_ENTRIES = config.MAX_LOG_ENTRIES;
    this._cache = [];
    this.level = 'error';
    this.isShown = false;

    this.content = null;
    this.menuBtn = document.getElementById('menuTable').appendChild(document.createElement('li'));
    var menuAnchor = this.menuBtn.appendChild(document.createElement('a'));
    menuAnchor.href = 'javascript:void(0)';
    menuAnchor.innerHTML = '<span class="textlabel">Auc. Timer</span>';
    menuAnchor.classList.add('menubutton');
    menuAnchor.addEventListener('click', function () {
      if (_this6.isShown) {
        _this6.closePanel();
      } else {
        _this6.showPanel();
      }
    });

    this._load();
  }

  _createClass(GMLogger, [{
    key: 'setLevel',
    value: function setLevel(level) {
      this.level = level;
    }
  }, {
    key: 'showPanel',
    value: function showPanel() {
      var _this7 = this;

      var logsDisplay = void 0;

      if (!this.content) {
        this.content = document.getElementById('middle').appendChild(document.createElement('div'));
        this.content.classList.add('auc-timer-logger');

        var logFilterLabel = this.content.appendChild(document.createElement('label'));
        logFilterLabel.htmlFor = 'auc-timer-logfilter';
        logFilterLabel.innerHTML = 'Log Level: &nbsp;&nbsp;&nbsp;';

        var logFilter = logFilterLabel.appendChild(document.createElement('select'));
        logFilter.id = 'auc-timer-logfilter';
        logFilter.classList.add('auc-timer-logger-filter');
        logFilter.innerHTML = '\n        <option class="" value="debug" ' + (this.level === 'debug' ? 'selected' : '') + '>DEBUG</option>\n        <option class="" value="info" ' + (this.level === 'info' ? 'selected' : '') + '>INFO</option>\n        <option class="" value="warn" ' + (this.level === 'warn' ? 'selected' : '') + '>WARN</option>\n        <option class="" value="error" ' + (this.level === 'error' ? 'selected' : '') + '>ERROR</option>\n        <option class="" value="off" ' + (this.level === 'off' ? 'selected' : '') + '>OFF</option>\n      ';

        try {
          $(logFilter).ogameDropDown().on('change', function () {
            _this7.level = $(logFilter).val();
            GM_setValue(_this7._state_key, { level: _this7.level });
            _this7.loadLogs(logsDisplay);
          });
        } catch (err) {
          console.error(err);
        }

        logsDisplay = this.content.appendChild(document.createElement('div'));
        logsDisplay.classList.add('auc-timer-logger-logs');

        var resetBtn = this.content.appendChild(document.createElement('div'));
        resetBtn.classList.add('auc-timer-logger-reset', 'auc-timer-logger-fn');
        resetBtn.innerHTML = 'Reset';
        resetBtn.addEventListener('click', function () {
          _this7._cache = [];
          _this7._save();
          _this7.loadLogs(logsDisplay);
        });

        var copyBtn = this.content.appendChild(document.createElement('div'));
        copyBtn.classList.add('auc-timer-logger-copy', 'auc-timer-logger-fn');
        copyBtn.innerHTML = 'Copy';
        copyBtn.addEventListener('click', function () {
          var copyzone = document.body.appendChild(document.createElement('textarea'));
          copyzone.classList.add('auc-timer-copyzone');
          copyzone.value = _this7._cache.filter(function (entry) {
            return GMLogger.levelMap[entry.level] >= GMLogger.levelMap[_this7.level];
          }).join('\n').trim() || EMPTY_LOGS;
          copyzone.select();
          document.execCommand('copy');
        });
      } else {
        logsDisplay = this.content.childNodes[1];
      }

      this.loadLogs(logsDisplay);

      logsDisplay.scrollTop = logsDisplay.scrollHeight;

      this.content.classList.remove('hidden');

      $(this.content).prevUntil().hide();
      this.isShown = true;
    }
  }, {
    key: 'loadLogs',
    value: function loadLogs(logsDisplay) {
      var _this8 = this;

      var logs = this._cache.filter(function (entry) {
        return GMLogger.levelMap[entry.level] >= GMLogger.levelMap[_this8.level];
      }).map(function (entry) {
        return entry.toHTML();
      }).join('<hr class="auc-timer-logger-sep">');

      logsDisplay.innerHTML = logs.trim() ? logs : '<div style="color:grey;pointer-events: none;">' + EMPTY_LOGS + '</div>';
    }
  }, {
    key: 'closePanel',
    value: function closePanel() {
      if (this.content && !this.content.classList.contains('hidden')) {
        this.content.classList.add('hidden');
        $(this.content).prevUntil().show();
      }

      this.isShown = false;
    }
  }, {
    key: '_gc',
    value: function _gc() {
      if (this._cache.length > this._MAX_LOG_ENTRIES) {
        this._cache.splice(0, this._cache.length - this._MAX_LOG_ENTRIES);
      }
    }
  }, {
    key: '_log',
    value: function _log(level) {
      var _this9 = this;

      var time = new Date();

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var msg = format.apply(undefined, args);

      this._cache.push(new GMLogEntry(time, level, msg));

      this._save();

      if (level === 'error' && !hasDialogShown('error')) {
        error('Error occurs.', {
          click: function click() {
            _this9.showPanel();
          },
          footer: '(Click to view details)'
        });
      }
    }
  }, {
    key: '_load',
    value: function _load() {
      this.level = GM_getValue(this._state_key, {}).level || 'error';
      this._cache = GM_getValue(this._GM_key, []).map(function (rawEntry) {
        return rawEntry.match(/^\[(.*?)\]\[(.*?)\] (.*)$/);
      }).filter(function (matchedEntry) {
        return matchedEntry !== null;
      }).map(function (matchedEntry) {
        return new GMLogEntry(new Date(matchedEntry[1]), matchedEntry[2], matchedEntry[3]);
      });
    }
  }, {
    key: '_save',
    value: function _save() {
      this._gc();
      GM_setValue(this._GM_key, this._cache.map(function (entry) {
        return entry.toString();
      }));
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

GMLogger.levelMap = {
  'debug': 0,
  'info': 10,
  'warn': 20,
  'error': 30,
  'off': 40
};

function getLogger() {
  try {
    return new GMLogger({ MAX_LOG_ENTRIES: MAX_LOG_ENTRIES });
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

  deps.forEach(function (dep) {
    if (!scope[dep]) {
      lacks.push(dep);
    }
  });

  if (lacks.length === 0) {
    cb(null);
  } else if (lacks.length > 0) {
    if (new Date().getTime() <= due.getTime()) {
      var safeFn = new SafeFunction(checkDependencies.bind(undefined, scope, lacks, cb, due));
      safeFn.on('error', function (err) {
        LOG.error('Error occurs in #checkDependencies()');
        LOG.error(err);
      });

      setTimeout(safeFn, DEP_CHECK_PERIOD);
    } else {
      cb(new DependencyError(lacks));
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

    if ($('#auctionTimer').length > 0) {
      return;
    }
    $('p.auction_info').next().before('<span id="auctionTimer" style="font-weight: bold; color: ' + $('p.auction_info span').css('color') + ';"></span>');
    if ($('#div_traderAuctioneer .left_header h2').text().indexOf(loca.auctionFinished) < 0) {
      auctionEndTime = GM_getValue(uni + '_auctionEndTime', -1);
      currentTime = new Date().getTime();
      if (auctionEndTime >= currentTime) {
        secs = Math.round((auctionEndTime - currentTime) / 1000);
        oldMins = Math.ceil(secs / 60);
        first = false;
        LOG.info('Ending time is found in storage. Action will end at ' + new Date(auctionEndTime).toLocaleString());
        document.getElementById('auctionTimer').classList.add('service');
      } else {
        var matched = $('p.auction_info').text().match(/\d+/g);
        if (!matched) return;

        oldMins = parseInt(matched[0]);
        secs = oldMins * 60;
        first = true;
      }
      mins = oldMins;
      auctionTimer = new SimpleCountdown($('#auctionTimer').get(0), secs, function () {
        $('#auctionTimer').text('');
      });
    }

    var mySock = io.connect(':' + nodePort + '/auctioneer', nodeParams);
    var onConnect = new SafeFunction(function () {
      mySock.on('timeLeft', function (msg) {
        if ($('#div_traderAuctioneer .left_header h2').text().indexOf(loca.auctionFinished) >= 0) {
          first = true;
          GM_setValue(uni + '_auctionEndTime', '-1');
          LOG.info('Auction ends');
          document.getElementById('auctionTimer').classList.remove('service');
          return;
        }
        auctionEndTime = GM_getValue(uni + '_auctionEndTime', -1);
        currentTime = new Date().getTime();
        newMins = parseInt(/<b>\D+(\d+)/.exec(msg)[1]);
        if (newMins === oldMins) {
          mins--;
          if (first) {
            first = false;
          } else if (auctionEndTime >= 0) {
            GM_setValue(uni + '_auctionEndTime', currentTime + mins * 60 * 1000);
            LOG.info('Auction ending time is locked');
            document.getElementById('auctionTimer').classList.add('service');
          }
        } else {
          if (newMins > oldMins && auctionEndTime >= currentTime) {
            newMins = Math.round((auctionEndTime - currentTime) / (1000 * 60));
          }
          if (first) {
            first = false;
          } else if (oldMins >= 0) {
            GM_setValue(uni + '_auctionEndTime', currentTime + newMins * 60 * 1000);
            LOG.info('Auction ending time is locked');
            document.getElementById('auctionTimer').classList.add('service');
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
        LOG.info('Auction starts');
        setTimeout(function () {
          $('#auctionTimer').css('color', $('p.auction_info span').css('color'));
        }, 100);
      });
      mySock.on('auction finished', function (msg) {
        changeTimeLeft(auctionTimer, 0);
        changeTimeLeft(overflowAuctionTimer, 0);
        first = true;
        GM_setValue(uni + '_auctionEndTime', '-1');
        LOG.info('Auction ends');
        document.getElementById('auctionTimer').classList.remove('service');
      });
    });

    onConnect.on('error', function (err) {
      LOG.error('Error occurs in #onConnect()');
      LOG.error(err);
    });

    mySock.on('connect', onConnect).on('connect_error', function (err) {
      LOG.error('Connect error.');
      LOG.error(err);
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
}

var SimpleCountdown$1 = simpleCountdown;

function handleNonAuction() {
  var uni = document.location.href.replace(/^https:\/\/([^/]+).+/, '$1');
  var auctionEndTime = GM_getValue(uni + '_auctionEndTime', -1);
  auctionEndTime = parseInt(auctionEndTime);
  var currentTime = new Date().getTime();
  var clock = $('.OGameClock');
  clock.parent().append('<li id="auctionTimer" style="padding: 0;width: 120px;position: absolute; right: 135px;"></li>');
  if (auctionEndTime < currentTime) {
    LOG.info('Invalid ending time: ' + new Date(auctionEndTime).toLocaleString() + ' (' + auctionEndTime + 'ms)');
    $('#auctionTimer').text('Pending...').addClass('pending');
  } else {
    LOG.info('Ending time is found in storage. Action will end at ' + new Date(auctionEndTime).toLocaleString());
    $('#auctionTimer').addClass('service');
    var auctionTimer = new SimpleCountdown$1($('#auctionTimer').get(0), Math.round((auctionEndTime - currentTime) / 1000), function () {
      $('#auctionTimer').text('');
    });
  }
}

GM_addStyle('\n  #auctionTimer {\n    display: inline-block;\n    width: 100%;\n    text-align: center;\n    background-color: initial;\n    transition: background-color 0.5s;\n    padding-top: 5px;\n    padding-bottom: 5px;\n  }\n\n  #auctionTimer.service {\n    background-color: #1d5a1d;\n  }\n\n  #auctionTimer.pending {\n    background-color: #922929;\n  }\n');

(function () {
  if (document.location.href.indexOf('/game/index.php?') < 0) {
    return;
  }

  try {
    var handle = function handle(cb, err) {
      if (err) {
        LOG.error('Failed to pass dependency check.');
        LOG.error(err);
        return;
      }

      LOG.info('Dependency check passed');
      cb();
    };
    var deps = void 0;

    if (location.pathname === "/game/index.php" && location.search.includes("component=traderOverview")) {
      LOG.debug('This is traderOverview page');
      deps = DEP_LIST.AUCTION;
      handle = handle.bind(null, handleAuction);
    } else if (document.getElementById('bar')) {
      LOG.debug('This is not traderOverview page');
      deps = DEP_LIST.NON_AUCTION;
      handle = handle.bind(null, handleNonAuction);
    }

    LOG.info('Start dependency check');
    checkDependencies(unsafeWindow, deps, handle);
  } catch (e) {
    LOG.error('Error is caught in the entry.');
    LOG.error(e);
  }
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF1Y3Rpb24tdGltZXIuanMiLCIuLi9zcmMvY29uZmlnLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2V4dGVuZC9pbmRleC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9yb2xsdXAtcGx1Z2luLW5vZGUtYnVpbHRpbnMvc3JjL2VzNi9ldmVudHMuanMiLCIuLi91dGlsL2Z1bmN0aW9uLmpzIiwiLi4vc3JjL3N0cmluZ3MuanMiLCIuLi9zcmMvZXJyb3JzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3JvbGx1cC1wbHVnaW4tbm9kZS1nbG9iYWxzL3NyYy9nbG9iYWwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvYnVmZmVyLWVzNi9iYXNlNjQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvYnVmZmVyLWVzNi9pZWVlNzU0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2J1ZmZlci1lczYvaXNBcnJheS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9idWZmZXItZXM2L2luZGV4LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3Byb2Nlc3MtZXM2L2Jyb3dzZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvcm9sbHVwLXBsdWdpbi1ub2RlLWJ1aWx0aW5zL3NyYy9lczYvdXRpbC5qcyIsIi4uL3NyYy91aS9kaWFsb2cuanMiLCIuLi9zcmMvbG9nZ2VyLmpzIiwiLi4vc3JjL2RlcGVuZGVuY3kuanMiLCIuLi9zcmMvaGFuZGxlci9hdWN0aW9uLmpzIiwiLi4vc3JjL2hhbmRsZXIvbm9uLWF1Y3Rpb24uanMiLCIuLi9zcmMvdWkvc3RhdGVmdWwuanMiLCIuLi9zcmMvaW5kZXguanMiXSwibmFtZXMiOlsiTUFYX0xPR19FTlRSSUVTIiwiTUFYX0RFUF9USU1FT1VUIiwiREVQX0NIRUNLX1BFUklPRCIsIkRFUF9MSVNUIiwiQVVDVElPTiIsIk5PTl9BVUNUSU9OIiwiaGFzT3duIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJ0b1N0ciIsInRvU3RyaW5nIiwiZGVmaW5lUHJvcGVydHkiLCJnT1BEIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwiaXNBcnJheSIsImFyciIsIkFycmF5IiwiY2FsbCIsImlzUGxhaW5PYmplY3QiLCJvYmoiLCJoYXNPd25Db25zdHJ1Y3RvciIsImhhc0lzUHJvdG90eXBlT2YiLCJjb25zdHJ1Y3RvciIsImtleSIsInNldFByb3BlcnR5IiwidGFyZ2V0Iiwib3B0aW9ucyIsIm5hbWUiLCJlbnVtZXJhYmxlIiwiY29uZmlndXJhYmxlIiwidmFsdWUiLCJuZXdWYWx1ZSIsIndyaXRhYmxlIiwiZ2V0UHJvcGVydHkiLCJleHRlbmQiLCJzcmMiLCJjb3B5IiwiY29weUlzQXJyYXkiLCJjbG9uZSIsImFyZ3VtZW50cyIsImkiLCJsZW5ndGgiLCJkZWVwIiwiZG9tYWluIiwiRXZlbnRIYW5kbGVycyIsImNyZWF0ZSIsIkV2ZW50RW1pdHRlciIsImluaXQiLCJ1c2luZ0RvbWFpbnMiLCJ1bmRlZmluZWQiLCJfZXZlbnRzIiwiX21heExpc3RlbmVycyIsImRlZmF1bHRNYXhMaXN0ZW5lcnMiLCJhY3RpdmUiLCJEb21haW4iLCJnZXRQcm90b3R5cGVPZiIsIl9ldmVudHNDb3VudCIsInNldE1heExpc3RlbmVycyIsIm4iLCJpc05hTiIsIlR5cGVFcnJvciIsIiRnZXRNYXhMaXN0ZW5lcnMiLCJ0aGF0IiwiZ2V0TWF4TGlzdGVuZXJzIiwiZW1pdE5vbmUiLCJoYW5kbGVyIiwiaXNGbiIsInNlbGYiLCJsZW4iLCJsaXN0ZW5lcnMiLCJhcnJheUNsb25lIiwiZW1pdE9uZSIsImFyZzEiLCJlbWl0VHdvIiwiYXJnMiIsImVtaXRUaHJlZSIsImFyZzMiLCJlbWl0TWFueSIsImFyZ3MiLCJhcHBseSIsImVtaXQiLCJ0eXBlIiwiZXIiLCJldmVudHMiLCJuZWVkRG9tYWluRXhpdCIsImRvRXJyb3IiLCJlcnJvciIsIkVycm9yIiwiZG9tYWluRW1pdHRlciIsImRvbWFpblRocm93biIsImVyciIsImNvbnRleHQiLCJleGl0IiwiX2FkZExpc3RlbmVyIiwibGlzdGVuZXIiLCJwcmVwZW5kIiwibSIsImV4aXN0aW5nIiwibmV3TGlzdGVuZXIiLCJ1bnNoaWZ0IiwicHVzaCIsIndhcm5lZCIsInciLCJlbWl0dGVyIiwiY291bnQiLCJlbWl0V2FybmluZyIsImUiLCJjb25zb2xlIiwid2FybiIsImxvZyIsImFkZExpc3RlbmVyIiwib24iLCJwcmVwZW5kTGlzdGVuZXIiLCJfb25jZVdyYXAiLCJmaXJlZCIsImciLCJyZW1vdmVMaXN0ZW5lciIsIm9uY2UiLCJwcmVwZW5kT25jZUxpc3RlbmVyIiwibGlzdCIsInBvc2l0aW9uIiwib3JpZ2luYWxMaXN0ZW5lciIsInNwbGljZU9uZSIsInJlbW92ZUFsbExpc3RlbmVycyIsImtleXMiLCJldmxpc3RlbmVyIiwicmV0IiwidW53cmFwTGlzdGVuZXJzIiwibGlzdGVuZXJDb3VudCIsImV2ZW50TmFtZXMiLCJSZWZsZWN0Iiwib3duS2V5cyIsImluZGV4IiwiayIsInBvcCIsIkNhbGxhYmxlIiwicHJvcGVydHkiLCJmdW5jIiwic2V0UHJvdG90eXBlT2YiLCJnZXRPd25Qcm9wZXJ0eU5hbWVzIiwiZm9yRWFjaCIsInAiLCJGdW5jdGlvbiIsIlNhZmVGdW5jdGlvbiIsImZuIiwiZGVmYXVsdFJldHVybiIsIl9mbiIsIl9ydG4iLCJOT1RfU1VQUE9SVEVEX0VOViIsIkRlcGVuZGVuY3lFcnJvciIsImRlcHMiLCJtYXAiLCJqb2luIiwiTm90U3VwcG9ydGVkRXJyb3IiLCJnbG9iYWwkMSIsImdsb2JhbCIsIndpbmRvdyIsImxvb2t1cCIsInJldkxvb2t1cCIsIkFyciIsIlVpbnQ4QXJyYXkiLCJpbml0ZWQiLCJjb2RlIiwiY2hhckNvZGVBdCIsInRvQnl0ZUFycmF5IiwiYjY0IiwiaiIsImwiLCJ0bXAiLCJwbGFjZUhvbGRlcnMiLCJMIiwidHJpcGxldFRvQmFzZTY0IiwibnVtIiwiZW5jb2RlQ2h1bmsiLCJ1aW50OCIsInN0YXJ0IiwiZW5kIiwib3V0cHV0IiwiZnJvbUJ5dGVBcnJheSIsImV4dHJhQnl0ZXMiLCJwYXJ0cyIsIm1heENodW5rTGVuZ3RoIiwibGVuMiIsInJlYWQiLCJidWZmZXIiLCJvZmZzZXQiLCJpc0xFIiwibUxlbiIsIm5CeXRlcyIsImVMZW4iLCJlTWF4IiwiZUJpYXMiLCJuQml0cyIsImQiLCJzIiwiTmFOIiwiSW5maW5pdHkiLCJNYXRoIiwicG93Iiwid3JpdGUiLCJjIiwicnQiLCJhYnMiLCJmbG9vciIsIkxOMiIsImlzQXJyYXkkMSIsIklOU1BFQ1RfTUFYX0JZVEVTIiwiQnVmZmVyIiwiVFlQRURfQVJSQVlfU1VQUE9SVCIsImtNYXhMZW5ndGgiLCJjcmVhdGVCdWZmZXIiLCJSYW5nZUVycm9yIiwiX19wcm90b19fIiwiYXJnIiwiZW5jb2RpbmdPck9mZnNldCIsImFsbG9jVW5zYWZlIiwiZnJvbSIsInBvb2xTaXplIiwiX2F1Z21lbnQiLCJBcnJheUJ1ZmZlciIsImZyb21BcnJheUJ1ZmZlciIsImZyb21TdHJpbmciLCJmcm9tT2JqZWN0IiwiYXNzZXJ0U2l6ZSIsInNpemUiLCJhbGxvYyIsImZpbGwiLCJlbmNvZGluZyIsImNoZWNrZWQiLCJhbGxvY1Vuc2FmZVNsb3ciLCJzdHJpbmciLCJpc0VuY29kaW5nIiwiYnl0ZUxlbmd0aCIsImFjdHVhbCIsInNsaWNlIiwiZnJvbUFycmF5TGlrZSIsImFycmF5IiwiYnl0ZU9mZnNldCIsImludGVybmFsSXNCdWZmZXIiLCJpc25hbiIsImRhdGEiLCJpc0J1ZmZlciIsImIiLCJfaXNCdWZmZXIiLCJjb21wYXJlIiwiYSIsIngiLCJ5IiwibWluIiwiU3RyaW5nIiwidG9Mb3dlckNhc2UiLCJjb25jYXQiLCJwb3MiLCJidWYiLCJpc1ZpZXciLCJsb3dlcmVkQ2FzZSIsInV0ZjhUb0J5dGVzIiwiYmFzZTY0VG9CeXRlcyIsInNsb3dUb1N0cmluZyIsImhleFNsaWNlIiwidXRmOFNsaWNlIiwiYXNjaWlTbGljZSIsImxhdGluMVNsaWNlIiwiYmFzZTY0U2xpY2UiLCJ1dGYxNmxlU2xpY2UiLCJzd2FwIiwic3dhcDE2Iiwic3dhcDMyIiwic3dhcDY0IiwiZXF1YWxzIiwiaW5zcGVjdCIsInN0ciIsIm1heCIsIm1hdGNoIiwidGhpc1N0YXJ0IiwidGhpc0VuZCIsInRoaXNDb3B5IiwidGFyZ2V0Q29weSIsImJpZGlyZWN0aW9uYWxJbmRleE9mIiwidmFsIiwiZGlyIiwiYXJyYXlJbmRleE9mIiwiaW5kZXhPZiIsImxhc3RJbmRleE9mIiwiaW5kZXhTaXplIiwiYXJyTGVuZ3RoIiwidmFsTGVuZ3RoIiwicmVhZFVJbnQxNkJFIiwiZm91bmRJbmRleCIsImZvdW5kIiwiaW5jbHVkZXMiLCJoZXhXcml0ZSIsIk51bWJlciIsInJlbWFpbmluZyIsInN0ckxlbiIsInBhcnNlZCIsInBhcnNlSW50Iiwic3Vic3RyIiwidXRmOFdyaXRlIiwiYmxpdEJ1ZmZlciIsImFzY2lpV3JpdGUiLCJhc2NpaVRvQnl0ZXMiLCJsYXRpbjFXcml0ZSIsImJhc2U2NFdyaXRlIiwidWNzMldyaXRlIiwidXRmMTZsZVRvQnl0ZXMiLCJpc0Zpbml0ZSIsInRvSlNPTiIsIl9hcnIiLCJiYXNlNjQuZnJvbUJ5dGVBcnJheSIsInJlcyIsImZpcnN0Qnl0ZSIsImNvZGVQb2ludCIsImJ5dGVzUGVyU2VxdWVuY2UiLCJzZWNvbmRCeXRlIiwidGhpcmRCeXRlIiwiZm91cnRoQnl0ZSIsInRlbXBDb2RlUG9pbnQiLCJkZWNvZGVDb2RlUG9pbnRzQXJyYXkiLCJNQVhfQVJHVU1FTlRTX0xFTkdUSCIsImNvZGVQb2ludHMiLCJmcm9tQ2hhckNvZGUiLCJvdXQiLCJ0b0hleCIsImJ5dGVzIiwibmV3QnVmIiwic3ViYXJyYXkiLCJzbGljZUxlbiIsImNoZWNrT2Zmc2V0IiwiZXh0IiwicmVhZFVJbnRMRSIsIm5vQXNzZXJ0IiwibXVsIiwicmVhZFVJbnRCRSIsInJlYWRVSW50OCIsInJlYWRVSW50MTZMRSIsInJlYWRVSW50MzJMRSIsInJlYWRVSW50MzJCRSIsInJlYWRJbnRMRSIsInJlYWRJbnRCRSIsInJlYWRJbnQ4IiwicmVhZEludDE2TEUiLCJyZWFkSW50MTZCRSIsInJlYWRJbnQzMkxFIiwicmVhZEludDMyQkUiLCJyZWFkRmxvYXRMRSIsImllZWU3NTQucmVhZCIsInJlYWRGbG9hdEJFIiwicmVhZERvdWJsZUxFIiwicmVhZERvdWJsZUJFIiwiY2hlY2tJbnQiLCJ3cml0ZVVJbnRMRSIsIm1heEJ5dGVzIiwid3JpdGVVSW50QkUiLCJ3cml0ZVVJbnQ4Iiwib2JqZWN0V3JpdGVVSW50MTYiLCJsaXR0bGVFbmRpYW4iLCJ3cml0ZVVJbnQxNkxFIiwid3JpdGVVSW50MTZCRSIsIm9iamVjdFdyaXRlVUludDMyIiwid3JpdGVVSW50MzJMRSIsIndyaXRlVUludDMyQkUiLCJ3cml0ZUludExFIiwibGltaXQiLCJzdWIiLCJ3cml0ZUludEJFIiwid3JpdGVJbnQ4Iiwid3JpdGVJbnQxNkxFIiwid3JpdGVJbnQxNkJFIiwid3JpdGVJbnQzMkxFIiwid3JpdGVJbnQzMkJFIiwiY2hlY2tJRUVFNzU0Iiwid3JpdGVGbG9hdCIsImllZWU3NTQud3JpdGUiLCJ3cml0ZUZsb2F0TEUiLCJ3cml0ZUZsb2F0QkUiLCJ3cml0ZURvdWJsZSIsIndyaXRlRG91YmxlTEUiLCJ3cml0ZURvdWJsZUJFIiwidGFyZ2V0U3RhcnQiLCJzZXQiLCJJTlZBTElEX0JBU0U2NF9SRSIsImJhc2U2NGNsZWFuIiwic3RyaW5ndHJpbSIsInJlcGxhY2UiLCJ0cmltIiwidW5pdHMiLCJsZWFkU3Vycm9nYXRlIiwiYnl0ZUFycmF5IiwiaGkiLCJsbyIsImJhc2U2NC50b0J5dGVBcnJheSIsImRzdCIsImlzRmFzdEJ1ZmZlciIsImlzU2xvd0J1ZmZlciIsInNldFRpbWVvdXQiLCJjbGVhclRpbWVvdXQiLCJwZXJmb3JtYW5jZSIsInBlcmZvcm1hbmNlTm93Iiwibm93IiwibW96Tm93IiwibXNOb3ciLCJvTm93Iiwid2Via2l0Tm93IiwiRGF0ZSIsImdldFRpbWUiLCJmb3JtYXRSZWdFeHAiLCJmb3JtYXQiLCJmIiwiaXNTdHJpbmciLCJvYmplY3RzIiwiSlNPTiIsInN0cmluZ2lmeSIsIl8iLCJpc051bGwiLCJpc09iamVjdCIsIm9wdHMiLCJjdHgiLCJzZWVuIiwic3R5bGl6ZSIsInN0eWxpemVOb0NvbG9yIiwiZGVwdGgiLCJjb2xvcnMiLCJpc0Jvb2xlYW4iLCJzaG93SGlkZGVuIiwiX2V4dGVuZCIsImlzVW5kZWZpbmVkIiwiY3VzdG9tSW5zcGVjdCIsInN0eWxpemVXaXRoQ29sb3IiLCJmb3JtYXRWYWx1ZSIsInN0eWxlcyIsInN0eWxlVHlwZSIsInN0eWxlIiwiYXJyYXlUb0hhc2giLCJoYXNoIiwiaWR4IiwicmVjdXJzZVRpbWVzIiwiaXNGdW5jdGlvbiIsInByaW1pdGl2ZSIsImZvcm1hdFByaW1pdGl2ZSIsInZpc2libGVLZXlzIiwiaXNFcnJvciIsImZvcm1hdEVycm9yIiwiaXNSZWdFeHAiLCJSZWdFeHAiLCJpc0RhdGUiLCJiYXNlIiwiYnJhY2VzIiwidG9VVENTdHJpbmciLCJmb3JtYXRBcnJheSIsImZvcm1hdFByb3BlcnR5IiwicmVkdWNlVG9TaW5nbGVTdHJpbmciLCJzaW1wbGUiLCJpc051bWJlciIsImRlc2MiLCJnZXQiLCJzcGxpdCIsImxpbmUiLCJudW1MaW5lc0VzdCIsInJlZHVjZSIsInByZXYiLCJjdXIiLCJhciIsInJlIiwib2JqZWN0VG9TdHJpbmciLCJvIiwib3JpZ2luIiwiYWRkIiwicHJvcCIsImRpYWxvZ0NvbnRhaW5lciIsImRvY3VtZW50IiwiYm9keSIsImFwcGVuZENoaWxkIiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTGlzdCIsIkRpYWxvZyIsIm1zZyIsInR0bCIsIl9lbExpc3RlbmVycyIsIl9pZCIsImlzU2hvd24iLCJlbCIsIm1zZ0xpc3QiLCJmb290ZXIiLCJhcHBlbmQiLCJhZGRFdmVudExpc3RlbmVyIiwiaGlkZSIsInByb3BlcnR5TmFtZSIsImNvbnRhaW5zIiwiaWRsZSIsInpJbmRleCIsImNsZWFyIiwicmVtb3ZlIiwiaW5uZXJIVE1MIiwiZXZlbnQiLCJjYiIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJTSE9XVVBfREVMQVkiLCJUUkFOU0lUSU9OX0RVUkFUSU9OIiwiR01fYWRkU3R5bGUiLCJoYXNEaWFsb2dTaG93biIsImRpYWxvZyIsIm9uRWwiLCJjbGljayIsInNldEZvb3RlciIsInNob3ciLCJFTVBUWV9MT0dTIiwiR01fZ2V0VmFsdWUiLCJkZWZhdWx0VmFsIiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsInN0b3JhZ2UiLCJHTV9zZXRWYWx1ZSIsInNldEl0ZW0iLCJHTUxvZ0VudHJ5IiwidGltZSIsImxldmVsIiwiR01Mb2dnZXIiLCJjb25maWciLCJfR01fa2V5IiwiX3N0YXRlX2tleSIsIl9NQVhfTE9HX0VOVFJJRVMiLCJfY2FjaGUiLCJjb250ZW50IiwibWVudUJ0biIsImdldEVsZW1lbnRCeUlkIiwibWVudUFuY2hvciIsImhyZWYiLCJjbG9zZVBhbmVsIiwic2hvd1BhbmVsIiwiX2xvYWQiLCJsb2dzRGlzcGxheSIsImxvZ0ZpbHRlckxhYmVsIiwiaHRtbEZvciIsImxvZ0ZpbHRlciIsImlkIiwiJCIsIm9nYW1lRHJvcERvd24iLCJsb2FkTG9ncyIsInJlc2V0QnRuIiwiX3NhdmUiLCJjb3B5QnRuIiwiY29weXpvbmUiLCJmaWx0ZXIiLCJlbnRyeSIsImxldmVsTWFwIiwic2VsZWN0IiwiZXhlY0NvbW1hbmQiLCJjaGlsZE5vZGVzIiwic2Nyb2xsVG9wIiwic2Nyb2xsSGVpZ2h0IiwicHJldlVudGlsIiwibG9ncyIsInRvSFRNTCIsInNwbGljZSIsInByb21wdEVycm9yIiwicmF3RW50cnkiLCJtYXRjaGVkRW50cnkiLCJfZ2MiLCJkZWJ1ZyIsIl9sb2ciLCJpbmZvIiwiZ2V0TG9nZ2VyIiwiYWxlcnQiLCJtZXNzYWdlIiwiTE9HIiwiY2hlY2tEZXBlbmRlbmNpZXMiLCJzY29wZSIsImR1ZSIsImxhY2tzIiwiZGVwIiwic2FmZUZuIiwiYmluZCIsIlNpbXBsZUNvdW50ZG93biIsInNpbXBsZUNvdW50ZG93biIsImNoYW5nZVRpbWVMZWZ0IiwidGltZXIiLCJ0aW1lTGVmdCIsImNvdW50ZG93biIsInN0YXJ0VGltZSIsInN0YXJ0TGVmdG92ZXJUaW1lIiwiY291bnRkb3duT2JqZWN0IiwiaGFuZGxlQXVjdGlvbiIsImNyZWF0ZVRpbWVyIiwib2xkTWlucyIsImZpcnN0Iiwib3ZlcmZsb3dBdWN0aW9uVGltZXIiLCJuZXdNaW5zIiwibWlucyIsInNlY3MiLCJhdWN0aW9uVGltZXIiLCJhdWN0aW9uRW5kVGltZSIsImN1cnJlbnRUaW1lIiwidW5pIiwibG9jYXRpb24iLCJuZXh0IiwiYmVmb3JlIiwiY3NzIiwidGV4dCIsImxvY2EiLCJhdWN0aW9uRmluaXNoZWQiLCJyb3VuZCIsImNlaWwiLCJ0b0xvY2FsZVN0cmluZyIsIm1hdGNoZWQiLCJteVNvY2siLCJpbyIsImNvbm5lY3QiLCJub2RlUG9ydCIsIm5vZGVQYXJhbXMiLCJvbkNvbm5lY3QiLCJleGVjIiwiJDEiLCJhamF4U3VjY2VzcyIsImhhbmRsZU5vbkF1Y3Rpb24iLCJjbG9jayIsInBhcmVudCIsImFkZENsYXNzIiwiaGFuZGxlIiwicGF0aG5hbWUiLCJzZWFyY2giLCJ1bnNhZmVXaW5kb3ciXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7QUNBTyxJQUFNQSxrQkFBa0IsR0FBeEI7QUFDUCxJQUFhQyxrQkFBa0IsS0FBL0I7QUFDQSxJQUFhQyxtQkFBbUIsR0FBaEM7QUFDQSxJQUFhQyxXQUFXO0FBQ3RCQyxXQUFTLENBQ1AsSUFETyxFQUVQLEdBRk8sRUFHUCxZQUhPLEVBSVAsaUJBSk8sRUFLUCxNQUxPLENBRGE7QUFRdEJDLGVBQWEsQ0FDWCxHQURXLEVBRVgsaUJBRlc7QUFSUyxDQUF4Qjs7QUNEQSxJQUFJQyxTQUFTQyxPQUFPQyxTQUFQLENBQWlCQyxjQUE5QjtBQUNBLElBQUlDLFFBQVFILE9BQU9DLFNBQVAsQ0FBaUJHLFFBQTdCO0FBQ0EsSUFBSUMsaUJBQWlCTCxPQUFPSyxjQUE1QjtBQUNBLElBQUlDLE9BQU9OLE9BQU9PLHdCQUFsQjs7QUFFQSxJQUFJQyxVQUFVLFNBQVNBLE9BQVQsQ0FBaUJDLEdBQWpCLEVBQXNCO0FBQ25DLE1BQUksT0FBT0MsTUFBTUYsT0FBYixLQUF5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