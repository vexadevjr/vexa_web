'use strict'
// Validators for every editable content block. Each returns the cleaned value, or undefined if invalid.
const { text, url, internalPath, bool, arr } = require('./sanitize')

const ICONS = ['lock', 'shield', 'clock', 'refresh']
const SERVICE_ICONS = ['discord', 'code', 'server', 'settings']
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : null)

const validators = {
  faq: (v) =>
    arr(v, 50, (i) => {
      const o = obj(i)
      const q = o && text(o.q, 200)
      const a = o && text(o.a, 2000, true)
      return q && a ? { q, a } : undefined
    }),

  portfolio: (v) =>
    arr(v, 40, (i, idx) => {
      const o = obj(i)
      if (!o) return undefined
      const title = text(o.title, 120)
      if (!title) return undefined
      return {
        id: text(o.id, 30) || `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
        title,
        category: text(o.category, 40),
        client: text(o.client, 120),
        result: text(o.result, 400),
        tags: arr(o.tags, 8, (t) => text(t, 30) || undefined) || [],
        sample: bool(o.sample),
      }
    }),

  contact: (v) => {
    const o = obj(v)
    if (!o) return undefined
    return { email: text(o.email, 120), discord: text(o.discord, 120), hours: text(o.hours, 300), location: text(o.location, 120) }
  },

  links: (v) => {
    const o = obj(v)
    if (!o) return undefined
    const out = {}
    for (const k of ['discord', 'demoServer', 'support', 'payment', 'github', 'youtube', 'x']) {
      const u = url(o[k])
      if (u === null) return undefined // reject the whole block: only https links are allowed
      out[k] = u
    }
    return out
  },

  guarantees: (v) =>
    arr(v, 8, (i) => {
      const o = obj(i)
      const title = o && text(o.title, 100)
      const body = o && text(o.text, 500, true)
      return title && body ? { icon: ICONS.includes(o.icon) ? o.icon : 'shield', title, text: body } : undefined
    }),

  steps: (v) =>
    arr(v, 8, (i) => {
      const o = obj(i)
      const title = o && text(o.title, 100)
      const desc = o && text(o.desc, 400, true)
      return title && desc ? { title, desc } : undefined
    }),

  serviceCards: (v) =>
    arr(v, 8, (i) => {
      const o = obj(i)
      const title = o && text(o.title, 80)
      const to = o && internalPath(o.to)
      const desc = o && text(o.desc, 300)
      return title && to && desc ? { title, icon: SERVICE_ICONS.includes(o.icon) ? o.icon : 'settings', to, desc } : undefined
    }),

  announcement: (v) => {
    const o = obj(v)
    if (!o) return undefined
    const link = o.link ? internalPath(o.link) || url(o.link) : ''
    if (link === null) return undefined
    return { enabled: bool(o.enabled), text: text(o.text, 300), link: link || '' }
  },
}

const CONTENT_KEYS = Object.keys(validators)

module.exports = { validators, CONTENT_KEYS }
