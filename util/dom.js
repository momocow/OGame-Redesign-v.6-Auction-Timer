export function setCSS (el, cssProp, cssVal) {
  let cssDesc = {}
  if (!(el instanceof window.HTMLElement)) {
    throw new TypeError('Expect the 1st param to be a HTML element.')
  }
  if (typeof cssProp === 'string') {
    if (typeof cssVal !== 'string') {
      cssDesc = toCSSDescriptor(cssProp)
    } else {
      cssDesc[cssProp] = cssVal
    }
  } else if (cssProp === 'object') {
    cssDesc = cssProp
  } else {
    throw new TypeError('Expect the 2nd param to be a string or a css descriptor object.')
  }

  return Object.assign(el.style, cssDesc)
}

export function toCSSDescriptor (cssStr) {
  const ret = {}

  if (typeof cssStr === 'string') {
    cssStr.split(';').filter(function (entry) {
      return entry.includes(':')
    }).map(function (entry) {
      return entry.split(':').map(function (token, index) {
        return index === 0 ? token.trim().replace(/([A-Z])/g, '-$1').toLowerCase() : token.trim()
      })
    }).forEach(function (propArray) {
      ret[propArray[0]] = propArray[1]
    })
  }

  return ret
}
