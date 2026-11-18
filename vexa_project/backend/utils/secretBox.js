'use strict'
const crypto = require('crypto')
const config = require('../config/appConfig')

// AES-256-GCM for sensitive order data (e.g. Discord bot tokens). Format: v1.<iv>.<tag>.<ciphertext> (base64url)
const key = crypto.createHash('sha256').update(`${config.dataKey || config.jwtSecret}:order-secrets`).digest()

function encrypt(plain) {
  const iv = crypto.randomBytes(12)
  const c = crypto.createCipheriv('aes-256-gcm', key, iv)
  const data = Buffer.concat([c.update(String(plain), 'utf8'), c.final()])
  return ['v1', iv.toString('base64url'), c.getAuthTag().toString('base64url'), data.toString('base64url')].join('.')
}

function decrypt(box) {
  const [v, iv, tag, data] = String(box || '').split('.')
  if (v !== 'v1' || !iv || !tag || !data) throw new Error('bad box')
  const d = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'))
  d.setAuthTag(Buffer.from(tag, 'base64url'))
  return Buffer.concat([d.update(Buffer.from(data, 'base64url')), d.final()]).toString('utf8')
}

module.exports = { encrypt, decrypt }
