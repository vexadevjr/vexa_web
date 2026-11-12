import { ArrowRight, ShoppingCart, Headphones, ShieldCheck, Zap, Clock } from 'lucide-react'
import Button from './Button.jsx'
import StarBar from './StarBar.jsx'
import { siteConfig } from '../config/siteConfig.js'
import { useStats } from '../hooks/useLive.js'
import { scrollToHash } from '../lib/scroll.js'
import vLogo from '../assets/vexstar-logo.png'

const chips = [
  { icon: Zap, label: 'Hızlı teslimat' },
  { icon: ShieldCheck, label: 'Güvenli altyapı' },
  { icon: Clock, label: '7/24 destek' },
]

export default function Hero() {
  const stats = useStats()
  const rated = stats && stats.available && stats.reviewCount > 0

  return (
    <section
      id="home"
      className="relative overflow-hidden rounded-3xl border border-vx-line bg-vx-card"
      style={{ backgroundImage: 'radial-gradient(60% 90% at 85% 40%, rgba(99,102,241,0.28), transparent 70%)' }}
    >
      <img
        src={vLogo}
        alt=""
        aria-hidden="true"
        className="pointer-events-none hidden md:block absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 w-[38%] max-w-[460px] drop-shadow-[0_0_60px_rgba(124,58,237,0.55)]"
      />

      <div className="relative z-10 px-8 py-12 sm:px-12 sm:py-14 md:max-w-[62%]">
        <div className="inline-flex items-center gap-2 px-3 h-8 rounded-full bg-vx-surface/80 border border-vx-line text-[12px] text-vx-accent-soft">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Siparişler açık
        </div>

        <h1 className="mt-5 text-4xl sm:text-5xl lg:text-[60px] font-extrabold tracking-tight leading-[1.05] text-white">
          Discord botun ve web siten,{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-300">hazır ve güvenilir.</span>
        </h1>

        <p className="mt-5 max-w-[520px] text-[16px] leading-relaxed text-slate-300">
          Vexstar Development ile sunucunuz ve markanız için özel botlar, hızlı web siteleri ve kesintisiz destek: fiyatı görün, saniyeler içinde sipariş verin.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" href={siteConfig.sections.services} onClick={(e) => scrollToHash(e, siteConfig.sections.services)}>
            <ShoppingCart className="w-5 h-5" />
            Hizmetleri İncele
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
          <Button size="lg" variant="secondary" to={siteConfig.routes.contact}>
            <Headphones className="w-5 h-5" />
            Destek Al
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-slate-300">
          {chips.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2">
              <Icon className="w-4 h-4 text-vx-accent-text" /> {label}
            </span>
          ))}
          {rated && (
            <span className="inline-flex items-center gap-2">
              <StarBar value={stats.average} className="w-4 h-4" />
              <b className="text-white">{stats.average.toFixed(1)}</b>
              <span className="text-vx-muted">({stats.reviewCount} yorum)</span>
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
