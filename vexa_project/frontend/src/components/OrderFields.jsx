import { useRef, useState } from 'react'
import { Eye, EyeOff, ImagePlus, ShieldCheck } from 'lucide-react'
import Field, { inputCls } from './Field.jsx'
import { api } from '../lib/api.js'
import { shrinkImage } from '../lib/image.js'
import { ORDER_FIELD_PRESETS, labelOf } from '../config/orderFields.js'

function LogoInput({ value, onChange }) {
  const input = useRef(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  async function pick(e) {
    const f = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!f) return
    setBusy(true)
    setErr('')
    try {
      if (!/^image\/(jpeg|png|webp|gif)$/.test(f.type)) throw new Error('Yalnızca JPG, PNG veya WebP seçin.')
      const data = await shrinkImage(f, 512, 900000)
      const r = await api.uploadOrderLogo(data)
      onChange(r.url)
    } catch (e2) {
      setErr(e2.message || 'Yükleme başarısız.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="flex items-center gap-4">
      <button type="button" onClick={() => input.current && input.current.click()} disabled={busy} className="relative w-20 h-20 shrink-0 overflow-hidden rounded-2xl border border-dashed border-vx-line bg-vx-surface grid place-items-center text-vx-muted hover:text-white hover:border-vx-accent-text/60 transition-colors" aria-label="Logo yükle">
        {value ? <img src={value} alt="Yüklenen logo" className="absolute inset-0 w-full h-full object-cover" /> : <ImagePlus className="w-6 h-6" />}
      </button>
      <div className="text-[13px] text-vx-muted">
        <button type="button" onClick={() => input.current && input.current.click()} disabled={busy} className="font-semibold text-vx-accent-text hover:text-white">{busy ? 'Yükleniyor…' : value ? 'Logoyu değiştir' : 'Logo yükle'}</button>
        {value && <button type="button" onClick={() => onChange('')} className="ml-3 text-rose-300 hover:text-rose-200">Kaldır</button>}
        {err && <div className="text-rose-400">{err}</div>}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={pick} />
    </div>
  )
}

// Extra questions an admin configured for this product (Discord server id, bot token, bot name, logo, invite link, custom ones).
export default function OrderFields({ product, values, onChange, errors }) {
  const defs = product.orderFields || []
  const [show, setShow] = useState(false)
  if (!defs.length) return null
  const hasToken = defs.some((d) => d.key === 'botToken')

  return (
    <fieldset className="sm:col-span-2 rounded-2xl border border-vx-line bg-vx-surface/60 p-4 space-y-4">
      <legend className="px-2 text-[13px] font-bold uppercase tracking-wide text-vx-accent-text">Kurulum bilgileri</legend>
      {defs.map((d) => {
        const p = ORDER_FIELD_PRESETS[d.key]
        const label = `${labelOf(d)}${d.required ? ' *' : ''}`
        const err = errors[`f_${d.key}`]
        const v = values[d.key] || ''
        if (p && p.type === 'image') {
          return (
            <Field key={d.key} label={label} error={err}>
              <LogoInput value={v} onChange={(x) => onChange(d.key, x)} />
              {p.hint && <span className="block mt-1.5 text-[12px] text-vx-muted">{p.hint}</span>}
            </Field>
          )
        }
        const secret = p && p.type === 'secret'
        return (
          <Field key={d.key} label={label} error={err}>
            <div className="relative">
              <input
                className={`${inputCls} ${secret ? 'pr-12 font-mono' : ''}`}
                type={secret && !show ? 'password' : 'text'}
                value={v}
                onChange={(e) => onChange(d.key, e.target.value)}
                placeholder={p ? p.placeholder : ''}
                autoComplete="off"
                spellCheck="false"
                maxLength={secret ? 120 : 300}
              />
              {secret && (
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-vx-muted hover:text-white" aria-label={show ? 'Gizle' : 'Göster'}>
                  {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              )}
            </div>
            {p && p.hint && <span className="block mt-1.5 text-[12px] text-vx-muted">{p.hint}</span>}
          </Field>
        )
      })}
      {hasToken && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[12px] leading-relaxed text-emerald-100">
          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-300" />
          <span>Bot token yalnızca botunuzu sunucunuza kurmak için kullanılır; <b>şifreli olarak saklanır</b> ve sipariş teslim edildiğinde veya iptal edildiğinde <b>otomatik silinir</b>. Güvenliğiniz için teslimden sonra tokenı Discord Developer Portal’dan yenilemenizi öneririz. Token’ı destek mesajlarında veya herkese açık yerlerde paylaşmayın.</span>
        </div>
      )}
    </fieldset>
  )
}
