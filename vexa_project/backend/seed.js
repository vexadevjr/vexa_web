'use strict'

// Usage: npm run seed --prefix backend   (needs MONGODB_URI)
// Upserts every product from frontend/src/config/siteConfig.js (catalog) into MongoDB.
const mongoose = require('mongoose')
const config = require('./config/appConfig')
const Product = require('./models/Product')
const { loadCatalog } = require('./data/catalog')

async function main() {
  if (!config.mongodbUri) throw new Error('MONGODB_URI is not set')
  const catalog = await loadCatalog()
  if (!catalog.length) throw new Error('Catalog is empty (could not read frontend/src/config/siteConfig.js)')

  await mongoose.connect(config.mongodbUri, { serverSelectionTimeoutMS: 10000 })

  const ops = catalog.map((p, i) => ({
    updateOne: {
      filter: { slug: p.slug },
      update: { $set: { ...p, sort: i, active: true } },
      upsert: true,
    },
  }))
  const result = await Product.bulkWrite(ops)
  console.log(`Seed complete: ${result.upsertedCount} created, ${result.modifiedCount} updated, ${catalog.length} total`)
}

main()
  .catch((err) => {
    console.error('Seed failed:', err.message)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
