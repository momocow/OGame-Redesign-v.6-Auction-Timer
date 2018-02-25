const meta = require('./meta')

module.exports = function (version) {
  return `${meta(version)}

/*****************************************************************************
 * Originaly developed by Vesselin
 * Currently developed by MomoCow after v3.0.0
 * Released under MIT
 *****************************************************************************/

/*****************************************************************************
 * Changelog
 * ### v3.0.0
 * - [Add] provide a more stateful timer
 * - [Changed] rewritten as a ES6 script with eslint \`standard\` coding style
 * - [Optmized] more stable dependency check
 *****************************************************************************/

/* jshint asi:true */`
}
