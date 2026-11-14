import { Bot, Globe, Check, Zap, Headphones, BadgeCheck } from 'lucide-react'
import Button from './Button.jsx'
import StarBar from './StarBar.jsx'
import { siteConfig } from '../config/siteConfig.js'
import { useStats } from '../hooks/useLive.js'
import vLogo from '../assets/vexstar-logo.png'

const points = ['Net fiyat, gizli ücret yok', 'Teslimat süresi baştan belli', 'Teslim sonrası ücretsiz hata düzeltme']

const floaters = [
  { icon: Zap, title: 'Hızlı teslimat', sub: 'Süre baştan net', pos: 'top-6 left-0' },
  { icon: Headphones, title: '7/24 destek', sub: 'Her zaman yanınızda', pos: 'top-1/2 -right-2 -translate-y-1/2' },
  { icon: BadgeCheck, title: 'Hata düzeltme', sub: 'Teslim sonrası ücretsiz', pos: 'bottom-6 left-6' },
]

// Brand visual: the Vexstar mark with a soft glow, orbit rings and three floating promise cards.
function BrandVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[460px] aspect-square">
      <div className="absolute inset-[8%] rounded-full border border-vx-accent/30" />
      <div className="absolute inset-[22%] rounded-full border border-vx-accent/20" />
      <div className="absolute inset-[18%] rounded-full bg-vx-accent/30 blur-3xl" />
      <img src={vLogo} alt="" aria-hidden="true" className="absolute inset-[14%] w-[72%] h-[72%] object-contain drop-shadow-[0_0_40px_rgba(124,58,237,0.5)]" />
      {floaters.map(({ icon: Icon, title, sub, pos }) => (
        <div key={title} className={`absolute ${pos} flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-2xl bg-vx-surface/85 backdrop-blur border border-vx-line shadow-xl shadow-black/40`}>
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-vx-accent/25 text-vx-accent-soft"><Icon className="w-[18px] h-[18px]" /></span>
          <span>
            <span className="block text-[13px] font-semibold text-white leading-tight">{title}</span>
            <span className="block text-[11px] text-vx-muted">{sub}</span>
          </span>
        </div>
      ))}
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
      style={{ backgroundImage: 'radial-gradient(55% 80% at 90% 30%, rgba(124,58,237,0.26), transparent 70%)' }}
    >
      <div aria-hidden="true" className="vx-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 items-center px-8 py-12 sm:px-12 sm:py-14">
        <div>
          <h1 className="text-4xl sm:text-5xl xl:text-[58px] font-extrabold tracking-tight leading-[1.06] text-white">
            Sunucunuz ve markanız için{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-violet-300">Discord botu ve web sitesi.</span>
          </h1>
          <p className="mt-5 max-w-[540px] text-[16px] leading-relaxed text-zinc-200">
            Hazır paketlerle hemen sipariş verin ya da ihtiyacınıza özel teklif alın. Kurulumdan teslimata kadar her adımda yanınızdayız.
          </p>

          <ul className="mt-6 space-y-2.5">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-[14px] text-zinc-100"><Check className="w-4 h-4 text-vx-accent-text" /> {p}</li>
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

        <div className="hidden lg:block"><BrandVisual /></div>
      </div>
    </section>
  )
}
