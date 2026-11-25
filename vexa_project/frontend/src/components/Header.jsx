import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, ShoppingCart, Bell, Search, X, Trash2, ArrowRight, PackageOpen } from 'lucide-react'
import { siteConfig } from '../config/siteConfig.js'
import UserMenu from './UserMenu.jsx'
import SearchBox from './SearchBox.jsx'
import AnnouncementPill, { useActiveAnnouncement } from './AnnouncementBanner.jsx'
import vLogo from '../assets/vexstar-logo.png'
import { useApp } from '../context/AppContext.jsx'
import { formatPrice, discountedTotalFor, totalFor, termsOf } from '../lib/format.js'
import { useSite } from '../context/SiteContext.jsx'
import { useEffect, useRef } from 'react'

export default function Header({ onMenu }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [activePanel, setActivePanel] = useState(null)
  const panelRef = useRef(null)
  const { cart, removeFromCart, clearCart, openOrder } = useApp()
  const { termDiscounts = {} } = useSite()
  const ann = useActiveAnnouncement()
  useEffect(() => {
    if (!activePanel) return undefined
    const close = (event) => { if (panelRef.current && !panelRef.current.contains(event.target)) setActivePanel(null) }
    const key = (event) => event.key === 'Escape' && setActivePanel(null)
    document.addEventListener('mousedown', close); document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', key) }
  }, [activePanel])
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
  const cartTotal = cart.reduce((sum, item) => {
    const price = item.product?.price
    if (price == null) return sum
    return sum + (item.months ? discountedTotalFor(price, item.months, termDiscounts) : totalFor(price, 1)) * (item.quantity || 1)
  }, 0)

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
            <button onClick={() => setActivePanel(activePanel === 'cart' ? null : 'cart')} aria-label={`Alışveriş sepeti${cartCount ? `, ${cartCount} ürün` : ''}`} aria-expanded={activePanel === 'cart'} className={`relative grid h-11 w-11 place-items-center rounded-xl border transition-colors ${activePanel === 'cart' ? 'border-vx-accent-text/60 bg-vx-card text-white' : 'border-vx-line bg-vx-surface text-vx-accent-soft hover:border-vx-accent-text/50 hover:bg-vx-card'}`}>
              <ShoppingCart className="h-[19px] w-[19px]" />
              {cartCount > 0 && <span className="absolute -right-1.5 -top-1.5 grid min-w-[19px] h-[19px] place-items-center rounded-full border-2 border-vx-bg bg-vx-accent px-1 text-[10px] font-bold text-white">{cartCount > 99 ? '99+' : cartCount}</span>}
            </button>
            <button onClick={() => setActivePanel(activePanel === 'notifications' ? null : 'notifications')} aria-label="Bildirimler" aria-expanded={activePanel === 'notifications'} className={`relative grid h-11 w-11 place-items-center rounded-xl border transition-colors ${activePanel === 'notifications' ? 'border-vx-accent-text/60 bg-vx-card text-white' : 'border-vx-line bg-vx-surface text-vx-accent-soft hover:border-vx-accent-text/50 hover:bg-vx-card'}`}>
              <Bell className="h-[19px] w-[19px]" />
            </button>
            {activePanel === 'cart' && <div className="absolute right-0 top-[54px] z-50 w-[min(90vw,370px)] overflow-hidden rounded-2xl border border-vx-line bg-vx-card shadow-2xl shadow-black/50">
              <div className="flex items-center justify-between border-b border-vx-line px-4 py-3"><div><div className="text-sm font-bold text-white">Alışveriş Sepetim</div><div className="mt-0.5 text-[11px] text-vx-muted">{cartCount} ürün</div></div>{cart.length > 0 && <button onClick={clearCart} className="text-[11px] font-semibold text-vx-muted hover:text-rose-300">Sepeti temizle</button>}</div>
              {cart.length === 0 ? <div className="flex flex-col items-center px-5 py-8 text-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-vx-surface text-vx-accent-text"><PackageOpen className="h-6 w-6"/></span><div className="mt-3 text-sm font-semibold text-white">Sepetiniz henüz boş</div><p className="mt-1 text-xs text-vx-muted">Beğendiğiniz hizmetleri sepetinize ekleyerek burada görüntüleyebilirsiniz.</p></div> : <>
                <div className="max-h-[320px] overflow-y-auto divide-y divide-vx-line">{cart.map((item) => <div key={item.key} className="flex items-center gap-3 px-4 py-3"><div className="min-w-0 flex-1"><div className="truncate text-[13px] font-semibold text-white">{item.product.name}</div><div className="mt-0.5 text-[11px] text-vx-muted">{item.months ? `${item.months} ay` : item.product.period || 'Tek seferlik'} · Adet: {item.quantity || 1}</div><div className="mt-1 text-xs font-bold text-vx-accent-soft">{item.product.price == null ? 'Teklif alın' : formatPrice((item.months ? discountedTotalFor(item.product.price, item.months, termDiscounts) : item.product.price) * (item.quantity || 1))}</div></div><button onClick={() => removeFromCart(item.key)} aria-label={`${item.product.name} ürününü sepetten çıkar`} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-vx-muted hover:bg-rose-500/10 hover:text-rose-300"><Trash2 className="h-4 w-4"/></button></div>)}</div>
                <div className="border-t border-vx-line px-4 py-3"><div className="mb-3 flex justify-between text-sm"><span className="text-vx-muted">Ara toplam</span><b className="text-white">{formatPrice(cartTotal)}</b></div><button onClick={() => { const item = cart[0]; setActivePanel(null); openOrder(item.product, item.months) }} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-vx-accent px-4 text-sm font-bold text-white transition hover:bg-vx-accent-hover">Siparişe devam et <ArrowRight className="h-4 w-4"/></button><p className="mt-2 text-center text-[10px] text-vx-muted">Sepetteki ürünler siparişe tek tek aktarılır.</p></div>
              </>}
            </div>}
            {activePanel === 'notifications' && <div className="absolute right-0 top-[54px] z-50 w-[min(90vw,340px)] overflow-hidden rounded-2xl border border-vx-line bg-vx-card shadow-2xl shadow-black/50"><div className="border-b border-vx-line px-4 py-3"><div className="text-sm font-bold text-white">Bildirimler</div><div className="mt-0.5 text-[11px] text-vx-muted">Hesabınızla ilgili güncellemeler</div></div><div className="flex flex-col items-center px-5 py-8 text-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-vx-surface text-vx-accent-text"><Bell className="h-6 w-6"/></span><div className="mt-3 text-sm font-semibold text-white">Şimdilik bildiriminiz yok</div><p className="mt-1 text-xs text-vx-muted">Sipariş ve destek güncellemeleriniz burada görüntülenecek.</p></div></div>}
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
    </header>
  )
}
