import { Search, LogIn, Menu } from 'lucide-react'
import { siteConfig } from '../config/siteConfig.js'
import { external } from '../lib/scroll.js'

export default function Header({ onMenu }) {
  return (
    <header className="flex items-center gap-3">
      <button
        onClick={onMenu}
        className="lg:hidden w-11 h-11 grid place-items-center rounded-xl bg-[#131422] border border-purple-950/40 text-white"
        aria-label="Menü"
      >
        <Menu className="w-5 h-5" />
      </button>

      <label className="flex-1 max-w-[476px] flex items-center gap-3 h-12 px-4 rounded-xl bg-[#131422] border border-purple-950/40 focus-within:border-indigo-500/60 transition-colors">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Hizmet ara..."
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-slate-500"
        />
      </label>

      <div className="ml-auto flex items-center gap-4">

        <a href={siteConfig.links.login} {...external} className="inline-flex items-center gap-2 h-12 px-5 rounded-xl text-[13px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300">
          Giriş Yap
          <LogIn className="w-4 h-4" />
        </a>
      </div>
    </header>
  )
}
