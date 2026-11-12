import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { Package, LifeBuoy, Settings, Check, X, Plus, ShieldAlert } from 'lucide-react'
import Avatar from '../components/Avatar.jsx'
import Button from '../components/Button.jsx'
import Field, { inputCls } from '../components/Field.jsx'
import Modal from '../components/Modal.jsx'
import TicketThread, { statusLabel } from '../components/TicketThread.jsx'
import { DiscordIcon, GoogleIcon } from '../components/Icons.jsx'
import { useApp } from '../context/AppContext.jsx'
import { api } from '../lib/api.js'
import { siteConfig } from '../config/siteConfig.js'
import { formatPrice, dateLabel } from '../lib/format.js'

const { routes } = siteConfig

const TABS = [
  { to: routes.orders, label: 'Siparişlerim', icon: Package },
  { to: routes.tickets, label: 'Destek Taleplerim', icon: LifeBuoy },
  { to: routes.settings, label: 'Ayarlar', icon: Settings },
]

const card = 'rounded-2xl bg-vx-card border border-vx-line'
const STEPS = [
  ['yeni', 'Alındı'],
  ['onaylandi', 'Onaylandı'],
  ['hazirlaniyor', 'Hazırlanıyor'],
  ['teslim-edildi', 'Teslim edildi'],
]

function Orders() {
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let alive = true
    api.myOrders().then((d) => alive && setOrders(d.orders)).catch((e) => alive && setError(e.message))
    return () => {
      alive = false
    }
  }, [])

  if (error) return <p className="text-[13px] text-rose-400">{error}</p>
  if (!orders) return <p className="text-[13px] text-vx-muted">Yükleniyor…</p>
  if (!orders.length) {
    return (
      <div className={`${card} p-8 text-center`}>
        <Package className="w-10 h-10 mx-auto text-vx-accent-text" strokeWidth={1.5} />
        <p className="mt-3 text-[15px] font-semibold text-white">Henüz siparişiniz yok</p>
        <p className="mt-1 text-[13px] text-vx-muted">Bir hizmet seçtiğinizde siparişinizin her aşamasını buradan takip edebilirsiniz.</p>
        <Button size="sm" to={routes.bots} className="mt-5">Botlara göz at</Button>
      </div>
    )
  }

  return (
    <ul className="space-y-4">
      {orders.map((o) => {
        const idx = STEPS.findIndex(([k]) => k === o.status)
        const cancelled = o.status === 'iptal'
        return (
          <li key={o.orderNo} className={`${card} p-5`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[16px] font-semibold text-white">{o.productName}</div>
                <div className="text-[12px] text-vx-muted mt-0.5">Sipariş no: {o.orderNo} · {dateLabel(o.createdAt)}</div>
              </div>
              <div className="text-[18px] font-black text-white">{formatPrice(o.price)}</div>
            </div>
            {cancelled ? (
              <div className="mt-4 inline-flex items-center gap-2 px-3 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[12px] text-rose-300"><X className="w-4 h-4" /> Sipariş iptal edildi</div>
            ) : (
              <ol className="mt-5 grid grid-cols-4 gap-2">
                {STEPS.map(([k, label], i) => (
                  <li key={k} className="text-center">
                    <div className={`h-1.5 rounded-full ${i <= idx ? 'bg-vx-accent' : 'bg-vx-line'}`} />
                    <div className={`mt-2 text-[11px] sm:text-[12px] ${i === idx ? 'font-semibold text-white' : i < idx ? 'text-vx-accent-soft' : 'text-slate-500'}`}>{label}</div>
                  </li>
                ))}
              </ol>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function Tickets() {
  const [tickets, setTickets] = useState(null)
  const [sel, setSel] = useState('')
  useEffect(() => {
    let alive = true
    api.myTickets().then((d) => alive && setTickets(d.tickets)).catch(() => alive && setTickets([]))
    return () => {
      alive = false
    }
  }, [])

  function open(t) {
    setSel(t.ticketNo)
    if (t.unread) {
      api.readTicket(t.ticketNo).catch(() => {})
      setTickets((l) => l.map((x) => (x.ticketNo === t.ticketNo ? { ...x, unread: false } : x)))
    }
  }
  async function reply(ticketNo, text) {
    const d = await api.replyTicket({ ticketNo, text })
    setTickets((l) => l.map((x) => (x.ticketNo === ticketNo ? d.ticket : x)))
  }

  if (!tickets) return <p className="text-[13px] text-vx-muted">Yükleniyor…</p>
  if (!tickets.length) {
    return (
      <div className={`${card} p-8 text-center`}>
        <LifeBuoy className="w-10 h-10 mx-auto text-vx-accent-text" strokeWidth={1.5} />
        <p className="mt-3 text-[15px] font-semibold text-white">Henüz destek talebiniz yok</p>
        <p className="mt-1 text-[13px] text-vx-muted">Sorularınız için bir talep oluşturun; yanıtları burada görürsünüz.</p>
        <Button size="sm" to={routes.contact} className="mt-5">Yeni Talep Oluştur</Button>
      </div>
    )
  }
  const current = tickets.find((t) => t.ticketNo === sel)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] gap-5 items-start">
      <div className={`${card} overflow-hidden`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-vx-line">
          <span className="text-[13px] font-semibold text-white">Taleplerim ({tickets.length})</span>
          <Link to={routes.contact} className="inline-flex items-center gap-1 text-[12px] text-vx-accent-soft hover:text-white"><Plus className="w-3.5 h-3.5" /> Yeni</Link>
        </div>
        <ul className="divide-y divide-vx-line max-h-[520px] overflow-y-auto">
          {tickets.map((t) => (
            <li key={t.ticketNo}>
              <button onClick={() => open(t)} className={`w-full text-left px-4 py-3 transition-colors ${sel === t.ticketNo ? 'bg-vx-surface' : 'hover:bg-vx-surface/60'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-white truncate flex items-center gap-2">
                    {t.unread && <i className="w-2 h-2 rounded-full bg-rose-500 shrink-0" aria-label="Yeni yanıt" />}
                    {t.subject}
                  </span>
                  <span className="text-[11px] text-vx-accent-soft shrink-0">{statusLabel(t.status)}</span>
                </div>
                <div className="mt-1 text-[12px] text-slate-400 truncate">{t.replies.length ? t.replies[t.replies.length - 1].text : t.message}</div>
                <div className="mt-0.5 text-[11px] text-slate-500">{t.ticketNo} · {dateLabel(t.updatedAt)}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className={`${card} p-5`}>
        {current ? <TicketThread key={current.ticketNo} ticket={current} onReply={(text) => reply(current.ticketNo, text)} /> : <p className="py-10 text-center text-[13px] text-vx-muted">Görüntülemek için soldan bir talep seçin.</p>}
      </div>
    </div>
  )
}

function Notice({ ok, children }) {
  return <p role={ok ? 'status' : 'alert'} className={`text-[13px] ${ok ? 'text-emerald-400' : 'text-rose-400'}`}>{children}</p>
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
              {user.google && <span className="inline-flex items-center gap-1.5 px-2 h-6 rounded-md bg-vx-surface border border-vx-line text-[11px] text-slate-200"><GoogleIcon className="w-3.5 h-3.5" /> Google bağlı</span>}
              {user.discord && <span className="inline-flex items-center gap-1.5 px-2 h-6 rounded-md bg-vx-surface border border-vx-line text-[11px] text-slate-200"><DiscordIcon className="w-3.5 h-3.5" /> Discord bağlı</span>}
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
  const { user, openAuth } = useApp()
  const { pathname } = useLocation()

  if (!user) {
    return (
      <div className={`${card} p-8 max-w-md`}>
        <h1 className="text-xl font-semibold text-white">Hesabım</h1>
        <p className="mt-2 text-[14px] text-vx-muted">Siparişlerinizi, destek taleplerinizi ve ayarlarınızı görmek için giriş yapın.</p>
        <div className="mt-5 flex gap-3">
          <Button size="sm" onClick={() => openAuth('login')}>Giriş Yap</Button>
          <Button size="sm" variant="secondary" onClick={() => openAuth('register')}>Kayıt Ol</Button>
        </div>
      </div>
    )
  }

  const Screen = pathname.startsWith(routes.tickets) ? Tickets : pathname.startsWith(routes.settings) ? SettingsTab : Orders
  const title = TABS.find((t) => pathname.startsWith(t.to))?.label || TABS[0].label

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-6 items-start">
      <aside className={`${card} p-4`}>
        <div className="flex items-center gap-3 pb-4 mb-3 border-b border-vx-line">
          <Avatar user={user} className="w-12 h-12 text-[18px] shrink-0" />
          <div className="min-w-0">
            <div className="text-[14px] font-semibold text-white truncate">{user.name}</div>
            <div className="text-[12px] text-vx-muted truncate">{user.email}</div>
          </div>
        </div>
        <nav className="flex lg:flex-col gap-1 overflow-x-auto" aria-label="Hesap menüsü">
          {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 h-11 px-3 rounded-xl text-[13px] font-medium whitespace-nowrap transition-colors ${isActive ? 'bg-vx-accent text-white' : 'text-vx-muted hover:text-white hover:bg-vx-surface'}`}>
              <Icon className="w-4 h-4 shrink-0" /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="space-y-5 min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
        <Screen />
      </div>
    </div>
  )
}
