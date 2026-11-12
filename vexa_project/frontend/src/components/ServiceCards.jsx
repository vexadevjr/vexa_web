import { Link } from 'react-router-dom'
import { Code2, Server, Settings, ArrowRight } from 'lucide-react'
import { DiscordIcon } from './Icons.jsx'
import { siteConfig } from '../config/siteConfig.js'
import { useSite } from '../context/SiteContext.jsx'
import { idOf } from '../lib/scroll.js'

const icons = { discord: DiscordIcon, code: Code2, server: Server, settings: Settings }

export default function ServiceCards() {
  const { serviceCards } = useSite()
  return (
    <section id={idOf(siteConfig.sections.services)} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
      {serviceCards.map(({ title, icon, desc, to }) => {
        const Icon = icons[icon] || Settings
        return (
          <Link
            key={title}
            to={to}
            className="group h-full min-h-[190px] flex flex-col p-6 rounded-2xl bg-vx-card border border-vx-line transition-colors hover:border-vx-accent-text/40"
          >
            <div className="flex gap-4">
              <Icon className="w-9 h-9 shrink-0 text-vx-accent-text" strokeWidth={2} />
              <div className="min-w-0">
                <h3 className="text-[17px] font-semibold text-white">{title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-vx-muted">{desc}</p>
              </div>
            </div>

            <div className="mt-auto pt-6 flex items-center justify-between">
              <span className="flex items-center gap-2 text-[14px] font-semibold text-vx-accent-text group-hover:text-vx-accent-soft transition-colors">
                İncele
                <ArrowRight className="w-4 h-4" />
              </span>
              <span className="grid place-items-center shrink-0 w-9 h-9 rounded-full bg-vx-surface border border-vx-line text-white group-hover:bg-vx-accent group-hover:border-vx-accent transition-colors">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        )
      })}
    </section>
  )
}
