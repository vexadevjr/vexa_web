'use strict'
const rateLimit = require('express-rate-limit')
const { clientIp } = require('../utils/clientIp')

const make = (windowMs, limit, message, extra = {}) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => clientIp(req), // per real visitor, not per proxy
    validate: { ip: false, trustProxy: false, xForwardedForHeader: false },
    message: { message },
    ...extra,
  })

module.exports = {
  // every /api request
  api: make(15 * 60 * 1000, 300, 'Çok fazla istek gönderdiniz. Lütfen biraz sonra tekrar deneyin.'),
  // login / register: brute-force protection
  auth: make(15 * 60 * 1000, 20, 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.'),
  // orders + contact + reviews: spam protection
  form: make(60 * 60 * 1000, 15, 'Çok fazla form gönderdiniz. Lütfen daha sonra tekrar deneyin.'),
  // admin login: very strict, failed attempts only
  adminLogin: make(15 * 60 * 1000, 8, 'Çok fazla deneme. Lütfen 15 dakika sonra tekrar deneyin.', { skipSuccessfulRequests: true }),
  // admin API after login
  admin: make(60 * 1000, 240, 'Çok fazla istek.'),
  // visit tracking beacon
  track: make(60 * 1000, 60, 'Too many requests', { skipFailedRequests: false }),
}
