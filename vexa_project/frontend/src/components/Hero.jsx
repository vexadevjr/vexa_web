import { ArrowRight, Headphones, PackageCheck, Sparkles, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DiscordIcon } from './Icons.jsx'
import Button from './Button.jsx'
import { iconFor } from '../lib/categories.js'
import { useSite } from '../context/SiteContext.jsx'
import useProducts from '../hooks/useProducts.js'
import { useCountUp, useDiscordStats, useStats } from '../hooks/useLive.js'
import { formatPrice, productPath } from '../lib/format.js'
import { external } from '../lib/scroll.js'
import vLogo from '../assets/vexstar-logo.png'

const nf = (n) => Number(n).toLocaleString('tr-TR')

// One clickable bubble style used everywhere in the hero.
function Bubble({ to, icon: Icon, label, title, sub, className = '', delay = 0, float = false }) {
  return (
    <Link
      to={to}
      style={float ? { animationDelay: `${delay}s` } : undefined}
      className={`${float ? 'vx-float ' : ''}flex items-center gap-3 p-3 rounded-2xl bg-vx-surface/90 backdrop-blur border border-vx-accent/40 shadow-xl shadow-black/50 hover:border-vx-accent-text/70 transition-colors ${className}`}
    >
      <span className="grid place-items-center w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white"><Icon className="w-5 h-5" /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10.5px] font-bold uppercase tracking-wide text-vx-accent-soft">{label}</span>
        <span className="block text-[14px] font-semibold text-white truncate">{title}</span>
        <span className="block text-[13px] text-zinc-300 truncate">{sub}</span>
      </span>
      <ArrowRight className="w-4 h-4 shrink-0 text-vx-accent-text" />
    </Link>
  )
}

function BrandVisual({ featured, routes }) {
  return (
    <div className="relative mx-auto w-full max-w-[470px] aspect-square">
      <div className="vx-spin-slow absolute inset-[4%] rounded-full border border-dashed border-vx-accent/40" />
      <div className="vx-spin-rev absolute inset-[16%] rounded-full border border-vx-accent/25" />
      <div className="absolute inset-[22%] rounded-full bg-vx-accent/35 blur-3xl" />
      <img src={vLogo} alt="" aria-hidden="true" className="absolute inset-[16%] w-[68%] h-[68%] object-contain drop-shadow-[0_0_44px_rgba(124,58,237,0.6)]" />

      <Bubble float to={routes.contact} icon={Headphones} label="Destek" title="7/24 Destek" sub="Talep oluştur" className="absolute top-3 left-0 w-[240px]" />
      <Bubble float delay={0.9} to={routes.orders} icon={PackageCheck} label="Hesabım" title="Sipariş takibi" sub="Durumu adım adım izle" className="absolute top-[42%] right-0 w-[240px]" />
      {featured && (
        <Bubble float delay={1.8} to={productPath(featured)} icon={Sparkles} label={featured.popular ? 'En çok tercih edilen' : 'Öne çıkan paket'} title={featured.name} sub={featured.price == null ? 'Teklif alın' : formatPrice(featured.price)} className="absolute bottom-3 left-0 w-[250px]" />
      )}
    </div>
  )
}

function StatCell({ icon: Icon, value, label, sub, href }) {
  const v = useCountUp(value)
  const inner = (
    <>
      <span className="grid place-items-center w-11 h-11 shrink-0 rounded-xl bg-vx-accent/20 text-vx-accent-soft"><Icon className="w-5 h-5" /></span>
      <span className="min-w-0">
        <span className="block text-[24px] font-extrabold leading-none tabular-nums text-white">{nf(v)}</span>
        <span className="mt-1 block text-[12.5px] text-zinc-300">{label}</span>
        {sub && <span className="block text-[11.5px] text-vx-muted">{sub}</span>}
      </span>
    </>
  )
  const cls = 'flex items-center gap-3.5 px-4 py-3.5 transition-colors'
  return href ? <a href={href} {...external} className={`${cls} hover:bg-vx-card`}>{inner}</a> : <div className={cls}>{inner}</div>
}

// Real numbers only: Discord members (read from Discord), registered customers, delivered orders. Empty values are skipped.
function TrustStats() {
  const discord = useDiscordStats()
  const stats = useStats()
  const { links } = useSite()
  const cells = []
  if (discord && discord.available && discord.members > 0) {
    cells.push({ key: 'd', icon: DiscordIcon, value: discord.members, label: 'Discord topluluk üyesi', sub: discord.online > 0 ? `${nf(discord.online)} çevrimiçi` : '', href: links.discord })
  }
  if (stats && stats.available && stats.customers > 0) cells.push({ key: 'c', icon: Users, value: stats.customers, label: 'Kayıtlı müşteri' })
  if (stats && stats.available && stats.completedOrders > 0) cells.push({ key: 'o', icon: PackageCheck, value: stats.completedOrders, label: 'Teslim edilen sipariş' })
  if (!cells.length) return null
  const cols = cells.length === 1 ? 'sm:grid-cols-1 sm:max-w-sm' : cells.length === 2 ? 'sm:grid-cols-2 sm:max-w-xl' : 'sm:grid-cols-3'
  return (
    <div className={`mt-8 grid grid-cols-1 ${cols} divide-y sm:divide-y-0 sm:divide-x divide-vx-line overflow-hidden rounded-2xl border border-vx-line bg-vx-surface/70 backdrop-blur`}>
      {cells.map(({ key, ...c }) => <StatCell key={key} {...c} />)}
    </div>
  )
}

export default function Hero() {
  const products = useProducts()
  const { categories, routes } = useSite()
  const [c1, c2] = categories
  const I1 = iconFor(c1 && c1.icon)
  const I2 = iconFor(c2 && c2.icon)
  const featured = products.find((p) => p.popular) || products[0]

  return (
    <section id="home" className="relative rounded-[1.9rem] p-px bg-gradient-to-br from-violet-500/50 via-vx-line to-fuchsia-500/30">
      <div className="relative overflow-hidden rounded-[calc(1.9rem-1px)] bg-vx-card bg-[radial-gradient(60%_90%_at_88%_20%,rgba(124,58,237,0.28),transparent_70%)]">
        <div aria-hidden="true" className="vx-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.12fr_1fr] gap-8 items-center px-5 py-9 sm:px-10 sm:py-12 xl:px-14">
          <div>
            <h1 className="text-[2.5rem] sm:text-5xl xl:text-[3.5rem] font-extrabold tracking-tight leading-[1.05] text-white">
              Sunucunuz ve markanız için{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-fuchsia-300">Discord botu ve web sitesi.</span>
            </h1>
            <p className="mt-5 max-w-[520px] text-[16px] leading-relaxed text-zinc-200">Hazır paketlerle hemen sipariş verin veya ihtiyacınıza özel teklif alın.</p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {c1 && <Button size="lg" className="w-full sm:w-auto" to={c1.path}><I1 className="w-5 h-5" /> {c1.name}</Button>}
              {c2 && <Button size="lg" variant="secondary" className="w-full sm:w-auto" to={c2.path}><I2 className="w-5 h-5" /> {c2.name}</Button>}
              <Link to={routes.contact} className="inline-flex items-center gap-1.5 h-12 px-2 text-[14px] font-semibold text-vx-accent-soft hover:text-white transition-colors">Teklif iste <ArrowRight className="w-4 h-4" /></Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:hidden">
              <Bubble to={routes.contact} icon={Headphones} label="Destek" title="7/24 Destek" sub="Talep oluştur" />
              <Bubble to={routes.orders} icon={PackageCheck} label="Hesabım" title="Sipariş takibi" sub="Durumu adım adım izle" />
              {featured && <Bubble to={productPath(featured)} icon={Sparkles} label={featured.popular ? 'En çok tercih edilen' : 'Öne çıkan paket'} title={featured.name} sub={featured.price == null ? 'Teklif alın' : formatPrice(featured.price)} className="sm:col-span-2" />}
            </div>

            <TrustStats />
          </div>

          <div className="hidden lg:block"><BrandVisual featured={featured} routes={routes} /></div>
        </div>
      </div>
    </section>
  )
}
