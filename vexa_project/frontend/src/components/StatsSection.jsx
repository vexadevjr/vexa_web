import { Box, Users, Star, ArrowRight } from 'lucide-react'
import { DiscordIcon } from './Icons.jsx'
import Shimmer from './Shimmer.jsx'

const stats = [
  { icon: Box, value: '500+', label: 'Tamamlanan projeler' },
  { icon: Users, value: '1K+', label: 'Müşteri Sayısı' },
  { icon: Star, value: '%99.9', label: 'Müşteri Memnuniyeti' },
]

export default function StatsSection() {
  return (
    <div className="h-full flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-4 px-6 py-8 rounded-2xl bg-[#131422] border border-purple-950/40">
        {stats.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex flex-col items-center text-center">
            <Icon className="w-6 h-6 text-indigo-400" strokeWidth={1.8} />
            <div className="mt-4 text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight">{value}</div>
            <div className="mt-2 text-[12px] sm:text-[13px] text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      <a
        href="#"
        className="group relative overflow-hidden flex-1 flex items-center gap-5 p-6 rounded-2xl bg-gradient-to-r from-indigo-600/20 to-[#131422] border border-indigo-500/40 hover:border-indigo-400/60 transition-colors duration-300"
      >
        <Shimmer />
        <DiscordIcon className="relative w-12 h-12 shrink-0 text-indigo-300" />
        <div className="relative flex-1 min-w-0">
          <div className="text-[16px] font-semibold text-white">Discord Sunucumuza Katılın</div>
          <div className="text-[13px] text-slate-400 mt-0.5">Güncellemeleri ve duyuruları kaçırmayın.</div>
        </div>
        <span className="relative flex items-center gap-2 h-10 px-5 rounded-full text-[13px] font-semibold text-white bg-[#0c0d14] border border-purple-950/60 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-colors duration-300">
          Katıl
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </a>
    </div>
  )
}
