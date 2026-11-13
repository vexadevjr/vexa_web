import { useEffect, useState } from 'react'
import { Bot, Globe, Play, Check } from 'lucide-react'
import Button from './Button.jsx'
import StarBar from './StarBar.jsx'
import useProducts from '../hooks/useProducts.js'
import { useApp } from '../context/AppContext.jsx'
import { useStats } from '../hooks/useLive.js'
import { siteConfig } from '../config/siteConfig.js'

const points = ['Net fiyat, gizli ücret yok', 'Teslimat süresi baştan belli', 'Teslim sonrası ücretsiz hata düzeltme']

// Animated Discord-style chat taken from a real bot product, with a button that opens the full demo.
function DemoCard() {
  const products = useProducts()
  const { openDemo } = useApp()
  const bot = products.find((p) => p.category === 'discord-bot' && p.demo && p.demo.length)
  const lines = bot ? bot.demo.slice(0, 4) : []
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (!lines.length) return undefined
    setShown(0)
    let i = 0
    const id = setInterval(() => {
      i += 1
      setShown(i)
      if (i >= lines.length) clearInterval(id)
    }, 1100)
    return () => clearInterval(id)
  }, [bot && bot.slug]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!bot) return null
  return (
    <div className="rounded-2xl bg-vx-surface/90 border border-vx-line shadow-2xl shadow-black/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 h-11 border-b border-vx-line text-[12px] text-vx-muted">
        <span className="flex gap-1.5"><i className="w-2.5 h-2.5 rounded-full bg-rose-400/70" /><i className="w-2.5 h-2.5 rounded-full bg-amber-400/70" /><i className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" /></span>
        <span className="ml-2"># {bot.name.toLowerCase().replace(/\s+/g, '-')}-demo</span>
      </div>
      <div className="p-4 space-y-3 min-h-[190px]">
        {lines.slice(0, shown).map((l, i) => (
          <div key={i} className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-[13px] leading-snug ${l.who === 'bot' ? 'bg-vx-accent/20 border border-vx-accent/40 text-white' : 'bg-vx-card border border-vx-line text-slate-200 ml-auto'}`}>
            <div className="text-[10px] mb-0.5 text-vx-muted">{l.who === 'bot' ? bot.name : 'Üye'}</div>
            {l.text}
          </div>
        ))}
      </div>
      <button onClick={() => openDemo(bot)} className="w-full h-12 flex items-center justify-center gap-2 border-t border-vx-line text-[13px] font-semibold text-vx-accent-soft hover:text-white hover:bg-vx-accent transition-colors">
        <Play className="w-4 h-4" /> {bot.name} demosunu dene
      </button>
    </div>
  )
}

export default function Hero() {
  const stats = useStats()
  const rated = stats && stats.available && stats.reviewCount > 0

  return (
    <section
      id="home"
      className="relative overflow-hidden rounded-3xl border border-vx-line bg-vx-card"
      style={{ backgroundImage: 'radial-gradient(55% 80% at 90% 30%, rgba(99,102,241,0.30), transparent 70%)' }}
    >
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 items-center px-8 py-12 sm:px-12 sm:py-14">
        <div>
          <div className="inline-flex items-center gap-2 px-3 h-8 rounded-full bg-vx-surface/80 border border-vx-line text-[12px] text-vx-accent-soft">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Yeni projeler için siparişler açık
          </div>
          <h1 className="mt-5 text-4xl sm:text-5xl xl:text-[58px] font-extrabold tracking-tight leading-[1.06] text-white">
            Sunucunuz ve markanız için{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-300">Discord botu ve web sitesi.</span>
          </h1>
          <p className="mt-5 max-w-[540px] text-[16px] leading-relaxed text-slate-300">
            Hazır paketlerle hemen sipariş verin ya da ihtiyacınıza özel teklif alın. Kurulumdan teslimata kadar her adımda yanınızdayız.
          </p>

          <ul className="mt-6 space-y-2.5">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-[14px] text-slate-200"><Check className="w-4 h-4 text-vx-accent-text" /> {p}</li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" to={siteConfig.routes.bots}><Bot className="w-5 h-5" /> Discord Botlarını Gör</Button>
            <Button size="lg" variant="secondary" to={siteConfig.routes.web}><Globe className="w-5 h-5" /> Web Sitesi Paketleri</Button>
          </div>

          {rated && (
            <div className="mt-7 flex items-center gap-3 text-[13px] text-vx-muted">
              <StarBar value={stats.average} className="w-4 h-4" />
              <span><b className="text-white">{stats.average.toFixed(1)}</b> / 5 · {stats.reviewCount} müşteri yorumu</span>
            </div>
          )}
        </div>

        <div className="hidden lg:block"><DemoCard /></div>
      </div>
    </section>
  )
}
