'use strict'
const rateLimit = require('express-rate-limit')

const make = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
  })

module.exports = {
  // every /api request
  api: make(15 * 60 * 1000, 300, 'Çok fazla istek gönderdiniz. Lütfen biraz sonra tekrar deneyin.'),
  // login / register: brute-force protection
  auth: make(15 * 60 * 1000, 20, 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.'),
  // orders + contact: spam protection
  form: make(60 * 60 * 1000, 15, 'Çok fazla form gönderdiniz. Lütfen daha sonra tekrar deneyin.'),
}
