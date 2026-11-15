'use strict'
const { str } = require('./validate')

const text = (v, max = 200, multiline = false) => str(v, max, multiline)

// only https:// (or http://localhost for dev) links; blocks javascript:, data:, etc.
function url(v, max = 300) {
  const s = str(v, max)
  if (!s) return ''
  return /^https:\/\/[^\s]+$/i.test(s) ? s : null
}

// internal route, e.g. /iletisim?konu=X
function internalPath(v, max = 200) {
  const s = str(v, max)
  return /^\/(?!\/)[^\s]*$/.test(s) ? s : null
}

const bool = (v) => v === true || v === 'true'

function num(v, { min = 0, max = 1e9, nullable = false, int = false } = {}) {
  if (v === null || v === '' || v === undefined) return nullable ? null : NaN
  const n = Number(v)
  if (!Number.isFinite(n) || n < min || n > max) return NaN
  return int ? Math.round(n) : Math.round(n * 100) / 100
}

function arr(v, maxItems, fn) {
  if (!Array.isArray(v)) return null
  const out = []
  for (const item of v.slice(0, maxItems)) {
    const r = fn(item)
    if (r === undefined) continue
    out.push(r)
  }
  return out
}

module.exports = { text, url, internalPath, bool, num, arr }
