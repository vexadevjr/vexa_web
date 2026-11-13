import { Lock, ShieldCheck, Clock, RefreshCw } from 'lucide-react'
import { useSite } from '../context/SiteContext.jsx'

const icons = { lock: Lock, shield: ShieldCheck, clock: Clock, refresh: RefreshCw }

export default function WhyUs() {
  const { guarantees } = useSite()
  if (!guarantees.length) return null
  return (
    <section>
      <h2 className="text-2xl font-bold tracking-tight text-white">Neden Vexstar Development?</h2>
      <p className="mt-1 text-[14px] text-vx-muted">Sipariş vermeden önce bilmeniz gereken taahhütlerimiz.</p>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {guarantees.map(({ icon, title, text }) => {
          const Icon = icons[icon] || ShieldCheck
          return (
            <div key={title} className="p-6 rounded-2xl bg-vx-card border border-vx-line">
              <Icon className="w-7 h-7 text-vx-accent-text" strokeWidth={1.8} />
              <h3 className="mt-4 text-[15px] font-semibold text-white">{title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-vx-muted">{text}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
