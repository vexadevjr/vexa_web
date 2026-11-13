import { Menu } from 'lucide-react'
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

      <div className="ml-auto flex items-center gap-4">
        <UserMenu />
      </div>
    </header>
  )
}
