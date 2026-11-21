import { ArrowRight, BadgeCheck, Headphones, Sparkles, Tag, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { iconFor } from '../lib/categories.js'
import { useSite } from '../context/SiteContext.jsx'
import Button from './Button.jsx'
import StarBar from './StarBar.jsx'
import useProducts from '../hooks/useProducts.js'
import { useStats } from '../hooks/useLive.js'
import { formatPrice, productPath } from '../lib/format.js'
import vLogo from '../assets/vexstar-logo.png'

const trio = [
  { icon: Tag, title: 'Net fiyat', sub: 'Gizli ücret yok' },
  { icon: Zap, title: 'Hızlı teslimat', sub: 'Süre baştan belli' },
  { icon: BadgeCheck, title: 'Ücretsiz hata düzeltme', sub: 'Teslimden sonra' },
]

const floaters = [
  { icon: Zap, title: 'Hızlı teslimat', sub: 'Süre baştan net', pos: 'top-4 left-0' },
  { icon: Headphones, title: '7/24 destek', sub: 'Her zaman yanınızda', pos: 'top-[46%] -right-3' },
]

// Brand visual: the Vexstar mark inside slowly turning rings, promise cards and a live "popular package" card.
function BrandVisual({ featured }) {
  return (
    <div className="relative mx-auto w-full max-w-[470px] aspect-square">
      <div className="vx-spin-slow absolute inset-[4%] rounded-full border border-dashed border-vx-accent/40" />
      <div className="vx-spin-rev absolute inset-[16%] rounded-full border border-vx-accent/25" />
      <div className="absolute inset-[22%] rounded-full bg-vx-accent/35 blur-3xl" />
      <div className="absolute inset-[30%] rounded-full bg-fuchsia-500/10 blur-2xl" />
      <img src={vLogo} alt="" aria-hidden="true" className="absolute inset-[16%] w-[68%] h-[68%] object-contain drop-shadow-[0_0_44px_rgba(124,58,237,0.6)]" />

      {floaters.map(({ icon: Icon, title, sub, pos }, i) => (
        <div key={title} style={{ animationDelay: `${i * 0.9}s` }} className={`vx-float absolute ${pos} flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-2xl bg-vx-surface/85 backdrop-blur border border-vx-line shadow-xl shadow-black/40`}>
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-vx-accent/25 text-vx-accent-soft"><Icon className="w-[18px] h-[18px]" /></span>
          <span>
            <span className="block text-[13px] font-semibold text-white leading-tight">{title}</span>
            <span className="block text-[11px] text-vx-muted">{sub}</span>
          </span>
        </div>
      ))}

      {featured && (
        <Link to={productPath(featured)} style={{ animationDelay: '1.8s' }} className="vx-float absolute bottom-3 left-2 right-2 sm:left-6 sm:right-auto sm:w-[250px] flex items-center gap-3 p-3 rounded-2xl bg-vx-surface/90 backdrop-blur border border-vx-accent/40 shadow-xl shadow-black/50 hover:border-vx-accent-text/70 transition-colors">
          <span className="grid place-items-center w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white"><Sparkles className="w-5 h-5" /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10.5px] font-bold uppercase tracking-wide text-vx-accent-soft">{featured.popular ? 'En çok tercih edilen' : 'Öne çıkan paket'}</span>
            <span className="block text-[14px] font-semibold text-white truncate">{featured.name}</span>
            <span className="block text-[13px] tabular-nums text-zinc-300">{featured.price == null ? 'Teklif alın' : formatPrice(featured.price)}</span>
          </span>
          <ArrowRight className="w-4 h-4 shrink-0 text-vx-accent-text" />
        </Link>
      )}
    </div>
  )
}

export default function Hero() {
  const stats = useStats()
  const products = useProducts()
  const { categories } = useSite()
  const [c1, c2] = categories
  const I1 = iconFor(c1 && c1.icon)
  const I2 = iconFor(c2 && c2.icon)
  const rated = stats && stats.available && stats.reviewCount > 0
  const featured = products.find((p) => p.popular) || products[0]

  return (
    <section id="home" className="relative rounded-[1.9rem] p-px bg-gradient-to-br from-violet-500/50 via-vx-line to-fuchsia-500/30">
      <div className="relative overflow-hidden rounded-[calc(1.9rem-1px)] bg-vx-card bg-[radial-gradient(60%_90%_at_88%_20%,rgba(124,58,237,0.3),transparent_70%),radial-gradient(45%_60%_at_0%_100%,rgba(217,70,239,0.12),transparent_70%)]">
        <div aria-hidden="true" className="vx-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.12fr_1fr] gap-8 items-center px-5 py-9 sm:px-10 sm:py-12 xl:px-14">
          <div>
            <div className="inline-flex items-center gap-2 h-8 px-3.5 rounded-full border border-vx-accent/40 bg-vx-accent/10 text-[12px] font-semibold text-vx-accent-soft">
              <span className="relative flex w-2 h-2"><span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" /><span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" /></span>
              {products.length > 0 ? `${products.length} hazır paket · net fiyat · hızlı teslimat` : 'Net fiyat · hızlı teslimat · 7/24 destek'}
            </div>

            <h1 className="mt-5 text-[2.5rem] sm:text-5xl xl:text-[3.5rem] font-extrabold tracking-tight leading-[1.05] text-white">
              Sunucunuz ve markanız için{' '}
              <span className="vx-gradient-text bg-clip-text text-transparent bg-gradient-to-r from-violet-300 via-fuchsia-300 to-violet-300">Discord botu ve web sitesi.</span>
            </h1>
            <p className="mt-5 max-w-[540px] text-[16px] leading-relaxed text-zinc-200">
              Hazır paketlerle hemen sipariş verin ya da ihtiyacınıza özel teklif alın. Kurulumdan teslimata kadar her adımda yanınızdayız.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {c1 && <Button size="lg" className="w-full sm:w-auto" to={c1.path}><I1 className="w-5 h-5" /> {c1.name}</Button>}
              {c2 && <Button size="lg" variant="secondary" className="w-full sm:w-auto" to={c2.path}><I2 className="w-5 h-5" /> {c2.name}</Button>}
              <Link to="/iletisim" className="inline-flex items-center gap-1.5 h-12 px-2 text-[14px] font-semibold text-vx-accent-soft hover:text-white transition-colors">Özel teklif iste <ArrowRight className="w-4 h-4" /></Link>
            </div>

            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-[620px]">
              {trio.map(({ icon: Icon, title, sub }) => (
                <li key={title} className="flex items-center gap-3 p-3 rounded-2xl bg-vx-surface/70 backdrop-blur border border-vx-line">
                  <span className="grid place-items-center w-9 h-9 shrink-0 rounded-xl bg-vx-accent/20 text-vx-accent-soft"><Icon className="w-[18px] h-[18px]" /></span>
                  <span className="min-w-0"><span className="block text-[13px] font-semibold text-white leading-tight">{title}</span><span className="block text-[11.5px] text-vx-muted">{sub}</span></span>
                </li>
              ))}
            </ul>

            {rated && (
              <div className="mt-6 flex items-center gap-3 text-[13px] text-vx-muted">
                <StarBar value={stats.average} className="w-4 h-4" />
                <span><b className="text-white">{stats.average.toFixed(1)}</b> / 5 · {stats.reviewCount} müşteri yorumu</span>
              </div>
            )}
          </div>

          <div className="hidden lg:block"><BrandVisual featured={featured} /></div>
        </div>
      </div>
    </section>
  )
}
