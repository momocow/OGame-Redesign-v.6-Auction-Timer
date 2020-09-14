// ==UserScript==
// @name           OGame Redesign (v.6): Auction Timer
// @author         MomoCow
// @namespace      https://github.com/momocow
// @version        3.0.2
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

    var mySock = io.connect('/auctioneer', nodeParams);
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

    mySock.on('connect', onConnect).on('error', function (err) {
      LOG.error('Socket error.');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF1Y3Rpb24tdGltZXIuanMiLCIuLi9zcmMvY29uZmlnLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2V4dGVuZC9pbmRleC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9yb2xsdXAtcGx1Z2luLW5vZGUtYnVpbHRpbnMvc3JjL2VzNi9ldmVudHMuanMiLCIuLi91dGlsL2Z1bmN0aW9uLmpzIiwiLi4vc3JjL3N0cmluZ3MuanMiLCIuLi9zcmMvZXJyb3JzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3JvbGx1cC1wbHVnaW4tbm9kZS1nbG9iYWxzL3NyYy9nbG9iYWwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvYnVmZmVyLWVzNi9iYXNlNjQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvYnVmZmVyLWVzNi9pZWVlNzU0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2J1ZmZlci1lczYvaXNBcnJheS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9idWZmZXItZXM2L2luZGV4LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3Byb2Nlc3MtZXM2L2Jyb3dzZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvcm9sbHVwLXBsdWdpbi1ub2RlLWJ1aWx0aW5zL3NyYy9lczYvdXRpbC5qcyIsIi4uL3NyYy91aS9kaWFsb2cuanMiLCIuLi9zcmMvbG9nZ2VyLmpzIiwiLi4vc3JjL2RlcGVuZGVuY3kuanMiLCIuLi9zcmMvaGFuZGxlci9hdWN0aW9uLmpzIiwiLi4vc3JjL2hhbmRsZXIvbm9uLWF1Y3Rpb24uanMiLCIuLi9zcmMvdWkvc3RhdGVmdWwuanMiLCIuLi9zcmMvaW5kZXguanMiXSwibmFtZXMiOlsiTUFYX0xPR19FTlRSSUVTIiwiTUFYX0RFUF9USU1FT1VUIiwiREVQX0NIRUNLX1BFUklPRCIsIkRFUF9MSVNUIiwiQVVDVElPTiIsIk5PTl9BVUNUSU9OIiwiaGFzT3duIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJ0b1N0ciIsInRvU3RyaW5nIiwiZGVmaW5lUHJvcGVydHkiLCJnT1BEIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwiaXNBcnJheSIsImFyciIsIkFycmF5IiwiY2FsbCIsImlzUGxhaW5PYmplY3QiLCJvYmoiLCJoYXNPd25Db25zdHJ1Y3RvciIsImhhc0lzUHJvdG90eXBlT2YiLCJjb25zdHJ1Y3RvciIsImtleSIsInNldFByb3BlcnR5IiwidGFyZ2V0Iiwib3B0aW9ucyIsIm5hbWUiLCJlbnVtZXJhYmxlIiwiY29uZmlndXJhYmxlIiwidmFsdWUiLCJuZXdWYWx1ZSIsIndyaXRhYmxlIiwiZ2V0UHJvcGVydHkiLCJleHRlbmQiLCJzcmMiLCJjb3B5IiwiY29weUlzQXJyYXkiLCJjbG9uZSIsImFyZ3VtZW50cyIsImkiLCJsZW5ndGgiLCJkZWVwIiwiZG9tYWluIiwiRXZlbnRIYW5kbGVycyIsImNyZWF0ZSIsIkV2ZW50RW1pdHRlciIsImluaXQiLCJ1c2luZ0RvbWFpbnMiLCJ1bmRlZmluZWQiLCJfZXZlbnRzIiwiX21heExpc3RlbmVycyIsImRlZmF1bHRNYXhMaXN0ZW5lcnMiLCJhY3RpdmUiLCJEb21haW4iLCJnZXRQcm90b3R5cGVPZiIsIl9ldmVudHNDb3VudCIsInNldE1heExpc3RlbmVycyIsIm4iLCJpc05hTiIsIlR5cGVFcnJvciIsIiRnZXRNYXhMaXN0ZW5lcnMiLCJ0aGF0IiwiZ2V0TWF4TGlzdGVuZXJzIiwiZW1pdE5vbmUiLCJoYW5kbGVyIiwiaXNGbiIsInNlbGYiLCJsZW4iLCJsaXN0ZW5lcnMiLCJhcnJheUNsb25lIiwiZW1pdE9uZSIsImFyZzEiLCJlbWl0VHdvIiwiYXJnMiIsImVtaXRUaHJlZSIsImFyZzMiLCJlbWl0TWFueSIsImFyZ3MiLCJhcHBseSIsImVtaXQiLCJ0eXBlIiwiZXIiLCJldmVudHMiLCJuZWVkRG9tYWluRXhpdCIsImRvRXJyb3IiLCJlcnJvciIsIkVycm9yIiwiZG9tYWluRW1pdHRlciIsImRvbWFpblRocm93biIsImVyciIsImNvbnRleHQiLCJleGl0IiwiX2FkZExpc3RlbmVyIiwibGlzdGVuZXIiLCJwcmVwZW5kIiwibSIsImV4aXN0aW5nIiwibmV3TGlzdGVuZXIiLCJ1bnNoaWZ0IiwicHVzaCIsIndhcm5lZCIsInciLCJlbWl0dGVyIiwiY291bnQiLCJlbWl0V2FybmluZyIsImUiLCJjb25zb2xlIiwid2FybiIsImxvZyIsImFkZExpc3RlbmVyIiwib24iLCJwcmVwZW5kTGlzdGVuZXIiLCJfb25jZVdyYXAiLCJmaXJlZCIsImciLCJyZW1vdmVMaXN0ZW5lciIsIm9uY2UiLCJwcmVwZW5kT25jZUxpc3RlbmVyIiwibGlzdCIsInBvc2l0aW9uIiwib3JpZ2luYWxMaXN0ZW5lciIsInNwbGljZU9uZSIsInJlbW92ZUFsbExpc3RlbmVycyIsImtleXMiLCJldmxpc3RlbmVyIiwicmV0IiwidW53cmFwTGlzdGVuZXJzIiwibGlzdGVuZXJDb3VudCIsImV2ZW50TmFtZXMiLCJSZWZsZWN0Iiwib3duS2V5cyIsImluZGV4IiwiayIsInBvcCIsIkNhbGxhYmxlIiwicHJvcGVydHkiLCJmdW5jIiwic2V0UHJvdG90eXBlT2YiLCJnZXRPd25Qcm9wZXJ0eU5hbWVzIiwiZm9yRWFjaCIsInAiLCJGdW5jdGlvbiIsIlNhZmVGdW5jdGlvbiIsImZuIiwiZGVmYXVsdFJldHVybiIsIl9mbiIsIl9ydG4iLCJOT1RfU1VQUE9SVEVEX0VOViIsIkRlcGVuZGVuY3lFcnJvciIsImRlcHMiLCJtYXAiLCJqb2luIiwiTm90U3VwcG9ydGVkRXJyb3IiLCJnbG9iYWwkMSIsImdsb2JhbCIsIndpbmRvdyIsImxvb2t1cCIsInJldkxvb2t1cCIsIkFyciIsIlVpbnQ4QXJyYXkiLCJpbml0ZWQiLCJjb2RlIiwiY2hhckNvZGVBdCIsInRvQnl0ZUFycmF5IiwiYjY0IiwiaiIsImwiLCJ0bXAiLCJwbGFjZUhvbGRlcnMiLCJMIiwidHJpcGxldFRvQmFzZTY0IiwibnVtIiwiZW5jb2RlQ2h1bmsiLCJ1aW50OCIsInN0YXJ0IiwiZW5kIiwib3V0cHV0IiwiZnJvbUJ5dGVBcnJheSIsImV4dHJhQnl0ZXMiLCJwYXJ0cyIsIm1heENodW5rTGVuZ3RoIiwibGVuMiIsInJlYWQiLCJidWZmZXIiLCJvZmZzZXQiLCJpc0xFIiwibUxlbiIsIm5CeXRlcyIsImVMZW4iLCJlTWF4IiwiZUJpYXMiLCJuQml0cyIsImQiLCJzIiwiTmFOIiwiSW5maW5pdHkiLCJNYXRoIiwicG93Iiwid3JpdGUiLCJjIiwicnQiLCJhYnMiLCJmbG9vciIsIkxOMiIsImlzQXJyYXkkMSIsIklOU1BFQ1RfTUFYX0JZVEVTIiwiQnVmZmVyIiwiVFlQRURfQVJSQVlfU1VQUE9SVCIsImtNYXhMZW5ndGgiLCJjcmVhdGVCdWZmZXIiLCJSYW5nZUVycm9yIiwiX19wcm90b19fIiwiYXJnIiwiZW5jb2RpbmdPck9mZnNldCIsImFsbG9jVW5zYWZlIiwiZnJvbSIsInBvb2xTaXplIiwiX2F1Z21lbnQiLCJBcnJheUJ1ZmZlciIsImZyb21BcnJheUJ1ZmZlciIsImZyb21TdHJpbmciLCJmcm9tT2JqZWN0IiwiYXNzZXJ0U2l6ZSIsInNpemUiLCJhbGxvYyIsImZpbGwiLCJlbmNvZGluZyIsImNoZWNrZWQiLCJhbGxvY1Vuc2FmZVNsb3ciLCJzdHJpbmciLCJpc0VuY29kaW5nIiwiYnl0ZUxlbmd0aCIsImFjdHVhbCIsInNsaWNlIiwiZnJvbUFycmF5TGlrZSIsImFycmF5IiwiYnl0ZU9mZnNldCIsImludGVybmFsSXNCdWZmZXIiLCJpc25hbiIsImRhdGEiLCJpc0J1ZmZlciIsImIiLCJfaXNCdWZmZXIiLCJjb21wYXJlIiwiYSIsIngiLCJ5IiwibWluIiwiU3RyaW5nIiwidG9Mb3dlckNhc2UiLCJjb25jYXQiLCJwb3MiLCJidWYiLCJpc1ZpZXciLCJsb3dlcmVkQ2FzZSIsInV0ZjhUb0J5dGVzIiwiYmFzZTY0VG9CeXRlcyIsInNsb3dUb1N0cmluZyIsImhleFNsaWNlIiwidXRmOFNsaWNlIiwiYXNjaWlTbGljZSIsImxhdGluMVNsaWNlIiwiYmFzZTY0U2xpY2UiLCJ1dGYxNmxlU2xpY2UiLCJzd2FwIiwic3dhcDE2Iiwic3dhcDMyIiwic3dhcDY0IiwiZXF1YWxzIiwiaW5zcGVjdCIsInN0ciIsIm1heCIsIm1hdGNoIiwidGhpc1N0YXJ0IiwidGhpc0VuZCIsInRoaXNDb3B5IiwidGFyZ2V0Q29weSIsImJpZGlyZWN0aW9uYWxJbmRleE9mIiwidmFsIiwiZGlyIiwiYXJyYXlJbmRleE9mIiwiaW5kZXhPZiIsImxhc3RJbmRleE9mIiwiaW5kZXhTaXplIiwiYXJyTGVuZ3RoIiwidmFsTGVuZ3RoIiwicmVhZFVJbnQxNkJFIiwiZm91bmRJbmRleCIsImZvdW5kIiwiaW5jbHVkZXMiLCJoZXhXcml0ZSIsIk51bWJlciIsInJlbWFpbmluZyIsInN0ckxlbiIsInBhcnNlZCIsInBhcnNlSW50Iiwic3Vic3RyIiwidXRmOFdyaXRlIiwiYmxpdEJ1ZmZlciIsImFzY2lpV3JpdGUiLCJhc2NpaVRvQnl0ZXMiLCJsYXRpbjFXcml0ZSIsImJhc2U2NFdyaXRlIiwidWNzMldyaXRlIiwidXRmMTZsZVRvQnl0ZXMiLCJpc0Zpbml0ZSIsInRvSlNPTiIsIl9hcnIiLCJiYXNlNjQuZnJvbUJ5dGVBcnJheSIsInJlcyIsImZpcnN0Qnl0ZSIsImNvZGVQb2ludCIsImJ5dGVzUGVyU2VxdWVuY2UiLCJzZWNvbmRCeXRlIiwidGhpcmRCeXRlIiwiZm91cnRoQnl0ZSIsInRlbXBDb2RlUG9pbnQiLCJkZWNvZGVDb2RlUG9pbnRzQXJyYXkiLCJNQVhfQVJHVU1FTlRTX0xFTkdUSCIsImNvZGVQb2ludHMiLCJmcm9tQ2hhckNvZGUiLCJvdXQiLCJ0b0hleCIsImJ5dGVzIiwibmV3QnVmIiwic3ViYXJyYXkiLCJzbGljZUxlbiIsImNoZWNrT2Zmc2V0IiwiZXh0IiwicmVhZFVJbnRMRSIsIm5vQXNzZXJ0IiwibXVsIiwicmVhZFVJbnRCRSIsInJlYWRVSW50OCIsInJlYWRVSW50MTZMRSIsInJlYWRVSW50MzJMRSIsInJlYWRVSW50MzJCRSIsInJlYWRJbnRMRSIsInJlYWRJbnRCRSIsInJlYWRJbnQ4IiwicmVhZEludDE2TEUiLCJyZWFkSW50MTZCRSIsInJlYWRJbnQzMkxFIiwicmVhZEludDMyQkUiLCJyZWFkRmxvYXRMRSIsImllZWU3NTQucmVhZCIsInJlYWRGbG9hdEJFIiwicmVhZERvdWJsZUxFIiwicmVhZERvdWJsZUJFIiwiY2hlY2tJbnQiLCJ3cml0ZVVJbnRMRSIsIm1heEJ5dGVzIiwid3JpdGVVSW50QkUiLCJ3cml0ZVVJbnQ4Iiwib2JqZWN0V3JpdGVVSW50MTYiLCJsaXR0bGVFbmRpYW4iLCJ3cml0ZVVJbnQxNkxFIiwid3JpdGVVSW50MTZCRSIsIm9iamVjdFdyaXRlVUludDMyIiwid3JpdGVVSW50MzJMRSIsIndyaXRlVUludDMyQkUiLCJ3cml0ZUludExFIiwibGltaXQiLCJzdWIiLCJ3cml0ZUludEJFIiwid3JpdGVJbnQ4Iiwid3JpdGVJbnQxNkxFIiwid3JpdGVJbnQxNkJFIiwid3JpdGVJbnQzMkxFIiwid3JpdGVJbnQzMkJFIiwiY2hlY2tJRUVFNzU0Iiwid3JpdGVGbG9hdCIsImllZWU3NTQud3JpdGUiLCJ3cml0ZUZsb2F0TEUiLCJ3cml0ZUZsb2F0QkUiLCJ3cml0ZURvdWJsZSIsIndyaXRlRG91YmxlTEUiLCJ3cml0ZURvdWJsZUJFIiwidGFyZ2V0U3RhcnQiLCJzZXQiLCJJTlZBTElEX0JBU0U2NF9SRSIsImJhc2U2NGNsZWFuIiwic3RyaW5ndHJpbSIsInJlcGxhY2UiLCJ0cmltIiwidW5pdHMiLCJsZWFkU3Vycm9nYXRlIiwiYnl0ZUFycmF5IiwiaGkiLCJsbyIsImJhc2U2NC50b0J5dGVBcnJheSIsImRzdCIsImlzRmFzdEJ1ZmZlciIsImlzU2xvd0J1ZmZlciIsInNldFRpbWVvdXQiLCJjbGVhclRpbWVvdXQiLCJwZXJmb3JtYW5jZSIsInBlcmZvcm1hbmNlTm93Iiwibm93IiwibW96Tm93IiwibXNOb3ciLCJvTm93Iiwid2Via2l0Tm93IiwiRGF0ZSIsImdldFRpbWUiLCJmb3JtYXRSZWdFeHAiLCJmb3JtYXQiLCJmIiwiaXNTdHJpbmciLCJvYmplY3RzIiwiSlNPTiIsInN0cmluZ2lmeSIsIl8iLCJpc051bGwiLCJpc09iamVjdCIsIm9wdHMiLCJjdHgiLCJzZWVuIiwic3R5bGl6ZSIsInN0eWxpemVOb0NvbG9yIiwiZGVwdGgiLCJjb2xvcnMiLCJpc0Jvb2xlYW4iLCJzaG93SGlkZGVuIiwiX2V4dGVuZCIsImlzVW5kZWZpbmVkIiwiY3VzdG9tSW5zcGVjdCIsInN0eWxpemVXaXRoQ29sb3IiLCJmb3JtYXRWYWx1ZSIsInN0eWxlcyIsInN0eWxlVHlwZSIsInN0eWxlIiwiYXJyYXlUb0hhc2giLCJoYXNoIiwiaWR4IiwicmVjdXJzZVRpbWVzIiwiaXNGdW5jdGlvbiIsInByaW1pdGl2ZSIsImZvcm1hdFByaW1pdGl2ZSIsInZpc2libGVLZXlzIiwiaXNFcnJvciIsImZvcm1hdEVycm9yIiwiaXNSZWdFeHAiLCJSZWdFeHAiLCJpc0RhdGUiLCJiYXNlIiwiYnJhY2VzIiwidG9VVENTdHJpbmciLCJmb3JtYXRBcnJheSIsImZvcm1hdFByb3BlcnR5IiwicmVkdWNlVG9TaW5nbGVTdHJpbmciLCJzaW1wbGUiLCJpc051bWJlciIsImRlc2MiLCJnZXQiLCJzcGxpdCIsImxpbmUiLCJudW1MaW5lc0VzdCIsInJlZHVjZSIsInByZXYiLCJjdXIiLCJhciIsInJlIiwib2JqZWN0VG9TdHJpbmciLCJvIiwib3JpZ2luIiwiYWRkIiwicHJvcCIsImRpYWxvZ0NvbnRhaW5lciIsImRvY3VtZW50IiwiYm9keSIsImFwcGVuZENoaWxkIiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTGlzdCIsIkRpYWxvZyIsIm1zZyIsInR0bCIsIl9lbExpc3RlbmVycyIsIl9pZCIsImlzU2hvd24iLCJlbCIsIm1zZ0xpc3QiLCJmb290ZXIiLCJhcHBlbmQiLCJhZGRFdmVudExpc3RlbmVyIiwiaGlkZSIsInByb3BlcnR5TmFtZSIsImNvbnRhaW5zIiwiaWRsZSIsInpJbmRleCIsImNsZWFyIiwicmVtb3ZlIiwiaW5uZXJIVE1MIiwiZXZlbnQiLCJjYiIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJTSE9XVVBfREVMQVkiLCJUUkFOU0lUSU9OX0RVUkFUSU9OIiwiR01fYWRkU3R5bGUiLCJoYXNEaWFsb2dTaG93biIsImRpYWxvZyIsIm9uRWwiLCJjbGljayIsInNldEZvb3RlciIsInNob3ciLCJFTVBUWV9MT0dTIiwiR01fZ2V0VmFsdWUiLCJkZWZhdWx0VmFsIiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsInN0b3JhZ2UiLCJHTV9zZXRWYWx1ZSIsInNldEl0ZW0iLCJHTUxvZ0VudHJ5IiwidGltZSIsImxldmVsIiwiR01Mb2dnZXIiLCJjb25maWciLCJfR01fa2V5IiwiX3N0YXRlX2tleSIsIl9NQVhfTE9HX0VOVFJJRVMiLCJfY2FjaGUiLCJjb250ZW50IiwibWVudUJ0biIsImdldEVsZW1lbnRCeUlkIiwibWVudUFuY2hvciIsImhyZWYiLCJjbG9zZVBhbmVsIiwic2hvd1BhbmVsIiwiX2xvYWQiLCJsb2dzRGlzcGxheSIsImxvZ0ZpbHRlckxhYmVsIiwiaHRtbEZvciIsImxvZ0ZpbHRlciIsImlkIiwiJCIsIm9nYW1lRHJvcERvd24iLCJsb2FkTG9ncyIsInJlc2V0QnRuIiwiX3NhdmUiLCJjb3B5QnRuIiwiY29weXpvbmUiLCJmaWx0ZXIiLCJlbnRyeSIsImxldmVsTWFwIiwic2VsZWN0IiwiZXhlY0NvbW1hbmQiLCJjaGlsZE5vZGVzIiwic2Nyb2xsVG9wIiwic2Nyb2xsSGVpZ2h0IiwicHJldlVudGlsIiwibG9ncyIsInRvSFRNTCIsInNwbGljZSIsInByb21wdEVycm9yIiwicmF3RW50cnkiLCJtYXRjaGVkRW50cnkiLCJfZ2MiLCJkZWJ1ZyIsIl9sb2ciLCJpbmZvIiwiZ2V0TG9nZ2VyIiwiYWxlcnQiLCJtZXNzYWdlIiwiTE9HIiwiY2hlY2tEZXBlbmRlbmNpZXMiLCJzY29wZSIsImR1ZSIsImxhY2tzIiwiZGVwIiwic2FmZUZuIiwiYmluZCIsIlNpbXBsZUNvdW50ZG93biIsInNpbXBsZUNvdW50ZG93biIsImNoYW5nZVRpbWVMZWZ0IiwidGltZXIiLCJ0aW1lTGVmdCIsImNvdW50ZG93biIsInN0YXJ0VGltZSIsInN0YXJ0TGVmdG92ZXJUaW1lIiwiY291bnRkb3duT2JqZWN0IiwiaGFuZGxlQXVjdGlvbiIsImNyZWF0ZVRpbWVyIiwib2xkTWlucyIsImZpcnN0Iiwib3ZlcmZsb3dBdWN0aW9uVGltZXIiLCJuZXdNaW5zIiwibWlucyIsInNlY3MiLCJhdWN0aW9uVGltZXIiLCJhdWN0aW9uRW5kVGltZSIsImN1cnJlbnRUaW1lIiwidW5pIiwibG9jYXRpb24iLCJuZXh0IiwiYmVmb3JlIiwiY3NzIiwidGV4dCIsImxvY2EiLCJhdWN0aW9uRmluaXNoZWQiLCJyb3VuZCIsImNlaWwiLCJ0b0xvY2FsZVN0cmluZyIsIm1hdGNoZWQiLCJteVNvY2siLCJpbyIsImNvbm5lY3QiLCJub2RlUGFyYW1zIiwib25Db25uZWN0IiwiZXhlYyIsIiQxIiwiYWpheFN1Y2Nlc3MiLCJoYW5kbGVOb25BdWN0aW9uIiwiY2xvY2siLCJwYXJlbnQiLCJhZGRDbGFzcyIsImhhbmRsZSIsInBhdGhuYW1lIiwic2VhcmNoIiwidW5zYWZlV2luZG93Il0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7O0FDQU8sSUFBTUEsa0JBQWtCLEdBQXhCO0FBQ1AsSUFBYUMsa0JBQWtCLEtBQS9CO0FBQ0EsSUFBYUMsbUJBQW1CLEdBQWhDO0FBQ0EsSUFBYUMsV0FBVztBQUN0QkMsV0FBUyxDQUNQLElBRE8sRUFFUCxHQUZPLEVBR1AsWUFITyxFQUlQLGlCQUpPLEVBS1AsTUFMTyxDQURhO0FBUXRCQyxlQUFhLENBQ1gsR0FEVyxFQUVYLGlCQUZXO0FBUlMsQ0FBeEI7O0FDREEsSUFBSUMsU0FBU0MsT0FBT0MsU0FBUCxDQUFpQkMsY0FBOUI7QUFDQSxJQUFJQyxRQUFRSCxPQUFPQyxTQUFQLENBQWlCRyxRQUE3QjtBQUNBLElBQUlDLGlCQUFpQkwsT0FBT0ssY0FBNUI7QUFDQSxJQUFJQyxPQUFPTixPQUFPTyx3QkFBbEI7O0FBRUEsSUFBSUMsVUFBVSxTQUFTQSxPQUFULENBQWlCQyxHQUFqQixFQUFzQjtBQUNuQyxNQUFJLE9BQU9DLE1BQU1GLE9BQWIsS0FBeUIsVUFBN0IsRUFB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