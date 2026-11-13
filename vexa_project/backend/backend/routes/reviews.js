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
  product: { max: 80 },
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

// Public: approved reviews + live statistics
router.get('/', async (req, res, next) => {
  try {
    if (!isConnected()) return res.json({ reviews: [], stats: { count: 0, average: 0, satisfaction: null, distribution: [0, 0, 0, 0, 0] } })
    const [reviews, stats] = await Promise.all([
      Review.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(30).select('name rating text product verified createdAt -_id').lean(),
      reviewStats(),
    ])
    res.set('Cache-Control', 'public, max-age=20')
    res.json({ reviews, stats })
  } catch (err) {
    next(err)
  }
})

// The logged-in customer's own review (to edit it)
router.get('/mine', requireDb, requireAuth, async (req, res, next) => {
  try {
    const review = await Review.findOne({ user: req.auth.sub }).select('rating text product status createdAt -_id').lean()
    res.json({ review: review || null })
  } catch (err) {
    next(err)
  }
})

// Only logged-in customers can review; one review per account (posting again edits it and re-queues moderation).
router.post('/', requireDb, formLimiter, requireAuth, async (req, res, next) => {
  try {
    const { value, errors, ok } = validate(rules, req.body)
    const rating = Number(req.body && req.body.rating)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.rating = 'Lütfen 1 ile 5 arasında bir puan verin.'
    if (!ok || errors.rating) return fail(res, errors)

    const user = await User.findById(req.auth.sub)
    if (!user) return res.status(401).json({ message: 'Oturum geçersiz.' })
    const verified = Boolean(await Order.exists({ user: user._id, status: 'teslim-edildi' }))

    await Review.findOneAndUpdate(
      { user: user._id },
      { $set: { name: displayName(user.name), rating, text: value.text, product: value.product || '', verified, status: 'pending' } },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    )
    res.status(201).json({ message: 'Yorumunuz alındı. Moderasyon onayından sonra yayınlanacaktır.' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
module.exports.reviewStats = reviewStats
