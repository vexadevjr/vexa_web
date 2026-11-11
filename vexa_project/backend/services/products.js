'use strict'
const Product = require('../models/Product')
const { isConnected } = require('../config/db')
const { loadCatalog } = require('../data/catalog')

const HIDDEN = '-_id -__v -createdAt -updatedAt -active'

// Database first; falls back to the siteConfig catalog when the DB is down or not seeded yet.
async function getAllProducts() {
  if (isConnected()) {
    try {
      const rows = await Product.find({ active: true }).sort({ sort: 1 }).select(HIDDEN).lean()
      if (rows.length) return rows
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

module.exports = { getAllProducts, findProductBySlug }
