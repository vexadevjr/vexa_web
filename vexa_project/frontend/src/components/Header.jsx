import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, ShoppingCart, Bell, Search, X, Trash2, ArrowRight, PackageOpen, Check, ShieldCheck, Lock, AlertTriangle, LifeBuoy, Package } from 'lucide-react'
import { siteConfig } from '../config/siteConfig.js'
import UserMenu from './UserMenu.jsx'
import SearchBox from './SearchBox.jsx'
import AnnouncementPill, { useActiveAnnouncement } from './AnnouncementBanner.jsx'
import vLogo from '../assets/vexstar-logo.png'
import { useApp } from '../context/AppContext.jsx'
import FitImage from './FitImage.jsx'
import { api } from '../lib/api.js'
import { formatPrice, discountedTotalFor, totalFor, termsOf, termLabel, discountInfo, productPath } from '../lib/format.js'
import { useSite } from '../context/SiteContext.jsx'
import { useEffect, useRef } from 'react'

// ───────── Sepet paneli (sağdan açılır) ─────────
function useCartRows() {
  const { cart } = useApp()
  const { products, termDiscounts = {} } = useSite()
  return cart.map((item) => {
    const live = (products || []).find((p) => p.slug === item.product.slug)
    const p = live || item.product
    const m = item.months || null
    const sale = discountInfo(p)
    const unavailable = !live || p.price == null
    const badTerm = Boolean(m) && !termsOf(p).includes(m)
    const ok = !unavailable && !badTerm
    const unit = ok ? (sale ? sale.old : p.price) : 0
    const list = ok ? totalFor(unit, m || 1) : 0
    const total = ok ? (m ? discountedTotalFor(p.price, m, termDiscounts) : p.price) : 0
    const old = list
    return { item, p, m, ok, unavailable, badTerm, list, old, total, termPct: m ? Number(termDiscounts[m]) || 0 : 0 }
  })
}

function CartDrawer() {
  const { cartOpen, closeCart, removeFromCart, clearCart, setCartTerm, checkoutCart } = useApp()
  const { termDiscounts = {} } = useSite()
  const rows = useCartRows()
  useEffect(() => {
    if (!cartOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const key = (e) => e.key === 'Escape' && closeCart()
    window.addEventListener('keydown', key)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', key) }
  }, [cartOpen, closeCart])
  if (!cartOpen) return null

  const valid = rows.filter((r) => r.ok)
  const listSum = valid.reduce((a, r) => a + r.list, 0)
  const totalSum = valid.reduce((a, r) => a + r.total, 0)
  const saving = Math.max(0, Math.round((listSum - totalSum) * 100) / 100)

  return createPortal(
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Sepetim">
      <div className="absolute inset-0 bg-black/70" onClick={closeCart} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col border-l border-vx-line bg-vx-surface shadow-2xl shadow-black/60" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between border-b border-vx-line px-5 py-4">
          <div>
            <div className="text-[17px] font-bold text-white">Sepetim <span className="font-medium text-vx-muted">({rows.length} ürün)</span></div>
            {rows.length > 0 && <button onClick={clearCart} className="mt-0.5 text-[12px] font-semibold text-vx-muted hover:text-rose-300">Sepeti temizle</button>}
          </div>
          <button onClick={closeCart} aria-label="Sepeti kapat" className="grid h-10 w-10 place-items-center rounded-xl border border-vx-line bg-vx-card text-white hover:bg-vx-line"><X className="h-5 w-5" /></button>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-3xl bg-vx-card text-vx-accent-text"><PackageOpen className="h-8 w-8" /></span>
            <div className="mt-4 text-[17px] font-semibold text-white">Sepetiniz boş</div>
            <p className="mt-1.5 text-[13px] text-vx-muted">Beğendiğiniz hizmetleri sepete ekleyin, tek yerden sipariş verin.</p>
            <button onClick={closeCart} className="mt-6 h-11 rounded-xl bg-vx-accent px-6 text-[14px] font-bold text-white hover:bg-vx-accent-hover">Alışverişe Devam Et</button>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {rows.map(({ item, p, m, ok, unavailable, badTerm, list, old, total, termPct }) => {
                const cover = (p.images || [])[0]
                return (
                  <li key={item.key} className={`rounded-2xl border p-3 ${ok ? 'border-vx-line bg-vx-card' : 'border-amber-500/40 bg-amber-500/5'}`}>
                    <div className="flex gap-3">
                      <Link to={productPath(p)} onClick={closeCart} className="block h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border border-vx-line bg-vx-surface">
                        {cover ? <FitImage src={cover} alt={p.name} className="h-full w-full" /> : <span className="grid h-full w-full place-items-center bg-gradient-to-br from-vx-accent/30 to-vx-surface text-xl font-black text-white/60">{(p.name || '?').slice(0, 1)}</span>}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link to={productPath(p)} onClick={closeCart} className="line-clamp-2 text-[14px] font-semibold leading-snug text-white hover:text-vx-accent-soft">{p.name}</Link>
                          <button onClick={() => removeFromCart(item.key)} aria-label={`${p.name} ürününü sepetten çıkar`} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-vx-muted hover:bg-rose-500/10 hover:text-rose-300"><Trash2 className="h-4 w-4" /></button>
                        </div>
                        <div className="mt-0.5 text-[12px] text-vx-muted">{p.subCategory || 'Hizmet'}{!m && p.period ? ` · ${p.period}` : ''}</div>
                      </div>
                    </div>

                    {m && (
                      <div className="mt-3" role="radiogroup" aria-label="Abonelik süresi">
                        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-vx-muted">Abonelik süresi</div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {termsOf(p).map((t) => (
                            <button key={t} type="button" role="radio" aria-checked={t === m} onClick={() => setCartTerm(item.key, t)} className={`h-9 rounded-lg border text-[12px] font-semibold transition-colors ${t === m ? 'border-vx-accent bg-vx-accent/20 text-white' : 'border-vx-line bg-vx-surface text-zinc-300 hover:border-vx-accent-text/40'}`}>{t === 12 ? 'Yıllık' : `${t} Ay`}</button>
                          ))}
                        </div>
                      </div>
                    )}

                    {ok ? (
                      <div className="mt-3 flex items-end justify-between gap-3 border-t border-vx-line pt-3">
                        <div className="text-[12px] text-vx-muted">{m ? `${termLabel(m)} · aylık ${formatPrice(p.price)}` : 'Tek seferlik'}{termPct > 0 && <div className="mt-0.5 font-semibold text-emerald-400">%{termPct} dönem indirimi</div>}</div>
                        <div className="text-right">
                          {old > total && <div className="text-[12px] tabular-nums text-zinc-500 line-through">{formatPrice(old)}</div>}
                          <div className="text-[18px] font-black tabular-nums text-white">{formatPrice(total)}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex items-start gap-2 border-t border-amber-500/30 pt-3 text-[12px] text-amber-200"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{badTerm ? 'Bu abonelik süresi artık sunulmuyor. Yukarıdan başka bir süre seçin.' : unavailable ? 'Bu ürün artık satışta değil veya fiyatı değişti. Sepetten çıkarın.' : ''}</div>
                    )}
                  </li>
                )
              })}
            </ul>

            <div className="border-t border-vx-line bg-vx-card px-5 pb-5 pt-4" style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
              <div className="space-y-1.5 text-[13px]">
                <div className="flex justify-between text-vx-muted"><span>Ürünlerin toplamı</span><span className="tabular-nums">{formatPrice(listSum)}</span></div>
                {saving > 0 && <div className="flex justify-between font-semibold text-emerald-400"><span>Toplam indirim</span><span className="tabular-nums">−{formatPrice(saving)}</span></div>}
                <div className="flex items-baseline justify-between pt-1.5"><span className="text-[14px] font-semibold text-white">Ödenecek tutar</span><span className="text-[24px] font-black tabular-nums text-white">{formatPrice(totalSum)}</span></div>
              </div>
              {saving > 0 && <div className="mt-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-center text-[12px] font-semibold text-emerald-300">Bu sepette {formatPrice(saving)} tasarruf ediyorsunuz</div>}
              <button disabled={!valid.length} onClick={() => checkoutCart(valid.map((r) => r.item))} className="mt-3 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 text-[15px] font-bold text-white ring-1 ring-inset ring-white/20 transition hover:from-violet-400 hover:to-violet-600 disabled:cursor-not-allowed disabled:opacity-50">
                <Lock className="h-4 w-4" /> Sepeti Onayla ({valid.length}) <ArrowRight className="h-4 w-4" />
              </button>
              {valid.length > 1 && <p className="mt-2 text-center text-[11.5px] text-vx-muted">Sepetinizdeki {valid.length} hizmet tek ekranda, tek onayla sipariş edilir.</p>}
              <p className="mt-1.5 flex items-center justify-center gap-1.5 text-[11.5px] text-vx-muted"><ShieldCheck className="h-3.5 w-3.5" /> Bu adımda ödeme alınmaz · İş başlamadan ücretsiz iptal</p>
            </div>
          </>
        )}
      </aside>
    </div>,
    document.body
  )
}

// "Sepete eklendi" bildirimi
function CartToast() {
  const { cartToast, dismissCartToast, openCart } = useApp()
  useEffect(() => {
    if (!cartToast) return undefined
    const t = setTimeout(dismissCartToast, 4500)
    return () => clearTimeout(t)
  }, [cartToast, dismissCartToast])
  if (!cartToast) return null
  const added = cartToast.kind === 'added'
  return createPortal(
    <div role="status" className="fixed right-4 top-[84px] z-[55] w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-vx-line bg-vx-card shadow-2xl shadow-black/60 vx-ann-in" style={{ marginTop: 'env(safe-area-inset-top)' }}>
      <div className="flex items-center gap-3 p-3.5">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${added ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>{added ? <Check className="h-5 w-5" strokeWidth={3} /> : <ShoppingCart className="h-4 w-4" />}</span>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-bold text-white">{added ? 'Sepete eklendi' : 'Bu ürün zaten sepetinizde'}</div>
          <div className="truncate text-[12px] text-vx-muted">{cartToast.name}</div>
        </div>
        <button onClick={dismissCartToast} aria-label="Kapat" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-vx-muted hover:text-white"><X className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-vx-line p-2.5">
        <button onClick={dismissCartToast} className="h-10 rounded-lg border border-vx-line bg-vx-surface text-[13px] font-semibold text-white hover:bg-vx-line">Alışverişe Devam</button>
        <button onClick={openCart} className="h-10 rounded-lg bg-vx-accent text-[13px] font-bold text-white hover:bg-vx-accent-hover">Sepete Git</button>
      </div>
    </div>,
    document.body
  )
}


// ───────── Bildirimler: gerçek hesap verisi (sipariş durum değişiklikleri + destek yanıtları) ─────────
const ORDER_NOTE = {
  yeni: 'Siparişiniz alındı',
  onaylandi: 'Siparişiniz onaylandı',
  hazirlaniyor: 'Siparişiniz hazırlanıyor',
  'teslim-edildi': 'Siparişiniz teslim edildi',
  iptal: 'Sipariş iptal edildi',
}
const seenKey = (uid) => `vexstar_notif_seen_${uid}`
const readSeen = (uid) => { try { return Number(localStorage.getItem(seenKey(uid))) || 0 } catch { return 0 } }
const ago = (t) => {
  const m = Math.max(1, Math.round((Date.now() - t) / 60000))
  if (m < 60) return `${m} dk önce`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} saat önce`
  return new Date(t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
}

function useNotifications(user) {
  const uid = user && user.id
  const [items, setItems] = useState([])
  const [seen, setSeen] = useState(0)
  useEffect(() => { setSeen(uid ? readSeen(uid) : 0) }, [uid])
  useEffect(() => {
    if (!uid) { setItems([]); return undefined }
    let alive = true
    const load = () => {
      Promise.allSettled([api.myOrders(), api.myTickets()]).then(([o, t]) => {
        if (!alive) return
        const list = []
        if (o.status === 'fulfilled') {
          for (const order of o.value.orders || []) {
            const hist = order.history && order.history.length ? order.history : [{ status: order.status, at: order.createdAt }]
            for (const h of hist) {
              if (!ORDER_NOTE[h.status] || !h.at) continue
              list.push({ id: `o-${order.orderNo}-${h.status}`, kind: 'order', at: new Date(h.at).getTime(), title: ORDER_NOTE[h.status], text: `${order.productName} · ${order.orderNo}`, tone: h.status === 'iptal' ? 'rose' : h.status === 'teslim-edildi' ? 'emerald' : 'violet' })
            }
          }
        }
        if (t.status === 'fulfilled') {
          for (const tk of t.value.tickets || []) {
            const last = [...(tk.replies || [])].reverse().find((r) => r.from === 'admin')
            if (!last) continue
            list.push({ id: `t-${tk.ticketNo}-${last.at}`, kind: 'ticket', at: new Date(last.at).getTime(), title: 'Destek talebinize yanıt geldi', text: `${tk.subject} · ${tk.ticketNo}`, tone: 'sky', forceUnread: Boolean(tk.unread) })
          }
        }
        const cut = Date.now() - 30 * 86400000
        setItems(list.filter((n) => n.at > cut).sort((a, b) => b.at - a.at).slice(0, 12))
      })
    }
    load()
    const id = setInterval(load, 60000)
    return () => { alive = false; clearInterval(id) }
  }, [uid])
  const isUnread = (n) => n.forceUnread || n.at > seen
  const markSeen = () => {
    const now = Date.now()
    try { localStorage.setItem(seenKey(uid), String(now)) } catch { /* storage unavailable */ }
    setSeen(now)
  }
  return { items, unread: items.filter(isUnread).length, isUnread, markSeen }
}

export default function Header({ onMenu }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [activePanel, setActivePanel] = useState(null)
  const panelRef = useRef(null)
  const { cart, cartOpen, openCart, user, openAuth } = useApp()
  const { routes } = useSite()
  const navigate = useNavigate()
  const notif = useNotifications(user)
  const ann = useActiveAnnouncement()
  useEffect(() => {
    if (!activePanel) return undefined
    const close = (event) => { if (panelRef.current && !panelRef.current.contains(event.target)) setActivePanel(null) }
    const key = (event) => event.key === 'Escape' && setActivePanel(null)
    document.addEventListener('mousedown', close); document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', key) }
  }, [activePanel])
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)

  return (
    <header
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
      className="fixed top-0 inset-x-0 lg:left-[215px] z-30 border-b border-vx-line bg-vx-bg/85 backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 sm:gap-3 h-[68px] px-4 sm:px-8 lg:px-12">
        <button onClick={onMenu} className="lg:hidden w-11 h-11 shrink-0 grid place-items-center rounded-xl bg-vx-card border border-vx-line text-white" aria-label="Menü">
          <Menu className="w-5 h-5" />
        </button>

        <Link to={siteConfig.routes.home} className="md:hidden flex items-center gap-2 min-w-0" aria-label="Vexstar ana sayfa">
          <img src={vLogo} alt="" width="36" height="32" className="w-9 h-auto shrink-0" />
          <span className="text-[15px] font-bold tracking-[0.12em] text-white truncate">VEXSTAR</span>
        </Link>

        <div className={`hidden md:block ${ann ? 'w-[210px] lg:w-[250px] xl:w-[320px] shrink-0' : 'flex-1 max-w-[476px]'}`}><SearchBox /></div>

        {ann && <div className="hidden md:flex flex-1 min-w-0 justify-center"><AnnouncementPill data={ann} className="w-full max-w-[720px]" /></div>}

        <div className="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">
          <button onClick={() => setSearchOpen((o) => !o)} className="md:hidden w-11 h-11 grid place-items-center rounded-xl bg-vx-card border border-vx-line text-white" aria-label={searchOpen ? 'Aramayı kapat' : 'Ara'} aria-expanded={searchOpen}>
            {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
          <div ref={panelRef} className="relative flex items-center gap-2">
            <button onClick={() => { setActivePanel(null); openCart() }} aria-label={`Alışveriş sepeti${cartCount ? `, ${cartCount} ürün` : ''}`} aria-haspopup="dialog" aria-expanded={cartOpen} className={`relative grid h-11 w-11 place-items-center rounded-xl border transition-colors ${cartOpen ? 'border-vx-accent-text/60 bg-vx-card text-white' : 'border-vx-line bg-vx-surface text-vx-accent-soft hover:border-vx-accent-text/50 hover:bg-vx-card'}`}>
              <ShoppingCart className="h-[19px] w-[19px]" />
              {cartCount > 0 && <span className="absolute -right-1.5 -top-1.5 grid min-w-[19px] h-[19px] place-items-center rounded-full border-2 border-vx-bg bg-vx-accent px-1 text-[10px] font-bold text-white">{cartCount > 99 ? '99+' : cartCount}</span>}
            </button>
            <button onClick={() => { if (activePanel === 'notifications') notif.markSeen(); setActivePanel(activePanel === 'notifications' ? null : 'notifications') }} aria-label="Bildirimler" aria-expanded={activePanel === 'notifications'} className={`relative grid h-11 w-11 place-items-center rounded-xl border transition-colors ${activePanel === 'notifications' ? 'border-vx-accent-text/60 bg-vx-card text-white' : 'border-vx-line bg-vx-surface text-vx-accent-soft hover:border-vx-accent-text/50 hover:bg-vx-card'}`}>
              <Bell className="h-[19px] w-[19px]" />
              {notif.unread > 0 && <span className="absolute -right-1.5 -top-1.5 grid min-w-[19px] h-[19px] place-items-center rounded-full border-2 border-vx-bg bg-rose-500 px-1 text-[10px] font-bold text-white">{notif.unread > 9 ? '9+' : notif.unread}</span>}
            </button>
            {activePanel === 'notifications' && (
              <div className="absolute right-0 top-[54px] z-50 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-vx-line bg-vx-card shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between border-b border-vx-line px-4 py-3">
                  <div><div className="text-sm font-bold text-white">Bildirimler</div><div className="mt-0.5 text-[11px] text-vx-muted">Sipariş ve destek güncellemeleriniz</div></div>
                  {notif.unread > 0 && <button onClick={notif.markSeen} className="text-[11px] font-semibold text-vx-accent-text hover:text-white">Tümünü okundu say</button>}
                </div>
                {!user ? (
                  <div className="flex flex-col items-center px-5 py-8 text-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-vx-surface text-vx-accent-text"><Bell className="h-6 w-6" /></span><div className="mt-3 text-sm font-semibold text-white">Bildirimleri görmek için giriş yapın</div><button onClick={() => { setActivePanel(null); openAuth('login') }} className="mt-4 h-10 rounded-xl bg-vx-accent px-5 text-[13px] font-bold text-white hover:bg-vx-accent-hover">Giriş Yap</button></div>
                ) : notif.items.length === 0 ? (
                  <div className="flex flex-col items-center px-5 py-8 text-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-vx-surface text-vx-accent-text"><Bell className="h-6 w-6" /></span><div className="mt-3 text-sm font-semibold text-white">Şimdilik bildiriminiz yok</div><p className="mt-1 text-xs text-vx-muted">Sipariş durumu ve destek yanıtları burada görünür.</p></div>
                ) : (
                  <ul className="max-h-[380px] divide-y divide-vx-line overflow-y-auto">
                    {notif.items.map((n) => {
                      const Icon = n.kind === 'ticket' ? LifeBuoy : Package
                      const un = notif.isUnread(n)
                      const tone = n.tone === 'emerald' ? 'bg-emerald-500/15 text-emerald-300' : n.tone === 'rose' ? 'bg-rose-500/15 text-rose-300' : n.tone === 'sky' ? 'bg-sky-500/15 text-sky-300' : 'bg-vx-accent/20 text-vx-accent-soft'
                      return (
                        <li key={n.id}>
                          <button onClick={() => { notif.markSeen(); setActivePanel(null); navigate(n.kind === 'ticket' ? routes.tickets : routes.orders) }} className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-vx-surface ${un ? 'bg-vx-accent/5' : ''}`}>
                            <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tone}`}><Icon className="h-[18px] w-[18px]" /></span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2"><span className="truncate text-[13px] font-semibold text-white">{n.title}</span>{un && <i className="h-2 w-2 shrink-0 rounded-full bg-rose-500" aria-label="Yeni" />}</span>
                              <span className="block truncate text-[12px] text-vx-muted">{n.text}</span>
                              <span className="mt-0.5 block text-[11px] text-zinc-500">{ago(n.at)}</span>
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
          <UserMenu />
        </div>
      </div>

      {ann && <div className="md:hidden px-4 pb-2.5"><AnnouncementPill data={ann} className="w-full" /></div>}

      {searchOpen && (
        <div className="md:hidden px-4 pb-3 [&>div]:max-w-none">
          <SearchBox />
        </div>
      )}
      <CartToast />
      <CartDrawer />
    </header>
  )
}
