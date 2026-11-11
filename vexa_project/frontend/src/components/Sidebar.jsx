import { Link, NavLink } from 'react-router-dom'
import { Home, Code2, LayoutGrid, Mail, ChevronRight, Headphones, X } from 'lucide-react'
import { DiscordIcon, GithubIcon, YoutubeIcon, XIcon } from './Icons.jsx'
import vLogo from '../assets/v-logo.png'
import { siteConfig } from '../config/siteConfig.js'
import { external } from '../lib/scroll.js'

const { routes, links } = siteConfig

const items = [
  { label: 'Ana Sayfa', icon: Home, to: routes.home },
  { label: 'Discord Botları', icon: DiscordIcon, to: routes.bots, chevron: true },
  { label: 'Web Geliştirme', icon: Code2, to: routes.web, chevron: true },
  { label: 'Portföy', icon: LayoutGrid, to: routes.portfolio },
  { label: 'İletişim', icon: Mail, to: routes.contact },
]

const socials = [
  { label: 'Discord', Icon: DiscordIcon, href: links.discord },
  { label: 'GitHub', Icon: GithubIcon, href: links.github },
  { label: 'YouTube', Icon: YoutubeIcon, href: links.youtube },
  { label: 'X', Icon: XIcon, href: links.x },
]

export default function Sidebar({ open, onClose }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-[215px] flex flex-col bg-vx-surface border-r border-vx-line transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      <button onClick={onClose} className="lg:hidden absolute top-3 right-3 text-vx-muted hover:text-white" aria-label="Kapat">
        <X className="w-5 h-5" />
      </button>

      <Link to={routes.home} onClick={onClose} className="flex flex-col items-center pt-9 pb-8" aria-label="Vexa Development ana sayfa">
        <img src={vLogo} alt="Vexa" className="w-[84px] h-auto" />
        <div className="mt-2 text-[22px] font-semibold tracking-[0.28em] leading-none pl-[0.28em] text-white">VEXA</div>
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
                isActive ? 'bg-vx-accent text-white' : 'text-vx-muted hover:text-white hover:bg-vx-card'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="flex-1">{label}</span>
            {chevron && <ChevronRight className="w-4 h-4 opacity-60" />}
          </NavLink>
        ))}
      </nav>

      <div className="h-10" />

      <Link
        to={routes.contact}
        onClick={onClose}
        className="mx-4 flex items-center gap-3 p-4 rounded-xl bg-vx-card border border-vx-line hover:border-vx-accent-text/40 transition-colors"
      >
        <Headphones className="w-6 h-6 text-vx-accent-text shrink-0" />
        <div>
          <div className="text-[14px] font-semibold leading-tight text-white">7/24 Destek</div>
          <div className="text-[11px] text-vx-muted mt-0.5">Her zaman yanınızdayız.</div>
        </div>
      </Link>

      <div className="mt-auto px-6 pb-6">
        <div className="text-[11px] text-vx-muted leading-relaxed">
          © 2026 Vexa Development
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
