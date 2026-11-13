'use strict'
const path = require('path')
const { pathToFileURL } = require('url')

// The product catalog (names, prices, features) lives in the frontend's siteConfig.js so there is
// exactly one place to edit. The backend reads it from there for seeding and as a fallback when
// the database is empty or unreachable.
const FILE = path.join(__dirname, '..', '..', 'frontend', 'src', 'config', 'siteConfig.js')
let cache = null

async function loadCatalog() {
  if (cache) return cache
  try {
    const mod = await import(pathToFileURL(FILE).href)
    cache = Array.isArray(mod.siteConfig && mod.siteConfig.catalog) ? mod.siteConfig.catalog : []
  } catch (err) {
    console.error('[catalog] could not load siteConfig.js:', err.message)
    cache = []
  }
  return cache
}

module.exports = { loadCatalog }
