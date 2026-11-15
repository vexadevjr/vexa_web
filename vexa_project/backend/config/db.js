'use strict'

const mongoose = require('mongoose')
const config = require('./appConfig')

mongoose.set('strictQuery', true)

let retryTimer = null

mongoose.connection.on('disconnected', () => console.warn('[db] disconnected'))
mongoose.connection.on('error', (err) => console.error('[db] error:', err.message))

function scheduleRetry() {
  if (retryTimer) return
  retryTimer = setTimeout(() => {
    retryTimer = null
    connectDb()
  }, 30000)
  retryTimer.unref()
}

// Never throws: the API keeps serving the built-in catalog while the database is unavailable.
async function connectDb() {
  if (!config.mongodbUri) {
    console.warn('[db] MONGODB_URI is not set: running in catalog-only mode (orders, auth and contact are disabled)')
    return false
  }
  try {
    await mongoose.connect(config.mongodbUri, { serverSelectionTimeoutMS: 8000 })
    console.log('[db] MongoDB connected')
    return true
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message)
    scheduleRetry()
    return false
  }
}

const isConnected = () => mongoose.connection.readyState === 1

async function closeDb() {
  if (retryTimer) clearTimeout(retryTimer)
  await mongoose.connection.close()
}

module.exports = { connectDb, closeDb, isConnected }
