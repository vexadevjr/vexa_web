import { Box, Users, ArrowRight } from 'lucide-react'
import StarBar from './StarBar.jsx'
import { DiscordIcon } from './Icons.jsx'
import Shimmer from './Shimmer.jsx'
import { useSite } from '../context/SiteContext.jsx'
import { useStats } from '../hooks/useLive.js'
import { external } from '../lib/scroll.js'

const num = (n) => Number(n).toLocaleString('tr-TR')

// Every figure here is computed by the server from real data: delivered orders, registered
// customers and the stars on approved customer reviews. Nothing is typed in by hand.
export function StatsGrid() {
  const stats = useStats()
  const ready = stats && stats.available
  const dash = stats ? '—' : '…'

  const items = [
    { Icon: Box, value: ready ? num(stats.completedOrders) : dash, label: 'Teslim edilen sipariş' },
    { Icon: Users, value: ready ? num(stats.customers) : dash, label: 'Kayıtlı müşteri' },
  ]

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 px-6 py-8 rounded-2xl bg-vx-card border border-vx-line">
      {items.map(({ Icon, value, label }) => (
        <div key={label} className="flex flex-col items-center text-center">
          <Icon className="w-6 h-6 text-vx-accent-text" strokeWidth={1.8} />
          <div className="mt-4 text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight">{value}</div>
          <div className="mt-2 text-[12px] sm:text-[13px] text-vx-muted">{label}</div>
        </div>
      ))}
      <div className="col-span-2 flex flex-col items-center text-center pt-6 border-t border-vx-line">
        <StarBar value={ready && stats.reviewCount ? stats.average : 0} className="w-8 h-8 sm:w-9 sm:h-9" />
        <div className="mt-3 text-3xl sm:text-4xl font-black text-white tracking-tight">{ready && stats.reviewCount ? stats.average.toFixed(1) : dash}</div>
        <div className="mt-1 text-[12px] sm:text-[13px] text-vx-muted">
          {ready && stats.reviewCount ? `Müşteri memnuniyeti (${num(stats.reviewCount)} yorum)` : 'Müşteri memnuniyeti (henüz yorum yok)'}
        </div>
      </div>
    </div>
  )
}

export default function StatsSection() {
  const { links } = useSite()
  return (
    <div className="h-full flex flex-col gap-5">
      <StatsGrid />

      <a
        href={links.discord}
        {...external}
        className="group relative overflow-hidden flex-1 flex items-center gap-5 p-6 rounded-2xl bg-gradient-to-r from-vx-accent/20 to-vx-card border border-vx-accent/40 hover:border-vx-accent-text/60 transition-colors duration-300"
      >
        <Shimmer />
        <DiscordIcon className="relative w-12 h-12 shrink-0 text-vx-accent-soft" />
        <div className="relative flex-1 min-w-0">
          <div className="text-[16px] font-semibold text-white">Discord Sunucumuza Katılın</div>
          <div className="text-[13px] text-vx-muted mt-0.5">Güncellemeleri ve duyuruları kaçırmayın.</div>
        </div>
        <span className="relative flex items-center gap-2 h-10 px-5 rounded-full text-[13px] font-semibold text-white bg-vx-surface border border-vx-line group-hover:bg-vx-accent group-hover:border-vx-accent transition-colors duration-300">
          Katıl
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </a>
    </div>
  )
}
