'use strict'
// Server-side SEO: every HTML request gets its own <title>, description, canonical, Open Graph / Twitter
// tags, JSON-LD structured data and a crawlable text snapshot, so search engines and link previews
// (Discord, WhatsApp, Telegram, X, LinkedIn ...) see real content even though the site is a React SPA.
const config = require('../config/appConfig')
const Setting = require('../models/Setting')
const { isConnected } = require('../config/db')
const { getAllProducts } = require('../services/products')
const { loadSiteConfig } = require('../data/catalog')

const SITE = config.siteUrl
const NOINDEX_PREFIXES = ['/hesap', '/panel', '/admin']

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const abs = (p) => (/^https?:\/\//i.test(p) ? p : `${SITE}${p.startsWith('/') ? '' : '/'}${p}`)
const jsonLd = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`
const trim = (s, n) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)

// ---- data (config defaults + admin edits + products), cached for 60 seconds ----
let dataCache = { at: 0, value: null }
async function getData() {
  if (dataCache.value && Date.now() - dataCache.at < 60000) return dataCache.value
  const cfg = await loadSiteConfig()
  const content = {}
  if (isConnected()) {
    try {
      const rows = await Setting.find({ key: { $regex: '^content:' } }).lean()
      for (const r of rows) content[r.key.slice(8)] = r.value
    } catch (e) {
      /* fall back to defaults */
    }
  }
  const products = await getAllProducts()
  const value = {
    seo: cfg.seo || { pages: {}, image: '/og-image.jpg' },
    products,
    faq: content.faq || cfg.faq || [],
    portfolio: content.portfolio || cfg.portfolio || [],
    contact: { ...(cfg.contact || {}), ...(content.contact || {}) },
    links: { ...(cfg.links || {}), ...(content.links || {}) },
    routes: (cfg.routes) || {},
    categories: content.categories || cfg.categories || [],
  }
  dataCache = { at: Date.now(), value }
  return value
}

const hasTerms = (p) => !Array.isArray(p.terms) || p.terms.length > 0
const priceText = (p) => (p.price == null ? 'Teklif alın' : `${p.priceFrom ? 'Başlangıç ' : ''}${Number(p.price).toLocaleString('tr-TR')} ₺${hasTerms(p) ? ' / ay' : ''}`)
const productsOf = (d, cat) => d.products.filter((p) => p.category === cat)

// ---- product pages: /urunler/<slug> ----
const catOf = (d, p) => d.categories.find((c) => c.id === p.category) || { name: 'Hizmetler', path: '/' }
const categoryPage = (d, c) => ({ category: c, title: c.seoTitle || `${c.name} | Vexstar`, description: c.seoDescription || c.description || `${c.name} hizmetleri.`, h1: c.title || c.name, changefreq: 'weekly', priority: '0.9' })
function productPage(d, p) {
  const base = trim(`${p.tagline || ''} ${p.description || ''}`.trim(), 160)
  return {
    product: p,
    title: p.metaTitle || trim(`${p.name} | ${catOf(d, p).name} – Vexstar`, 70),
    description: p.metaDescription || base || `${p.name} hizmeti: net fiyat ve hızlı teslimat.`,
    h1: p.name,
    image: p.images && p.images[0],
    changefreq: 'weekly',
    priority: '0.8',
  }
}

// ---- structured data ----
function organization(d) {
  const sameAs = ['discord', 'github', 'youtube', 'x'].map((k) => d.links[k]).filter((u) => u && /^https:\/\//.test(u) && new URL(u).pathname.length > 1)
  const org = {
    '@type': ['Organization', 'ProfessionalService'],
    '@id': `${SITE}/#organization`,
    name: d.seo.legalName || 'Vexstar Development',
    alternateName: [d.seo.siteName || 'Vexstar', 'Vexstar Development', 'Vexstar Discord Bot', 'Vexstar Web'],
    url: `${SITE}/`,
    logo: { '@type': 'ImageObject', url: abs('/favicon-512.png'), width: 512, height: 512 },
    image: abs(d.seo.image || '/og-image.jpg'),
    description: (d.seo.pages['/'] || {}).description,
    areaServed: { '@type': 'Country', name: 'Türkiye' },
    availableLanguage: ['tr'],
    knowsAbout: ['Discord botu', 'Discord bot yaptırma', 'Web sitesi yaptırma', 'Web tasarım', 'E-ticaret sitesi', 'Sunucu kurulumu'],
  }
  if (sameAs.length) org.sameAs = sameAs
  if (d.contact.email) org.contactPoint = { '@type': 'ContactPoint', contactType: 'customer support', email: d.contact.email, availableLanguage: ['tr'], url: `${SITE}/iletisim` }
  return org
}

function productNode(d, p, pagePath) {
  const node = {
    '@type': 'Product',
    name: p.name,
    description: p.description || p.tagline,
    category: p.category === 'web' ? 'Web sitesi hizmeti' : 'Discord bot hizmeti',
    brand: { '@type': 'Brand', name: d.seo.siteName || 'Vexstar' },
    image: abs((p.images && p.images[0]) || d.seo.image || '/og-image.jpg'),
    url: `${SITE}${pagePath}#${p.slug}`,
  }
  if ((p.specs || []).length) node.additionalProperty = p.specs.map((s) => ({ '@type': 'PropertyValue', name: s.k, value: s.v }))
  if (p.price != null) {
    node.offers = {
      '@type': 'Offer',
      priceCurrency: 'TRY',
      price: String(p.price),
      availability: 'https://schema.org/InStock',
      url: `${SITE}${pagePath}#${p.slug}`,
      seller: { '@id': `${SITE}/#organization` },
    }
  }
  return node
}

function breadcrumb(path, name) {
  if (path === '/') return null
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name, item: `${SITE}${path}` },
    ],
  }
}

function faqNode(faq) {
  if (!faq.length) return null
  return { '@type': 'FAQPage', mainEntity: faq.slice(0, 20).map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }
}

function graph(d, path, page) {
  const nodes = [
    organization(d),
    { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: d.seo.siteName || 'Vexstar', alternateName: d.seo.legalName, inLanguage: 'tr-TR', publisher: { '@id': `${SITE}/#organization` } },
    { '@type': path === '/iletisim' ? 'ContactPage' : 'WebPage', '@id': `${SITE}${path === '/' ? '/' : path}#webpage`, url: `${SITE}${path === '/' ? '/' : path}`, name: page.title, description: page.description, inLanguage: 'tr-TR', isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': `${SITE}/#organization` }, primaryImageOfPage: { '@type': 'ImageObject', url: abs(d.seo.image || '/og-image.jpg') } },
  ]
  if (page.product) {
    const p = page.product
    nodes.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: catOf(d, p).name, item: `${SITE}${catOf(d, p).path}` },
        { '@type': 'ListItem', position: 3, name: p.name, item: `${SITE}${path}` },
      ],
    })
    nodes.push({ ...productNode(d, p, catOf(d, p).path), url: `${SITE}${path}`, '@id': `${SITE}${path}#product` })
    nodes[nodes.length - 1].offers && (nodes[nodes.length - 1].offers.url = `${SITE}${path}`)
  } else {
    const crumb = breadcrumb(path, (page.h1 || page.title).split(':')[0])
    if (crumb) nodes.push(crumb)
  }
  if (page.category) {
    const list = productsOf(d, page.category.id)
    if (list.length) {
      nodes.push({ '@type': 'ItemList', name: page.h1, itemListElement: list.map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: productNode(d, p, path) })) })
    }
  }
  if (!page.product && (path === '/' || path === '/iletisim')) {
    const f = faqNode(d.faq)
    if (f) nodes.push(f)
  }
  return { '@context': 'https://schema.org', '@graph': nodes }
}

// ---- crawlable snapshot (replaced by React once the app loads) ----
function productList(d, list, path) {
  return `<ul>${list.map((p) => `<li id="${esc(p.slug)}"><h3>${esc(p.name)}</h3><p>${esc(p.tagline || '')}</p>${p.description ? `<p>${esc(p.description)}</p>` : ''}<ul>${(p.features || []).map((f) => `<li>${esc(f)}</li>`).join('')}</ul><p>Fiyat: ${esc(priceText(p))}${p.period ? ` (${esc(p.period)})` : ''}</p></li>`).join('')}</ul>`
}
const faqHtml = (faq) => (faq.length ? `<h2>Sık Sorulan Sorular</h2><dl>${faq.map((f) => `<dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd>`).join('')}</dl>` : '')

function snapshot(d, path, page) {
  const nav = `<nav aria-label="Ana menü"><a href="/">Ana Sayfa</a> ${d.categories.map((c) => `<a href="${esc(c.path)}">${esc(c.name)}</a>`).join(' ')} <a href="/portfoy">Portföy</a> <a href="/iletisim">İletişim</a></nav>`
  let body = `<h1>${esc(page.h1 || page.title)}</h1><p>${esc(page.description)}</p>`
  if (page.product) {
    const p = page.product
    body += `<p>${esc(p.tagline || '')}</p>${p.details ? `<p>${esc(p.details)}</p>` : `<p>${esc(p.description || '')}</p>`}<ul>${(p.features || []).map((f) => `<li>${esc(f)}</li>`).join('')}</ul>${(p.requirements || []).length ? `<h2>Teknik özellikler</h2><ul>${(p.specs || []).map((s) => `<li>${esc(s.k)}: ${esc(s.v)}</li>`).join('')}</ul><h2>Teslim için gerekenler</h2><ul>${p.requirements.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}<p>Fiyat: ${esc(priceText(p))}${p.oldPrice && p.price != null && p.oldPrice > p.price ? ` (indirim öncesi ${Number(p.oldPrice).toLocaleString('tr-TR')} ₺)` : ''}</p><p>Teslim: ${esc(p.delivery || (p.deliveryDays ? `${p.deliveryDays} iş günü` : 'Kapsama göre'))}</p>`
  } else if (path === '/') {
    body += d.categories.map((c) => `<h2>${esc(c.name)}</h2><p>${esc(c.description || '')}</p>${productList(d, productsOf(d, c.id), c.path)}`).join('')
    body += faqHtml(d.faq)
  } else if (page.category) body += `<p>${esc(page.category.description || '')}</p>${productList(d, productsOf(d, page.category.id), path)}`
  else if (path === '/portfoy') body += `<ul>${d.portfolio.map((p) => `<li><h3>${esc(p.title)}</h3><p>${esc(p.client)} · ${esc(p.category)}</p><p>${esc(p.result)}</p></li>`).join('')}</ul>`
  else if (path === '/iletisim') body += `<p>E-posta: ${esc(d.contact.email || '')}</p><p>${esc(d.contact.hours || '')}</p>${faqHtml(d.faq)}`
  // kept off-screen (not display:none) until React replaces it; identical to what the app renders
  return `<div id="seo-snapshot" class="vx-snapshot">${nav}<main>${body}</main></div>`
}

// ---- head ----
function head(d, path, page, indexable) {
  const url = `${SITE}${path === '/' ? '/' : path}`
  const img = abs(page.image || d.seo.image || '/og-image.jpg')
  const imgType = /\.(png)$/i.test(img) ? 'image/png' : 'image/jpeg'
  const title = esc(page.title)
  const desc = esc(trim(page.description, 200))
  const robots = indexable ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' : 'noindex, nofollow'
  const lines = [
    `<title>${title}</title>`,
    `<meta name="description" content="${desc}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<meta name="googlebot" content="${robots}" />`,
    `<meta name="author" content="${esc(d.seo.legalName || 'Vexstar Development')}" />`,
    `<meta name="application-name" content="${esc(d.seo.siteName || 'Vexstar')}" />`,
    `<meta name="apple-mobile-web-app-title" content="${esc(d.seo.siteName || 'Vexstar')}" />`,
    `<meta name="format-detection" content="telephone=no" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<link rel="alternate" hreflang="tr" href="${esc(url)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${esc(url)}" />`,
    `<link rel="manifest" href="/manifest.webmanifest" />`,
    `<meta property="og:type" content="${page.product ? 'product' : 'website'}" />`,
    `<meta property="og:site_name" content="${esc(d.seo.siteName || 'Vexstar')}" />`,
    `<meta property="og:locale" content="${esc(d.seo.locale || 'tr_TR')}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${desc}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(img)}" />`,
    `<meta property="og:image:secure_url" content="${esc(img)}" />`,
    ...(page.image ? [] : [`<meta property="og:image:type" content="image/jpeg" />`, `<meta property="og:image:width" content="1200" />`, `<meta property="og:image:height" content="630" />`]),
    `<meta property="og:image:alt" content="${esc(d.seo.imageAlt || page.title)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${desc}" />`,
    `<meta name="twitter:image" content="${esc(img)}" />`,
    `<meta name="twitter:image:alt" content="${esc(d.seo.imageAlt || page.title)}" />`,
  ]
  if (config.googleVerification) lines.push(`<meta name="google-site-verification" content="${esc(config.googleVerification)}" />`)
  if (config.bingVerification) lines.push(`<meta name="msvalidate.01" content="${esc(config.bingVerification)}" />`)
  if (indexable) lines.push(jsonLd(graph(d, path, page)))
  return lines.join('\n    ')
}

// ---- public API ----
function cleanPath(p) {
  const x = decodeURI(p || '/').replace(/\/+$/, '')
  return x === '' ? '/' : x
}

async function renderPage(template, rawPath) {
  const path = cleanPath(rawPath)
  const d = await getData()
  const pm = path.match(/^\/urunler\/([a-z0-9-]+)$/)
  const prod = pm ? d.products.find((x) => x.slug === pm[1]) : null
  const cat = d.categories.find((c) => c.path === path)
  const known = prod ? productPage(d, prod) : cat ? categoryPage(d, cat) : d.seo.pages[path]
  const noindex = NOINDEX_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))
  let page = known
  let status = 200
  let indexable = Boolean(known)
  if (!known) {
    indexable = false
    if (noindex) page = { title: 'Hesabım | Vexstar', description: 'Vexstar hesap sayfası.' }
    else {
      status = 404
      page = { title: 'Sayfa bulunamadı | Vexstar', description: 'Aradığınız sayfa taşınmış veya kaldırılmış olabilir.' }
    }
  }
  const stripped = template
    .replace(/<title\b[^>]*data-seo[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<(?:meta|link)\b[^>]*data-seo[^>]*>/gi, '')
    .replace(/<script\b[^>]*data-seo[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<link\b[^>]*rel="manifest"[^>]*>/gi, '')
  const snap = known ? snapshot(d, path, page) : ''
  const html = stripped
    .replace('</head>', () => `    ${head(d, path, page, indexable)}\n  </head>`)
    .replace(/<div id="root">\s*<\/div>/, () => `<div id="root">${snap}</div>`)
  return { status, html }
}

async function robots(req, res) {
  res.type('text/plain').send(['User-agent: *', 'Allow: /', 'Disallow: /api/', 'Disallow: /hesap', 'Disallow: /panel', '', `Sitemap: ${SITE}/sitemap.xml`, ''].join('\n'))
}

async function sitemap(req, res) {
  const d = await getData()
  const day = new Date().toISOString().slice(0, 10)
  const entries = [...Object.entries(d.seo.pages), ...d.categories.map((c) => [c.path, { changefreq: 'weekly', priority: '0.9' }]), ...d.products.map((p) => [`/urunler/${p.slug}`, { changefreq: 'weekly', priority: '0.8' }])]
  const urls = entries
    .map(([p, v]) => `  <url>\n    <loc>${esc(SITE + (p === '/' ? '/' : p))}</loc>\n    <lastmod>${day}</lastmod>\n    <changefreq>${v.changefreq || 'monthly'}</changefreq>\n    <priority>${v.priority || '0.5'}</priority>\n  </url>`)
    .join('\n')
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)
}

module.exports = { renderPage, robots, sitemap }
