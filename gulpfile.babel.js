/************************/
/*  require gulp@4.0.0  */
/************************/

const gulp = require('gulp')
const babel = require('gulp-babel')
const file = require('gulp-file')
const insert = require('gulp-insert')
const srcmap = require('gulp-sourcemaps')
const path = require('path')
const rollup = require('rollup')
const shell = require('shelljs')

const { prepend, stripComment } = require('./util/string')
const { ensureExtname } = require('./util/fs')

const { main: ENTRY_FILE, version: PKG_VER } = require('./package.json')

const HEADER = require('./assets/header')(PKG_VER)
const META = require('./assets/meta')(PKG_VER)

const FILENAME = 'auction-timer'
const BUILDDIR = path.resolve('build')
const DISTDIR = 'dist'
const SRCDIR = 'src'

const ROLLUP_BUILDDIR = path.resolve(BUILDDIR, 'rollup')
const BABEL_BUILDDIR = path.resolve(BUILDDIR, 'babel')

const ROLLUP_OUTFILE = path.resolve(ROLLUP_BUILDDIR, ensureExtname(FILENAME, '.js'))

function gulpRollup () {
  return rollup.rollup({
    input: path.resolve(BUILDDIR, ENTRY_FILE)
  }).then(bundle => {
    return bundle.write({
      file: ROLLUP_OUTFILE,
      format: 'cjs',
      banner: HEADER,
      sourcemap: true
    })
  })
}

function gulpBabel () {
  return gulp.src(ROLLUP_OUTFILE)
    .pipe(srcmap.init({ loadMaps: true }))
    .pipe(babel())
    .pipe(srcmap.write(BABEL_BUILDDIR))
    .pipe(gulp.dest(BABEL_BUILDDIR))
}

function init () {
  return gulp.src(path.join(SRCDIR, '**'), { base: '.' })
    .pipe(gulp.dest(BUILDDIR))
}

function dist () {
  return gulp.src(path.join(BABEL_BUILDDIR, '**', '*'), { allowEmpty: true })
    .pipe(insert.transform(function (content, file) {
      return file.extname === '.js' ? stripComment(content) : content
    }))
    .pipe(insert.transform(function (content, file) {
      return file.extname === '.js' ? prepend(content, HEADER) : content
    }))
    .pipe(gulp.dest(DISTDIR))
}

function clean () {
  shell.rm('-R', BUILDDIR)
  return Promise.resolve()
}

function meta () {
  return file(ensureExtname(FILENAME, '.meta.js'), META, { src: true })
    .pipe(gulp.dest(DISTDIR))
}

gulp.task('init', init)
gulp.task('clean', clean)
gulp.task('meta', meta)
gulp.task('rollup', gulp.series('init', gulpRollup))
gulp.task('babel', gulp.series('rollup', gulpBabel))
gulp.task('build', gulp.series('babel'))
gulp.task('dist', gulp.series('build', dist))
gulp.task('build:clean', gulp.series('build', 'clean'))
gulp.task('default', gulp.series('dist'))
