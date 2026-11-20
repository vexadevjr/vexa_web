'use strict'
const jwt = require('jsonwebtoken')
const config = require('../config/appConfig')

function bearer(req) {
  const [scheme, token] = (req.headers.authorization || '').split(' ')
  return scheme === 'Bearer' && token ? token : null
}

// ids of accounts blocked by an admin; tokens of these users stop working immediately (single-instance memory set)
const blocked = new Set()
async function loadBlocked() {
  try {
    const User = require('../models/User')
    const rows = await User.find({ disabled: true }).select('_id').lean()
    blocked.clear()
    rows.forEach((r) => blocked.add(String(r._id)))
  } catch (e) {
    console.error('[auth] could not load blocked users:', e.message)
  }
}
require('mongoose').connection.on('connected', loadBlocked)

const verify = (token) => jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] })

function sign(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, config.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: config.jwtExpiresIn,
  })
}

function optionalAuth(req, res, next) {
  const token = bearer(req)
  if (token) {
    try {
      const a = verify(token)
      if (!blocked.has(a.sub)) req.auth = a
    } catch (e) {
      /* anonymous request */
    }
  }
  next()
}

function requireAuth(req, res, next) {
  const token = bearer(req)
  if (!token) return res.status(401).json({ message: 'Devam etmek için giriş yapmanız gerekiyor.' })
  try {
    const a = verify(token)
    if (blocked.has(a.sub)) return res.status(401).json({ message: 'Hesabınız askıya alınmıştır. Destek için bizimle iletişime geçin.' })
    req.auth = a
    next()
  } catch (e) {
    res.status(401).json({ message: 'Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.' })
  }
}

module.exports = { sign, optionalAuth, requireAuth, blocked }
