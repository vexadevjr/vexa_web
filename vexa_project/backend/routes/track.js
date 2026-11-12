'use strict'
const router = require('express').Router()
const Visit = require('../models/Visit')
const { isConnected } = require('../config/db')
const { track: limiter } = require('../middleware/limiters')
const { str } = require('../utils/validate')

const BOT = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|monitor|uptime|curl|wget|python-requests|render\//i
const recent = new Map() // ip|path -> timestamp (drops accidental double beacons)

const cleanIp = (ip) => String(ip || '').replace(/^::ffff:/, '').slice(0, 64)

router.post('/', limiter, async (req, res) => {
  try {
    if (!isConnected()) return res.status(204).end()
    const ua = str(req.headers['user-agent'], 200)
    let path = str(req.body && req.body.path, 200).split('?')[0].split('#')[0]
    if (!path.startsWith('/') || path.startsWith('/admin') || BOT.test(ua)) return res.status(204).end()

    const ip = cleanIp(req.ip)
    const key = `${ip}|${path}`
    const now = Date.now()
    if (now - (recent.get(key) || 0) < 20000) return res.status(204).end()
    recent.set(key, now)
    if (recent.size > 5000) for (const [k, t] of recent) if (now - t > 20000) recent.delete(k)

    await Visit.create({ ip, path, ua })
  } catch (err) {
    /* analytics must never break the site */
  }
  res.status(204).end()
})

module.exports = router
