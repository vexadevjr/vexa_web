'use strict'
const crypto = require('crypto')
const AuditLog = require('../models/AuditLog')
const config = require('../config/appConfig')
const { clientIp } = require('../utils/clientIp')

const SEP = '\u241f'
const hashOf = (d) => crypto.createHash('sha256').update([d.prevHash, d.seq, new Date(d.at).toISOString(), d.actor, d.ip, d.category, d.action, d.summary, d.details].join(SEP)).digest('hex')

// long text is shortened so one log entry can never grow without limit
const clip = (v, n = 300) => (typeof v === 'string' && v.length > n ? `${v.slice(0, n)}… (+${v.length - n})` : v)
const show = (v) => (Array.isArray(v) ? `[${v.length} öğe]` : v && typeof v === 'object' ? '{…}' : clip(v === undefined ? null : v, 120))

// { field: { onceki, yeni } } for the fields that really changed
function diff(before, after, keys) {
  const out = {}
  for (const k of keys || Object.keys(after)) {
    const a = before ? before[k] : undefined
    const b = after[k]
    if (b === undefined || JSON.stringify(a ?? null) === JSON.stringify(b ?? null)) continue
    const img = k === 'images'
    out[k] = img ? { onceki: `${(a || []).length} görsel`, yeni: `${(b || []).length} görsel` } : { onceki: Array.isArray(a) ? a.map((x) => clip(typeof x === 'string' ? x : JSON.stringify(x), 120)) : clip(a ?? null), yeni: Array.isArray(b) ? b.map((x) => clip(typeof x === 'string' ? x : JSON.stringify(x), 120)) : clip(b ?? null) }
  }
  return out
}
const diffText = (d, labels = {}) => Object.entries(d).map(([k, v]) => `${labels[k] || k}: ${show(v.onceki)} → ${show(v.yeni)}`).join(', ')

let chain = Promise.resolve() // entries are written one after another, so the hash chain never forks
async function write(entry) {
  for (let i = 0; i < 6; i += 1) {
    const last = await AuditLog.findOne().sort({ seq: -1 }).select('seq hash').lean()
    const doc = { ...entry, seq: (last ? last.seq : 0) + 1, at: new Date(), prevHash: last ? last.hash : 'GENESIS' }
    doc.hash = hashOf(doc)
    try {
      await AuditLog.create(doc)
      console.log(`[audit] #${doc.seq} ${doc.action} ${doc.hash.slice(0, 12)}`) // second copy in the platform logs
      return
    } catch (e) {
      if (e && e.code === 11000) continue // another instance took this number: try the next one
      throw e
    }
  }
}

// Never throws: a logging problem must not break the admin's action, but it is reported loudly.
function record(req, category, action, summary, details = {}, actor) {
  let json = ''
  try {
    json = JSON.stringify(details)
    if (json.length > 12000) json = JSON.stringify({ not: 'Çok büyük, kısaltıldı', ozet: json.slice(0, 4000) })
  } catch (e) {
    json = '{}'
  }
  const entry = {
    actor: actor || config.admin.email || 'admin',
    ip: clientIp(req),
    ua: String(req.headers['user-agent'] || '').slice(0, 200),
    category,
    action,
    summary: clip(summary, 500),
    details: json === '{}' ? '' : json,
  }
  chain = chain.then(() => write(entry)).catch((err) => console.error('[audit] KAYIT YAZILAMADI:', err.message, entry.action))
  return chain
}

async function verify() {
  let prev = 'GENESIS'
  let seq = 0
  let count = 0
  for await (const d of AuditLog.find().sort({ seq: 1 }).lean().cursor()) {
    seq += 1
    if (d.seq !== seq) return { ok: false, count, brokenAt: seq, reason: 'Eksik kayıt (sıra numarası atlıyor).' }
    if (d.prevHash !== prev || hashOf(d) !== d.hash) return { ok: false, count, brokenAt: d.seq, reason: 'Kayıt değiştirilmiş.' }
    prev = d.hash
    count += 1
  }
  return { ok: true, count, head: prev.slice(0, 16) }
}

module.exports = { record, verify, diff, diffText, clip }
