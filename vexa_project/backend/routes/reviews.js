'use strict'
const router = require('express').Router()
const Review = require('../models/Review')
const Order = require('../models/Order')
const User = require('../models/User')
const requireDb = require('../middleware/requireDb')
const { requireAuth } = require('../middleware/auth')
const { form: formLimiter } = require('../middleware/limiters')
const { isConnected } = require('../config/db')
const { validate, fail } = require('../utils/validate')

const rules = {
  text: { required: true, min: 10, max: 600, multiline: true },
}

// "Ahmet Yılmaz" -> "Ahmet Y."  (customers' full names are never shown publicly)
function displayName(full) {
  const parts = String(full || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'Müşteri'
  const first = parts[0].slice(0, 20)
  return parts.length > 1 ? `${first} ${Array.from(parts[parts.length - 1])[0]}.` : first
}

// Satisfaction % = total stars given / maximum possible stars, over APPROVED reviews only.
async function reviewStats() {
  const [row] = await Review.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: null, count: { $sum: 1 }, sum: { $sum: '$rating' }, r1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }, r2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } }, r3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } }, r4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } }, r5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } } } },
  ])
  if (!row || !row.count) return { count: 0, average: 0, satisfaction: null, distribution: [0, 0, 0, 0, 0] }
  return {
    count: row.count,
    average: Math.round((row.sum / row.count) * 10) / 10,
    satisfaction: Math.round((row.sum / (row.count * 5)) * 100),
    distribution: [row.r1, row.r2, row.r3, row.r4, row.r5],
  }
}

// Public: approved reviews + live statistics (?product=<slug> limits the list to one product)
router.get('/', async (req, res, next) => {
  try {
    if (!isConnected()) return res.json({ reviews: [], stats: { count: 0, average: 0, satisfaction: null, distribution: [0, 0, 0, 0, 0] } })
    const filter = { status: 'approved' }
    const slug = String(req.query.product || '').slice(0, 60)
    if (/^[a-z0-9-]{1,60}$/.test(slug)) filter.productSlug = slug
    const [reviews, stats] = await Promise.all([
      Review.find(filter).sort({ createdAt: -1 }).limit(30).select('name rating text product productSlug verified createdAt -_id').lean(),
      reviewStats(),
    ])
    res.set('Cache-Control', 'public, max-age=20')
    res.json({ reviews, stats })
  } catch (err) {
    next(err)
  }
})

// Average stars and review count per product (shown on cards without opening the product)
router.get('/summary', async (req, res, next) => {
  try {
    if (!isConnected()) return res.json({ bySlug: {}, byName: {} })
    const rows = await Review.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: { slug: '$productSlug', name: '$product' }, count: { $sum: 1 }, sum: { $sum: '$rating' } } },
    ])
    const bySlug = {}
    const byName = {}
    for (const r of rows) {
      const v = { count: r.count, average: Math.round((r.sum / r.count) * 10) / 10 }
      if (r._id.slug) bySlug[r._id.slug] = v
      else if (r._id.name) byName[r._id.name] = v // reviews written before products were linked by slug
    }
    res.set('Cache-Control', 'public, max-age=30')
    res.json({ bySlug, byName })
  } catch (err) {
    next(err)
  }
})

// What the logged-in customer may review: products from delivered orders, plus the reviews they already wrote
router.get('/mine', requireDb, requireAuth, async (req, res, next) => {
  try {
    const [orders, reviews] = await Promise.all([
      Order.find({ user: req.auth.sub, status: 'teslim-edildi' }).select('productSlug productName -_id').lean(),
      Review.find({ user: req.auth.sub, productSlug: { $ne: '' } }).select('productSlug rating text status -_id').lean(),
    ])
    const seen = new Set()
    const eligible = orders.filter((o) => o.productSlug && !seen.has(o.productSlug) && seen.add(o.productSlug)).map((o) => ({ slug: o.productSlug, name: o.productName }))
    res.json({ eligible, reviews })
  } catch (err) {
    next(err)
  }
})

// Only a customer whose order for THIS product was delivered can review it (one review per product; posting again edits it).
router.post('/', requireDb, formLimiter, requireAuth, async (req, res, next) => {
  try {
    const { value, errors, ok } = validate({ text: rules.text }, req.body)
    const rating = Number(req.body && req.body.rating)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.rating = 'Lütfen 1 ile 5 arasında bir puan verin.'
    const slug = String((req.body && req.body.productSlug) || '').slice(0, 60)
    if (!/^[a-z0-9-]{2,60}$/.test(slug)) errors.productSlug = 'Ürün seçilmedi.'
    if (!ok || errors.rating || errors.productSlug) return fail(res, errors)

    const user = await User.findById(req.auth.sub)
    if (!user) return res.status(401).json({ message: 'Oturum geçersiz.' })
    const bought = await Order.findOne({ user: user._id, productSlug: slug, status: 'teslim-edildi' }).select('productName')
    if (!bought) return res.status(403).json({ message: 'Bu ürünü yalnızca satın alıp teslim alan müşteriler değerlendirebilir.' })

    await Review.findOneAndUpdate(
      { user: user._id, productSlug: slug },
      { $set: { name: displayName(user.name), rating, text: value.text, product: bought.productName, verified: true, status: 'pending' } },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    )
    res.status(201).json({ message: 'Değerlendirmeniz alındı. İncelendikten sonra yayınlanacak.' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
module.exports.reviewStats = reviewStats
