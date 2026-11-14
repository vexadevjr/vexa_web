import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cookie, ShieldCheck, Zap, BarChart3 } from 'lucide-react'
import Button from './Button.jsx'
import { getConsent, saveConsent } from '../lib/consent.js'
import { siteConfig } from '../config/siteConfig.js'

const OPTIONS = [
  { key: 'necessary', icon: ShieldCheck, title: 'Zorunlu', text: 'Oturumunuzu açık tutar ve bu tercihinizi hatırlar. Site bunlar olmadan çalışamaz.', locked: true },
  { key: 'functional', icon: Zap, title: 'İşlevsel', text: 'Site içeriğini tarayıcınızda saklayarak sayfanın bir sonraki ziyarette anında açılmasını sağlar.' },
  { key: 'analytics', icon: BarChart3, title: 'Analitik', text: 'Hangi sayfaların ilgi gördüğünü ölçmek için ziyaretinizi (sayfa, IP, tarayıcı) kaydeder. Reklam için kullanılmaz.' },
]

function Toggle({ on, locked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={locked}
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 shrink-0 rounded-full transition-colors ${on ? 'bg-vx-accent' : 'bg-vx-line'} ${locked ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  )
}

export default function CookieBanner() {
  const needs = getConsent() === null
  const [open, setOpen] = useState(false) // mounted
  const [visible, setVisible] = useState(false) // animated in
  const [manage, setManage] = useState(false)
  const [choice, setChoice] = useState(() => getConsent() || { functional: false, analytics: false })

  // first visit: appears softly after the page has settled instead of popping in with the load
  useEffect(() => {
    if (!needs) return undefined
    const t = setTimeout(() => setOpen(true), 1600)
    return () => clearTimeout(t)
  }, [needs])

  useEffect(() => {
    const show = () => {
      setChoice(getConsent() || { functional: false, analytics: false })
      setManage(true)
      setOpen(true)
    }
    window.addEventListener('vx-open-consent', show)
    return () => window.removeEventListener('vx-open-consent', show)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    return () => cancelAnimationFrame(id)
  }, [open])

  if (!open) return null

  const done = (c) => {
    saveConsent(c)
    setVisible(false)
    setTimeout(() => {
      setOpen(false)
      setManage(false)
    }, 600)
  }

  return (
    <div
      role="dialog"
      aria-label="Çerez tercihleri"
      className={`fixed inset-x-0 bottom-0 z-[70] border-t border-vx-line bg-vx-surface/95 backdrop-blur-xl shadow-[0_-24px_60px_-20px_rgba(0,0,0,0.8)] transition-all duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
    >
      <div className="mx-auto max-w-5xl px-5 py-6 sm:py-7 flex flex-col items-center text-center">
        <span className="grid place-items-center w-11 h-11 rounded-xl bg-vx-accent/20 text-vx-accent-soft"><Cookie className="w-5 h-5" /></span>
        <h2 className="mt-3 text-[17px] font-semibold text-white">Çerez tercihleriniz</h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-vx-muted">
          Siteyi çalıştırmak için zorunlu çerezleri, deneyimi hızlandırmak ve ziyaretleri anlamak için isteğe bağlı olanları kullanıyoruz. Ayrıntılar için{' '}
          <Link to={siteConfig.routes.cookies} className="font-semibold text-vx-accent-text underline underline-offset-2 hover:text-white">Çerez Politikası</Link>’nı inceleyin.
        </p>

        {manage && (
          <ul className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 w-full text-left">
            {OPTIONS.map(({ key, icon: Icon, title, text, locked }) => (
              <li key={key} className="flex items-start gap-3 p-4 rounded-xl bg-vx-card border border-vx-line">
                <Icon className="w-4 h-4 mt-1 shrink-0 text-vx-accent-text" />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-white">{title}{locked && <span className="ml-2 text-[11px] font-normal text-vx-muted">Her zaman açık</span>}</div>
                  <p className="mt-1 text-[12px] leading-relaxed text-vx-muted">{text}</p>
                </div>
                <Toggle label={title} locked={locked} on={locked ? true : Boolean(choice[key])} onChange={(v) => setChoice((c) => ({ ...c, [key]: v }))} />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {manage ? (
            <Button size="md" onClick={() => done(choice)}>Seçimlerimi Kaydet</Button>
          ) : (
            <Button size="md" onClick={() => done({ functional: true, analytics: true })}>Tümünü Kabul Et</Button>
          )}
          <Button size="md" variant="secondary" onClick={() => done({ functional: false, analytics: false })}>Sadece Zorunlu</Button>
          {!manage && (
            <button type="button" onClick={() => setManage(true)} className="h-11 px-4 text-[14px] font-semibold text-vx-accent-soft hover:text-white">
              Tercihleri Yönet
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
