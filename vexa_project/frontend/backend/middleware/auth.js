'use strict'
const jwt = require('jsonwebtoken')
const config = require('../config/appConfig')

function bearer(req) {
  const [scheme, token] = (req.headers.authorization || '').split(' ')
  return scheme === 'Bearer' && token ? token : null
}

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
      req.auth = verify(token)
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
    req.auth = verify(token)
    next()
  } catch (e) {
    res.status(401).json({ message: 'Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.' })
  }
}

module.exports = { sign, optionalAuth, requireAuth }
