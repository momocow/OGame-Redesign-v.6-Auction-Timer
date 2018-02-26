const path = require('path')
const webpack = require('webpack')

/**
 * {
 *   outfile
 *   entry
 *   banner
 *   dev
 * }
 */
module.exports = function (env, args) {
  if (typeof env !== 'object') env = {}
  if (typeof args !== 'object') args = {}

  const DEV = env.dev || args.dev
  const ENTRY = path.resolve(env.entry || args.entry)
  const OUTFILE = env.outfile || args.outfile || ''
  const OUTSUFFIX = DEV ? '-dev' : ''
  const BANNER = env.banner || args.banner || ''

  return {
    entry: ENTRY,
    output: {
      filename: OUTFILE + OUTSUFFIX + '.user.js',
      path: path.resolve(__dirname, 'dist')
    },
    mode: 'development',
    module: {
      rules: [{
        test: new RegExp('^' + ENTRY + '$'),
        use: [{
          loader: 'webpack-rollup-loader',
          query: {
            format: 'cjs'
          }
        }]
      }, {
        test: /\.css$/,
        use: [ 'to-string-loader', 'css-loader' ]
      }
      // , {
      //   test: /\.js$/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: 'babel-loader',
      //     options: {
      //       cacheDirectory: true,
      //       comments: false,
      //       presets: [
      //         [
      //           '@babel/env',
      //           {
      //             useBuiltIns: 'entry'
      //           }
      //         ]
      //       ]
      //     }
      //   }
      // }
      ]
    },
    plugins: [
      new webpack.BannerPlugin({ banner: BANNER, raw: true, entryOnly: true })
    ],
    devtool: DEV ? 'source-map' : false
  }
}
