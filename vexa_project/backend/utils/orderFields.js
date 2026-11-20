'use strict'
const { str } = require('./validate')
const { encrypt } = require('./secretBox')

const INVITE = /^https:\/\/(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\/[A-Za-z0-9-]{2,32}\/?$/
const MEDIA = /^\/api\/media\/[a-f0-9]{24}$/

// Order-form fields an admin can switch on per product. `secret` values are encrypted at rest and purged after delivery/cancellation.
const PRESETS = {
  discordUsername: { label: 'Discord Kullanıcı Adı', check: (v) => (v.length >= 2 && v.length <= 40) || 'Discord kullanıcı adınızı girin (2-40 karakter).' },
  discordServerId: { label: 'Discord Sunucu ID', check: (v) => /^\d{17,20}$/.test(v) || 'Geçerli bir Discord sunucu ID girin (17-20 haneli sayı).' },
  botToken: {
    label: 'Discord Bot Token',
    secret: true,
    check: (v) => (v.length >= 50 && v.length <= 120 && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(v)) || 'Geçerli bir bot token girin (Discord Developer Portal → Bot → Reset Token).',
  },
  botName: { label: 'Discord Bot Adı', check: (v) => (v.length >= 2 && v.length <= 32) || 'Bot adı 2-32 karakter olmalıdır.' },
  botLogo: { label: 'Discord Bot Logosu', check: (v) => MEDIA.test(v) || 'Lütfen bir logo fotoğrafı yükleyin.' },
  serverInvite: { label: 'Discord Sunucu Linki', check: (v) => INVITE.test(v) || 'Geçerli bir davet linki girin (https://discord.gg/...).' },
}
const CUSTOM = /^custom_[0-2]$/

// Validates an admin-supplied definition list: [{ key, required, label? }]
function normalizeDefs(input) {
  if (!Array.isArray(input)) return null
  const seen = new Set()
  const out = []
  for (const d of input.slice(0, 8)) {
    if (!d || typeof d !== 'object') continue
    const key = String(d.key || '')
    if (seen.has(key)) continue
    if (PRESETS[key]) out.push({ key, required: d.required === true, label: '' })
    else if (CUSTOM.test(key)) {
      const label = str(d.label, 60)
      if (label) out.push({ key, required: d.required === true, label })
    } else continue
    seen.add(key)
  }
  return out
}

// Validates the customer's answers against the product's definitions.
// Returns { fields: [{ key, label, value, secret }], errors: { f_<key>: message } }
function parseOrderFields(defs, input) {
  const fields = []
  const errors = {}
  const given = input && typeof input === 'object' ? input : {}
  for (const d of defs || []) {
    const preset = PRESETS[d.key]
    const label = preset ? preset.label : d.label
    const raw = given[d.key]
    const value = typeof raw === 'string' ? str(raw, preset && preset.secret ? 200 : 300).trim() : ''
    if (!value) {
      if (d.required) errors[`f_${d.key}`] = `${label} zorunludur.`
      continue
    }
    if (preset) {
      const r = preset.check(value)
      if (r !== true) {
        errors[`f_${d.key}`] = r
        continue
      }
    }
    fields.push({ key: d.key, label, value: preset && preset.secret ? encrypt(value) : value, secret: Boolean(preset && preset.secret) })
  }
  return { fields, errors }
}

// what customers / lists may see: secrets never leave the server
const publicFields = (fields) =>
  (fields || []).map((f) => ({ key: f.key, label: f.label, secret: f.secret, value: f.secret ? '' : f.value, provided: Boolean(f.value) }))

module.exports = { PRESETS, normalizeDefs, parseOrderFields, publicFields }
