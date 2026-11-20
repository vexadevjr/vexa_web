import ProductCard from './ProductCard.jsx'
import useProducts from '../hooks/useProducts.js'
import { Flame } from 'lucide-react'

// Home page shop window: ONLY the products the admin marked as "popular" (most preferred), from every category.
export default function Featured() {
  const products = useProducts()
  const picks = products.filter((p) => p.popular)
  if (picks.length === 0) return null

  return (
    <section id="services">
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="vx-eyebrow inline-flex items-center gap-1.5"><Flame className="w-3.5 h-3.5" /> En çok tercih edilenler</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Popüler Paketler</h2>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
        {picks.map((p) => <ProductCard key={p.slug} product={p} />)}
      </div>
    </section>
  )
}
