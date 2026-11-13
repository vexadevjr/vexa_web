import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, Package, Settings, LifeBuoy, LogOut } from 'lucide-react'
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
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
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
        <div role="menu" className="absolute right-0 top-14 z-40 w-[260px] rounded-2xl bg-vx-card border border-vx-line shadow-xl shadow-black/50 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-4 border-b border-vx-line">
            <Avatar user={user} className="w-10 h-10 text-[15px] shrink-0" />
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-white truncate">{user.name}</div>
              <div className="text-[12px] text-vx-muted truncate">{user.email}</div>
            </div>
          </div>
          <div className="p-2">
            {items.map(({ label, icon: Icon, to }) => (
              <Link key={to} to={to} role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-3 h-11 px-3 rounded-xl text-[14px] text-zinc-100 hover:text-white hover:bg-vx-surface transition-colors">
                <Icon className="w-[18px] h-[18px] text-vx-accent-text" /> {label}
              </Link>
            ))}
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false)
                logout()
                navigate(routes.home)
              }}
              className="w-full flex items-center gap-3 h-11 px-3 rounded-xl text-[14px] text-rose-300 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-[18px] h-[18px]" /> Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
