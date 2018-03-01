/************************/
/*  require gulp@4.0.0  */
/************************/

const gulp = require('gulp')
const babel = require('gulp-babel')
const file = require('gulp-file')
const insert = require('gulp-insert')
const rename = require('gulp-rename')
const srcmap = require('gulp-sourcemaps')
const path = require('path')
const rollup = require('rollup')
const resolve = require('rollup-plugin-node-resolve')
const cjs = require('rollup-plugin-commonjs')
const shell = require('shelljs')

const { SourceMap } = require('./util/build-time')
const { stripComment } = require('./util/string')
const { ensureExtname } = require('./util/fs')

const { main: ENTRY_FILE, version: PKG_VER } = require('./package.json')

const HEADER = require('./assets/header')(PKG_VER)
const META = require('./assets/meta')(PKG_VER)

const FILENAME = 'auction-timer'
const BUILDDIR = path.resolve('build')
const DISTDIR = path.resolve('dist')
const SRCDIR = path.resolve('src')

const ROLLUP_BUILDDIR = path.resolve(BUILDDIR, 'rollup')
const BABEL_BUILDDIR = path.resolve(BUILDDIR, 'babel')

const ROLLUP_OUTFILE = path.resolve(ROLLUP_BUILDDIR, ensureExtname(FILENAME, '.js'))

function gulpRollup () {
  return rollup.rollup({
    input: path.resolve(BUILDDIR, ENTRY_FILE),
    plugins: [
      resolve(),
      cjs()
    ]
  }).then(bundle => {
    return bundle.write({
      file: ROLLUP_OUTFILE,
      format: 'cjs',
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
  return gulp.src([ path.join(SRCDIR, '**'), 'util/**' ], { base: '.' })
    .pipe(gulp.dest(BUILDDIR))
}

function distDev () {
  return gulp.src(path.join(BABEL_BUILDDIR, '**', '*.js'), { allowEmpty: true })
    .pipe(insert.transform(function (content, file) {
      const inlineSrcmap = SourceMap.fromFile(file.path + '.map')
      return HEADER + stripComment(content) + inlineSrcmap
    }))
    .pipe(rename({
      suffix: '-dev',
      extname: '.user.js'
    }))
    .pipe(gulp.dest(DISTDIR))
}

function distProd () {
  return gulp.src(path.join(BABEL_BUILDDIR, '**', '*.js'), { allowEmpty: true })
    .pipe(insert.transform(function (content, file) {
      return HEADER + stripComment(content)
    }))
    .pipe(rename({
      extname: '.user.js'
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
gulp.task('dist', gulp.series('build', gulp.parallel(distDev, distProd)))
gulp.task('dist:prod', gulp.series('build', distProd))
gulp.task('dist:dev', gulp.series('build', distDev))
gulp.task('build:clean', gulp.series('build', 'clean'))
gulp.task('default', gulp.series('dist'))
