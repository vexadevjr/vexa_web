import { useEffect, useState } from 'react'
import { Cookie, ShieldCheck, Zap, BarChart3 } from 'lucide-react'
import Button from './Button.jsx'
import { getConsent, saveConsent } from '../lib/consent.js'

const OPTIONS = [
  { key: 'necessary', icon: ShieldCheck, title: 'Zorunlu', text: 'Oturumunuzu açık tutar ve bu tercihinizi hatırlar. Site bunlar olmadan çalışamaz.', locked: true },
  { key: 'functional', icon: Zap, title: 'İşlevsel', text: 'Site içeriğini ve ürünleri tarayıcınızda saklayarak sayfanın bir sonraki ziyarette anında açılmasını sağlar.' },
  { key: 'analytics', icon: BarChart3, title: 'Analitik', text: 'Hangi sayfaların ilgi gördüğünü ölçmek için ziyaretinizi (sayfa, IP adresi, tarayıcı bilgisi) kaydeder. Reklam amacıyla kullanılmaz.' },
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
  const [open, setOpen] = useState(() => getConsent() === null)
  const [manage, setManage] = useState(false)
  const [choice, setChoice] = useState(() => getConsent() || { functional: false, analytics: false })

  useEffect(() => {
    const show = () => {
      setChoice(getConsent() || { functional: false, analytics: false })
      setManage(true)
      setOpen(true)
    }
    window.addEventListener('vx-open-consent', show)
    return () => window.removeEventListener('vx-open-consent', show)
  }, [])

  if (!open) return null

  const done = (c) => {
    saveConsent(c)
    setOpen(false)
    setManage(false)
  }

  return (
    <div role="dialog" aria-label="Çerez tercihleri" className="fixed z-[70] bottom-4 left-4 right-4 sm:right-auto sm:w-[440px] rounded-2xl bg-vx-card border border-vx-line shadow-2xl shadow-black/60 p-5">
      <div className="flex items-start gap-3">
        <span className="grid place-items-center w-10 h-10 shrink-0 rounded-xl bg-vx-accent/20 text-vx-accent-soft"><Cookie className="w-5 h-5" /></span>
        <div>
          <h2 className="text-[15px] font-semibold text-white">Çerez tercihleriniz</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-vx-muted">
            Siteyi çalıştırmak için zorunlu çerezleri, deneyimi hızlandırmak ve ziyaretleri anlamak için isteğe bağlı olanları kullanıyoruz. Seçimi istediğiniz zaman değiştirebilirsiniz.
          </p>
        </div>
      </div>

      {manage && (
        <ul className="mt-4 space-y-3">
          {OPTIONS.map(({ key, icon: Icon, title, text, locked }) => (
            <li key={key} className="flex items-start gap-3 p-3 rounded-xl bg-vx-surface border border-vx-line">
              <Icon className="w-4 h-4 mt-1 shrink-0 text-vx-accent-text" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-white">{title}{locked && <span className="ml-2 text-[11px] font-normal text-vx-muted">Her zaman açık</span>}</div>
                <p className="mt-0.5 text-[12px] leading-relaxed text-vx-muted">{text}</p>
              </div>
              <Toggle label={title} locked={locked} on={locked ? true : Boolean(choice[key])} onChange={(v) => setChoice((c) => ({ ...c, [key]: v }))} />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {manage ? (
          <Button size="sm" onClick={() => done(choice)}>Seçimlerimi Kaydet</Button>
        ) : (
          <Button size="sm" onClick={() => done({ functional: true, analytics: true })}>Tümünü Kabul Et</Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => done({ functional: false, analytics: false })}>Sadece Zorunlu</Button>
        {!manage && (
          <button type="button" onClick={() => setManage(true)} className="h-10 px-3 text-[13px] font-semibold text-vx-accent-soft hover:text-white">
            Tercihleri Yönet
          </button>
        )}
      </div>
    </div>
  )
}
