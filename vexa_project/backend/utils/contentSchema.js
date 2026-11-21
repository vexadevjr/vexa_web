'use strict'
// Validators for every editable content block. Each returns the cleaned value, or undefined if invalid.
const { text, url, internalPath, bool, arr } = require('./sanitize')

const ICONS = ['lock', 'shield', 'clock', 'refresh']
const SERVICE_ICONS = ['discord', 'code', 'server', 'settings']
const MEDIA_URL = /^\/api\/media\/[a-f0-9]{24}$/
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
    arr(v, 60, (i) => {
      const o = obj(i)
      if (!o) return undefined
      const title = text(o.title, 120)
      if (!title) return undefined
      const link = o.link ? url(o.link) : ''
      return {
        id: text(o.id, 30) || `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
        title,
        category: text(o.category, 40),
        client: text(o.client, 120),
        result: text(o.result, 600, true),
        tags: arr(o.tags, 8, (t) => text(t, 30) || undefined) || [],
        images: arr(o.images, 8, (m) => (typeof m === 'string' && MEDIA_URL.test(m) ? m : undefined)) || [],
        link: link || '',
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
    for (const k of ['discord', 'support', 'payment', 'github', 'youtube', 'x']) {
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

  categories: (v) => {
    const BUILTIN = { 'discord-bot': '/discord-hizmetleri', web: '/web-gelistirme' }
    const ICON_IDS = ['discord', 'code', 'server', 'package', 'sparkles', 'shield', 'cpu', 'gamepad']
    const seen = new Set()
    const list = arr(v, 12, (i) => {
      const o = obj(i)
      const id = o && text(o.id, 40)
      const name = o && text(o.name, 40)
      if (!id || !name || !/^[a-z0-9-]{2,40}$/.test(id) || seen.has(id)) return undefined
      seen.add(id)
      return {
        id,
        path: BUILTIN[id] || `/kategori/${id}`, // computed on the server, never taken from the client
        name,
        icon: ICON_IDS.includes(o.icon) ? o.icon : 'package',
        title: text(o.title, 100) || name,
        description: text(o.description, 400, true),
        seoTitle: text(o.seoTitle, 70),
        seoDescription: text(o.seoDescription, 170),
      }
    })
    return list && list.length ? list : undefined
  },

  legal: (v) => {
    const o = obj(v)
    if (!o) return undefined
    const out = {}
    for (const [k, max] of [['unvan', 150], ['adres', 300], ['vergiDairesi', 80], ['vergiNo', 40], ['mersis', 40], ['eposta', 120], ['telefon', 40], ['kep', 120], ['yetkili', 100]]) out[k] = text(o[k], max)
    return out
  },

  announcement: (v) => {
    const o = obj(v)
    if (!o) return undefined
    const link = o.link ? internalPath(o.link) || url(o.link) : ''
    if (link === null) return undefined
    const STYLES = ['kampanya', 'bilgi', 'uyari', 'basari']
    // optional end time: the banner counts down to it and hides itself afterwards
    const end = o.endsAt ? new Date(o.endsAt) : null
    const endsAt = end && !Number.isNaN(end.getTime()) ? end.toISOString() : ''
    return { enabled: bool(o.enabled), title: text(o.title, 80), text: text(o.text, 300), link: link || '', linkText: text(o.linkText, 30), style: STYLES.includes(o.style) ? o.style : 'bilgi', endsAt }
  },
}

const CONTENT_KEYS = Object.keys(validators)

module.exports = { validators, CONTENT_KEYS, MEDIA_URL }
