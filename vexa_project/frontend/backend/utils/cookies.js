'use strict'

function parse(header) {
  const out = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const i = part.indexOf('=')
    if (i < 1) continue
    const k = part.slice(0, i).trim()
    try {
      out[k] = decodeURIComponent(part.slice(i + 1).trim())
    } catch (e) {
      /* ignore malformed cookie */
    }
  }
  return out
}

function serialize(name, value, { maxAge, path = '/', sameSite = 'Strict', secure = false } = {}) {
  let c = `${name}=${encodeURIComponent(value)}; Path=${path}; HttpOnly; SameSite=${sameSite}`
  if (secure) c += '; Secure'
  if (maxAge != null) c += `; Max-Age=${Math.floor(maxAge)}`
  return c
}

module.exports = { parse, serialize }
