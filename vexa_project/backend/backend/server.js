'use strict'

const path = require('path')
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')

const config = require('./config/appConfig')
const db = require('./config/db')
const limiters = require('./middleware/limiters')

const app = express()

// Render terminates TLS at a proxy; trust it so rate limiting sees real client IPs.
app.set('trust proxy', 1)

// ---- security middleware ----
// ---- canonical URLs: https, no "www.", no trailing slash ----
const siteHost = new URL(config.siteUrl).hostname
app.use((req, res, next) => {
  if (config.isProd && (req.hostname === siteHost || req.hostname === `www.${siteHost}`)) {
    const insecure = req.headers['x-forwarded-proto'] === 'http'
    if (insecure || req.hostname !== siteHost) return res.redirect(301, `${config.siteUrl}${req.originalUrl}`)
  }
  if (req.path.length > 1 && req.path.endsWith('/') && !req.path.startsWith('/api')) {
    const q = req.originalUrl.slice(req.path.length)
    return res.redirect(301, req.path.replace(/\/+$/, '') + q)
  }
  next()
})

// gzip/brotli-less compression for HTML, JS, CSS and JSON (faster pages = better ranking)
try {
  app.use(require('compression')())
} catch (e) {
  console.warn('[server] "compression" is not installed; run npm install in backend/')
}

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
        'img-src': ["'self'", 'data:', 'https://*.googleusercontent.com', 'https://cdn.discordapp.com'],
        'connect-src': ["'self'"],
        'frame-ancestors': ["'none'"],
        'object-src': ["'none'"],
        'form-action': ["'self'"],
      },
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
)
// the admin panel must never be indexed or cached
app.use((req, res, next) => {
  if (req.path === '/admin' || req.path.startsWith('/admin/') || req.path.startsWith('/api/admin')) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive')
    res.setHeader('Cache-Control', 'no-store')
  }
  next()
})
app.use(
  cors({
    origin: config.corsOrigins.length ? config.corsOrigins : false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  })
)
// admin content (FAQ, portfolio ...) can be larger than public form bodies
app.use('/api/admin', express.json({ limit: '300kb' }))
app.use(express.json({ limit: '20kb' }))
app.use(mongoSanitize()) // strips $ and . operators from body/query/params (NoSQL injection)
app.use('/api', limiters.api)

// ---- API ----
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Vexstar Backend API is active',
    database: db.isConnected() ? 'connected' : 'unavailable',
  })
})
app.use('/api/products', require('./routes/products'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/contact', require('./routes/contact'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/reviews', require('./routes/reviews'))
app.use('/api/stats', require('./routes/stats'))
app.use('/api/content', require('./routes/content'))
app.use('/api/track', require('./routes/track'))
app.use('/api/admin', require('./routes/admin'))

app.use('/api', (req, res) => {
  res.status(404).json({ status: 'error', message: 'Not found' })
})

// ---- built React app (single Render web service) ----
const distPath = path.join(__dirname, '..', 'frontend', 'dist')
const indexHtml = path.join(distPath, 'index.html')

if (fs.existsSync(indexHtml)) {
  const seo = require('./seo/render')
  const template = fs.readFileSync(indexHtml, 'utf8')
  app.get('/robots.txt', seo.robots)
  app.get('/sitemap.xml', seo.sitemap)
  app.use(
    express.static(distPath, {
      index: false,
      setHeaders(res, filePath) {
        const hashed = filePath.includes(`${path.sep}assets${path.sep}`)
        res.setHeader('Cache-Control', hashed ? 'public, max-age=31536000, immutable' : 'no-cache')
      },
    })
  )
  // every page request gets its own SEO tags + structured data + crawlable text (see seo/render.js)
  app.get('*', async (req, res, next) => {
    try {
      const { status, html } = await seo.renderPage(template, req.path)
      res.status(status)
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.setHeader('Content-Language', 'tr')
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
      res.send(html)
    } catch (err) {
      next(err)
    }
  })
}

// ---- error handling ----
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Geçersiz istek gövdesi.' })
  if (err.type === 'entity.too.large') return res.status(413).json({ message: 'İstek çok büyük.' })
  console.error('[error]', err)
  res.status(500).json({ message: 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.' })
})

// ---- start ----
const server = app.listen(config.port, () => {
  console.log(`Vexstar server listening on port ${config.port} (${config.env})`)
})
db.connectDb() // does not block startup; failures are logged and retried

function shutdown(signal) {
  console.log(`${signal} received, shutting down`)
  server.close(async () => {
    try {
      await db.closeDb()
    } catch (e) {
      /* ignore */
    }
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 10000).unref()
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

module.exports = app
