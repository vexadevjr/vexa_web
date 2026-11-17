'use strict'
const router = require('express').Router()
const Order = require('../models/Order')
const requireDb = require('../middleware/requireDb')
const { optionalAuth, requireAuth } = require('../middleware/auth')
const { form: formLimiter } = require('../middleware/limiters')
const { findProductBySlug } = require('../services/products')
const { validate, fail, str } = require('../utils/validate')
const { makeNo } = require('../utils/ids')

const rules = {
  productSlug: { required: true, max: 60 },
  name: { required: true, min: 2, max: 80 },
  email: { type: 'email', required: true },
  discord: { max: 40 },
  note: { max: 1000, multiline: true },
}

// Create an order. Works for guests and logged-in users. The price always comes from the
// server-side catalog, never from the request body.
router.post('/', requireDb, formLimiter, optionalAuth, async (req, res, next) => {
  try {
    const { value, errors, ok } = validate(rules, req.body)
    if (req.body && req.body.legalAccepted !== true) errors.legal = 'Devam etmek için Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu’nu onaylamanız gerekir.'
    if (!ok || errors.legal) return fail(res, errors)

    const product = await findProductBySlug(value.productSlug)
    if (!product) return res.status(404).json({ message: 'Seçilen ürün bulunamadı.' })
    if (product.price == null) {
      return res.status(400).json({ message: 'Bu hizmet için lütfen teklif formunu kullanın.' })
    }

    const order = await Order.create({
      orderNo: makeNo('VX'),
      user: req.auth ? req.auth.sub : null,
      productSlug: product.slug,
      productName: product.name,
      price: product.price,
      currency: product.currency || 'TRY',
      customer: { name: value.name, email: value.email, discord: value.discord || '' },
      note: value.note || '',
      delivery: product.delivery || (product.deliveryDays ? `${product.deliveryDays} iş günü` : ''),
      history: [{ status: 'yeni' }],
      legalAcceptedAt: new Date(),
      legalVersion: '2026-11-14',
    })

    res.status(201).json({
      order: {
        orderNo: order.orderNo,
        productName: order.productName,
        price: order.price,
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
      .select('orderNo productSlug productName price currency status note delivery history cancelReason cancelledBy createdAt updatedAt -_id')
      .lean()
    res.json({ orders })
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
    await order.save()
    res.json({
      order: {
        orderNo: order.orderNo, productSlug: order.productSlug, productName: order.productName, price: order.price, currency: order.currency,
        status: order.status, note: order.note, delivery: order.delivery, history: order.history, cancelReason: order.cancelReason,
        cancelledBy: order.cancelledBy, createdAt: order.createdAt, updatedAt: order.updatedAt,
      },
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
