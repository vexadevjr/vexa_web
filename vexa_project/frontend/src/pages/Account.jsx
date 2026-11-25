import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { Package, LifeBuoy, Settings, ShieldAlert, ChevronRight, ShieldCheck, UserRound, Mail, KeyRound, ShoppingCart, Wallet, MessageSquare, FileText, Cookie, LogOut, Lock } from 'lucide-react'
import Avatar from '../components/Avatar.jsx'
import Button from '../components/Button.jsx'
import Field, { inputCls } from '../components/Field.jsx'
import Modal from '../components/Modal.jsx'
import OrdersTab from '../components/account/OrdersTab.jsx'
import TicketsTab from '../components/account/TicketsTab.jsx'
import { DiscordIcon, GoogleIcon } from '../components/Icons.jsx'
import { useApp } from '../context/AppContext.jsx'
import { api } from '../lib/api.js'
import { siteConfig } from '../config/siteConfig.js'
import { openConsentSettings } from '../lib/consent.js'
import { formatPrice } from '../lib/format.js'

const { routes } = siteConfig

const GROUPS = [
  { title: 'Hesabım', tabs: [
    { to: routes.profile, label: 'Profilim', icon: UserRound },
    { to: routes.orders, label: 'Siparişlerim', icon: Package },
    { to: routes.tickets, label: 'Destek Taleplerim', icon: LifeBuoy },
  ] },
  { title: 'Hesap ayarları', tabs: [{ to: routes.settings, label: 'Üyelik ve Güvenlik', icon: Settings }] },
]
const TABS = GROUPS.flatMap((g) => g.tabs)
const LEGAL = [
  [routes.kvkk, 'KVKK Aydınlatma Metni'],
  [routes.privacy, 'Gizlilik Politikası'],
  [routes.distance, 'Mesafeli Satış Sözleşmesi'],
  [routes.refund, 'İptal ve İade'],
]

const card = 'rounded-2xl bg-vx-card border border-vx-line'
function Notice({ ok, children }) {
  return <p role={ok ? 'status' : 'alert'} className={`text-[13px] ${ok ? 'text-emerald-400' : 'text-rose-400'}`}>{children}</p>
}

const STATUS = {
  yeni: ['Onay bekliyor', 'border-amber-500/40 bg-amber-500/15 text-amber-300'],
  onaylandi: ['Onaylandı', 'border-sky-500/40 bg-sky-500/15 text-sky-300'],
  hazirlaniyor: ['Hazırlanıyor', 'border-violet-400/40 bg-violet-500/20 text-violet-200'],
  'teslim-edildi': ['Teslim edildi', 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'],
  iptal: ['İptal edildi', 'border-rose-500/40 bg-rose-500/15 text-rose-300'],
}
const when = (iso) => new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

function SectionHead({ title, action }) {
  return <div className="flex items-center justify-between gap-3 border-b border-vx-line px-5 py-4"><h3 className="text-[15px] font-bold text-white">{title}</h3>{action}</div>
}

function ProfileTab() {
  const { user, cart, openCart } = useApp()
  const [orders, setOrders] = useState(null)
  const [tickets, setTickets] = useState(null)
  useEffect(() => {
    let alive = true
    api.myOrders().then((d) => alive && setOrders(d.orders || [])).catch(() => alive && setOrders([]))
    api.myTickets().then((d) => alive && setTickets(d.tickets || [])).catch(() => alive && setTickets([]))
    return () => { alive = false }
  }, [])

  const active = orders ? orders.filter((o) => o.status !== 'teslim-edildi' && o.status !== 'iptal').length : null
  const spent = orders ? orders.filter((o) => o.status !== 'iptal').reduce((a, o) => a + (Number(o.price) || 0), 0) : null
  const openTickets = tickets ? tickets.filter((t) => t.status !== 'kapali').length : null
  const dash = (v, f = (x) => x) => (v == null ? '…' : f(v))

  const stats = [
    { icon: Package, label: 'Toplam sipariş', value: dash(orders && orders.length), to: routes.orders },
    { icon: ShieldCheck, label: 'Devam eden sipariş', value: dash(active), to: routes.orders },
    { icon: Wallet, label: 'Toplam tutar', value: dash(spent, formatPrice), to: routes.orders },
    { icon: MessageSquare, label: 'Açık destek talebi', value: dash(openTickets), to: routes.tickets },
  ]
  const quick = [
    { icon: Package, title: 'Siparişlerim', text: 'Durum ve teslimat takibi', to: routes.orders },
    { icon: LifeBuoy, title: 'Destek taleplerim', text: 'Yanıtları görüntüle', to: routes.tickets },
    { icon: MessageSquare, title: 'Yeni destek talebi', text: 'Bize ulaşın', to: routes.contact },
    { icon: KeyRound, title: 'Şifre ve güvenlik', text: 'Şifre değiştir', to: routes.settings },
  ]
  const login = [user.hasPassword && 'E-posta ve şifre', user.google && 'Google', user.discord && 'Discord'].filter(Boolean)
  const info = [
    ['Ad soyad', user.name],
    ['E-posta', user.email],
    ['Giriş yöntemi', login.join(' · ') || '—'],
    ['Şifre', user.hasPassword ? 'Tanımlı' : 'Tanımlı değil'],
    ['Hesap durumu', 'Aktif'],
  ]
  const recent = orders ? orders.slice(0, 4) : []

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, to }) => (
          <Link key={label} to={to} className={`${card} flex flex-col p-4 transition-colors hover:border-vx-accent-text/40`}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-vx-accent/15 text-vx-accent-text"><Icon className="h-5 w-5" /></span>
            <span className="mt-4 text-[22px] font-black leading-none tabular-nums text-white">{value}</span>
            <span className="mt-1.5 text-[12.5px] text-vx-muted">{label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
        <section className={`${card} flex flex-col overflow-hidden`}>
          <SectionHead title="Son siparişlerim" action={<Link to={routes.orders} className="text-[12.5px] font-semibold text-vx-accent-text hover:text-white">Tümünü gör</Link>} />
          {orders && orders.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center"><Package className="h-9 w-9 text-vx-accent-text" strokeWidth={1.5} /><p className="mt-3 text-[14px] font-semibold text-white">Henüz siparişiniz yok</p><Link to={routes.home} className="mt-3 text-[13px] font-semibold text-vx-accent-text hover:text-white">Hizmetlere göz at</Link></div>
          ) : (
            <ul className="flex-1 divide-y divide-vx-line">
              {!orders && <li className="px-5 py-6 text-[13px] text-vx-muted">Yükleniyor…</li>}
              {recent.map((o) => {
                const [label, tone] = STATUS[o.status] || STATUS.yeni
                return (
                  <li key={o.orderNo}><Link to={routes.orders} className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-vx-surface">
                    <span className="min-w-0"><span className="block truncate text-[14px] font-semibold text-white">{o.productName}</span><span className="block text-[12px] text-vx-muted">{o.orderNo} · {when(o.createdAt)}</span></span>
                    <span className="shrink-0 text-right"><span className="block text-[14px] font-bold tabular-nums text-white">{formatPrice(o.price)}</span><span className={`mt-1 inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-semibold ${tone}`}>{label}</span></span>
                  </Link></li>
                )
              })}
            </ul>
          )}
        </section>

        <section className={`${card} flex flex-col overflow-hidden`}>
          <SectionHead title="Hızlı işlemler" />
          <div className="grid flex-1 grid-cols-1 gap-3 p-4 sm:grid-cols-2">
            {quick.map(({ icon: Icon, title, text, to }) => (
              <Link key={title} to={to} className="group flex items-center gap-3 rounded-xl border border-vx-line bg-vx-surface/60 p-3.5 transition-colors hover:border-vx-accent-text/40 hover:bg-vx-surface">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-vx-accent/15 text-vx-accent-text"><Icon className="h-[18px] w-[18px]" /></span>
                <span className="min-w-0 flex-1"><span className="block truncate text-[13.5px] font-semibold text-white">{title}</span><span className="block truncate text-[12px] text-vx-muted">{text}</span></span>
                <ChevronRight className="h-4 w-4 shrink-0 text-vx-muted transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
            <button type="button" onClick={openCart} className="group flex items-center gap-3 rounded-xl border border-vx-line bg-vx-surface/60 p-3.5 text-left transition-colors hover:border-vx-accent-text/40 hover:bg-vx-surface sm:col-span-2">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-vx-accent/15 text-vx-accent-text"><ShoppingCart className="h-[18px] w-[18px]" /></span>
              <span className="min-w-0 flex-1"><span className="block text-[13.5px] font-semibold text-white">Sepetim</span><span className="block text-[12px] text-vx-muted">{cart.length ? `${cart.length} hizmet sipariş bekliyor` : 'Sepetiniz boş'}</span></span>
              <ChevronRight className="h-4 w-4 shrink-0 text-vx-muted transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
        <section className={`${card} overflow-hidden`}>
          <SectionHead title="Üyelik bilgilerim" action={<Link to={routes.settings} className="text-[12.5px] font-semibold text-vx-accent-text hover:text-white">Düzenle</Link>} />
          <dl className="divide-y divide-vx-line">
            {info.map(([k, v]) => <div key={k} className="grid grid-cols-[130px_minmax(0,1fr)] gap-3 px-5 py-3 text-[13px]"><dt className="text-vx-muted">{k}</dt><dd className="break-words font-medium text-zinc-100">{v}</dd></div>)}
          </dl>
        </section>
        <section className={`${card} overflow-hidden`}>
          <SectionHead title="Hesap güvenliği" />
          <ul className="divide-y divide-vx-line text-[13px]">
            <li className="flex items-center gap-3 px-5 py-3.5"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${user.hasPassword ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}><Lock className="h-4 w-4" /></span><span className="flex-1"><span className="block font-semibold text-white">Hesap şifresi</span><span className="text-[12px] text-vx-muted">{user.hasPassword ? 'E-posta ve şifre ile giriş yapabilirsiniz.' : 'Şifre ekleyerek giriş seçeneklerinizi artırın.'}</span></span><Link to={routes.settings} className="text-[12.5px] font-semibold text-vx-accent-text hover:text-white">{user.hasPassword ? 'Değiştir' : 'Ekle'}</Link></li>
            <li className="flex items-center gap-3 px-5 py-3.5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-vx-accent/15 text-vx-accent-text"><GoogleIcon className="h-4 w-4" /></span><span className="flex-1"><span className="block font-semibold text-white">Google</span><span className="text-[12px] text-vx-muted">{user.google ? 'Hesabınız bağlı.' : 'Bağlı değil.'}</span></span></li>
            <li className="flex items-center gap-3 px-5 py-3.5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-vx-accent/15 text-vx-accent-text"><DiscordIcon className="h-4 w-4" /></span><span className="flex-1"><span className="block font-semibold text-white">Discord</span><span className="text-[12px] text-vx-muted">{user.discord ? 'Hesabınız bağlı.' : 'Bağlı değil.'}</span></span></li>
            <li className="flex items-center gap-3 px-5 py-3.5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-vx-accent/15 text-vx-accent-text"><Mail className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block font-semibold text-white">Bildirim e-postası</span><span className="block truncate text-[12px] text-vx-muted">{user.email}</span></span></li>
          </ul>
        </section>
      </div>
    </div>
  )
}

function SettingsTab() {
  const { user, setUser, logout } = useApp()
  const navigate = useNavigate()
  const [name, setName] = useState(user.name)
  const [nameMsg, setNameMsg] = useState(null)
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', again: '' })
  const [pwMsg, setPwMsg] = useState(null)
  const [busy, setBusy] = useState('')
  const [del, setDel] = useState(false)
  const [delInput, setDelInput] = useState('')
  const [delErr, setDelErr] = useState('')

  async function saveName(e) {
    e.preventDefault()
    setBusy('name')
    setNameMsg(null)
    try {
      const d = await api.updateProfile({ name })
      setUser(d.user)
      setNameMsg({ ok: true, text: 'Kullanıcı adınız güncellendi.' })
    } catch (err) {
      setNameMsg({ ok: false, text: (err.errors && err.errors.name) || err.message })
    } finally {
      setBusy('')
    }
  }

  async function savePw(e) {
    e.preventDefault()
    setPwMsg(null)
    if (pw.newPassword.length < 8) return setPwMsg({ ok: false, text: 'Yeni şifre en az 8 karakter olmalıdır.' })
    if (pw.newPassword !== pw.again) return setPwMsg({ ok: false, text: 'Şifreler eşleşmiyor.' })
    setBusy('pw')
    try {
      const d = await api.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword })
      setUser(d.user)
      setPw({ currentPassword: '', newPassword: '', again: '' })
      setPwMsg({ ok: true, text: user.hasPassword ? 'Şifreniz değiştirildi.' : 'Şifre eklendi. Artık e-posta ve şifre ile de giriş yapabilirsiniz.' })
    } catch (err) {
      setPwMsg({ ok: false, text: err.message })
    } finally {
      setBusy('')
    }
  }

  async function removeAccount(e) {
    e.preventDefault()
    setBusy('del')
    setDelErr('')
    try {
      await api.deleteAccount(user.hasPassword ? { password: delInput } : { confirm: delInput })
      logout()
      navigate(routes.home)
    } catch (err) {
      setDelErr(err.message)
      setBusy('')
    }
  }

  const setP = (k) => (e) => setPw((p) => ({ ...p, [k]: e.target.value }))

  return (
    <div className="space-y-5 max-w-2xl">
      <form onSubmit={saveName} className={`${card} p-6 space-y-4`}>
        <h2 className="text-[16px] font-semibold text-white">Profil</h2>
        <div className="flex items-center gap-4">
          <Avatar user={user} className="w-16 h-16 text-[24px]" />
          <div className="text-[12px] text-vx-muted leading-relaxed">
            {user.avatar ? 'Profil fotoğrafınız bağlı hesabınızdan (Google / Discord) alınır.' : 'Fotoğraf yoksa adınızın baş harfi gösterilir. Google veya Discord ile giriş yaparsanız fotoğrafınız otomatik gelir.'}
            <div className="mt-2 flex gap-2">
              {user.google && <span className="inline-flex items-center gap-1.5 px-2 h-6 rounded-md bg-vx-surface border border-vx-line text-[11px] text-zinc-100"><GoogleIcon className="w-3.5 h-3.5" /> Google bağlı</span>}
              {user.discord && <span className="inline-flex items-center gap-1.5 px-2 h-6 rounded-md bg-vx-surface border border-vx-line text-[11px] text-zinc-100"><DiscordIcon className="w-3.5 h-3.5" /> Discord bağlı</span>}
            </div>
          </div>
        </div>
        <Field label="Kullanıcı adı"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} /></Field>
        <Field label="E-posta"><input className={`${inputCls} opacity-60`} value={user.email} disabled /></Field>
        {nameMsg && <Notice ok={nameMsg.ok}>{nameMsg.text}</Notice>}
        <Button type="submit" size="sm" disabled={busy === 'name' || name.trim().length < 2 || name.trim() === user.name}>{busy === 'name' ? 'Kaydediliyor…' : 'Kaydet'}</Button>
      </form>

      <form onSubmit={savePw} className={`${card} p-6 space-y-4`}>
        <h2 className="text-[16px] font-semibold text-white">{user.hasPassword ? 'Şifre Değiştir' : 'Şifre Ekle'}</h2>
        {!user.hasPassword && <p className="text-[13px] text-vx-muted">Hesabınızı {user.google ? 'Google' : 'Discord'} ile oluşturdunuz. Bir şifre ekleyerek e-posta ve şifre ile de giriş yapabilirsiniz.</p>}
        {user.hasPassword && <Field label="Mevcut şifre"><input className={inputCls} type="password" autoComplete="current-password" value={pw.currentPassword} onChange={setP('currentPassword')} maxLength={128} /></Field>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Yeni şifre"><input className={inputCls} type="password" autoComplete="new-password" value={pw.newPassword} onChange={setP('newPassword')} maxLength={128} /></Field>
          <Field label="Yeni şifre (tekrar)"><input className={inputCls} type="password" autoComplete="new-password" value={pw.again} onChange={setP('again')} maxLength={128} /></Field>
        </div>
        {pwMsg && <Notice ok={pwMsg.ok}>{pwMsg.text}</Notice>}
        <Button type="submit" size="sm" disabled={busy === 'pw' || !pw.newPassword}>{busy === 'pw' ? 'Kaydediliyor…' : user.hasPassword ? 'Şifreyi Güncelle' : 'Şifre Ekle'}</Button>
      </form>

      <section className={`${card} p-6 border-rose-500/30`}>
        <h2 className="text-[16px] font-semibold text-rose-300 flex items-center gap-2"><ShieldAlert className="w-5 h-5" /> Hesabı Sil</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-vx-muted">Hesabınız ve yorumunuz kalıcı olarak silinir; bu işlem geri alınamaz. Sipariş ve destek kayıtları muhasebe ve hizmet geçmişi için kimliğinizden ayrılmış olarak saklanır.</p>
        <Button size="sm" variant="quiet" className="mt-4 !border-rose-500/50 hover:!bg-rose-600" onClick={() => { setDel(true); setDelInput(''); setDelErr('') }}>Hesabımı Sil</Button>
      </section>

      {del && (
        <Modal title="Hesabı silmek istediğinize emin misiniz?" onClose={() => setDel(false)}>
          <form onSubmit={removeAccount} className="space-y-4">
            <p className="text-[13px] text-vx-muted">{user.hasPassword ? 'Onaylamak için şifrenizi girin.' : `Onaylamak için e-posta adresinizi yazın: ${user.email}`}</p>
            <input className={inputCls} type={user.hasPassword ? 'password' : 'text'} value={delInput} onChange={(e) => setDelInput(e.target.value)} autoComplete="off" maxLength={254} />
            {delErr && <Notice>{delErr}</Notice>}
            <div className="flex gap-3">
              <Button type="submit" size="sm" variant="flat" className="!bg-rose-600 hover:!bg-rose-700" disabled={busy === 'del' || !delInput}>{busy === 'del' ? 'Siliniyor…' : 'Evet, Sil'}</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => setDel(false)}>Vazgeç</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default function Account() {
  const { user, checking, openAuth, logout } = useApp()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  if (!user && checking) return null
  if (!user) {
    return (
      <div className={`${card} max-w-md p-8`}>
        <h1 className="text-xl font-semibold text-white">Hesabım</h1>
        <p className="mt-2 text-[14px] text-vx-muted">Siparişlerinizi, destek taleplerinizi ve ayarlarınızı görmek için giriş yapın.</p>
        <div className="mt-5 flex gap-3">
          <Button size="sm" onClick={() => openAuth('login')}>Giriş Yap</Button>
          <Button size="sm" variant="secondary" onClick={() => openAuth('register')}>Kayıt Ol</Button>
        </div>
      </div>
    )
  }

  const Screen = pathname.startsWith(routes.profile) ? ProfileTab : pathname.startsWith(routes.tickets) ? TicketsTab : pathname.startsWith(routes.settings) ? SettingsTab : OrdersTab
  const title = (TABS.find((t) => pathname.startsWith(t.to)) || TABS[1]).label

  return (
    <div className="space-y-5">
      <section className={`${card} flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7`}>
        <div className="flex min-w-0 items-center gap-4">
          <Avatar user={user} className="h-16 w-16 shrink-0 text-[22px] ring-2 ring-vx-line" />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-white sm:text-2xl">{user.name}</h1>
            <p className="mt-0.5 truncate text-[13px] text-vx-muted">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex h-6 items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 text-[11px] font-semibold text-emerald-300"><ShieldCheck className="h-3 w-3" /> Hesap aktif</span>
              {user.google && <span className="inline-flex h-6 items-center gap-1.5 rounded-md border border-vx-line bg-vx-surface px-2 text-[11px] text-zinc-200"><GoogleIcon className="h-3 w-3" /> Google</span>}
              {user.discord && <span className="inline-flex h-6 items-center gap-1.5 rounded-md border border-vx-line bg-vx-surface px-2 text-[11px] text-zinc-200"><DiscordIcon className="h-3 w-3" /> Discord</span>}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-3"><Button size="sm" variant="secondary" to={routes.orders}><Package className="h-4 w-4" /> Siparişlerim</Button><Button size="sm" to={routes.contact}><MessageSquare className="h-4 w-4" /> Destek al</Button></div>
      </section>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[256px_minmax(0,1fr)]">
        <aside className={`${card} p-3`}>
          <nav aria-label="Hesap menüsü" className="flex gap-1 overflow-x-auto lg:block lg:space-y-4 lg:overflow-visible">
            {GROUPS.map((g) => (
              <div key={g.title} className="flex gap-1 lg:block lg:space-y-1">
                <div className="hidden px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[.16em] text-vx-muted lg:block">{g.title}</div>
                {g.tabs.map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} className={({ isActive }) => `flex h-11 min-w-max items-center gap-3 rounded-xl px-3 text-[13px] font-semibold transition-colors ${isActive ? 'bg-vx-accent text-white' : 'text-zinc-300 hover:bg-vx-surface hover:text-white'}`}>
                    <Icon className="h-4 w-4 shrink-0" /> <span className="flex-1">{label}</span><ChevronRight className="hidden h-4 w-4 opacity-60 lg:block" />
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
          <div className="mt-4 hidden border-t border-vx-line pt-4 lg:block">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[.16em] text-vx-muted">Yasal ve gizlilik</div>
            <ul className="space-y-0.5">
              {LEGAL.map(([to, label]) => <li key={to}><Link to={to} className="flex h-9 items-center gap-3 rounded-lg px-3 text-[12.5px] text-vx-muted transition-colors hover:bg-vx-surface hover:text-white"><FileText className="h-3.5 w-3.5" /> {label}</Link></li>)}
              <li><button type="button" onClick={openConsentSettings} className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left text-[12.5px] text-vx-muted transition-colors hover:bg-vx-surface hover:text-white"><Cookie className="h-3.5 w-3.5" /> Çerez tercihleri</button></li>
            </ul>
            <button type="button" onClick={() => { logout(); navigate(routes.home) }} className="mt-3 flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[13px] font-semibold text-rose-300 transition-colors hover:bg-rose-500/10"><LogOut className="h-4 w-4" /> Çıkış yap</button>
          </div>
        </aside>

        <main className="min-w-0 space-y-5">
          <div className="flex items-center justify-between gap-3 px-1">
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{title}</h2>
            <span className="hidden items-center gap-1.5 text-[12px] text-vx-muted sm:flex"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Güvenli hesap alanı</span>
          </div>
          <Screen />
        </main>
      </div>
    </div>
  )
}
