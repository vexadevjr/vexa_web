import { Home, Code2, LayoutGrid, Mail, ChevronRight, Headphones, X } from 'lucide-react'
import { DiscordIcon, GithubIcon, YoutubeIcon, XIcon } from './Icons.jsx'
import vLogo from '../assets/v-logo.png'

const items = [
  { label: 'Ana Sayfa', icon: Home, active: true },
  { label: 'Discord Botları', icon: DiscordIcon, chevron: true },
  { label: 'Web Geliştirme', icon: Code2, chevron: true },
  { label: 'Portföy', icon: LayoutGrid },
  { label: 'İletişim', icon: Mail },
]

const socials = [
  { label: 'Discord', Icon: DiscordIcon },
  { label: 'GitHub', Icon: GithubIcon },
  { label: 'YouTube', Icon: YoutubeIcon },
  { label: 'X', Icon: XIcon },
]

export default function Sidebar({ open, onClose }) {
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
        {items.map(({ label, icon: Icon, active, chevron }) => (
          <a
            key={label}
            href="#"
            className={`flex items-center gap-3 h-12 px-4 rounded-xl text-[14px] font-medium transition-colors ${
              active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-[#131422]'
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="flex-1">{label}</span>
            {chevron && <ChevronRight className="w-4 h-4 text-slate-500" />}
          </a>
        ))}
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
          {socials.map(({ label, Icon }) => (
            <a key={label} href="#" aria-label={label} className="hover:text-white transition-colors">
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}
