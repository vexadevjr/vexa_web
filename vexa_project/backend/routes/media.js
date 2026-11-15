'use strict'
const router = require('express').Router()
const Media = require('../models/Media')
const { isConnected } = require('../config/db')

// Public image delivery: /api/media/<id>. Ids are unguessable ObjectIds; files are immutable, so cache hard.
router.get('/:id', async (req, res, next) => {
  try {
    if (!isConnected() || !/^[a-f0-9]{24}$/i.test(req.params.id)) return res.status(404).end()
    const doc = await Media.findById(req.params.id).select('data mime')
    if (!doc) return res.status(404).end()
    res.set({
      'Content-Type': doc.mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'Cross-Origin-Resource-Policy': 'same-site',
    })
    res.send(doc.data)
  } catch (err) {
    next(err)
  }
})

module.exports = router
