export function extend () {
  const target = {}
  for (let i = 0; i < arguments.length; i++) {
    const source = arguments[i]

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key]
      }
    }
  }
  return target
}
