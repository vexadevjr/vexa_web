import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, Package, Settings, LifeBuoy, LogOut, ShieldCheck, ChevronRight } from 'lucide-react'
import Avatar from './Avatar.jsx'
import { useApp } from '../context/AppContext.jsx'
import { siteConfig } from '../config/siteConfig.js'

const { routes } = siteConfig

export default function UserMenu() {
  const { user, checking, openAuth, logout } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    const onScroll = () => setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user && checking) return <span aria-hidden="true" className="w-11 h-11 rounded-full bg-vx-card border border-vx-line animate-pulse" />

  if (!user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => openAuth('login')}
          className="h-11 px-4 sm:px-5 rounded-xl text-[14px] font-semibold text-white border border-vx-line hover:border-vx-accent-text/60 hover:bg-vx-card transition-colors"
        >
          Giriş Yap
        </button>
        <button
          onClick={() => openAuth('register')}
          className="h-11 px-4 sm:px-5 rounded-xl text-[14px] font-semibold text-white bg-vx-accent hover:bg-vx-accent-hover transition-colors"
        >
          Kayıt Ol
        </button>
      </div>
    )
  }

  const items = [
    { label: 'Siparişlerim', icon: Package, to: routes.orders },
    { label: 'Destek Taleplerim', icon: LifeBuoy, to: routes.tickets },
    { label: 'Ayarlar', icon: Settings, to: routes.settings },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Hesap menüsü"
        className={`flex items-center gap-2.5 h-12 pl-1.5 pr-3 sm:pr-4 rounded-full border transition-colors ${open ? 'bg-vx-card border-vx-accent-text/60' : 'bg-vx-surface border-vx-line hover:border-vx-accent-text/50 hover:bg-vx-card'}`}
      >
        <Avatar user={user} className="w-9 h-9 text-[15px]" />
        <span className="hidden sm:block max-w-[150px] truncate text-[14px] font-semibold text-white">{user.name}</span>
        <ChevronDown className={`w-4 h-4 text-vx-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-14 z-40 w-[286px] overflow-hidden rounded-[20px] border border-vx-line bg-vx-card shadow-2xl shadow-black/60">
          <div className="relative overflow-hidden border-b border-vx-line bg-gradient-to-br from-vx-accent/20 via-vx-card to-vx-card px-4 py-4">
            <div className="pointer-events-none absolute -right-8 -top-12 h-28 w-28 rounded-full bg-vx-accent/20 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <Avatar user={user} className="w-12 h-12 text-[16px] shrink-0 ring-2 ring-white/10" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-bold text-white">{user.name}</div>
                <div className="mt-0.5 truncate text-[11px] text-vx-muted">{user.email}</div>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300"><ShieldCheck className="h-3 w-3" /> Hesap aktif</div>
              </div>
            </div>
          </div>
          <div className="p-2">
            <div className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[.16em] text-vx-muted">Hesabım</div>
            {items.map(({ label, icon: Icon, to }) => (
              <Link key={to} to={to} role="menuitem" onClick={() => setOpen(false)} className="group flex items-center gap-3 rounded-xl px-3 h-11 text-[13px] font-medium text-zinc-200 transition-colors hover:bg-vx-surface hover:text-white">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-vx-surface text-vx-accent-text group-hover:bg-vx-line"><Icon className="h-4 w-4" /></span>
                <span className="flex-1">{label}</span><ChevronRight className="h-4 w-4 text-vx-muted opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
            <div className="my-2 border-t border-vx-line" />
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false)
                logout()
                navigate(routes.home)
              }}
              className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[13px] font-semibold text-rose-300 transition-colors hover:bg-rose-500/10"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-500/10"><LogOut className="h-4 w-4" /></span> Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
