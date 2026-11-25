import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useActiveAnnouncement } from './components/AnnouncementBanner.jsx'
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

function Splash({ exiting = false }) {
  return (
    <div className={`vx-loading-screen${exiting ? ' is-exiting' : ''}`} role="status" aria-live="polite" aria-label="Vexstar yükleniyor">
      <div className="vx-loading-atmosphere" aria-hidden="true">
        <span className="vx-loading-orbit vx-loading-orbit-one" />
        <span className="vx-loading-orbit vx-loading-orbit-two" />
        <span className="vx-loading-orbit vx-loading-orbit-three" />
        <span className="vx-loading-beam vx-loading-beam-one" />
        <span className="vx-loading-beam vx-loading-beam-two" />
        <span className="vx-loading-particle vx-loading-particle-one" />
        <span className="vx-loading-particle vx-loading-particle-two" />
        <span className="vx-loading-particle vx-loading-particle-three" />
        <span className="vx-loading-particle vx-loading-particle-four" />
      </div>

      <div className="vx-loading-content">
        <div className="vx-loading-logo-stage">
          <span className="vx-loading-logo-halo" />
          <span className="vx-loading-logo-ring" />
          <span className="vx-loading-logo-ring vx-loading-logo-ring-inner" />
          <img src={vLogo} alt="Vexstar Development" className="vx-loading-logo" />
          <span className="vx-loading-logo-glint" />
        </div>

        <div className="vx-loading-brand">
          <div className="vx-loading-wordmark">VEXSTAR</div>
          <div className="vx-loading-submark">D E V E L O P M E N T</div>
        </div>

        <div className="vx-loading-message">Dijital hizmetleriniz hazırlanıyor<span className="vx-loading-ellipsis" aria-hidden="true">...</span></div>
        <div className="vx-loading-track" aria-hidden="true">
          <span className="vx-loading-track-fill" />
          <span className="vx-loading-track-glow" />
        </div>
        <div className="vx-loading-footnote">GÜVENİLİR • GÜÇLÜ • KESİNTİSİZ</div>
      </div>
    </div>
  )
}

function PublicApp() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { authOpen, orderProduct, closeOrder } = useApp()
  const { ready, categories } = useSite()
  const ann = useActiveAnnouncement()
  const { pathname } = useLocation()
  const [splashVisible, setSplashVisible] = useState(true)

  useEffect(() => {
    if (!ready) return undefined
    const timer = window.setTimeout(() => setSplashVisible(false), 520)
    return () => window.clearTimeout(timer)
  }, [ready])

  // lock the page behind the mobile menu drawer
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // wait for the real content (or last visit's cache) so the default text never flashes
  if (!ready || splashVisible) return <Splash exiting={ready} />

  return (
    <div className="min-h-screen text-white">
      <Seo />
      <ScrollUi />
      <ScrollManager />
      <VisitTracker />
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && <div className="fixed inset-0 z-30 bg-black/70 lg:hidden" onClick={() => setMenuOpen(false)} />}

      <Header onMenu={() => setMenuOpen(true)} />

      <main className={`lg:ml-[215px] px-4 sm:px-8 lg:px-12 pb-8 space-y-6 ${ann ? 'pt-[calc(156px+env(safe-area-inset-top))] md:pt-[calc(92px+env(safe-area-inset-top))]' : 'pt-[calc(92px+env(safe-area-inset-top))]'}`}>
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
