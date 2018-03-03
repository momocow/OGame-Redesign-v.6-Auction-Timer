export function stripComment (src) {
  return src.replace(/\/\*[^/]*\*\//g, '//')
    .split('\n').filter(function (line) {
      let matches = line.match(/^(.*?)\/\/.*/)
      return matches ? matches[1].trim().length > 0 : true
    }).map(function (line) {
      return line.replace(/\s*\/\/.*/, '')
    }).join('\n')
}
