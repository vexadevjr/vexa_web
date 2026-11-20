import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ArrowRight, Flame, Megaphone, TriangleAlert, X } from 'lucide-react'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import AuthModal from './components/AuthModal.jsx'
import OrderModal from './components/OrderModal.jsx'
import Home from './pages/Home.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import Portfolio from './pages/Portfolio.jsx'
import Contact from './pages/Contact.jsx'
import Account from './pages/Account.jsx'
import CookiePolicy from './pages/CookiePolicy.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import { PrivacyPolicy, Terms, Kvkk, DistanceSales, Refund } from './pages/Legal.jsx'
import Footer from './components/Footer.jsx'
import NotFound from './pages/NotFound.jsx'
import { useApp } from './context/AppContext.jsx'
import { useSite } from './context/SiteContext.jsx'
import { siteConfig } from './config/siteConfig.js'
import { api } from './lib/api.js'
import { hasConsent } from './lib/consent.js'
import CookieBanner from './components/CookieBanner.jsx'
import Seo from './components/Seo.jsx'
import ScrollUi from './components/ScrollUi.jsx'
import vLogo from './assets/vexstar-logo.png'

const AdminApp = lazy(() => import('./pages/admin/AdminApp.jsx'))

const { routes } = siteConfig

// New page -> top. Link with a #hash (search results) -> scroll to that element.
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return undefined
    }
    const t = setTimeout(() => {
      const el = document.getElementById(hash.slice(1))
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
    return () => clearTimeout(t)
  }, [pathname, hash])
  return null
}

// Counts one page view per navigation for the admin visitor statistics.
// Only runs with the visitor's analytics consent (cookie preferences).
function VisitTracker() {
  const { pathname } = useLocation()
  const [consentTick, setConsentTick] = useState(0)
  useEffect(() => {
    const bump = () => setConsentTick((t) => t + 1)
    window.addEventListener('vx-consent', bump)
    return () => window.removeEventListener('vx-consent', bump)
  }, [])
  useEffect(() => {
    if (hasConsent('analytics')) api.track(pathname)
  }, [pathname, consentTick])
  return null
}

function Splash() {
  return (
    <div className="min-h-screen grid place-items-center">
      <img src={vLogo} alt="Vexstar" className="w-24 h-auto animate-pulse" />
    </div>
  )
}

const ANN = {
  kampanya: { wrap: 'from-orange-500 via-rose-500 to-fuchsia-600 text-white', badge: 'bg-black/25 text-white', btn: 'bg-white text-rose-600 hover:bg-white/90', icon: Flame },
  bilgi: { wrap: 'from-violet-600 via-indigo-600 to-sky-600 text-white', badge: 'bg-black/25 text-white', btn: 'bg-white text-violet-700 hover:bg-white/90', icon: Megaphone },
  uyari: { wrap: 'from-amber-400 via-yellow-400 to-amber-500 text-zinc-900', badge: 'bg-black/20 text-zinc-900', btn: 'bg-zinc-900 text-white hover:bg-zinc-800', icon: TriangleAlert },
}

// Eye-catching banner: gradient, pulsing "DUYURU" badge, bold title, optional button, can be dismissed for the session.
function Announcement() {
  const { announcement } = useSite()
  const key = announcement ? `vx-ann-${announcement.title || ''}${announcement.text || ''}`.slice(0, 120) : ''
  const [hidden, setHidden] = useState(() => {
    try { return sessionStorage.getItem(key) === '1' } catch (e) { return false }
  })
  if (!announcement || !announcement.enabled || !(announcement.text || announcement.title) || hidden) return null
  const t = ANN[announcement.style] || ANN.bilgi
  const Icon = t.icon
  const close = () => {
    setHidden(true)
    try { sessionStorage.setItem(key, '1') } catch (e) { /* ignore */ }
  }
  const label = announcement.linkText || 'İncele'
  const btnCls = `shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-bold shadow transition-colors ${t.btn}`
  const btn = announcement.link
    ? announcement.link.startsWith('/')
      ? <Link to={announcement.link} className={btnCls}>{label} <ArrowRight className="w-4 h-4" /></Link>
      : <a href={announcement.link} target="_blank" rel="noopener noreferrer" className={btnCls}>{label} <ArrowRight className="w-4 h-4" /></a>
    : null
  return (
    <div role="status" className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${t.wrap} shadow-[0_18px_50px_-22px_rgba(244,63,94,0.7)]`}>
      <span className="shimmer-line" aria-hidden="true" />
      <div className="relative flex flex-wrap items-center gap-x-4 gap-y-3 px-4 sm:px-6 py-3.5 pr-12">
        <span className={`inline-flex items-center gap-2 h-7 px-3 rounded-full text-[11px] font-extrabold tracking-[0.14em] ${t.badge}`}>
          <span className="relative flex w-2 h-2"><span className="absolute inline-flex w-full h-full rounded-full bg-current opacity-70 animate-ping" /><span className="relative inline-flex w-2 h-2 rounded-full bg-current" /></span>
          DUYURU
        </span>
        <Icon className="w-5 h-5 shrink-0 hidden sm:block" />
        <div className="flex-1 min-w-[200px]">
          {announcement.title && <div className="text-[16px] sm:text-[18px] font-extrabold leading-tight">{announcement.title}</div>}
          {announcement.text && <div className="text-[13.5px] sm:text-[14.5px] leading-snug opacity-95">{announcement.text}</div>}
        </div>
        {btn}
      </div>
      <button onClick={close} aria-label="Duyuruyu kapat" className="absolute right-2.5 top-2.5 grid place-items-center w-8 h-8 rounded-full bg-black/15 hover:bg-black/30 transition-colors"><X className="w-4 h-4" /></button>
    </div>
  )
}

function PublicApp() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { authOpen, orderProduct, closeOrder } = useApp()
  const { ready, categories } = useSite()
  const { pathname } = useLocation()

  // lock the page behind the mobile menu drawer
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // wait for the real content (or last visit's cache) so the default text never flashes
  if (!ready) return <Splash />

  return (
    <div className="min-h-screen text-white">
      <Seo />
      <ScrollUi />
      <ScrollManager />
      <VisitTracker />
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && <div className="fixed inset-0 z-30 bg-black/70 lg:hidden" onClick={() => setMenuOpen(false)} />}

      <Header onMenu={() => setMenuOpen(true)} />

      <main className="lg:ml-[215px] px-4 sm:px-8 lg:px-12 pb-8 pt-[calc(92px+env(safe-area-inset-top))] space-y-6">
        <Announcement />
        <div key={pathname} className="vx-rise space-y-6">
        <Routes>
          <Route path={routes.home} element={<Home />} />
          {categories.map((c) => <Route key={c.id} path={c.path} element={<CategoryPage category={c} />} />)}
          <Route path="/discord-botlari" element={<Navigate to={routes.bots} replace />} />
          <Route path={routes.portfolio} element={<Portfolio />} />
          <Route path={routes.contact} element={<Contact />} />
          <Route path={`${routes.product}/:slug`} element={<ProductDetail />} />
          <Route path={routes.cookies} element={<CookiePolicy />} />
          <Route path={routes.privacy} element={<PrivacyPolicy />} />
          <Route path={routes.terms} element={<Terms />} />
          <Route path={routes.kvkk} element={<Kvkk />} />
          <Route path={routes.distance} element={<DistanceSales />} />
          <Route path={routes.refund} element={<Refund />} />
          <Route path={routes.panel} element={<Navigate to={routes.orders} replace />} />
          <Route path={`${routes.account}/*`} element={<Account />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </div>
        <Footer />
      </main>

      <CookieBanner />
      {authOpen && <AuthModal />}
      {orderProduct && <OrderModal product={orderProduct} onClose={closeOrder} />}
    </div>
  )
}

export default function App() {
  const { pathname } = useLocation()
  // /admin is a separate, lazily loaded application: none of its code ships to normal visitors.
  if (pathname === routes.admin || pathname.startsWith(`${routes.admin}/`)) {
    return (
      <Suspense fallback={<div className="min-h-screen grid place-items-center text-vx-muted text-sm">Yükleniyor…</div>}>
        <AdminApp />
      </Suspense>
    )
  }
  return <PublicApp />
}
