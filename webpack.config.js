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

  return {
    entry: path.resolve(env.entry || args.entry),
    output: {
      filename: (env.outfile || args.outfile || '') + (env.dev || args.dev ? '-dev' : '') + '.user.js',
      path: path.resolve(__dirname, 'dist')
    },
    mode: 'development',
    module: {
      rules: [{
        test: /\.css$/,
        use: [ 'to-string-loader', 'css-loader' ]
      }, {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            comments: false,
            presets: [
              [
                '@babel/env',
                {
                  useBuiltIns: 'entry'
                }
              ]
            ]
          }
        }
      }]
    },
    plugins: [
      new webpack.BannerPlugin({ banner: env.banner || args.banner || '', raw: true, entryOnly: true })
    ],
    devtool: env.dev || args.dev ? 'source-map' : false
  }
}
