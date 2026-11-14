'use strict'
const net = require('net')

// Real visitor IP behind Cloudflare / Render proxies. Priority:
//   CLIENT_IP_HEADER (your own override) -> CF-Connecting-IP -> True-Client-IP -> X-Real-IP -> right-most X-Forwarded-For -> socket
// (the right-most X-Forwarded-For entry is the one added by the platform's own proxy, so a visitor cannot forge it.)
const clean = (v) => {
  if (!v) return ''
  let ip = String(v).trim().replace(/^::ffff:/, '')
  if (ip.startsWith('[')) ip = ip.slice(1, ip.indexOf(']'))
  if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(ip)) ip = ip.split(':')[0]
  return net.isIP(ip) ? ip : ''
}

function clientIp(req) {
  const h = req.headers
  const custom = process.env.CLIENT_IP_HEADER ? clean(h[process.env.CLIENT_IP_HEADER.toLowerCase()]) : ''
  if (custom) return custom
  const direct = clean(h['cf-connecting-ip']) || clean(h['true-client-ip']) || clean(h['x-real-ip'])
  if (direct) return direct
  const xff = String(h['x-forwarded-for'] || '').split(',').map(clean).filter(Boolean)
  if (xff.length) return xff[xff.length - 1]
  return clean(req.socket && req.socket.remoteAddress) || clean(req.ip) || 'unknown'
}

module.exports = { clientIp }
