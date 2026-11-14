import { Link } from 'react-router-dom'
import { Menu, Headphones } from 'lucide-react'
import { siteConfig } from '../config/siteConfig.js'
import UserMenu from './UserMenu.jsx'
import SearchBox from './SearchBox.jsx'

export default function Header({ onMenu }) {

  return (
    <header className="flex items-center gap-3">
      <button
        onClick={onMenu}
        className="lg:hidden w-11 h-11 shrink-0 grid place-items-center rounded-xl bg-vx-card border border-vx-line text-white"
        aria-label="Menü"
      >
        <Menu className="w-5 h-5" />
      </button>

      <SearchBox />

      <div className="ml-auto flex items-center gap-3 sm:gap-4">
        <Link
          to={siteConfig.routes.contact}
          className="hidden md:inline-flex items-center gap-2 h-11 px-4 rounded-xl text-[14px] font-semibold text-slate-100 border border-vx-line bg-vx-surface hover:border-vx-accent-text/50 hover:bg-vx-card transition-colors"
        >
          <span className="relative flex w-2 h-2"><span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" /><span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" /></span>
          <Headphones className="w-4 h-4 text-vx-accent-text" />
          7/24 Destek
        </Link>
        <UserMenu />
      </div>
    </header>
  )
}
