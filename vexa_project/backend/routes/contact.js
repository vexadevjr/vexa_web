'use strict'
const router = require('express').Router()
const Message = require('../models/Message')
const requireDb = require('../middleware/requireDb')
const { optionalAuth } = require('../middleware/auth')
const { form: formLimiter } = require('../middleware/limiters')
const { validate, fail } = require('../utils/validate')
const { makeNo } = require('../utils/ids')

const SUBJECTS = ['Sipariş Hakkında', 'Teknik Destek', 'Fiyat Teklifi', 'Diğer']

const rules = {
  name: { required: true, min: 2, max: 80 },
  email: { type: 'email', required: true },
  subject: { required: true, oneOf: SUBJECTS },
  message: { required: true, min: 10, max: 3000, multiline: true },
  orderNo: { max: 30 },
}

// Support ticket / contact form
router.post('/', requireDb, formLimiter, optionalAuth, async (req, res, next) => {
  try {
    const { value, errors, ok } = validate(rules, req.body)
    if (!ok) return fail(res, errors)

    const ticket = await Message.create({
      ticketNo: makeNo('TK'),
      user: req.auth ? req.auth.sub : null,
      ...value,
    })
    res.status(201).json({ ticketNo: ticket.ticketNo })
  } catch (err) {
    next(err)
  }
})

module.exports = router
