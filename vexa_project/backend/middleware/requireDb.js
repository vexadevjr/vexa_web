'use strict'
const { isConnected } = require('../config/db')

module.exports = function requireDb(req, res, next) {
  if (!isConnected()) {
    return res.status(503).json({ message: 'Bu özellik şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.' })
  }
  next()
}
