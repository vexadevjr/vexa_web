import { Lock, ShieldCheck, Clock, RefreshCw } from 'lucide-react'
import { siteConfig } from '../config/siteConfig.js'

const icons = { lock: Lock, shield: ShieldCheck, clock: Clock, refresh: RefreshCw }

// compact: one short row (modals). Default: guarantee cards with explanations.
export default function TrustBadges({ compact = false }) {
  if (compact) {
    return (
      <ul className="flex flex-col gap-2 rounded-xl bg-vx-surface border border-vx-line p-4">
        {siteConfig.trust.map(({ icon, title }) => {
          const Icon = icons[icon] || ShieldCheck
          return (
            <li key={title} className="flex items-center gap-3 text-[12px] text-vx-muted">
              <Icon className="w-4 h-4 shrink-0 text-vx-accent-text" />
              {title}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {siteConfig.guarantees.map(({ icon, title, text }) => {
        const Icon = icons[icon] || ShieldCheck
        return (
          <div key={title} className="p-6 rounded-2xl bg-vx-card border border-vx-line">
            <Icon className="w-6 h-6 text-vx-accent-text" strokeWidth={1.8} />
            <h3 className="mt-4 text-[16px] font-semibold text-white">{title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-vx-muted">{text}</p>
          </div>
        )
      })}
    </section>
  )
}
