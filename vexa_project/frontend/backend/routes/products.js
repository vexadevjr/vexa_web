'use strict'
const router = require('express').Router()
const { getAllProducts, findProductBySlug } = require('../services/products')
const { str, norm } = require('../utils/validate')

const CATEGORIES = ['discord-bot', 'web', 'server', 'software']

// GET /api/products?category=discord-bot&sub=Müzik&q=ban
router.get('/', async (req, res, next) => {
  try {
    const category = str(req.query.category, 20)
    const sub = norm(str(req.query.sub, 40))
    const q = norm(str(req.query.q, 60))

    let products = await getAllProducts()
    if (CATEGORIES.includes(category)) products = products.filter((p) => p.category === category)
    if (sub) products = products.filter((p) => norm(p.subCategory) === sub)
    if (q) {
      products = products.filter((p) =>
        norm([p.name, p.tagline, p.subCategory, ...(p.tags || []), ...(p.features || [])].join(' ')).includes(q)
      )
    }
    res.json({ products })
  } catch (err) {
    next(err)
  }
})

router.get('/:slug', async (req, res, next) => {
  try {
    const slug = str(req.params.slug, 60)
    if (!/^[a-z0-9-]+$/.test(slug)) return res.status(404).json({ message: 'Ürün bulunamadı.' })
    const product = await findProductBySlug(slug)
    if (!product) return res.status(404).json({ message: 'Ürün bulunamadı.' })
    res.json({ product })
  } catch (err) {
    next(err)
  }
})

module.exports = router
