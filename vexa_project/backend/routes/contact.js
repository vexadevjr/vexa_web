'use strict'
const router = require('express').Router()
const Message = require('../models/Message')
const requireDb = require('../middleware/requireDb')
const { optionalAuth, requireAuth } = require('../middleware/auth')
const { form: formLimiter, auth: authLimiter } = require('../middleware/limiters')
const { validate, fail, str } = require('../utils/validate')
const { makeNo } = require('../utils/ids')

const SUBJECTS = ['Sipariş Hakkında', 'Teknik Destek', 'Fiyat Teklifi', 'Diğer']

const rules = {
  name: { required: true, min: 2, max: 80 },
  email: { type: 'email', required: true },
  subject: { required: true, oneOf: SUBJECTS },
  message: { required: true, min: 10, max: 3000, multiline: true },
  orderNo: { max: 30 },
}

// what a customer is allowed to see of a ticket
const view = (t) => ({
  ticketNo: t.ticketNo,
  subject: t.subject,
  message: t.message,
  status: t.status,
  createdAt: t.createdAt,
  updatedAt: t.updatedAt,
  unread: Boolean(t.unreadByUser),
  replies: (t.replies || []).map((r) => ({ from: r.from, text: r.text, at: r.at })),
})

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

// Tickets of the logged-in customer (customer panel)
router.get('/mine', requireDb, requireAuth, async (req, res, next) => {
  try {
    const tickets = await Message.find({ user: req.auth.sub }).sort({ updatedAt: -1 }).limit(50).lean()
    res.json({ tickets: tickets.map(view) })
  } catch (err) {
    next(err)
  }
})

// Guests: look a ticket up with ticket number + the e-mail used on the form
router.post('/lookup', requireDb, authLimiter, async (req, res, next) => {
  try {
    const ticketNo = str(req.body && req.body.ticketNo, 40).toUpperCase()
    const email = str(req.body && req.body.email, 254).toLowerCase()
    const ticket = ticketNo && email ? await Message.findOne({ ticketNo, email }) : null
    if (!ticket) return res.status(404).json({ message: 'Bu bilgilerle eşleşen bir talep bulunamadı.' })
    if (ticket.unreadByUser) {
      ticket.unreadByUser = false
      await ticket.save()
    }
    res.json({ ticket: { ...view(ticket), unread: false } })
  } catch (err) {
    next(err)
  }
})

// Customer follow-up on an existing ticket (owner by login, or by ticket number + e-mail)
router.post('/reply', requireDb, formLimiter, optionalAuth, async (req, res, next) => {
  try {
    const ticketNo = str(req.body && req.body.ticketNo, 40).toUpperCase()
    const email = str(req.body && req.body.email, 254).toLowerCase()
    const text = str(req.body && req.body.text, 3000, true)
    if (text.length < 2) return res.status(400).json({ message: 'Lütfen bir mesaj yazın.' })

    const ticket = await Message.findOne({ ticketNo })
    const ownerByLogin = ticket && req.auth && ticket.user && String(ticket.user) === req.auth.sub
    const ownerByMail = ticket && email && ticket.email === email
    if (!ticket || !(ownerByLogin || ownerByMail)) return res.status(404).json({ message: 'Talep bulunamadı.' })
    if (ticket.replies.length >= 100) return res.status(429).json({ message: 'Bu talep için mesaj sınırına ulaşıldı.' })

    ticket.replies.push({ from: 'user', text })
    ticket.status = 'acik'
    ticket.unreadByAdmin = true
    await ticket.save()
    res.status(201).json({ ticket: view(ticket) })
  } catch (err) {
    next(err)
  }
})

// Mark a ticket as read by its owner
router.post('/read', requireDb, requireAuth, async (req, res, next) => {
  try {
    const ticketNo = str(req.body && req.body.ticketNo, 40).toUpperCase()
    await Message.updateOne({ ticketNo, user: req.auth.sub }, { $set: { unreadByUser: false } })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

module.exports = router
