import { useCallback, useEffect, useMemo, useState } from 'react'
import { LayoutDashboard, Package, FileText, MessageSquare, ShoppingBag, Star, Users, LogOut, Menu, X, ShieldCheck } from 'lucide-react'
import { admin } from '../../lib/adminApi.js'
import { AdminContext, Btn, TextField, Card } from './ui.jsx'
import Dashboard from './Dashboard.jsx'
import Products from './Products.jsx'
import Content from './Content.jsx'
import Tickets from './Tickets.jsx'
import { Orders, Reviews, Customers } from './Lists.jsx'
import logo from '../../assets/vexstar-logo.png'

const TABS = [
  { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
  { id: 'products', label: 'Ürünler & Fiyatlar', icon: Package },
  { id: 'content', label: 'Site İçeriği & SSS', icon: FileText },
  { id: 'tickets', label: 'Destek Talepleri', icon: MessageSquare, badge: 'openTickets' },
  { id: 'orders', label: 'Siparişler', icon: ShoppingBag, badge: 'newOrders' },
  { id: 'reviews', label: 'Yorumlar', icon: Star, badge: 'pendingReviews' },
  { id: 'users', label: 'Müşteriler', icon: Users },
]
const SCREENS = { dashboard: Dashboard, products: Products, content: Content, tickets: Tickets, orders: Orders, reviews: Reviews, users: Customers }

function Login({ onDone }) {
  const [cfg, setCfg] = useState(null)
  const [form, setForm] = useState({ email: '', password: '', code: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    admin.config().then(setCfg).catch(() => setCfg({ enabled: true, totp: false }))
  }, [])

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await admin.login(form)
      onDone()
    } catch (err) {
      setError(err.message)
      setForm((f) => ({ ...f, password: '', code: '' }))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm p-8 rounded-2xl bg-vx-card border border-vx-line space-y-5" autoComplete="off">
        <div className="flex flex-col items-center">
          <img src={logo} alt="" className="w-16 h-auto" />
          <h1 className="mt-3 text-lg font-semibold text-white">Yönetim Paneli</h1>
          <p className="text-[12px] text-vx-muted">Yalnızca yetkili kişiler içindir.</p>
        </div>
        {cfg && !cfg.enabled ? (
          <p className="text-[13px] text-amber-300">Yönetim paneli bu sunucuda etkin değil. ADMIN_EMAIL ve ADMIN_PASSWORD ortam değişkenlerini tanımlayın.</p>
        ) : (
          <>
            <TextField label="E-posta" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} max={254} />
            <TextField label="Şifre" type="password" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} max={200} />
            {cfg && cfg.totp && <TextField label="Doğrulama kodu (6 haneli)" value={form.code} onChange={(v) => setForm((f) => ({ ...f, code: v.replace(/\D/g, '') }))} max={6} placeholder="123456" />}
            {error && (
              <p role="alert" className="text-[13px] text-rose-400">
                {error}
              </p>
            )}
            <Btn type="submit" disabled={busy || !form.email || !form.password} className="w-full h-11">
              {busy ? 'Kontrol ediliyor…' : 'Giriş Yap'}
            </Btn>
          </>
        )}
      </form>
    </div>
  )
}

export default function AdminApp() {
  const [phase, setPhase] = useState('checking') // checking | login | in
  const [tab, setTab] = useState(() => (TABS.some((t) => `#${t.id}` === window.location.hash) ? window.location.hash.slice(1) : 'dashboard'))
  const [menu, setMenu] = useState(false)
  const [counts, setCounts] = useState({})

  useEffect(() => {
    document.title = 'Yönetim · Vexstar'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  useEffect(() => {
    admin.me().then(() => setPhase('in')).catch(() => setPhase('login'))
  }, [])

  const authLost = useCallback(() => setPhase('login'), [])
  const refreshCounts = useCallback(() => {
    admin.overview().then(setCounts).catch(() => {})
  }, [])
  useEffect(() => {
    if (phase !== 'in') return undefined
    refreshCounts()
    const id = setInterval(refreshCounts, 60000)
    return () => clearInterval(id)
  }, [phase, refreshCounts])

  const ctx = useMemo(() => ({ authLost, refreshCounts, counts, goTo: (id) => go(id) }), [authLost, refreshCounts, counts]) // eslint-disable-line react-hooks/exhaustive-deps

  function go(id) {
    setTab(id)
    setMenu(false)
    window.history.replaceState(null, '', `#${id}`)
    window.scrollTo(0, 0)
  }

  async function logout() {
    try {
      await admin.logout()
    } catch (e) {
      /* session cookie is cleared server-side; ignore network errors */
    }
    setPhase('login')
  }

  if (phase === 'checking') return <div className="min-h-screen grid place-items-center text-vx-muted text-sm">Yükleniyor…</div>
  if (phase === 'login') return <Login onDone={() => setPhase('in')} />

  const Screen = SCREENS[tab] || Dashboard

  return (
    <AdminContext.Provider value={ctx}>
      <div className="min-h-screen text-white">
        <aside className={`fixed inset-y-0 left-0 z-40 w-[230px] flex flex-col bg-vx-surface border-r border-vx-line transition-transform duration-300 ${menu ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
          <button onClick={() => setMenu(false)} className="lg:hidden absolute top-3 right-3 text-vx-muted" aria-label="Kapat">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 px-5 pt-6 pb-5">
            <img src={logo} alt="" className="w-10 h-auto" />
            <div>
              <div className="text-[15px] font-bold tracking-wide">VEXSTAR</div>
              <div className="text-[10px] tracking-[0.25em] text-vx-muted">YÖNETİM</div>
            </div>
          </div>
          <nav className="px-3 space-y-1 flex-1 overflow-y-auto" aria-label="Yönetim menüsü">
            {TABS.map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                onClick={() => go(id)}
                className={`w-full flex items-center gap-3 h-11 px-3 rounded-xl text-[13px] font-medium transition-colors ${tab === id ? 'bg-vx-accent text-white' : 'text-vx-muted hover:text-white hover:bg-vx-card'}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {badge && counts[badge] > 0 && <span className="min-w-5 h-5 px-1.5 grid place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">{counts[badge]}</span>}
              </button>
            ))}
          </nav>
          <div className="p-4 space-y-3 border-t border-vx-line">
            <div className="flex items-center gap-2 text-[11px] text-vx-muted">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Oturum 2 saat geçerli
            </div>
            <Btn variant="ghost" onClick={logout} className="w-full">
              <LogOut className="w-4 h-4" /> Çıkış Yap
            </Btn>
          </div>
        </aside>
        {menu && <div className="fixed inset-0 z-30 bg-black/70 lg:hidden" onClick={() => setMenu(false)} />}

        <main className="lg:ml-[230px] px-4 sm:px-8 py-6 space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenu(true)} className="lg:hidden w-10 h-10 grid place-items-center rounded-xl bg-vx-card border border-vx-line" aria-label="Menü">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">{TABS.find((t) => t.id === tab).label}</h1>
          </div>
          <Screen />
        </main>
      </div>
    </AdminContext.Provider>
  )
}
