const gulp = require('gulp')
const file = require('gulp-file')

const webpack = require('./gulp-webpack')

const { main: SRC_PATH, version: PKG_VER } = require('./package.json')
const HEADER = require('./assets/header')(PKG_VER)
const META = require('./assets/meta')(PKG_VER)
const OUTDIR = 'dist'
const OUTFILE = 'auction-timer'

function webpackrc (dev) {
  return {
    entry: SRC_PATH,
    banner: HEADER,
    outfile: OUTFILE,
    dev
  }
}

gulp.task('build:meta', function () {
  return file(OUTFILE + '.meta.js', META, { src: true })
    .pipe(gulp.dest(OUTDIR))
})

gulp.task('build:prod', function (done) {
  webpack.compile(webpackrc(false), function (...args) {
    console.log(...args)
    done()
  })
})

gulp.task('build:dev', function (done) {
  webpack.compile(webpackrc(true), done)
})

gulp.task('build', [ 'build:meta', 'build:prod', 'build:dev' ])

gulp.task('default', [ 'build' ])
