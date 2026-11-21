import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Flame, Megaphone, TriangleAlert, X } from 'lucide-react'

// Four looks. Each one defines the gradient, accent colours of the badge / icon tile and the button.
const STYLES = {
  kampanya: { label: 'KAMPANYA', icon: Flame, wrap: 'from-orange-500 via-rose-500 to-fuchsia-600', glow: 'shadow-[0_22px_60px_-26px_rgba(244,63,94,0.85)]', btn: 'bg-white text-rose-600 hover:bg-rose-50', dark: false },
  bilgi: { label: 'DUYURU', icon: Megaphone, wrap: 'from-violet-600 via-indigo-600 to-sky-600', glow: 'shadow-[0_22px_60px_-26px_rgba(99,102,241,0.85)]', btn: 'bg-white text-violet-700 hover:bg-violet-50', dark: false },
  uyari: { label: 'ÖNEMLİ', icon: TriangleAlert, wrap: 'from-amber-300 via-amber-400 to-orange-400', glow: 'shadow-[0_22px_60px_-26px_rgba(245,158,11,0.8)]', btn: 'bg-zinc-900 text-white hover:bg-zinc-800', dark: true },
  basari: { label: 'YENİ', icon: CheckCircle2, wrap: 'from-emerald-500 via-teal-500 to-cyan-600', glow: 'shadow-[0_22px_60px_-26px_rgba(16,185,129,0.8)]', btn: 'bg-white text-emerald-700 hover:bg-emerald-50', dark: false },
}

const pad = (n) => String(n).padStart(2, '0')
function parts(ms) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

// Real countdown to the end time the admin typed in (the banner disappears by itself when it ends).
function Countdown({ endsAt, dark }) {
  const end = new Date(endsAt).getTime()
  const [left, setLeft] = useState(end - Date.now())
  useEffect(() => {
    const id = setInterval(() => setLeft(end - Date.now()), 1000)
    return () => clearInterval(id)
  }, [end])
  const t = parts(left)
  const cells = [...(t.d > 0 ? [[t.d, 'gün']] : []), [pad(t.h), 'saat'], [pad(t.m), 'dk'], [pad(t.s), 'sn']]
  return (
    <div className="flex items-center gap-1.5" aria-label="Kalan süre">
      {cells.map(([v, l]) => (
        <div key={l} className={`min-w-[46px] rounded-lg px-2 py-1 text-center ${dark ? 'bg-black/15' : 'bg-black/25'}`}>
          <div className="text-[17px] font-extrabold leading-none tabular-nums">{v}</div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-80">{l}</div>
        </div>
      ))}
    </div>
  )
}

export default function AnnouncementBanner({ data, preview = false }) {
  const key = data ? `vx-ann-${data.title || ''}${data.text || ''}${data.endsAt || ''}`.slice(0, 140) : ''
  const [hidden, setHidden] = useState(() => {
    if (preview) return false
    try {
      return sessionStorage.getItem(key) === '1'
    } catch (e) {
      return false
    }
  })
  const [expired, setExpired] = useState(() => Boolean(data && data.endsAt && new Date(data.endsAt).getTime() <= Date.now()))
  // hide the moment the campaign ends, even while the page stays open
  useEffect(() => {
    if (!data || !data.endsAt) return undefined
    const ms = new Date(data.endsAt).getTime() - Date.now()
    if (ms <= 0) {
      setExpired(true)
      return undefined
    }
    setExpired(false)
    const id = setTimeout(() => setExpired(true), Math.min(ms + 500, 2 ** 31 - 1))
    return () => clearTimeout(id)
  }, [data && data.endsAt]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!data || !data.enabled || !(data.text || data.title) || hidden || (expired && !preview)) return null

  const t = STYLES[data.style] || STYLES.bilgi
  const Icon = t.icon
  const ink = t.dark ? 'text-zinc-900' : 'text-white'
  const close = () => {
    setHidden(true)
    try {
      sessionStorage.setItem(key, '1')
    } catch (e) {
      /* storage unavailable */
    }
  }
  const label = data.linkText || 'İncele'
  const btnCls = `shrink-0 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-[14px] font-bold shadow-lg transition-all hover:-translate-y-0.5 w-full sm:w-auto ${t.btn}`
  const inner = <>{label} <ArrowRight className="w-4 h-4" /></>
  const btn = data.link ? (
    data.link.startsWith('/') ? <Link to={data.link} className={btnCls}>{inner}</Link> : <a href={data.link} target="_blank" rel="noopener noreferrer" className={btnCls}>{inner}</a>
  ) : null

  return (
    <div role="status" className={`vx-ann-in relative overflow-hidden rounded-2xl bg-gradient-to-r ${t.wrap} ${t.glow} ${ink}`}>
      <span className="shimmer-line" aria-hidden="true" />
      {/* soft light blobs for depth */}
      <span aria-hidden="true" className="pointer-events-none absolute -left-10 -top-16 w-56 h-56 rounded-full bg-white/20 blur-3xl" />
      <span aria-hidden="true" className="pointer-events-none absolute right-10 -bottom-20 w-64 h-64 rounded-full bg-black/10 blur-3xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 px-4 sm:px-6 py-4 pr-12 sm:pr-14">
        <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
          <span className={`hidden sm:grid place-items-center w-12 h-12 shrink-0 rounded-2xl ring-1 ${t.dark ? 'bg-black/10 ring-black/10' : 'bg-white/15 ring-white/25'}`}>
            <Icon className="w-6 h-6" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[10.5px] font-extrabold tracking-[0.16em] ${t.dark ? 'bg-black/15' : 'bg-black/25'}`}>
                <span className="relative flex w-1.5 h-1.5"><span className="absolute inline-flex w-full h-full rounded-full bg-current opacity-70 animate-ping" /><span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-current" /></span>
                {t.label}
              </span>
              <Icon className="w-4 h-4 sm:hidden" />
            </div>
            {data.title && <div className="mt-1.5 text-[17px] sm:text-[20px] font-extrabold leading-tight tracking-tight">{data.title}</div>}
            {data.text && <div className="mt-1 text-[13.5px] sm:text-[14.5px] leading-snug opacity-95">{data.text}</div>}
          </div>
        </div>
        {data.endsAt && <Countdown endsAt={data.endsAt} dark={t.dark} />}
        {btn}
      </div>

      {!preview && (
        <button onClick={close} aria-label="Duyuruyu kapat" className={`absolute right-2.5 top-2.5 grid place-items-center w-8 h-8 rounded-full transition-colors ${t.dark ? 'bg-black/10 hover:bg-black/25' : 'bg-black/15 hover:bg-black/30'}`}>
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
