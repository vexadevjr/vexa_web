import { useState } from 'react'
import Modal from './Modal.jsx'
import Button from './Button.jsx'
import Field, { inputCls } from './Field.jsx'
import TrustBadges from './TrustBadges.jsx'
import { DiscordIcon, GoogleIcon } from './Icons.jsx'
import { useApp } from '../context/AppContext.jsx'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function AuthModal() {
  const { authTab, authNotice, closeAuth, login, register } = useApp()
  const [tab, setTab] = useState(authTab)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)

  const isRegister = tab === 'register'
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const switchTab = (next) => {
    setTab(next)
    setErrors({})
    setServerError('')
  }

  async function submit(e) {
    e.preventDefault()
    const next = {}
    if (isRegister && form.name.trim().length < 2) next.name = 'Ad soyad girin.'
    if (!EMAIL.test(form.email.trim())) next.email = 'Geçerli bir e-posta adresi girin.'
    if (form.password.length < (isRegister ? 8 : 1)) next.password = isRegister ? 'Şifre en az 8 karakter olmalıdır.' : 'Şifrenizi girin.'
    setErrors(next)
    setServerError('')
    if (Object.keys(next).length) return

    setBusy(true)
    try {
      if (isRegister) await register({ name: form.name, email: form.email, password: form.password })
      else await login({ email: form.email, password: form.password })
    } catch (err) {
      setErrors(err.errors || {})
      setServerError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal title="Müşteri Paneli" onClose={closeAuth}>
      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-vx-surface border border-vx-line">
        {[
          ['login', 'Giriş Yap'],
          ['register', 'Kayıt Ol'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => switchTab(key)}
            className={`h-9 rounded-lg text-[13px] font-semibold transition-colors ${tab === key ? 'bg-vx-accent text-white' : 'text-vx-muted hover:text-white'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} noValidate className="mt-5 space-y-4">
        {isRegister && (
          <Field label="Ad soyad" error={errors.name}>
            <input className={inputCls} value={form.name} onChange={set('name')} autoComplete="name" maxLength={80} />
          </Field>
        )}
        <Field label="E-posta" error={errors.email}>
          <input className={inputCls} type="email" value={form.email} onChange={set('email')} autoComplete="email" maxLength={254} />
        </Field>
        <Field label="Şifre" error={errors.password}>
          <input
            className={inputCls}
            type="password"
            value={form.password}
            onChange={set('password')}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            maxLength={128}
          />
        </Field>

        {authNotice && !serverError && (
          <p role="alert" className="text-[13px] text-amber-300">
            {authNotice}
          </p>
        )}
        {serverError && (
          <p role="alert" className="text-[13px] text-rose-400">
            {serverError}
          </p>
        )}

        <Button type="submit" disabled={busy} variant="flat" className="w-full">
          {busy ? 'Lütfen bekleyin…' : isRegister ? 'Hesap Oluştur' : 'Giriş Yap'}
        </Button>
        <TrustBadges compact />
      </form>

      <div className="mt-5 flex items-center gap-3 text-[12px] text-vx-muted">
        <span className="h-px flex-1 bg-vx-line" />
        veya
        <span className="h-px flex-1 bg-vx-line" />
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href="/api/auth/discord"
          className="h-11 inline-flex items-center justify-center gap-2.5 rounded-xl text-[13px] font-semibold text-white bg-[#5865F2] hover:bg-[#4752c4] transition-colors"
        >
          <DiscordIcon className="w-5 h-5" /> Discord ile {isRegister ? 'kayıt ol' : 'giriş yap'}
        </a>
        <a
          href="/api/auth/google"
          className="h-11 inline-flex items-center justify-center gap-2.5 rounded-xl text-[13px] font-semibold text-slate-900 bg-white hover:bg-slate-100 transition-colors"
        >
          <GoogleIcon className="w-5 h-5" /> Google ile {isRegister ? 'kayıt ol' : 'giriş yap'}
        </a>
      </div>
    </Modal>
  )
}
