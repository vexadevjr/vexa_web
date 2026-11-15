'use strict'
const crypto = require('crypto')

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32Decode(input) {
  let bits = ''
  for (const ch of input.replace(/=+$/, '')) {
    const v = ALPHABET.indexOf(ch)
    if (v < 0) throw new Error('invalid base32')
    bits += v.toString(2).padStart(5, '0')
  }
  const bytes = []
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2))
  return Buffer.from(bytes)
}

function hotp(key, counter) {
  const buf = Buffer.alloc(8)
  buf.writeBigUInt64BE(BigInt(counter))
  const h = crypto.createHmac('sha1', key).update(buf).digest()
  const o = h[h.length - 1] & 15
  const code = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3]
  return String(code % 1000000).padStart(6, '0')
}

// Returns the matched time step (number) or -1.
function verifyTotp(secret, token, window = 1) {
  if (!/^\d{6}$/.test(token || '')) return -1
  const key = base32Decode(secret)
  const step = Math.floor(Date.now() / 30000)
  for (let i = -window; i <= window; i++) {
    const expected = hotp(key, step + i)
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token))) return step + i
  }
  return -1
}

module.exports = { verifyTotp }
