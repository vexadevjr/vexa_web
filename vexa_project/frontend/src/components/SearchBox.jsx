import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import useProducts from '../hooks/useProducts.js'
import { useSite } from '../context/SiteContext.jsx'
import { norm, productPath, priceLabel } from '../lib/format.js'

const CATEGORY_LABEL = { 'discord-bot': 'Discord Botu', web: 'Web Geliştirme', server: 'Sunucu', software: 'Yazılım' }

export default function SearchBox() {
  const products = useProducts()
  const { serviceCards } = useSite()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)

  // real-time filtering across products and the four main service areas
  const results = useMemo(() => {
    const term = norm(query.trim())
    if (term.length < 2) return []

    const fromProducts = products
      .filter((p) => norm([p.name, p.tagline, p.subCategory, p.category, ...(p.tags || []), ...(p.features || [])].join(' ')).includes(term))
      .map((p) => ({ key: p.slug, title: p.name, meta: CATEGORY_LABEL[p.category] || p.category, price: priceLabel(p), to: productPath(p) }))

    const fromServices = serviceCards
      .filter((s) => norm(`${s.title} ${s.desc}`).includes(term))
      .filter((s) => !fromProducts.some((r) => r.to === s.to))
      .map((s) => ({ key: s.title, title: s.title, meta: 'Hizmet', price: '', to: s.to }))

    return [...fromProducts, ...fromServices].slice(0, 7)
  }, [query, products, serviceCards])

  useEffect(() => {
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function go(to) {
    setOpen(false)
    setQuery('')
    navigate(to)
  }

  const showPanel = open && query.trim().length >= 2

  return (
    <div ref={boxRef} className="relative flex-1 max-w-[476px]">
      <label className="flex items-center gap-3 h-12 px-4 rounded-xl bg-vx-card border border-vx-line focus-within:border-vx-accent-text/60 transition-colors">
        <Search className="w-5 h-5 text-vx-muted" />
        <input
          type="search"
          value={query}
          placeholder="Hizmet ara..."
          aria-label="Hizmet ara"
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && results[0]) go(results[0].to)
            if (e.key === 'Escape') setOpen(false)
          }}
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-slate-500"
        />
      </label>

      {showPanel && (
        <div className="absolute left-0 right-0 top-14 z-30 rounded-xl bg-vx-card border border-vx-line overflow-hidden">
          {results.length === 0 ? (
            <div className="px-4 py-4 text-[13px] text-vx-muted">“{query}” için sonuç bulunamadı.</div>
          ) : (
            <ul>
              {results.map((r) => (
                <li key={r.key}>
                  <button
                    type="button"
                    onClick={() => go(r.to)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-vx-surface transition-colors"
                  >
                    <span>
                      <span className="block text-[14px] font-medium text-white">{r.title}</span>
                      <span className="block text-[12px] text-vx-muted">{r.meta}</span>
                    </span>
                    {r.price && <span className="text-[12px] font-semibold text-vx-accent-soft whitespace-nowrap">{r.price}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
