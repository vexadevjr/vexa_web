'use strict'
const Setting = require('../models/Setting')
const { isConnected } = require('../config/db')
const { loadSiteConfig } = require('../data/catalog')

// Shop categories: admin-edited list (Setting content:categories) or the defaults from siteConfig.js
async function getCategories() {
  const cfg = await loadSiteConfig()
  const defaults = cfg.categories || []
  if (!isConnected()) return defaults
  try {
    const row = await Setting.findOne({ key: 'content:categories' }).lean()
    if (row && Array.isArray(row.value) && row.value.length) return row.value
  } catch (e) {
    /* fall back to defaults */
  }
  return defaults
}

module.exports = { getCategories }
