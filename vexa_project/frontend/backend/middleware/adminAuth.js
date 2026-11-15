'use strict'
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config/appConfig')
const cookies = require('../utils/cookies')
const { verifyTotp } = require('../utils/totp')

const COOKIE = 'vx_admin'
const COOKIE_PATH = '/api/admin'
const enabled = Boolean(config.admin.email && config.admin.password.length >= 12)
if (!enabled) {
  console.warn('[admin] disabled: set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) to enable /admin')
}

// the admin password only exists as a bcrypt hash in memory
const adminHash = enabled ? bcrypt.hashSync(config.admin.password, config.bcryptRounds) : ''
const DUMMY = bcrypt.hashSync('not-the-admin-password', config.bcryptRounds)
// a different signing key than customer tokens, so a customer JWT can never be used as an admin token
const adminSecret = crypto.createHash('sha256').update(`${config.jwtSecret}:vexstar-admin`).digest('hex')

const sha = (s) => crypto.createHash('sha256').update(String(s)).digest()
const safeEq = (a, b) => crypto.timingSafeEqual(sha(a), sha(b))

// lockout: 5 consecutive failures from one IP -> 15 minutes
const fails = new Map()
const MAX_FAILS = 5
const LOCK_MS = 15 * 60 * 1000
let lastTotpStep = -1

function locked(ip) {
  const f = fails.get(ip)
  return Boolean(f && f.until && f.until > Date.now())
}
function recordFail(ip) {
  const f = fails.get(ip) || { n: 0, until: 0 }
  f.n += 1
  if (f.n >= MAX_FAILS) {
    f.until = Date.now() + LOCK_MS
    f.n = 0
  }
  fails.set(ip, f)
  if (fails.size > 5000) fails.clear()
}

async function checkCredentials({ email, password, code }, ip) {
  if (!enabled) return false
  if (locked(ip)) return 'locked'
  const e = typeof email === 'string' ? email.trim().toLowerCase().slice(0, 254) : ''
  const p = typeof password === 'string' ? password.slice(0, 200) : ''
  // always run bcrypt and every check, so timing does not reveal which part was wrong
  const passOk = await bcrypt.compare(p, adminHash || DUMMY)
  const mailOk = safeEq(e, config.admin.email)
  let totpOk = true
  let step = -1
  if (config.admin.totpSecret) {
    try {
      step = verifyTotp(config.admin.totpSecret, typeof code === 'string' ? code.trim() : '')
    } catch (err) {
      step = -1
    }
    totpOk = step > lastTotpStep
  }
  if (passOk && mailOk && totpOk) {
    if (step > 0) lastTotpStep = step // a one-time code cannot be replayed
    fails.delete(ip)
    return true
  }
  recordFail(ip)
  return false
}

function issue(res) {
  const token = jwt.sign({ aud: 'admin', sub: 'admin' }, adminSecret, {
    algorithm: 'HS256',
    expiresIn: `${config.admin.sessionMinutes}m`,
  })
  res.setHeader(
    'Set-Cookie',
    cookies.serialize(COOKIE, token, {
      maxAge: config.admin.sessionMinutes * 60,
      path: COOKIE_PATH,
      sameSite: 'Strict',
      secure: config.isProd,
    })
  )
}

function clear(res) {
  res.setHeader('Set-Cookie', cookies.serialize(COOKIE, '', { maxAge: 0, path: COOKIE_PATH, sameSite: 'Strict', secure: config.isProd }))
}

function requireAdmin(req, res, next) {
  if (!enabled) return res.status(404).json({ status: 'error', message: 'Not found' })
  const token = cookies.parse(req.headers.cookie)[COOKIE]
  if (!token) return res.status(401).json({ message: 'Oturum gerekli.' })
  try {
    jwt.verify(token, adminSecret, { algorithms: ['HS256'], audience: 'admin' })
  } catch (e) {
    return res.status(401).json({ message: 'Oturum geçersiz veya süresi dolmuş.' })
  }
  // CSRF: state-changing requests must carry a header that a cross-site form/link cannot set
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.headers['x-vx-admin'] !== '1') {
    return res.status(403).json({ message: 'İstek reddedildi.' })
  }
  next()
}

module.exports = { enabled, checkCredentials, issue, clear, requireAdmin, requiresTotp: Boolean(config.admin.totpSecret) }
