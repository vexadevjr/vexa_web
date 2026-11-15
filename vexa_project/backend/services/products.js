'use strict'
const Product = require('../models/Product')
const Setting = require('../models/Setting')
const { isConnected } = require('../config/db')
const { loadCatalog } = require('../data/catalog')

const HIDDEN = '-_id -__v -createdAt -updatedAt -active'
let seeded = false

// Once the catalog has been copied into MongoDB (by `npm run seed` or the admin panel) the database
// is the source of truth, even if every product is later deleted.
async function isSeeded() {
  if (seeded) return true
  const flag = await Setting.findOne({ key: 'catalogSeeded' }).lean()
  if (flag || (await Product.estimatedDocumentCount()) > 0) {
    seeded = true
    return true
  }
  return false
}

async function seedCatalogIfNeeded() {
  if (await isSeeded()) return
  const catalog = await loadCatalog()
  if (catalog.length) {
    await Product.insertMany(catalog.map((p, i) => ({ ...p, sort: i, active: true })), { ordered: false }).catch(() => {})
  }
  await Setting.updateOne({ key: 'catalogSeeded' }, { $set: { value: true } }, { upsert: true })
  seeded = true
}

// Database first; falls back to the siteConfig catalog when the DB is down or not seeded yet.
async function getAllProducts() {
  if (isConnected()) {
    try {
      if (await isSeeded()) return await Product.find({ active: true }).sort({ sort: 1 }).select(HIDDEN).lean()
    } catch (err) {
      console.error('[products] query failed:', err.message)
    }
  }
  return loadCatalog()
}

async function findProductBySlug(slug) {
  const all = await getAllProducts()
  return all.find((p) => p.slug === slug) || null
}

module.exports = { getAllProducts, findProductBySlug, seedCatalogIfNeeded }
