import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Megaphone } from 'lucide-react'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import AuthModal from './components/AuthModal.jsx'
import OrderModal from './components/OrderModal.jsx'
import Home from './pages/Home.jsx'
import DiscordBots from './pages/DiscordBots.jsx'
import WebDev from './pages/WebDev.jsx'
import Portfolio from './pages/Portfolio.jsx'
import Contact from './pages/Contact.jsx'
import Account from './pages/Account.jsx'
import NotFound from './pages/NotFound.jsx'
import { useApp } from './context/AppContext.jsx'
import { useSite } from './context/SiteContext.jsx'
import { siteConfig } from './config/siteConfig.js'
import { api } from './lib/api.js'
import { hasConsent } from './lib/consent.js'
import CookieBanner from './components/CookieBanner.jsx'
import Seo from './components/Seo.jsx'
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

function Announcement() {
  const { announcement } = useSite()
  if (!announcement || !announcement.enabled || !announcement.text) return null
  const body = (
    <>
      <Megaphone className="w-4 h-4 shrink-0" />
      <span>{announcement.text}</span>
    </>
  )
  const cls = 'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-vx-accent/20 border border-vx-accent/40 text-[13px] text-white'
  if (announcement.link && announcement.link.startsWith('/')) return <Link to={announcement.link} className={cls}>{body}</Link>
  if (announcement.link) return <a href={announcement.link} target="_blank" rel="noopener noreferrer" className={cls}>{body}</a>
  return <div className={cls}>{body}</div>
}

function PublicApp() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { authOpen, orderProduct, closeOrder } = useApp()
  const { ready } = useSite()

  // wait for the real content (or last visit's cache) so the default text never flashes
  if (!ready) return <Splash />

  return (
    <div className="min-h-screen text-white">
      <Seo />
      <ScrollManager />
      <VisitTracker />
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && <div className="fixed inset-0 z-30 bg-black/70 lg:hidden" onClick={() => setMenuOpen(false)} />}

      <main className="lg:ml-[215px] px-4 sm:px-8 lg:px-12 py-8 space-y-6">
        <Header onMenu={() => setMenuOpen(true)} />
        <Announcement />
        <Routes>
          <Route path={routes.home} element={<Home />} />
          <Route path={routes.bots} element={<DiscordBots />} />
          <Route path={routes.web} element={<WebDev />} />
          <Route path={routes.portfolio} element={<Portfolio />} />
          <Route path={routes.contact} element={<Contact />} />
          <Route path={routes.panel} element={<Navigate to={routes.orders} replace />} />
          <Route path={`${routes.account}/*`} element={<Account />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
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
