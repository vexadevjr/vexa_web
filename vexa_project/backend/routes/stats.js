'use strict'
const router = require('express').Router()
const Order = require('../models/Order')
const User = require('../models/User')
const { isConnected } = require('../config/db')
const { reviewStats } = require('./reviews')

// Real, live numbers only: nothing here is typed in by hand.
router.get('/', async (req, res, next) => {
  try {
    if (!isConnected()) return res.json({ available: false })
    const [reviews, completedOrders, customers] = await Promise.all([
      reviewStats(),
      Order.countDocuments({ status: 'teslim-edildi' }),
      User.estimatedDocumentCount(),
    ])
    res.set('Cache-Control', 'public, max-age=30')
    res.json({ available: true, satisfaction: reviews.satisfaction, reviewCount: reviews.count, average: reviews.average, completedOrders, customers })
  } catch (err) {
    next(err)
  }
})

module.exports = router
