'use strict'

const EMAIL = /^[^\s@<>]{1,64}@[^\s@<>]{1,190}\.[^\s@<>]{2,}$/

// Coerce to a bounded plain string. Non-strings (objects such as {"$gt": ""}) become ''.
function str(value, max, multiline = false) {
  if (typeof value !== 'string') return ''
  const control = multiline ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g
  return value.replace(control, ' ').replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim().slice(0, max)
}

// rules: { field: { type?: 'email'|'password', required?, min?, max?, multiline?, oneOf?, msg? } }
function validate(rules, body) {
  const value = {}
  const errors = {}
  const src = body && typeof body === 'object' ? body : {}

  for (const [key, rule] of Object.entries(rules)) {
    const raw = src[key]

    if (rule.type === 'password') {
      // passwords are never trimmed or altered
      if (typeof raw !== 'string' || raw.length < (rule.min || 8) || raw.length > 128) {
        errors[key] = `Şifre ${rule.min || 8}-128 karakter arasında olmalıdır.`
      } else {
        value[key] = raw
      }
      continue
    }

    const v = rule.type === 'email' ? str(raw, 254).toLowerCase() : str(raw, rule.max || 200, rule.multiline)

    if (!v) {
      if (rule.required) errors[key] = rule.msg || 'Bu alan zorunludur.'
      continue
    }
    if (rule.type === 'email' && !EMAIL.test(v)) {
      errors[key] = 'Geçerli bir e-posta adresi girin.'
      continue
    }
    if (rule.min && v.length < rule.min) {
      errors[key] = `En az ${rule.min} karakter olmalıdır.`
      continue
    }
    if (rule.oneOf && !rule.oneOf.includes(v)) {
      errors[key] = 'Geçersiz seçim.'
      continue
    }
    value[key] = v
  }

  return { value, errors, ok: Object.keys(errors).length === 0 }
}

function fail(res, errors) {
  return res.status(400).json({ message: 'Lütfen form bilgilerini kontrol edin.', errors })
}

// accent/case-insensitive helper for in-memory catalog search
const norm = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ıİ]/g, 'i')
    .toLowerCase()

module.exports = { str, validate, fail, norm }
