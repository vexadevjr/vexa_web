'use strict'

const path = require('path')
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const app = express()
const PORT = process.env.PORT || 5000

// Render terminates TLS at a proxy; trust it so req.ip / req.protocol are correct.
app.set('trust proxy', 1)

// ---- security & middleware ----
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        // the frontend loads Inter from Google Fonts
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
        'img-src': ["'self'", 'data:'],
      },
    },
  })
)

// CORS: open by default; set CORS_ORIGIN="https://a.com,https://b.com" to restrict.
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : undefined))

app.use(express.json())

// ---- API routes ----
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'Vexa Backend API is active' })
})

// Placeholder data for future service fetches (will move to a database later).
const services = [
  { id: 'discord-bots', title: 'Discord Botları', description: 'Sunucunuz için gelişmiş, güvenli ve özelleştirilebilir botlar.' },
  { id: 'web-development', title: 'Web Geliştirme', description: 'Modern ve performanslı web siteleri ile projelerinizi büyütün.' },
  { id: 'server-solutions', title: 'Sunucu Çözümleri', description: 'Sunucu, hosting ve altyapı desteği ile kesintisiz hizmet.' },
  { id: 'custom-software', title: 'Özel Yazılım', description: 'İhtiyacınıza özel yazılım çözümleri geliştiriyoruz.' },
]

app.get('/api/services', (req, res) => {
  res.json({ services })
})

// Unknown API routes -> JSON 404 (never fall through to the SPA)
app.use('/api', (req, res) => {
  res.status(404).json({ status: 'error', message: 'Not found' })
})

// ---- serve the built React app in production (single Render web service) ----
const distPath = path.join(__dirname, '..', 'frontend', 'dist')
const indexHtml = path.join(distPath, 'index.html')

if (fs.existsSync(indexHtml)) {
  app.use(
    express.static(distPath, {
      index: false,
      setHeaders(res, filePath) {
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable') // hashed files
        } else {
          res.setHeader('Cache-Control', 'no-cache')
        }
      },
    })
  )
  // SPA fallback
  app.get('*', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache')
    res.sendFile(indexHtml)
  })
}

// ---- error handler ----
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ status: 'error', message: 'Internal server error' })
})

// ---- start + graceful shutdown (Render sends SIGTERM on deploys) ----
const server = app.listen(PORT, () => {
  console.log(`Vexa server listening on port ${PORT}`)
})

function shutdown(signal) {
  console.log(`${signal} received, shutting down`)
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(1), 10000).unref()
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

module.exports = app
