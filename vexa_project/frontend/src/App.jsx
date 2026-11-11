import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import ServiceCards from './components/ServiceCards.jsx'
import WhySection from './components/WhySection.jsx'
import StatsSection from './components/StatsSection.jsx'
import { siteConfig } from './config/siteConfig.js'
import { idOf } from './lib/scroll.js'

export default function App() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen text-white">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      {open && <div className="fixed inset-0 z-30 bg-black/70 lg:hidden" onClick={() => setOpen(false)} />}

      <main className="lg:ml-[215px] px-4 sm:px-8 lg:px-12 py-8 space-y-6">
        <div id={idOf(siteConfig.sections.home)}>
          <Header onMenu={() => setOpen(true)} />
        </div>
        <Hero />
        <ServiceCards />
        <section className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-6 items-stretch">
          <WhySection />
          <StatsSection />
        </section>
      </main>
    </div>
  )
}
