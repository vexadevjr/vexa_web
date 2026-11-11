'use strict'
const router = require('express').Router()
const Order = require('../models/Order')
const requireDb = require('../middleware/requireDb')
const { optionalAuth, requireAuth } = require('../middleware/auth')
const { form: formLimiter } = require('../middleware/limiters')
const { findProductBySlug } = require('../services/products')
const { validate, fail } = require('../utils/validate')
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
    if (!ok) return fail(res, errors)

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
      .select('orderNo productName price currency status createdAt -_id')
      .lean()
    res.json({ orders })
  } catch (err) {
    next(err)
  }
})

module.exports = router
