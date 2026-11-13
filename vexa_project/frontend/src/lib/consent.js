// Real first-party cookie: vx_consent = {v, f (functional), a (analytics)}, kept for 180 days.
const NAME = 'vx_consent'
const CACHE_KEYS = ['vx_site_cache']

export function getConsent() {
  try {
    const m = document.cookie.split('; ').find((c) => c.startsWith(`${NAME}=`))
    if (!m) return null
    const v = JSON.parse(decodeURIComponent(m.slice(NAME.length + 1)))
    return v && v.v === 1 ? { functional: v.f === 1, analytics: v.a === 1 } : null
  } catch (e) {
    return null
  }
}

export const hasConsent = (kind) => {
  const c = getConsent()
  return Boolean(c && c[kind])
}

export function saveConsent({ functional, analytics }) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  const value = encodeURIComponent(JSON.stringify({ v: 1, f: functional ? 1 : 0, a: analytics ? 1 : 0 }))
  document.cookie = `${NAME}=${value}; Max-Age=${180 * 24 * 60 * 60}; Path=/; SameSite=Lax${secure}`
  if (!functional) clearCaches()
  window.dispatchEvent(new Event('vx-consent'))
}

export function clearCaches() {
  try {
    CACHE_KEYS.forEach((k) => localStorage.removeItem(k))
  } catch (e) {
    /* storage unavailable */
  }
}

// functional cache: site content + products, so a reload shows the last known data instantly
export function readCache() {
  if (!hasConsent('functional')) return null
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEYS[0]))
  } catch (e) {
    return null
  }
}
export function writeCache(data) {
  if (!hasConsent('functional')) return
  try {
    localStorage.setItem(CACHE_KEYS[0], JSON.stringify(data))
  } catch (e) {
    /* storage full or unavailable */
  }
}

export const openConsentSettings = () => window.dispatchEvent(new Event('vx-open-consent'))
