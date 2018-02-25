const webpack = require('webpack')
const getConfig = require('./webpack.config')

function logError (err, stats, onLogged) {
  if (err) {
    console.error(`${err.stack || err}`)
    if (err.details) {
      console.error(`${err.details}`)
    }
    return
  }

  console.log(stats.toString({ colors: true }))

  if (typeof onLogged === 'function') onLogged()
}

function compile (opts, onComplied) {
  if (typeof onComplied !== 'function') {
    onComplied = function () {}
  }

  if (arguments.length === 1 && typeof opts === 'function') {
    onComplied = opts
    opts = {}
  }

  webpack(getConfig(opts), function (...args) {
    logError(...args)
    onComplied()
  })
}

function watch (opts, watchConfig, onComplied) {
  if (typeof onComplied !== 'function') {
    onComplied = function () {}
  }

  if (arguments.length === 1 && typeof opts === 'function') {
    onComplied = opts
    opts = {}
  }

  if (arguments.length === 2 && typeof watchConfig === 'function') {
    onComplied = watchConfig
    watchConfig = {}
  }

  const WP_CONFIG = getConfig(opts)
  watchConfig = Object.assign({ aggregateTimeout: 3000 }, watchConfig)
  webpack(WP_CONFIG).watch(watchConfig, function (...args) {
    logError(...args)
    onComplied()
  })
}

module.exports = {
  watch, compile
}
