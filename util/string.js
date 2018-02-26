export function stripComment (src) {
  return src.replace(/\/\*[^/]*\*\//g, '//')
    .split('\n').filter(function (line) {
      let matches = line.match(/^(.*?)\/\/.*/)
      return matches ? matches[1].trim().length > 0 : true
    }).map(function (line) {
      return line.replace(/\s*\/\/.*/, '')
    }).join('\n')
}

export function append (src, suffix) {
  return src + suffix
}

export function prepend (src, prefix) {
  return prefix + src
}
