'use strict'
const router = require('express').Router()
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const config = require('../config/appConfig')
const requireDb = require('../middleware/requireDb')
const { sign, requireAuth } = require('../middleware/auth')
const { auth: authLimiter } = require('../middleware/limiters')
const { validate, fail } = require('../utils/validate')

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

// compared against when the e-mail is unknown, so response time does not reveal which accounts exist
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', config.bcryptRounds)

router.post('/register', requireDb, authLimiter, async (req, res, next) => {
  try {
    const { value, errors, ok } = validate(registerRules, req.body)
    if (!ok) return fail(res, errors)

    if (await User.exists({ email: value.email })) {
      return res.status(409).json({ message: 'Bu e-posta adresi ile zaten bir hesap var.' })
    }
    const passwordHash = await bcrypt.hash(value.password, config.bcryptRounds)
    const user = await User.create({ name: value.name, email: value.email, passwordHash })
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
    const match = await bcrypt.compare(value.password, user ? user.passwordHash : DUMMY_HASH)
    if (!user || !match) return res.status(401).json({ message: 'E-posta veya şifre hatalı.' })

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

module.exports = router
