'use strict'
const router = require('express').Router()
const Product = require('../models/Product')
const Order = require('../models/Order')
const Message = require('../models/Message')
const Review = require('../models/Review')
const Visit = require('../models/Visit')
const User = require('../models/User')
const Setting = require('../models/Setting')
const config = require('../config/appConfig')
const requireDb = require('../middleware/requireDb')
const limiters = require('../middleware/limiters')
const adminAuth = require('../middleware/adminAuth')
const { seedCatalogIfNeeded } = require('../services/products')
const Media = require('../models/Media')
const { validators, CONTENT_KEYS, MEDIA_URL } = require('../utils/contentSchema')
const { text, bool, num, arr } = require('../utils/sanitize')
const { str } = require('../utils/validate')

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

// ───────── session ─────────
router.post('/login', limiters.adminLogin, async (req, res, next) => {
  try {
    if (!adminAuth.enabled) return res.status(404).json({ message: 'Not found' })
    const ip = require('../utils/clientIp').clientIp(req)
    const result = await adminAuth.checkCredentials(req.body || {}, ip)
    if (result === 'locked') return res.status(429).json({ message: 'Çok fazla hatalı deneme. 15 dakika sonra tekrar deneyin.' })
    if (!result) return res.status(401).json({ message: 'Giriş bilgileri hatalı.' }) // same message for every failure
    adminAuth.issue(res)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.get('/config', (req, res) => {
  // tells the login form whether a 2FA code field is needed; reveals nothing else
  res.json({ enabled: adminAuth.enabled, totp: adminAuth.requiresTotp })
})

router.post('/logout', (req, res) => {
  adminAuth.clear(res)
  res.json({ ok: true })
})

// everything below needs a valid admin session
router.use(adminAuth.requireAdmin, limiters.admin)

router.get('/me', (req, res) => res.json({ ok: true, email: config.admin.email }))

router.use(requireDb)

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const page = (req) => Math.max(1, Math.min(500, parseInt(req.query.page, 10) || 1))
const PER = 25

// ───────── overview ─────────
router.get('/overview', async (req, res, next) => {
  try {
    const [openTickets, newOrders, pendingReviews, users, products, recentOrders, recentTickets, legal, revenue] = await Promise.all([
      Message.countDocuments({ status: { $ne: 'kapali' }, unreadByAdmin: true }),
      Order.countDocuments({ status: 'yeni' }),
      Review.countDocuments({ status: 'pending' }),
      User.estimatedDocumentCount(),
      Product.estimatedDocumentCount(),
      Order.find().sort({ createdAt: -1 }).limit(5).select('orderNo productName price status createdAt customer.name -_id').lean(),
      Message.find().sort({ updatedAt: -1 }).limit(5).select('ticketNo subject name status unreadByAdmin updatedAt -_id').lean(),
      Setting.findOne({ key: 'content:legal' }).lean(),
      Order.aggregate([{ $match: { status: { $ne: 'iptal' } } }, { $group: { _id: null, total: { $sum: '$price' }, count: { $sum: 1 } } }]),
    ])
    const l = (legal && legal.value) || {}
    res.json({
      openTickets, newOrders, pendingReviews, users, products, recentOrders, recentTickets,
      revenue: revenue[0] ? { total: revenue[0].total, count: revenue[0].count } : { total: 0, count: 0 },
      legalMissing: !(l.unvan && l.adres && (l.vergiNo || l.mersis)),
    })
  } catch (err) {
    next(err)
  }
})

// ───────── visitor analytics ─────────
const TZ = config.timezone
const partsFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false })
function keyOf(date, unit) {
  const p = Object.fromEntries(partsFmt.formatToParts(date).map((x) => [x.type, x.value]))
  const h = p.hour === '24' ? '00' : p.hour
  if (unit === 'hour') return `${p.year}-${p.month}-${p.day} ${h}`
  if (unit === 'day') return `${p.year}-${p.month}-${p.day}`
  return `${p.year}-${p.month}`
}
const FORMAT = { hour: '%Y-%m-%d %H', day: '%Y-%m-%d', month: '%Y-%m' }

function buckets(range) {
  const now = Date.now()
  const out = []
  if (range === 'day') for (let i = 23; i >= 0; i--) out.push(new Date(now - i * 3600000))
  else if (range === 'week') for (let i = 6; i >= 0; i--) out.push(new Date(now - i * 86400000))
  else if (range === 'month') for (let i = 29; i >= 0; i--) out.push(new Date(now - i * 86400000))
  else {
    const [y, m] = keyOf(new Date(now), 'month').split('-').map(Number)
    for (let i = 11; i >= 0; i--) out.push(new Date(Date.UTC(y, m - 1 - i, 15)))
  }
  const unit = range === 'day' ? 'hour' : range === 'year' ? 'month' : 'day'
  return { unit, list: out.map((d) => ({ key: keyOf(d, unit), label: label(d, unit) })), since: sinceOf(range) }
}
function label(d, unit) {
  const k = keyOf(d, unit)
  if (unit === 'hour') return `${k.slice(11)}:00`
  if (unit === 'day') return `${k.slice(8)}.${k.slice(5, 7)}`
  return k
}
function sinceOf(range) {
  const now = Date.now()
  if (range === 'day') return new Date(now - 24 * 3600000)
  if (range === 'week') return new Date(now - 7 * 86400000)
  if (range === 'month') return new Date(now - 30 * 86400000)
  return new Date(now - 366 * 86400000)
}
const RANGES = ['day', 'week', 'month', 'year']
const rangeOf = (v) => (RANGES.includes(v) ? v : 'week')

async function totalsSince(since) {
  const [a] = await Visit.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: '$ip', hits: { $sum: 1 } } },
    { $group: { _id: null, unique: { $sum: 1 }, views: { $sum: '$hits' } } },
  ])
  return { views: a ? a.views : 0, unique: a ? a.unique : 0 }
}

async function totalsBetween(from, to) {
  const [a] = await Visit.aggregate([
    { $match: { createdAt: { $gte: from, $lt: to } } },
    { $group: { _id: '$ip', hits: { $sum: 1 } } },
    { $group: { _id: null, unique: { $sum: 1 }, views: { $sum: '$hits' } } },
  ])
  return { views: a ? a.views : 0, unique: a ? a.unique : 0 }
}

// device / browser family from the user-agent string
function classify(ua) {
  const device = /ipad|tablet|(android(?!.*mobile))/i.test(ua) ? 'Tablet' : /mobi|iphone|android/i.test(ua) ? 'Mobil' : 'Masaüstü'
  let browser = 'Diğer'
  if (/edg\//i.test(ua)) browser = 'Edge'
  else if (/opr\/|opera/i.test(ua)) browser = 'Opera'
  else if (/samsungbrowser/i.test(ua)) browser = 'Samsung'
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox'
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome'
  else if (/safari/i.test(ua)) browser = 'Safari'
  return { device, browser }
}

router.get('/analytics', async (req, res, next) => {
  try {
    const range = rangeOf(req.query.range)
    const { unit, list, since } = buckets(range)
    const fmt = FORMAT[unit]

    const span = Date.now() - since.getTime()
    const [series, totals, pages, previous, uaRows] = await Promise.all([
      Visit.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { k: { $dateToString: { format: fmt, date: '$createdAt', timezone: TZ } }, ip: '$ip' }, hits: { $sum: 1 } } },
        { $group: { _id: '$_id.k', views: { $sum: '$hits' }, unique: { $sum: 1 } } },
      ]),
      Promise.all(RANGES.map((r) => totalsSince(sinceOf(r)))),
      Visit.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$path', views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 8 },
      ]),
      totalsBetween(new Date(since.getTime() - span), since),
      Visit.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$ua', hits: { $sum: 1 } } },
        { $sort: { hits: -1 } },
        { $limit: 400 },
      ]),
    ])
    const devices = {}
    const browsers = {}
    for (const r of uaRows) {
      const c = classify(r._id || '')
      devices[c.device] = (devices[c.device] || 0) + r.hits
      browsers[c.browser] = (browsers[c.browser] || 0) + r.hits
    }
    const byKey = new Map(series.map((s) => [s._id, s]))
    res.json({
      range,
      series: list.map((b) => ({ label: b.label, views: (byKey.get(b.key) || {}).views || 0, unique: (byKey.get(b.key) || {}).unique || 0 })),
      totals: Object.fromEntries(RANGES.map((r, i) => [r, totals[i]])),
      topPages: pages.map((p) => ({ path: p._id, views: p.views })),
      previous,
      devices: Object.entries(devices).map(([name, views]) => ({ name, views })).sort((a, b) => b.views - a.views),
      browsers: Object.entries(browsers).map(([name, views]) => ({ name, views })).sort((a, b) => b.views - a.views).slice(0, 6),
    })
  } catch (err) {
    next(err)
  }
})

router.get('/visitors', async (req, res, next) => {
  try {
    const range = rangeOf(req.query.range)
    const since = sinceOf(range)
    const q = str(req.query.q, 45).replace(/[^0-9a-fA-F:.]/g, '')
    const match = { createdAt: { $gte: since } }
    if (q) match.ip = { $regex: `^${esc(q)}` }
    const p = page(req)

    const [out] = await Visit.aggregate([
      { $match: match },
      { $sort: { createdAt: 1 } },
      { $group: { _id: '$ip', hits: { $sum: 1 }, firstSeen: { $first: '$createdAt' }, lastSeen: { $last: '$createdAt' }, lastPath: { $last: '$path' }, ua: { $last: '$ua' }, pages: { $addToSet: '$path' } } },
      { $sort: { lastSeen: -1 } },
      {
        $facet: {
          rows: [{ $skip: (p - 1) * PER }, { $limit: PER }, { $project: { _id: 0, ip: '$_id', hits: 1, firstSeen: 1, lastSeen: 1, lastPath: 1, ua: 1, pageCount: { $size: '$pages' } } }],
          total: [{ $count: 'n' }],
        },
      },
    ]).allowDiskUse(true)
    res.json({ rows: out.rows, total: out.total[0] ? out.total[0].n : 0, page: p, perPage: PER })
  } catch (err) {
    next(err)
  }
})

// ───────── products & categories ─────────
const CATEGORIES = ['discord-bot', 'web', 'server', 'software']

function productInput(b, { creating }) {
  const o = b && typeof b === 'object' ? b : {}
  const out = {}
  const errors = []
  const set = (k, v, bad) => (bad ? errors.push(k) : (out[k] = v))

  if (creating || 'slug' in o) {
    const slug = str(o.slug, 60).toLowerCase()
    set('slug', slug, !/^[a-z0-9-]{2,60}$/.test(slug))
  }
  if ('category' in o || creating) set('category', o.category, !CATEGORIES.includes(o.category))
  if ('subCategory' in o || creating) out.subCategory = text(o.subCategory, 40)
  if ('name' in o || creating) {
    const name = text(o.name, 120)
    set('name', name, !name)
  }
  if ('tagline' in o) out.tagline = text(o.tagline, 200)
  if ('description' in o) out.description = text(o.description, 1000, true)
  if ('features' in o) out.features = arr(o.features, 15, (f) => text(f, 200) || undefined) || []
  if ('tags' in o) out.tags = arr(o.tags, 15, (f) => text(f, 30) || undefined) || []
  if ('price' in o) {
    const n = num(o.price, { min: 0, max: 10000000, nullable: true })
    set('price', n, Number.isNaN(n))
  }
  if ('oldPrice' in o) {
    const n = num(o.oldPrice, { min: 0, max: 10000000, nullable: true })
    set('oldPrice', n, Number.isNaN(n))
  }
  if (out.oldPrice != null && out.price != null && out.oldPrice <= out.price) errors.push('oldPrice (eski fiyat, satış fiyatından yüksek olmalı)')
  if ('delivery' in o) out.delivery = text(o.delivery, 60)
  if ('images' in o) out.images = arr(o.images, 6, (m) => (typeof m === 'string' && MEDIA_URL.test(m) ? m : undefined)) || []
  if ('specs' in o) out.specs = arr(o.specs, 20, (r) => { const k = r && text(r.k, 60); const v = r && text(r.v, 200); return k && v ? { k, v } : undefined }) || []
  if ('details' in o) out.details = text(o.details, 4000, true)
  if ('requirements' in o) out.requirements = arr(o.requirements, 12, (r) => text(r, 200) || undefined) || []
  if ('metaTitle' in o) out.metaTitle = text(o.metaTitle, 70)
  if ('metaDescription' in o) out.metaDescription = text(o.metaDescription, 170)
  if ('priceFrom' in o) out.priceFrom = bool(o.priceFrom)
  if ('period' in o) out.period = text(o.period, 40)
  if ('deliveryDays' in o) {
    const n = num(o.deliveryDays, { min: 0, max: 365, nullable: true, int: true })
    set('deliveryDays', n, Number.isNaN(n))
  }
  if ('popular' in o) out.popular = bool(o.popular)
  if ('active' in o) out.active = bool(o.active)
  if ('sort' in o) {
    const n = num(o.sort, { min: 0, max: 10000, int: true })
    set('sort', n, Number.isNaN(n))
  }
  return { out, errors }
}

router.get('/products', async (req, res, next) => {
  try {
    await seedCatalogIfNeeded()
    const products = await Product.find().sort({ sort: 1, createdAt: 1 }).select('-__v').lean()
    res.json({ products: products.map((p) => ({ ...p, id: String(p._id), _id: undefined })), categories: CATEGORIES })
  } catch (err) {
    next(err)
  }
})

router.post('/products', async (req, res, next) => {
  try {
    await seedCatalogIfNeeded()
    const { out, errors } = productInput(req.body, { creating: true })
    if (errors.length) return res.status(400).json({ message: `Geçersiz alan: ${errors.join(', ')}` })
    if (await Product.exists({ slug: out.slug })) return res.status(409).json({ message: 'Bu kısa ad (slug) zaten kullanılıyor.' })
    const count = await Product.estimatedDocumentCount()
    const product = await Product.create({ sort: count, ...out })
    res.status(201).json({ id: String(product._id) })
  } catch (err) {
    next(err)
  }
})

router.put('/products/:slug', async (req, res, next) => {
  try {
    const slug = str(req.params.slug, 60)
    const { out, errors } = productInput(req.body, { creating: false })
    if (errors.length) return res.status(400).json({ message: `Geçersiz alan: ${errors.join(', ')}` })
    if (out.slug && out.slug !== slug && (await Product.exists({ slug: out.slug }))) return res.status(409).json({ message: 'Bu kısa ad (slug) başka bir üründe kullanılıyor.' })
    const r = await Product.updateOne({ slug }, { $set: out }, { runValidators: true })
    if (!r.matchedCount) return res.status(404).json({ message: 'Ürün bulunamadı.' })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.delete('/products/:slug', async (req, res, next) => {
  try {
    const r = await Product.deleteOne({ slug: str(req.params.slug, 60) })
    if (!r.deletedCount) return res.status(404).json({ message: 'Ürün bulunamadı.' })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// reorder the products of one category: body { category, order: [slug, ...] } (the new order of that category)
router.post('/products-reorder', async (req, res, next) => {
  try {
    const category = req.body && req.body.category
    const order = arr(req.body && req.body.order, 200, (s) => str(s, 60) || undefined)
    if (!CATEGORIES.includes(category) || !order || !order.length) return res.status(400).json({ message: 'Geçersiz istek.' })
    const all = await Product.find().sort({ sort: 1, createdAt: 1 }).select('slug category').lean()
    const mine = new Set(all.filter((p) => p.category === category).map((p) => p.slug))
    const wanted = order.filter((s) => mine.has(s))
    const rest = [...mine].filter((s) => !wanted.includes(s))
    const queue = [...wanted, ...rest]
    // keep the category's slots, fill them in the new order, then renumber everything
    const slugs = all.map((p) => (p.category === category ? queue.shift() : p.slug))
    await Product.bulkWrite(slugs.map((slug, i) => ({ updateOne: { filter: { slug }, update: { $set: { sort: i } } } })))
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// rename a sub-category on every product at once
router.post('/products-rename-sub', async (req, res, next) => {
  try {
    const category = req.body && req.body.category
    const from = text(req.body && req.body.from, 40)
    const to = text(req.body && req.body.to, 40)
    if (!CATEGORIES.includes(category) || !from || !to) return res.status(400).json({ message: 'Geçersiz istek.' })
    const r = await Product.updateMany({ category, subCategory: from }, { $set: { subCategory: to } })
    res.json({ updated: r.modifiedCount })
  } catch (err) {
    next(err)
  }
})

// ───────── photo uploads ─────────
function sniff(buf) {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf.length > 12 && buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (buf.length > 12 && buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'image/webp'
  return null
}

router.post('/media', async (req, res, next) => {
  try {
    const raw = req.body && req.body.data
    if (typeof raw !== 'string' || raw.length < 100 || raw.length > 2200000 || !/^[A-Za-z0-9+/=]+$/.test(raw)) return res.status(400).json({ message: 'Geçersiz görsel.' })
    const buf = Buffer.from(raw, 'base64')
    if (buf.length > 1600000) return res.status(400).json({ message: 'Görsel çok büyük (en fazla 1,5 MB).' })
    const mime = sniff(buf) // type comes from the file's real bytes, never from the client
    if (!mime) return res.status(400).json({ message: 'Yalnızca JPG, PNG veya WebP yüklenebilir.' })
    if ((await Media.estimatedDocumentCount()) > 600) return res.status(400).json({ message: 'Görsel depolama sınırına ulaşıldı.' })
    const doc = await Media.create({ data: buf, mime, size: buf.length })
    res.status(201).json({ url: `/api/media/${doc._id}` })
  } catch (err) {
    next(err)
  }
})

// ───────── site content (FAQ, portfolio, contact info, links, ...) ─────────
router.get('/content', async (req, res, next) => {
  try {
    const rows = await Setting.find({ key: { $in: CONTENT_KEYS.map((k) => `content:${k}`) } }).lean()
    const content = {}
    for (const r of rows) content[r.key.slice(8)] = r.value
    res.json({ content, keys: CONTENT_KEYS })
  } catch (err) {
    next(err)
  }
})

router.put('/content/:key', async (req, res, next) => {
  try {
    const key = req.params.key
    if (!CONTENT_KEYS.includes(key)) return res.status(404).json({ message: 'Bilinmeyen içerik.' })
    const value = validators[key](req.body && req.body.value)
    if (value === undefined || value === null) return res.status(400).json({ message: 'Geçersiz içerik. (Bağlantılar yalnızca https:// ile başlamalıdır.)' })
    await Setting.updateOne({ key: `content:${key}` }, { $set: { value } }, { upsert: true })
    res.json({ ok: true, value })
  } catch (err) {
    next(err)
  }
})

router.delete('/content/:key', async (req, res, next) => {
  try {
    if (!CONTENT_KEYS.includes(req.params.key)) return res.status(404).json({ message: 'Bilinmeyen içerik.' })
    await Setting.deleteOne({ key: `content:${req.params.key}` })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// ───────── support tickets ─────────
const TICKET_STATUS = ['acik', 'yanitlandi', 'kapali']

router.get('/tickets', async (req, res, next) => {
  try {
    const filter = {}
    if (TICKET_STATUS.includes(req.query.status)) filter.status = req.query.status
    const q = str(req.query.q, 60)
    if (q) {
      const rx = new RegExp(esc(q), 'i')
      filter.$or = [{ ticketNo: rx }, { name: rx }, { email: rx }, { subject: rx }, { message: rx }]
    }
    const p = page(req)
    const [rows, total, unread] = await Promise.all([
      Message.find(filter).sort({ unreadByAdmin: -1, updatedAt: -1 }).skip((p - 1) * PER).limit(PER).lean(),
      Message.countDocuments(filter),
      Message.countDocuments({ unreadByAdmin: true }),
    ])
    res.json({ tickets: rows.map((t) => ({ ...t, _id: undefined, __v: undefined, user: t.user ? String(t.user) : null })), total, unread, page: p, perPage: PER })
  } catch (err) {
    next(err)
  }
})

router.get('/tickets/:ticketNo', async (req, res, next) => {
  try {
    const t = await Message.findOneAndUpdate({ ticketNo: str(req.params.ticketNo, 40) }, { $set: { unreadByAdmin: false } }, { new: true }).lean()
    if (!t) return res.status(404).json({ message: 'Talep bulunamadı.' })
    res.json({ ticket: { ...t, _id: undefined, __v: undefined, user: t.user ? String(t.user) : null } })
  } catch (err) {
    next(err)
  }
})

router.post('/tickets/:ticketNo/reply', async (req, res, next) => {
  try {
    const body = str(req.body && req.body.text, 3000, true)
    if (body.length < 2) return res.status(400).json({ message: 'Yanıt boş olamaz.' })
    const t = await Message.findOne({ ticketNo: str(req.params.ticketNo, 40) })
    if (!t) return res.status(404).json({ message: 'Talep bulunamadı.' })
    if (t.replies.length >= 100) return res.status(400).json({ message: 'Mesaj sınırına ulaşıldı.' })
    t.replies.push({ from: 'admin', text: body })
    t.status = 'yanitlandi'
    t.unreadByUser = true // the customer sees a "new reply" marker in their panel
    t.unreadByAdmin = false
    await t.save()
    res.status(201).json({ ok: true, replies: t.replies })
  } catch (err) {
    next(err)
  }
})

router.patch('/tickets/:ticketNo', async (req, res, next) => {
  try {
    if (!TICKET_STATUS.includes(req.body && req.body.status)) return res.status(400).json({ message: 'Geçersiz durum.' })
    const r = await Message.updateOne({ ticketNo: str(req.params.ticketNo, 40) }, { $set: { status: req.body.status } })
    if (!r.matchedCount) return res.status(404).json({ message: 'Talep bulunamadı.' })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.delete('/tickets/:ticketNo', async (req, res, next) => {
  try {
    await Message.deleteOne({ ticketNo: str(req.params.ticketNo, 40) })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// ───────── orders ─────────
const ORDER_STATUS = ['yeni', 'onaylandi', 'hazirlaniyor', 'teslim-edildi', 'iptal']

router.get('/orders', async (req, res, next) => {
  try {
    const filter = ORDER_STATUS.includes(req.query.status) ? { status: req.query.status } : {}
    const q = str(req.query.q, 60)
    if (q) {
      const rx = new RegExp(esc(q), 'i')
      filter.$or = [{ orderNo: rx }, { productName: rx }, { 'customer.name': rx }, { 'customer.email': rx }, { 'customer.discord': rx }]
    }
    const p = page(req)
    const [rows, total, counts] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip((p - 1) * PER).limit(PER).select('-__v').lean(),
      Order.countDocuments(filter),
      Order.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    ])
    res.json({ orders: rows.map((o) => ({ ...o, _id: undefined, user: o.user ? String(o.user) : null })), total, page: p, perPage: PER, counts: Object.fromEntries(counts.map((c) => [c._id, c.n])) })
  } catch (err) {
    next(err)
  }
})

router.patch('/orders/:orderNo', async (req, res, next) => {
  try {
    if (!ORDER_STATUS.includes(req.body && req.body.status)) return res.status(400).json({ message: 'Geçersiz durum.' })
    const order = await Order.findOne({ orderNo: str(req.params.orderNo, 40) })
    if (!order) return res.status(404).json({ message: 'Sipariş bulunamadı.' })
    if (order.status !== req.body.status) {
      order.status = req.body.status
      order.history.push({ status: req.body.status })
      if (req.body.status === 'iptal' && !order.cancelledBy) order.cancelledBy = 'admin'
      await order.save()
    }
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// ───────── reviews (moderation) ─────────
router.get('/reviews', async (req, res, next) => {
  try {
    const filter = ['pending', 'approved', 'rejected'].includes(req.query.status) ? { status: req.query.status } : {}
    const rows = await Review.find(filter).sort({ createdAt: -1 }).limit(200).populate('user', 'email').lean()
    res.json({ reviews: rows.map((r) => ({ id: String(r._id), name: r.name, email: r.user ? r.user.email : '', rating: r.rating, text: r.text, product: r.product, verified: r.verified, status: r.status, createdAt: r.createdAt })) })
  } catch (err) {
    next(err)
  }
})

const objectId = (v) => (/^[a-f0-9]{24}$/i.test(String(v)) ? String(v) : null)

router.patch('/reviews/:id', async (req, res, next) => {
  try {
    const id = objectId(req.params.id)
    if (!id || !['pending', 'approved', 'rejected'].includes(req.body && req.body.status)) return res.status(400).json({ message: 'Geçersiz istek.' })
    const review = await Review.findById(id)
    if (!review) return res.status(404).json({ message: 'Yorum bulunamadı.' })
    review.status = req.body.status
    review.verified = Boolean(await Order.exists({ user: review.user, status: 'teslim-edildi' }))
    await review.save()
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.delete('/reviews/:id', async (req, res, next) => {
  try {
    const id = objectId(req.params.id)
    if (!id) return res.status(400).json({ message: 'Geçersiz istek.' })
    await Review.deleteOne({ _id: id })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// ───────── customers ─────────
router.get('/users', async (req, res, next) => {
  try {
    const p = page(req)
    const [rows, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip((p - 1) * PER).limit(PER).lean(),
      User.estimatedDocumentCount(),
    ])
    res.json({
      users: rows.map((u) => ({ id: String(u._id), name: u.name, email: u.email, google: Boolean(u.googleId), discord: Boolean(u.discordId), emailVerified: u.emailVerified, createdAt: u.createdAt })),
      total,
      page: p,
      perPage: PER,
    })
  } catch (err) {
    next(err)
  }
})

router.use((req, res) => res.status(404).json({ message: 'Not found' }))

module.exports = router
