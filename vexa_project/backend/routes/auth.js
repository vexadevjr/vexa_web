'use strict'
const crypto = require('crypto')
const router = require('express').Router()
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const config = require('../config/appConfig')
const requireDb = require('../middleware/requireDb')
const { sign, requireAuth } = require('../middleware/auth')
const { auth: authLimiter } = require('../middleware/limiters')
const { validate, fail, str } = require('../utils/validate')
const cookies = require('../utils/cookies')

const registerRules = {
  name: { required: true, min: 2, max: 80 },
  email: { type: 'email', required: true },
  password: { type: 'password', min: 8 },
}
const loginRules = {
  email: { type: 'email', required: true },
  password: { type: 'password', min: 1 },
}

const publicUser = (u) => ({ id: String(u._id), name: u.name, email: u.email, role: u.role })

// compared against when the e-mail is unknown (or the account has no password), so response time does not reveal it
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', config.bcryptRounds)

router.post('/register', requireDb, authLimiter, async (req, res, next) => {
  try {
    const { value, errors, ok } = validate(registerRules, req.body)
    if (!ok) return fail(res, errors)

    if (await User.exists({ email: value.email })) {
      return res.status(409).json({ message: 'Bu e-posta adresi ile zaten bir hesap var.' })
    }
    const passwordHash = await bcrypt.hash(value.password, config.bcryptRounds)
    const user = await User.create({ name: value.name, email: value.email, passwordHash, emailVerified: false })
    res.status(201).json({ token: sign(user), user: publicUser(user) })
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ message: 'Bu e-posta adresi ile zaten bir hesap var.' })
    next(err)
  }
})

router.post('/login', requireDb, authLimiter, async (req, res, next) => {
  try {
    const { value, errors, ok } = validate(loginRules, req.body)
    if (!ok) return fail(res, errors)

    const user = await User.findOne({ email: value.email }).select('+passwordHash')
    const hash = user && user.passwordHash ? user.passwordHash : DUMMY_HASH
    const match = await bcrypt.compare(value.password, hash)
    if (!user || !user.passwordHash || !match) {
      return res.status(401).json({ message: 'E-posta veya şifre hatalı. Google/Discord ile kayıt olduysanız o seçeneği kullanın.' })
    }
    res.json({ token: sign(user), user: publicUser(user) })
  } catch (err) {
    next(err)
  }
})

router.get('/me', requireDb, requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.auth.sub)
    if (!user) return res.status(401).json({ message: 'Oturum geçersiz.' })
    res.json({ user: publicUser(user) })
  } catch (err) {
    next(err)
  }
})

// ───────────────────────── Google / Discord (OAuth 2.0 authorization-code flow) ─────────────────────────

const PROVIDERS = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    profileUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
    scope: 'openid email profile',
    extra: { prompt: 'select_account' },
    idField: 'googleId',
    profile: (p) => ({ id: p.sub, email: p.email, verified: p.email_verified === true, name: p.name || p.given_name }),
  },
  discord: {
    authUrl: 'https://discord.com/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    profileUrl: 'https://discord.com/api/users/@me',
    scope: 'identify email',
    extra: { prompt: 'none' },
    idField: 'discordId',
    profile: (p) => ({ id: p.id, email: p.email, verified: p.verified === true, name: p.global_name || p.username }),
  },
}

const STATE_COOKIE = 'vx_oauth'
const codes = new Map() // one-time login codes: code -> { userId, exp }
const redirectUri = (name) => `${config.publicUrl}/api/auth/${name}/callback`
const configured = (name) => Boolean(config.oauth[name] && config.oauth[name].id && config.oauth[name].secret)
const bounce = (res, reason) => res.redirect(`/?auth_error=${encodeURIComponent(reason)}`)

router.get('/providers', (req, res) => {
  res.json({ google: configured('google'), discord: configured('discord') })
})

router.get('/:provider(google|discord)', authLimiter, (req, res) => {
  const name = req.params.provider
  if (!configured(name) || !require('../config/db').isConnected()) return bounce(res, 'not_configured')
  const p = PROVIDERS[name]
  const state = crypto.randomBytes(24).toString('hex')
  res.setHeader('Set-Cookie', cookies.serialize(STATE_COOKIE, `${name}.${state}`, { maxAge: 600, path: '/api/auth', sameSite: 'Lax', secure: config.isProd }))
  const q = new URLSearchParams({
    client_id: config.oauth[name].id,
    redirect_uri: redirectUri(name),
    response_type: 'code',
    scope: p.scope,
    state,
    ...p.extra,
  })
  res.redirect(`${p.authUrl}?${q}`)
})

async function fetchJson(url, options) {
  const r = await fetch(url, { ...options, signal: AbortSignal.timeout(8000) })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

router.get('/:provider(google|discord)/callback', authLimiter, async (req, res) => {
  const name = req.params.provider
  const p = PROVIDERS[name]
  const saved = cookies.parse(req.headers.cookie)[STATE_COOKIE] || ''
  res.setHeader('Set-Cookie', cookies.serialize(STATE_COOKIE, '', { maxAge: 0, path: '/api/auth', sameSite: 'Lax', secure: config.isProd }))

  try {
    if (!configured(name) || !require('../config/db').isConnected()) return bounce(res, 'not_configured')
    if (req.query.error) return bounce(res, 'cancelled')

    const state = str(req.query.state, 100)
    const code = str(req.query.code, 2000)
    const expected = `${name}.${state}`
    const okState = state && saved.length === expected.length && crypto.timingSafeEqual(Buffer.from(saved), Buffer.from(expected))
    if (!okState || !code) return bounce(res, 'invalid_state')

    const token = await fetchJson(p.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({
        client_id: config.oauth[name].id,
        client_secret: config.oauth[name].secret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri(name),
      }),
    })
    if (!token.access_token) return bounce(res, 'failed')
    const profile = p.profile(await fetchJson(p.profileUrl, { headers: { Authorization: `Bearer ${token.access_token}` } }))

    const email = str(profile.email, 254).toLowerCase()
    if (!profile.id || !email || !profile.verified) return bounce(res, 'email_unverified')
    const displayName = str(profile.name, 80) || email.split('@')[0]

    let user = await User.findOne({ [p.idField]: String(profile.id) })
    if (!user) {
      user = await User.findOne({ email }).select('+passwordHash')
      if (user) {
        // Linking to an existing account. If that account's e-mail was never verified, somebody else may have
        // registered it in advance: drop its password so only the real owner (via Google/Discord) can sign in.
        const update = { [p.idField]: String(profile.id), emailVerified: true }
        if (!user.emailVerified && user.passwordHash) await User.updateOne({ _id: user._id }, { $set: update, $unset: { passwordHash: 1 } })
        else await User.updateOne({ _id: user._id }, { $set: update })
      } else {
        user = await User.create({ name: displayName, email, emailVerified: true, [p.idField]: String(profile.id) })
      }
    }

    const one = crypto.randomBytes(32).toString('hex')
    codes.set(one, { userId: String(user._id), exp: Date.now() + 60000 })
    for (const [k, v] of codes) if (v.exp < Date.now()) codes.delete(k)
    res.redirect(`/?oauth=${one}`)
  } catch (err) {
    console.error(`[oauth:${name}]`, err.message)
    bounce(res, 'failed')
  }
})

// The browser trades the one-time code for a normal session token (the token itself never appears in a URL).
router.post('/exchange', requireDb, authLimiter, async (req, res, next) => {
  try {
    const code = str(req.body && req.body.code, 100)
    const entry = codes.get(code)
    codes.delete(code)
    if (!entry || entry.exp < Date.now()) return res.status(400).json({ message: 'Giriş bağlantısının süresi doldu. Lütfen tekrar deneyin.' })
    const user = await User.findById(entry.userId)
    if (!user) return res.status(400).json({ message: 'Hesap bulunamadı.' })
    res.json({ token: sign(user), user: publicUser(user) })
  } catch (err) {
    next(err)
  }
})

module.exports = router
