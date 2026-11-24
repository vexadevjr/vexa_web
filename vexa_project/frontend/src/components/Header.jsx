import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Headphones, Search, X } from 'lucide-react'
import { siteConfig } from '../config/siteConfig.js'
import UserMenu from './UserMenu.jsx'
import SearchBox from './SearchBox.jsx'
import AnnouncementPill, { useActiveAnnouncement } from './AnnouncementBanner.jsx'
import vLogo from '../assets/vexstar-logo.png'

export default function Header({ onMenu }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const ann = useActiveAnnouncement()

  return (
    <header
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
      className="fixed top-0 inset-x-0 lg:left-[215px] z-30 border-b border-vx-line bg-vx-bg/85 backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 sm:gap-3 h-[68px] px-4 sm:px-8 lg:px-12">
        <button onClick={onMenu} className="lg:hidden w-11 h-11 shrink-0 grid place-items-center rounded-xl bg-vx-card border border-vx-line text-white" aria-label="Menü">
          <Menu className="w-5 h-5" />
        </button>

        <Link to={siteConfig.routes.home} className="md:hidden flex items-center gap-2 min-w-0" aria-label="Vexstar ana sayfa">
          <img src={vLogo} alt="" width="36" height="32" className="w-9 h-auto shrink-0" />
          <span className="text-[15px] font-bold tracking-[0.12em] text-white truncate">VEXSTAR</span>
        </Link>

        <div className={`hidden md:block ${ann ? 'w-[210px] lg:w-[250px] xl:w-[320px] shrink-0' : 'flex-1 max-w-[476px]'}`}><SearchBox /></div>

        {ann && <div className="hidden md:flex flex-1 min-w-0 justify-center"><AnnouncementPill data={ann} className="w-full max-w-[720px]" /></div>}

        <div className="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">
          <button onClick={() => setSearchOpen((o) => !o)} className="md:hidden w-11 h-11 grid place-items-center rounded-xl bg-vx-card border border-vx-line text-white" aria-label={searchOpen ? 'Aramayı kapat' : 'Ara'} aria-expanded={searchOpen}>
            {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
          <Link
            to={siteConfig.routes.contact}
            className="hidden lg:inline-flex items-center gap-2 h-11 px-4 rounded-xl text-[14px] font-semibold text-slate-100 border border-vx-line bg-vx-surface hover:border-vx-accent-text/50 hover:bg-vx-card transition-colors"
          >
            <span className="relative flex w-2 h-2"><span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" /><span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" /></span>
            <Headphones className="w-4 h-4 text-vx-accent-text" />
            7/24 Destek
          </Link>
          <UserMenu />
        </div>
      </div>

      {ann && <div className="md:hidden px-4 pb-2.5"><AnnouncementPill data={ann} className="w-full" /></div>}

      {searchOpen && (
        <div className="md:hidden px-4 pb-3 [&>div]:max-w-none">
          <SearchBox />
        </div>
      )}
    </header>
  )
}
