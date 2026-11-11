'use strict'

// Single source of truth for backend settings. Everything comes from environment
// variables (.env locally, the Render dashboard in production).
const path = require('path')
const crypto = require('crypto')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const env = process.env.NODE_ENV || 'development'
const isProd = env === 'production'

const list = (v) =>
  (v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

let jwtSecret = process.env.JWT_SECRET
if (!jwtSecret || jwtSecret.length < 16) {
  if (isProd) {
    throw new Error('JWT_SECRET must be set (at least 16 characters) when NODE_ENV=production')
  }
  jwtSecret = crypto.randomBytes(32).toString('hex')
  console.warn('[config] JWT_SECRET is not set: using a temporary secret (logins reset on restart)')
}

const corsOrigins = list(process.env.CORS_ORIGIN)

module.exports = Object.freeze({
  env,
  isProd,
  port: Number(process.env.PORT) || 5000,
  mongodbUri: process.env.MONGODB_URI || '',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  // Production serves the frontend and API from one origin, so CORS stays closed unless configured.
  corsOrigins: corsOrigins.length ? corsOrigins : isProd ? [] : ['http://localhost:5173'],
  bcryptRounds: 12,
})
