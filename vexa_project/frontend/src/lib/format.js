import { siteConfig } from '../config/siteConfig.js'

const { symbol, locale } = siteConfig.currency
const { routes } = siteConfig

export function formatPrice(value) {
  return `${Number(value).toLocaleString(locale)} ${symbol}`
}

export function priceLabel(product) {
  if (product.price == null) return 'Teklif alın'
  return `${product.priceFrom ? 'Başlangıç ' : ''}${formatPrice(product.price)}`
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
