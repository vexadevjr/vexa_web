import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import ProductCard from './ProductCard.jsx'
import Reveal from './Reveal.jsx'
import useProducts from '../hooks/useProducts.js'
import { useSite } from '../context/SiteContext.jsx'

const FIRST = 6

// Home page shop window: ONLY the products the admin marked as "popular" (most preferred), from every category.
// Phones get a swipeable strip, larger screens a grid; long lists are folded after the first six.
export default function Featured() {
  const products = useProducts()
  const { categories } = useSite()
  const [all, setAll] = useState(false)
  const picks = products.filter((p) => p.popular)
  if (picks.length === 0) return null

  const shown = all ? picks : picks.slice(0, FIRST)
  const nameOf = (id) => ((categories || []).find((c) => c.id === id) || {}).name || ''
  const cols = picks.length === 1 ? 'sm:grid-cols-1 sm:max-w-md sm:mx-auto' : picks.length === 2 ? 'sm:grid-cols-2 xl:max-w-4xl xl:mx-auto' : 'sm:grid-cols-2 xl:grid-cols-3'

  return (
    <section id="services" className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute -inset-x-6 -top-10 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(124,58,237,0.16),transparent_70%)]" />
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Popüler Paketler</h2>
        </div>
        <div className="inline-flex items-center gap-2 h-9 px-3.5 rounded-full border border-vx-line bg-vx-card text-[12px] font-semibold text-zinc-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> {picks.length} paket
        </div>
      </div>

      <div className={`relative mt-6 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:overflow-visible ${cols} items-stretch`}>
        {shown.map((p, i) => (
          <div key={p.slug} className="shrink-0 w-[84%] snap-start sm:w-auto">
            <Reveal delay={Math.min(i, 5) * 70} className="h-full"><ProductCard product={p} categoryName={nameOf(p.category)} /></Reveal>
          </div>
        ))}
      </div>

      {picks.length > FIRST && (
        <div className="mt-6 text-center">
          <button type="button" onClick={() => setAll((v) => !v)} className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-vx-line bg-vx-card text-[14px] font-semibold text-white hover:border-vx-accent-text/50 hover:bg-vx-surface transition-colors">
            {all ? 'Daha az göster' : `Tüm popüler paketleri göster (${picks.length})`}
            <ChevronDown className={`w-4 h-4 transition-transform ${all ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}
    </section>
  )
}
