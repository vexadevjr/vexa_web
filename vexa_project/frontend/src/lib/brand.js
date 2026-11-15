import { siteConfig } from '../config/siteConfig.js'

const kebab = (s) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())

function hexToTriplet(hex) {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}

// Publishes siteConfig.brand.colors as CSS variables (--vx-bg, --vx-card, ...).
export function applyBrand() {
  const root = document.documentElement
  for (const [key, hex] of Object.entries(siteConfig.brand.colors)) {
    root.style.setProperty(`--vx-${kebab(key)}`, hexToTriplet(hex))
  }
}
