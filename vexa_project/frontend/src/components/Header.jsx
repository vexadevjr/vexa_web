import { Link } from 'react-router-dom'
import { LogIn, Menu, User } from 'lucide-react'
import SearchBox from './SearchBox.jsx'
import { useApp } from '../context/AppContext.jsx'
import { siteConfig } from '../config/siteConfig.js'

const btn =
  'inline-flex items-center gap-2 h-12 px-5 rounded-xl text-[13px] font-semibold text-white bg-vx-accent hover:bg-vx-accent-hover transition-colors duration-300'

export default function Header({ onMenu }) {
  const { user, openAuth } = useApp()

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

      <div className="ml-auto flex items-center gap-4">
        {user ? (
          <Link to={siteConfig.routes.panel} className={btn}>
            <User className="w-4 h-4" />
            <span className="max-w-[120px] truncate">{user.name}</span>
          </Link>
        ) : (
          <button onClick={() => openAuth('login')} className={btn}>
            Giriş Yap
            <LogIn className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  )
}
