import { useState } from 'react'
import { Home, Code2, LayoutGrid, Mail, ChevronRight, Headphones, X } from 'lucide-react'
import { DiscordIcon, GithubIcon, YoutubeIcon, XIcon } from './Icons.jsx'
import vLogo from '../assets/v-logo.png'
import { siteConfig } from '../config/siteConfig.js'
import { scrollToHash, external } from '../lib/scroll.js'

const { sections, links } = siteConfig

const items = [
  { key: 'home', label: 'Ana Sayfa', icon: Home, section: sections.home },
  { key: 'discordBots', label: 'Discord Botları', icon: DiscordIcon, chevron: true, section: sections.discordBots },
  { key: 'webDevelopment', label: 'Web Geliştirme', icon: Code2, chevron: true, section: sections.webDevelopment },
  { key: 'portfolio', label: 'Portföy', icon: LayoutGrid, section: sections.portfolio },
  { key: 'contact', label: 'İletişim', icon: Mail, section: sections.contact },
]

const socials = [
  { label: 'Discord', Icon: DiscordIcon, href: links.discord },
  { label: 'GitHub', Icon: GithubIcon, href: links.github },
  { label: 'YouTube', Icon: YoutubeIcon, href: links.youtube },
  { label: 'X', Icon: XIcon, href: links.x },
]

export default function Sidebar({ open, onClose }) {
  const [activeKey, setActiveKey] = useState('home')

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-[215px] flex flex-col bg-[#0a0b13] border-r border-purple-950/40 transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      <button onClick={onClose} className="lg:hidden absolute top-3 right-3 text-slate-400 hover:text-white" aria-label="Kapat">
        <X className="w-5 h-5" />
      </button>

      <div className="flex flex-col items-center pt-9 pb-8">
        <img src={vLogo} alt="Vexa" className="w-[84px] h-auto" />
        <div className="mt-2 text-[22px] font-semibold tracking-[0.28em] leading-none pl-[0.28em] text-white">VEXA</div>
        <div className="mt-1.5 text-[10px] tracking-[0.32em] text-slate-400 pl-[0.32em]">DEVELOPMENT</div>
      </div>

      <nav className="px-4 space-y-1.5">
        {items.map(({ key, label, icon: Icon, chevron, section }) => {
          const active = activeKey === key
          return (
            <a
              key={key}
              href={section}
              onClick={(e) =>
                scrollToHash(e, section, () => {
                  setActiveKey(key)
                  onClose()
                })
              }
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 h-12 px-4 rounded-xl text-[14px] font-medium transition-colors ${
                active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-[#131422]'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="flex-1">{label}</span>
              {chevron && <ChevronRight className="w-4 h-4 text-slate-500" />}
            </a>
          )
        })}
      </nav>

      <div className="h-10" />

      <div className="relative mx-4 flex items-center gap-3 p-4 rounded-xl bg-[#131422] border border-purple-950/40">
        <Headphones className="w-6 h-6 text-indigo-400 shrink-0" />
        <div>
          <div className="text-[14px] font-semibold leading-tight text-white">7/24 Destek</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Her zaman yanınızdayız.</div>
        </div>
      </div>

      <div className="mt-auto px-6 pb-6">
        <div className="text-[11px] text-slate-400 leading-relaxed">
          © 2026 Vexa Development
          <br />
          Tüm hakları saklıdır.
        </div>
        <div className="flex items-center gap-5 mt-4 text-slate-400">
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
