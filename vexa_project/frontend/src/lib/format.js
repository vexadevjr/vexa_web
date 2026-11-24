import { siteConfig } from '../config/siteConfig.js'

const { symbol, locale } = siteConfig.currency
const { routes } = siteConfig

export function formatPrice(value) {
  return `${Number(value).toLocaleString(locale)} ${symbol}`
}

// Subscription terms: the product price is the MONTHLY price, the customer picks 1 / 3 / 6 / 12 months.
export const ALL_TERMS = [1, 3, 6, 12]
export const termsOf = (p) => (Array.isArray(p.terms) ? p.terms : ALL_TERMS)
export const termLabel = (m) => (m === 12 ? 'Yıllık' : `${m} Aylık`)
export const totalFor = (price, months) => Math.round(Number(price) * months * 100) / 100
export const termsSummary = (terms) => terms.map((m) => (m === 12 ? 'Yıllık' : `${m} ay`)).join(' · ')

export function priceLabel(product) {
  if (product.price == null) return 'Teklif alın'
  return `${product.priceFrom ? 'Başlangıç ' : ''}${formatPrice(product.price)}${termsOf(product).length ? ' / ay' : ''}`
}

// free text from the admin ("5-7 iş günü"); older products fall back to their numeric day count
export function deliveryLabel(product) {
  if (product.delivery) return product.delivery
  if (product.deliveryDays) return `${product.deliveryDays} iş günü`
  return 'Kapsama göre'
}

// { old, pct } when the product is on sale (old price must be higher than the current one)
export function discountInfo(product) {
  if (product.price == null || !product.oldPrice || product.oldPrice <= product.price) return null
  return { old: product.oldPrice, pct: Math.round((1 - product.price / product.oldPrice) * 100) }
}

// accent/case-insensitive text for searching ("muzik" matches "Müzik")
export const norm = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ıİ]/g, 'i')
    .toLowerCase()

// every product has its own page: /urunler/<slug>
export function productPath(p) {
  return `${routes.product}/${p.slug}`
}

export const dateLabel = (iso) =>
  new Date(iso).toLocaleDateString(siteConfig.currency.locale, { day: '2-digit', month: 'long', year: 'numeric' })

// Business-day based delivery estimate from the free-text delivery field ("5-7 iş günü", "24 saat içinde", "3 gün").
export function estimateDelivery(text) {
  if (!text) return null
  const t = text.toLowerCase()
  let a
  let b
  let business = /iş\s*gün/.test(t)
  let m = t.match(/(\d+)\s*[-–]\s*(\d+)\s*(?:iş\s*)?gün/)
  if (m) {
    a = Number(m[1])
    b = Number(m[2])
  } else if ((m = t.match(/(\d+)\s*(?:iş\s*)?gün/))) {
    a = b = Number(m[1])
  } else if (/\d+\s*saat/.test(t)) {
    a = b = 1
    business = true
  } else return null
  if (!a || !b) return null
  const add = (n) => {
    const d = new Date()
    while (n > 0) {
      d.setDate(d.getDate() + 1)
      if (!business || (d.getDay() !== 0 && d.getDay() !== 6)) n -= 1
    }
    return d
  }
  const f = (d) => d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
  return a === b ? f(add(a)) : `${f(add(Math.min(a, b)))} – ${f(add(Math.max(a, b)))}`
}
