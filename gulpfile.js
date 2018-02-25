const gulp = require('gulp')
const concat = require('gulp-concat')
const srcmap = require('gulp-sourcemaps')
const babel = require('gulp-babel')
const rename = require('gulp-rename')
const replace = require('gulp-replace')
const file = require('gulp-file')

const { main: SRC_PATH, version: PKG_VER } = require('./package.json')
const OUTDIR = 'dist'
const OUTFILE = 'auction-timer'
const BABELRC = {
  comments: false,
  ignore: 'header.js',
  presets: [
    [
      'env',
      {
        useBuiltIns: 'entry'
      }
    ]
  ]
}

gulp.task('build:meta', function () {
  return file(OUTFILE, '// @version        ' + PKG_VER, { src: true })
    .pipe(rename({
      extname: '.meta.js'
    }))
    .pipe(gulp.dest(OUTDIR))
})

gulp.task('build:prod', function () {
  return gulp.src([ 'header.js', SRC_PATH ])
    .pipe(babel(BABELRC))
    .pipe(concat(OUTFILE))
    .pipe(replace('{{VERSION}}', PKG_VER))
    .pipe(rename({
      extname: '.user.js'
    }))
    .pipe(gulp.dest(OUTDIR))
})

gulp.task('build:dev', function () {
  return gulp.src([ 'header.js', SRC_PATH ])
    .pipe(srcmap.init())
    .pipe(babel(BABELRC))
    .pipe(concat(OUTFILE))
    .pipe(replace('{{VERSION}}', PKG_VER))    
    .pipe(rename({
      suffix: '-dev',
      extname: '.user.js'
    }))
    .pipe(srcmap.write())
    .pipe(gulp.dest(OUTDIR))
})

gulp.task('build', [ 'build:meta', 'build:prod', 'build:dev' ])

gulp.task('default', [ 'build' ])
