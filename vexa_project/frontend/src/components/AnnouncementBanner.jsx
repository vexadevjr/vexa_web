import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Flame, Megaphone, TriangleAlert } from 'lucide-react'
import { useSite } from '../context/SiteContext.jsx'

// Four looks: gradient + readable text colour.
const STYLES = {
  kampanya: { icon: Flame, wrap: 'from-orange-500 via-rose-500 to-fuchsia-600', glow: 'shadow-[0_10px_30px_-14px_rgba(244,63,94,0.9)]', dark: false },
  bilgi: { icon: Megaphone, wrap: 'from-violet-600 via-indigo-600 to-sky-600', glow: 'shadow-[0_10px_30px_-14px_rgba(99,102,241,0.9)]', dark: false },
  uyari: { icon: TriangleAlert, wrap: 'from-amber-300 via-amber-400 to-orange-400', glow: 'shadow-[0_10px_30px_-14px_rgba(245,158,11,0.9)]', dark: true },
  basari: { icon: CheckCircle2, wrap: 'from-emerald-500 via-teal-500 to-cyan-600', glow: 'shadow-[0_10px_30px_-14px_rgba(16,185,129,0.9)]', dark: false },
}

const pad = (n) => String(n).padStart(2, '0')

// the announcement, or null when it is off / past its end time (re-evaluates by itself when the end time passes)
export function useActiveAnnouncement() {
  const { announcement } = useSite()
  const [, tick] = useState(0)
  const end = announcement && announcement.endsAt ? new Date(announcement.endsAt).getTime() : 0
  useEffect(() => {
    if (!end) return undefined
    const ms = end - Date.now()
    if (ms <= 0) return undefined
    const id = setTimeout(() => tick((n) => n + 1), Math.min(ms + 300, 2 ** 31 - 1))
    return () => clearTimeout(id)
  }, [end])
  if (!announcement || !announcement.enabled || !(announcement.text || announcement.title)) return null
  if (end && end <= Date.now()) return null
  return announcement
}

function Countdown({ endsAt }) {
  const end = new Date(endsAt).getTime()
  const [left, setLeft] = useState(end - Date.now())
  useEffect(() => {
    const id = setInterval(() => setLeft(end - Date.now()), 1000)
    return () => clearInterval(id)
  }, [end])
  const s = Math.max(0, Math.floor(left / 1000))
  const d = Math.floor(s / 86400)
  const clock = `${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
  return <span className="shrink-0 rounded-full bg-black/25 px-2.5 py-1 text-[12px] font-bold leading-none tabular-nums" aria-label="Kalan süre">{d > 0 ? `${d}g ` : ''}{clock}</span>
}

// Sits in the middle of the navbar, so it stays visible while the page scrolls.
export default function AnnouncementPill({ data, className = '' }) {
  if (!data) return null
  const t = STYLES[data.style] || STYLES.bilgi
  const Icon = t.icon
  const cls = `group relative flex items-center gap-2.5 h-11 max-w-full min-w-0 overflow-hidden rounded-full bg-gradient-to-r ${t.wrap} ${t.glow} ${t.dark ? 'text-zinc-900' : 'text-white'} pl-1.5 pr-3 sm:pr-4 ${className}`
  const body = (
    <>
      <span aria-hidden="true" className="shimmer-line" />
      <span className={`relative grid place-items-center w-8 h-8 shrink-0 rounded-full ${t.dark ? 'bg-black/10' : 'bg-white/20'}`}><Icon className="w-4 h-4" /></span>
      <span className="relative min-w-0 flex-1 truncate text-[13px] leading-none">
        {data.title && <b className="font-extrabold">{data.title}</b>}
        {data.title && data.text && <span className="mx-1.5 opacity-60">•</span>}
        {data.text && <span className="font-medium opacity-95">{data.text}</span>}
      </span>
      {data.endsAt && <span className="relative hidden sm:block"><Countdown endsAt={data.endsAt} /></span>}
      {data.link && (
        <span className={`relative hidden lg:inline-flex shrink-0 items-center gap-1 h-7 px-3 rounded-full text-[12px] font-bold ${t.dark ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}`}>
          {data.linkText || 'İncele'} <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      )}
    </>
  )
  const title = [data.title, data.text].filter(Boolean).join(' - ')
  if (data.link && data.link.startsWith('/')) return <Link to={data.link} title={title} className={cls}>{body}</Link>
  if (data.link) return <a href={data.link} target="_blank" rel="noopener noreferrer" title={title} className={cls}>{body}</a>
  return <div title={title} className={cls}>{body}</div>
}
