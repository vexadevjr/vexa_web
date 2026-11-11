import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import AuthModal from './components/AuthModal.jsx'
import OrderModal from './components/OrderModal.jsx'
import DemoModal from './components/DemoModal.jsx'
import Home from './pages/Home.jsx'
import DiscordBots from './pages/DiscordBots.jsx'
import WebDev from './pages/WebDev.jsx'
import Portfolio from './pages/Portfolio.jsx'
import Contact from './pages/Contact.jsx'
import Panel from './pages/Panel.jsx'
import NotFound from './pages/NotFound.jsx'
import { useApp } from './context/AppContext.jsx'
import { siteConfig } from './config/siteConfig.js'

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

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { authOpen, orderProduct, closeOrder, demoProduct, closeDemo } = useApp()

  return (
    <div className="min-h-screen text-white">
      <ScrollManager />
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && <div className="fixed inset-0 z-30 bg-black/70 lg:hidden" onClick={() => setMenuOpen(false)} />}

      <main className="lg:ml-[215px] px-4 sm:px-8 lg:px-12 py-8 space-y-6">
        <Header onMenu={() => setMenuOpen(true)} />
        <Routes>
          <Route path={routes.home} element={<Home />} />
          <Route path={routes.bots} element={<DiscordBots />} />
          <Route path={routes.web} element={<WebDev />} />
          <Route path={routes.portfolio} element={<Portfolio />} />
          <Route path={routes.contact} element={<Contact />} />
          <Route path={routes.panel} element={<Panel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {authOpen && <AuthModal />}
      {orderProduct && <OrderModal product={orderProduct} onClose={closeOrder} />}
      {demoProduct && <DemoModal product={demoProduct} onClose={closeDemo} />}
    </div>
  )
}
