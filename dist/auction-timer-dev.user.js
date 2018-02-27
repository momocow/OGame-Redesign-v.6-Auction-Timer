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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NOT_SUPPORTED_ENV = '[Auction Timer] The script will not work on your browser since it is out-of-date.\n\nYou can either disable the script or update your browser to avoid the alert.';

var NotSupportedError = function (_Error) {
  _inherits(NotSupportedError, _Error);

  function NotSupportedError() {
    _classCallCheck(this, NotSupportedError);

    var _this = _possibleConstructorReturn(this, (NotSupportedError.__proto__ || Object.getPrototypeOf(NotSupportedError)).call(this, '' + NOT_SUPPORTED_ENV));

    _this.name = 'NotSupportedError';
    return _this;
  }

  return NotSupportedError;
}(Error);

console.log(new NotSupportedError());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF1Y3Rpb24tdGltZXIuanMiLCIuLi9zcmMvc3RyaW5ncy5qcyIsIi4uL3NyYy9lcnJvcnMuanMiLCIuLi9zcmMvaW5kZXguanMiXSwibmFtZXMiOlsiTk9UX1NVUFBPUlRFRF9FTlYiLCJOb3RTdXBwb3J0ZWRFcnJvciIsIm5hbWUiLCJFcnJvciIsImNvbnNvbGUiLCJsb2ciXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OztBQ0FPLElBQU1BLHVMQUFOOztJQ1NNQyxpQjs7O0FBQ1gsK0JBQWU7QUFBQTs7QUFBQSwySUFDSkQsaUJBREk7O0FBRWIsVUFBS0UsSUFBTCxHQUFZLG1CQUFaO0FBRmE7QUFHZDs7O0VBSm9DQyxLOztBQ1B2Q0MsUUFBUUMsR0FBUixDQUFZLElBQUlKLGlCQUFKLEVBQVoiLCJmaWxlIjoiLi4vLi4vLi4vLi4vLi4vYXVjdGlvbi10aW1lci5qcyJ9