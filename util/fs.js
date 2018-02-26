import { format, parse } from 'path'

export function ensureExtname (fileIn, extIn) {
  return format({
    ...parse(fileIn),
    base: '',
    ext: extIn
  })
}