import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ProductCard from './ProductCard.jsx'
import useProducts from '../hooks/useProducts.js'
import { useSite } from '../context/SiteContext.jsx'

// Home page shop window: the popular products first, so a visitor sees real prices without clicking around.
export default function Featured() {
  const products = useProducts()
  const { categories } = useSite()
  const [tab, setTab] = useState('')
  const active = categories.find((c) => c.id === tab) || categories[0]
  const picks = products.filter((p) => active && p.category === active.id).sort((a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular))).slice(0, 3)

  return (
    <section id="services">
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="vx-eyebrow">Paketler</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Popüler Paketler</h2>
          <p className="mt-1 text-[14px] text-vx-muted">En çok tercih edilenler, net fiyatlarla.</p>
        </div>
        <div className="flex items-center gap-2">
          {categories.map(({ id, name: l }) => (
            <button key={id} onClick={() => setTab(id)} className={`h-10 px-4 rounded-xl text-[13px] font-semibold border transition-colors ${active && active.id === id ? 'bg-vx-accent border-vx-accent text-white' : 'bg-vx-card border-vx-line text-vx-muted hover:text-white'}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
        {picks.length === 0 && <p className="text-[14px] text-vx-muted">Bu kategoride şu an paket yok.</p>}
        {picks.map((p) => <ProductCard key={p.slug} product={p} />)}
      </div>

      <div className="mt-5 text-center">
        <Link to={active ? active.path : '/'} className="inline-flex items-center gap-2 text-[14px] font-semibold text-vx-accent-text hover:text-vx-accent-soft">
          {active ? `Tüm ${active.name} ürünlerini gör` : ''} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}
