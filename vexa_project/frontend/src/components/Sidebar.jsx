import { Link, NavLink } from 'react-router-dom'
import { Home, LayoutGrid, Mail, ChevronRight, X } from 'lucide-react'
import { iconFor } from '../lib/categories.js'
import { DiscordIcon, GithubIcon, YoutubeIcon, XIcon } from './Icons.jsx'
import vLogo from '../assets/vexstar-logo.png'
import { siteConfig } from '../config/siteConfig.js'
import { useSite } from '../context/SiteContext.jsx'
import { external } from '../lib/scroll.js'

const { routes } = siteConfig


const socialDefs = [
  { label: 'Discord', Icon: DiscordIcon, key: 'discord' },
  { label: 'GitHub', Icon: GithubIcon, key: 'github' },
  { label: 'YouTube', Icon: YoutubeIcon, key: 'youtube' },
  { label: 'X', Icon: XIcon, key: 'x' },
]

export default function Sidebar({ open, onClose }) {
  const { links, categories } = useSite()
  // shop categories come from the admin panel, so a new category shows up here automatically
  const items = [
    { label: 'Ana Sayfa', icon: Home, to: routes.home },
    ...categories.map((c) => ({ label: c.name, icon: iconFor(c.icon), to: c.path, chevron: true })),
    { label: 'Portföy', icon: LayoutGrid, to: routes.portfolio },
    { label: 'İletişim', icon: Mail, to: routes.contact },
  ]
  const socials = socialDefs.filter((s) => links[s.key]).map((s) => ({ ...s, href: links[s.key] }))
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-[215px] flex flex-col bg-vx-surface border-r border-vx-line transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      <button onClick={onClose} className="lg:hidden absolute top-3 right-3 text-vx-muted hover:text-white" aria-label="Kapat">
        <X className="w-5 h-5" />
      </button>

      <Link to={routes.home} onClick={onClose} className="flex flex-col items-center pt-9 pb-8" aria-label="Vexstar Development ana sayfa">
        <img src={vLogo} alt="Vexstar" className="w-[96px] h-auto" />
        <div className="mt-2 text-[22px] font-semibold tracking-[0.28em] leading-none pl-[0.28em] text-white">VEXSTAR</div>
        <div className="mt-1.5 text-[10px] tracking-[0.32em] text-vx-muted pl-[0.32em]">DEVELOPMENT</div>
      </Link>

      <nav className="px-4 space-y-1.5" aria-label="Ana menü">
        {items.map(({ label, icon: Icon, to, chevron }) => (
          <NavLink
            key={to}
            to={to}
            end={to === routes.home}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 h-12 px-4 rounded-xl text-[14px] font-medium transition-colors ${
                isActive ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-[0_8px_24px_-10px_rgba(124,58,237,0.9)]' : 'text-vx-muted hover:text-white hover:bg-vx-card hover:translate-x-0.5'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="flex-1">{label}</span>
            {chevron && <ChevronRight className="w-4 h-4 opacity-60" />}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-6 pb-6">
        <div className="text-[11px] text-vx-muted leading-relaxed">
          © 2026 Vexstar Development
          <br />
          Tüm hakları saklıdır.
        </div>
        <div className="flex items-center gap-5 mt-4 text-vx-muted">
          {socials.map(({ label, Icon, href }) => (
            <a key={label} href={href} {...external} aria-label={label} className="hover:text-white transition-colors">
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}
