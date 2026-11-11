import { Box, Users, Star, ArrowRight } from 'lucide-react'
import { DiscordIcon } from './Icons.jsx'
import Shimmer from './Shimmer.jsx'
import { siteConfig } from '../config/siteConfig.js'
import { external } from '../lib/scroll.js'

const statIcons = [Box, Users, Star]

export function StatsGrid() {
  return (
    <div className="grid grid-cols-3 gap-4 px-6 py-8 rounded-2xl bg-vx-card border border-vx-line">
      {siteConfig.stats.map(({ value, label }, i) => {
        const Icon = statIcons[i] || Star
        return (
          <div key={label} className="flex flex-col items-center text-center">
            <Icon className="w-6 h-6 text-vx-accent-text" strokeWidth={1.8} />
            <div className="mt-4 text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight">{value}</div>
            <div className="mt-2 text-[12px] sm:text-[13px] text-vx-muted">{label}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function StatsSection() {
  return (
    <div className="h-full flex flex-col gap-5">
      <StatsGrid />

      <a
        href={siteConfig.links.discord}
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
