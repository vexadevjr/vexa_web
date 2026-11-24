'use strict'
const { loadSiteConfig } = require('../data/catalog')
const Setting = require('../models/Setting')
const { isConnected } = require('../config/db')

// Member / online counts of the community server, pulled from Discord and cached for 10 minutes.
//  1) With DISCORD_BOT_TOKEN + DISCORD_GUILD_ID (the bot must be in the server): GET /guilds/{id}?with_counts=true
//  2) Otherwise the public invite endpoint of the server link set in the admin panel (no token needed)
const TTL = 10 * 60 * 1000
let cache = { at: 0, value: null }

async function getJson(url, headers) {
  const r = await fetch(url, { headers, signal: AbortSignal.timeout(6000) })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

async function inviteCode() {
  const cfg = await loadSiteConfig()
  let link = (cfg.links || {}).discord || ''
  if (isConnected()) {
    try {
      const row = await Setting.findOne({ key: 'content:links' }).lean()
      if (row && row.value && row.value.discord) link = row.value.discord
    } catch (e) {
      /* use default */
    }
  }
  const m = String(link).match(/discord(?:app)?\.(?:gg|com\/invite)\/([A-Za-z0-9-]{2,32})/)
  return m ? m[1] : ''
}

async function fetchStats() {
  const token = process.env.DISCORD_BOT_TOKEN
  const guild = process.env.DISCORD_GUILD_ID
  if (token && /^\d{17,20}$/.test(guild || '')) {
    const g = await getJson(`https://discord.com/api/v10/guilds/${guild}?with_counts=true`, { Authorization: `Bot ${token}` })
    return { members: g.approximate_member_count, online: g.approximate_presence_count, name: g.name }
  }
  const code = await inviteCode()
  if (!code) return null
  const i = await getJson(`https://discord.com/api/v10/invites/${code}?with_counts=true`)
  return { members: i.approximate_member_count, online: i.approximate_presence_count, name: i.guild && i.guild.name }
}

async function getDiscordStats() {
  if (cache.value && Date.now() - cache.at < TTL) return cache.value
  try {
    const s = await fetchStats()
    const value = s && Number.isFinite(s.members) ? { available: true, members: s.members, online: Number.isFinite(s.online) ? s.online : null, name: s.name || '' } : { available: false }
    cache = { at: Date.now(), value }
    return value
  } catch (err) {
    console.error('[discord] stats failed:', err.message)
    if (cache.value) return cache.value // keep the last known numbers
    cache = { at: Date.now() - TTL + 60 * 1000, value: { available: false } } // retry in a minute
    return cache.value
  }
}

module.exports = { getDiscordStats }
