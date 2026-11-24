'use strict'
const router = require('express').Router()
const Order = require('../models/Order')
const requireDb = require('../middleware/requireDb')
const { requireAuth } = require('../middleware/auth')
const User = require('../models/User')
const { form: formLimiter, upload: uploadLimiter } = require('../middleware/limiters')
const Media = require('../models/Media')
const { sniff } = require('../utils/imageSniff')
const { parseOrderFields, publicFields } = require('../utils/orderFields')
const { findProductBySlug } = require('../services/products')
const { validate, fail, str } = require('../utils/validate')
const { makeNo } = require('../utils/ids')

const rules = {
  productSlug: { required: true, max: 60 },
  note: { max: 1000, multiline: true },
}

// Create an order. Login is required: name and e-mail come from the account. The price always comes from the
// server-side catalog, never from the request body.
router.post('/', requireDb, formLimiter, requireAuth, async (req, res, next) => {
  try {
    const account = await User.findById(req.auth.sub)
    if (!account) return res.status(401).json({ message: 'Oturum geçersiz. Lütfen tekrar giriş yapın.' })
    const { value, errors, ok } = validate(rules, req.body)
    if (req.body && req.body.legalAccepted !== true) errors.legal = 'Devam etmek için Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu’nu onaylamanız gerekir.'
    if (!ok || errors.legal) return fail(res, errors)

    const product = await findProductBySlug(value.productSlug)
    if (!product) return res.status(404).json({ message: 'Seçilen ürün bulunamadı.' })
    if (product.price == null) {
      return res.status(400).json({ message: 'Bu hizmet için lütfen teklif formunu kullanın.' })
    }

    // subscription length: the price is monthly, the total is monthly price x months (calculated here, never taken from the request)
    const terms = Array.isArray(product.terms) ? product.terms : [1, 3, 6, 12]
    const months = terms.length ? Number(req.body.termMonths) : 1
    if (terms.length && !terms.includes(months)) return res.status(400).json({ message: 'Geçersiz abonelik süresi.' })

    const parsed = parseOrderFields(product.orderFields, req.body.fields)
    if (Object.keys(parsed.errors).length) return fail(res, parsed.errors)

    const order = await Order.create({
      orderNo: makeNo('VX'),
      user: account._id,
      productSlug: product.slug,
      productName: product.name,
      price: Math.round(product.price * months * 100) / 100,
      termMonths: months,
      monthlyPrice: product.price,
      currency: product.currency || 'TRY',
      customer: { name: account.name, email: account.email, discord: (parsed.fields.find((f) => f.key === 'discordUsername') || {}).value || '' },
      note: value.note || '',
      delivery: product.delivery || (product.deliveryDays ? `${product.deliveryDays} iş günü` : ''),
      fields: parsed.fields,
      history: [{ status: 'yeni' }],
      legalAcceptedAt: new Date(),
      legalVersion: '2026-11-14',
    })

    res.status(201).json({
      order: {
        orderNo: order.orderNo,
        productName: order.productName,
        price: order.price,
        termMonths: order.termMonths,
        currency: order.currency,
        status: order.status,
      },
    })
  } catch (err) {
    next(err)
  }
})

// Orders of the logged-in customer (customer panel)
router.get('/mine', requireDb, requireAuth, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.auth.sub })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('orderNo productSlug productName price termMonths monthlyPrice currency status note delivery history fields secretsPurgedAt cancelReason cancelledBy createdAt updatedAt -_id')
      .lean()
    // sensitive values (bot tokens) never leave the server
    res.json({ orders: orders.map((o) => ({ ...o, fields: publicFields(o.fields) })) })
  } catch (err) {
    next(err)
  }
})

// Customer uploads the bot logo during ordering (JPG/PNG/WebP, resized in the browser; real type checked here).
router.post('/logo', requireDb, uploadLimiter, async (req, res, next) => {
  try {
    const raw = req.body && req.body.data
    if (typeof raw !== 'string' || raw.length < 100 || raw.length > 1500000 || !/^[A-Za-z0-9+/=]+$/.test(raw)) return res.status(400).json({ message: 'Geçersiz görsel.' })
    const buf = Buffer.from(raw, 'base64')
    if (buf.length > 1000000) return res.status(400).json({ message: 'Logo çok büyük (en fazla 1 MB).' })
    const mime = sniff(buf)
    if (!mime) return res.status(400).json({ message: 'Yalnızca JPG, PNG veya WebP yüklenebilir.' })
    if ((await Media.countDocuments({ kind: 'order-logo' })) > 3000) return res.status(400).json({ message: 'Şu an yükleme yapılamıyor. Lütfen destek talebi oluşturun.' })
    const doc = await Media.create({ data: buf, mime, size: buf.length, kind: 'order-logo' })
    res.status(201).json({ url: `/api/media/${doc._id}` })
  } catch (err) {
    next(err)
  }
})

const CANCELLABLE = ['yeni', 'onaylandi']

// The customer cancels their own order while work has not started yet.
router.post('/:orderNo/cancel', requireDb, formLimiter, requireAuth, async (req, res, next) => {
  try {
    const orderNo = str(req.params.orderNo, 40).toUpperCase()
    const order = await Order.findOne({ orderNo, user: req.auth.sub })
    if (!order) return res.status(404).json({ message: 'Sipariş bulunamadı.' })
    if (order.status === 'iptal') return res.status(400).json({ message: 'Bu sipariş zaten iptal edilmiş.' })
    if (!CANCELLABLE.includes(order.status)) {
      return res.status(400).json({ message: 'Çalışma başladığı veya sipariş teslim edildiği için iptal için lütfen destek talebi oluşturun.' })
    }
    order.status = 'iptal'
    order.cancelledBy = 'customer'
    order.cancelReason = str(req.body && req.body.reason, 300, true)
    order.history.push({ status: 'iptal' })
    // data minimisation: sensitive values are wiped as soon as the order is cancelled
    order.fields.forEach((f) => { if (f.secret) f.value = '' })
    order.secretsPurgedAt = new Date()
    await order.save()
    res.json({
      order: {
        orderNo: order.orderNo, productSlug: order.productSlug, productName: order.productName, price: order.price, termMonths: order.termMonths, monthlyPrice: order.monthlyPrice, currency: order.currency,
        status: order.status, note: order.note, delivery: order.delivery, history: order.history, cancelReason: order.cancelReason,
        cancelledBy: order.cancelledBy, createdAt: order.createdAt, updatedAt: order.updatedAt, fields: publicFields(order.fields), secretsPurgedAt: order.secretsPurgedAt,
      },
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
