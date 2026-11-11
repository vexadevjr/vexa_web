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

export function deliveryLabel(product) {
  if (!product.deliveryDays) return 'Kapsama göre'
  return `${product.deliveryDays} iş günü`
}

// accent/case-insensitive text for searching ("muzik" matches "Müzik")
export const norm = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ıİ]/g, 'i')
    .toLowerCase()

export function productPath(p) {
  if (p.category === 'discord-bot') return `${routes.bots}#${p.slug}`
  if (p.category === 'web') return `${routes.web}#${p.slug}`
  return `${routes.contact}?konu=${encodeURIComponent(p.name)}`
}

export const dateLabel = (iso) =>
  new Date(iso).toLocaleDateString(siteConfig.currency.locale, { day: '2-digit', month: 'long', year: 'numeric' })
