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
const publicUrl = (process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:5173').replace(/\/+$/, '')

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
  timezone: process.env.ANALYTICS_TZ || 'Europe/Istanbul',
  publicUrl,
  // Admin identity lives ONLY in environment variables (never in the database, never in the frontend).
  admin: {
    email: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || '',
    totpSecret: (process.env.ADMIN_TOTP_SECRET || '').replace(/\s+/g, '').toUpperCase(),
    sessionMinutes: 120,
  },
  oauth: {
    google: { id: process.env.GOOGLE_CLIENT_ID || '', secret: process.env.GOOGLE_CLIENT_SECRET || '' },
    discord: { id: process.env.DISCORD_CLIENT_ID || '', secret: process.env.DISCORD_CLIENT_SECRET || '' },
  },
})
