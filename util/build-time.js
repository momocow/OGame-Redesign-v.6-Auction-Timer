import { readFile, readFileSync } from 'fs'

export const SourceMap = {
  /**
   * @param {string|object} data Mapping Object in string or object form
   * @param {object} options {
   *   keepSrc: boolean
   * }
   * @return base64 inline sourcemap
   */
  from: function (data, options) {
    let mapObj = typeof data === 'string' ? JSON.parse(data, function (k, v) {
      if (!options.keepSrc && k === 'sourcesContent') return undefined
      return v
    }) : typeof data === 'object' ? (function (_m) {
      delete _m.sourcesContent
      return _m
    })(data) : undefined

    return SourceMap.fromFile.PREFIX + Buffer.from(JSON.stringify(mapObj)).toString('base64')
  },
  /**
   * @param {string|object} srcmapFile path to the .js.map file
   * @param {object} [options] {
   *   keepSrc: boolean
   * }
   * @param {(err: Error, data: string)=>void} [cb] if omitted, `#fromFileSync()` will be called and returned implicitly
   * @return {string|void} return the base64 inline sourcemap if `cb` is omitted
   */
  fromFile: function (srcmapFile, options, cb) {
    switch (arguments.length) {
      case 1:
        return SourceMap.fromFileSync(srcmapFile)
      case 2:
        if (typeof options === 'function') {
          cb = options
          options = {}
        } else if (typeof options === 'object') {
          return SourceMap.fromFileSync(srcmapFile, options)
        }
        break
      default:
        return
      case 3:
    }

    readFile(srcmapFile, { encoding: 'utf8' }, function (err, data) {
      return err ? cb(err) : cb(null, SourceMap.from(data, options))
    })
  },
  /**
   * @param {string|object} srcmapFile path to the .js.map file
   * @param {object} options {
   *   keepSrc: boolean
   * }
   * @return base64 inline sourcemap
   */
  fromFileSync: function (srcmapFile, options) {
    options = typeof options === 'object' ? options : {}
    const data = readFileSync(srcmapFile, { encoding: 'utf8' })
    return SourceMap.from(data, options)
  }
}

SourceMap.fromFile.PREFIX = '//# sourceMappingURL=data:application/json;base64,'
