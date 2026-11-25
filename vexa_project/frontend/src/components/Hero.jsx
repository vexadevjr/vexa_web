import { ArrowRight, BadgeCheck, Clock, Headphones, PackageCheck, ShieldCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DiscordIcon } from './Icons.jsx'
import Button from './Button.jsx'
import FitImage from './FitImage.jsx'
import { iconFor } from '../lib/categories.js'
import { useSite } from '../context/SiteContext.jsx'
import useProducts from '../hooks/useProducts.js'
import { useCountUp, useDiscordStats, useStats } from '../hooks/useLive.js'
import { priceLabel, productPath } from '../lib/format.js'
import { external } from '../lib/scroll.js'

const nf = (n) => Number(n).toLocaleString('tr-TR')

const ASSURANCES = [
  { icon: BadgeCheck, title: 'Net fiyat', text: 'Gizli ücret yok' },
  { icon: Clock, title: 'Belirli teslim süresi', text: 'Süre baştan yazılı' },
  { icon: Headphones, title: '7/24 destek', text: 'Talep üzerinden yanıt' },
]

function StatCell({ icon: Icon, value, label, href }) {
  const v = useCountUp(value)
  const inner = (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-vx-line bg-vx-surface text-vx-accent-text"><Icon className="h-[18px] w-[18px]" /></span>
      <span className="min-w-0"><span className="block text-[22px] font-extrabold leading-none tabular-nums text-white">{nf(v)}</span><span className="mt-1 block text-[12.5px] text-vx-muted">{label}</span></span>
    </>
  )
  const cls = 'flex items-center gap-3.5 px-5 py-4 transition-colors'
  return href ? <a href={href} {...external} className={`${cls} hover:bg-vx-surface`}>{inner}</a> : <div className={cls}>{inner}</div>
}

// Gerçek rakamlar: Discord üyesi, kayıtlı müşteri, teslim edilen sipariş. Boş olanlar gösterilmez.
function TrustStats() {
  const discord = useDiscordStats()
  const stats = useStats()
  const { links } = useSite()
  const cells = []
  if (discord && discord.available && discord.members > 0) cells.push({ key: 'd', icon: DiscordIcon, value: discord.members, label: 'Discord topluluk üyesi', href: links.discord })
  if (stats && stats.available && stats.customers > 0) cells.push({ key: 'c', icon: Users, value: stats.customers, label: 'Kayıtlı müşteri' })
  if (stats && stats.available && stats.completedOrders > 0) cells.push({ key: 'o', icon: PackageCheck, value: stats.completedOrders, label: 'Teslim edilen sipariş' })
  if (!cells.length) return null
  const cols = cells.length === 1 ? 'sm:grid-cols-1' : cells.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
  return (
    <div className={`grid grid-cols-1 ${cols} divide-y divide-vx-line border-t border-vx-line sm:divide-x sm:divide-y-0`}>
      {cells.map(({ key, ...c }) => <StatCell key={key} {...c} />)}
    </div>
  )
}

// Sağ panel: gerçek "popüler paket" listesi (yönetim panelinde işaretlenenler)
function PackagePanel({ items, routes }) {
  if (!items.length) {
    return (
      <div className="flex h-full flex-col justify-center rounded-2xl border border-vx-line bg-vx-surface/70 p-6">
        <ShieldCheck className="h-8 w-8 text-vx-accent-text" strokeWidth={1.6} />
        <h2 className="mt-4 text-[17px] font-bold text-white">İhtiyacınıza özel çözüm</h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-vx-muted">Kapsamı birlikte belirleyelim, size yazılı fiyat ve teslim süresi iletelim.</p>
        <Link to={routes.contact} className="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-vx-accent-text hover:text-white">Teklif iste <ArrowRight className="h-4 w-4" /></Link>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-vx-line bg-vx-surface/70">
      <div className="flex items-center justify-between border-b border-vx-line px-5 py-4">
        <h2 className="text-[14px] font-bold text-white">En çok tercih edilen paketler</h2>
        <span className="rounded-md border border-vx-line bg-vx-card px-2 py-1 text-[11px] font-semibold text-vx-muted">{items.length} paket</span>
      </div>
      <ul className="flex-1 divide-y divide-vx-line">
        {items.map((p) => {
          const cover = (p.images || [])[0]
          return (
            <li key={p.slug}>
              <Link to={productPath(p)} className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-vx-card">
                <span className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-vx-line bg-vx-card">
                  {cover ? <FitImage src={cover} alt="" className="h-full w-full" /> : <span className="grid h-full w-full place-items-center text-lg font-black text-white/50">{(p.name || '?').slice(0, 1)}</span>}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-white">{p.name}</span>
                  <span className="block truncate text-[12.5px] text-vx-muted">{p.subCategory || p.tagline}</span>
                </span>
                <span className="shrink-0 text-right"><span className="block text-[14px] font-bold tabular-nums text-white">{priceLabel(p)}</span></span>
                <ArrowRight className="h-4 w-4 shrink-0 text-vx-muted transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
              </Link>
            </li>
          )
        })}
      </ul>
      <Link to={routes.contact} className="flex items-center justify-between border-t border-vx-line px-5 py-3.5 text-[13px] font-semibold text-vx-accent-text transition-colors hover:bg-vx-card hover:text-white">Aradığınız paket yok mu? Özel teklif alın <ArrowRight className="h-4 w-4" /></Link>
    </div>
  )
}

export default function Hero() {
  const products = useProducts()
  const { categories, routes } = useSite()
  const [c1, c2] = categories
  const I1 = iconFor(c1 && c1.icon)
  const I2 = iconFor(c2 && c2.icon)
  const picks = products.filter((p) => p.popular).slice(0, 3)
  const shown = picks.length ? picks : products.slice(0, 3)

  return (
    <section id="home" className="relative overflow-hidden rounded-3xl border border-vx-line bg-vx-card">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-vx-accent-text/60 to-transparent" />
      <div className="grid grid-cols-1 items-stretch gap-8 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1.15fr_1fr] lg:gap-12 xl:px-14 xl:py-14">
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-vx-line bg-vx-surface px-3.5 py-1.5 text-[12px] font-semibold text-zinc-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Discord bot ve web geliştirme</span>
          <h1 className="mt-5 text-[2.25rem] font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl xl:text-[3.25rem]">Markanız ve topluluğunuz için profesyonel dijital çözümler.</h1>
          <p className="mt-5 max-w-[540px] text-[16px] leading-relaxed text-zinc-300">Hazır paketlerle hemen sipariş verin ya da ihtiyacınıza özel yazılı teklif alın. Kapsam, fiyat ve teslim süresi baştan nettir.</p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {c1 && <Button size="lg" className="w-full sm:w-auto" to={c1.path}><I1 className="h-5 w-5" /> {c1.name}</Button>}
            {c2 && <Button size="lg" variant="secondary" className="w-full sm:w-auto" to={c2.path}><I2 className="h-5 w-5" /> {c2.name}</Button>}
          </div>

          <ul className="mt-8 grid max-w-[600px] grid-cols-1 gap-4 sm:grid-cols-3">
            {ASSURANCES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-vx-accent-text" /><span><span className="block text-[13.5px] font-semibold text-white">{title}</span><span className="block text-[12.5px] text-vx-muted">{text}</span></span></li>
            ))}
          </ul>
        </div>

        <PackagePanel items={shown} routes={routes} />
      </div>
      <TrustStats />
    </section>
  )
}
