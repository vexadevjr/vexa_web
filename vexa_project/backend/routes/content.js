'use strict'
const router = require('express').Router()
const Setting = require('../models/Setting')
const { isConnected } = require('../config/db')
const { CONTENT_KEYS } = require('../utils/contentSchema')

// Public: editable site content overrides (everything missing falls back to siteConfig.js in the frontend).
router.get('/', async (req, res, next) => {
  try {
    const out = {}
    if (isConnected()) {
      const rows = await Setting.find({ key: { $in: CONTENT_KEYS.map((k) => `content:${k}`) } }).lean()
      for (const r of rows) out[r.key.slice(8)] = r.value
    }
    res.set('Cache-Control', 'public, max-age=30')
    res.json({ content: out })
  } catch (err) {
    next(err)
  }
})

module.exports = router
