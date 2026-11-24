import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import ProductCard from '../components/ProductCard.jsx'
import TrustBadges from '../components/TrustBadges.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import Reviews from '../components/Reviews.jsx'
import Button from '../components/Button.jsx'
import useProducts from '../hooks/useProducts.js'
import { useSite } from '../context/SiteContext.jsx'

// One page for every shop category (built-in or added from the admin panel): same look, different products.
export default function CategoryPage({ category }) {
  const { routes, termMonths, setTermMonths } = useSite()
  const all = useProducts()
  const [filter, setFilter] = useState('Tümü')
  const items = useMemo(() => all.filter((p) => p.category === category.id), [all, category.id])
  const visible = filter === 'Tümü' ? items : items.filter((p) => p.subCategory === filter)
  // sub-categories come straight from the products, so editing a product in /admin updates these chips
  const chips = ['Tümü', ...Array.from(new Set(items.map((p) => p.subCategory).filter(Boolean)))]
  const count = (c) => (c === 'Tümü' ? items.length : items.filter((p) => p.subCategory === c).length)

  return (
    <div className="space-y-10">
      <PageHeader title={category.title || category.name} description={category.description} />

      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {chips.length > 2 && (
          <div className="flex flex-wrap gap-2" role="tablist" aria-label={`${category.name} alt kategorileri`}>
            {chips.map((c) => (
              <button key={c} role="tab" aria-selected={filter === c} onClick={() => setFilter(c)} className={`h-10 px-4 rounded-xl text-[13px] font-semibold border transition-colors ${filter === c ? 'bg-vx-accent border-vx-accent text-white' : 'bg-vx-card border-vx-line text-vx-muted hover:text-white'}`}>
                {c} <span className="opacity-60">({count(c)})</span>
              </button>
            ))}
          </div>
        )}
        {items.some((p) => p.price != null && (Array.isArray(p.terms) ? p.terms.length : true)) && <div className="flex items-center justify-end gap-2 shrink-0"><span className="text-[12px] text-vx-muted">Ödeme dönemi</span><div className="inline-flex rounded-xl border border-vx-line bg-vx-card p-1" aria-label="Ödeme dönemi seçimi">{[[1,'Aylık'],[3,'3 Ay'],[6,'6 Ay'],[12,'Yıllık']].map(([m,l]) => <button key={m} type="button" onClick={() => setTermMonths(m)} className={`px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors ${termMonths === m ? 'bg-vx-accent text-white shadow' : 'text-vx-muted hover:text-white'}`}>{l}</button>)}</div></div>}
        </div>
        {items.length === 0 && (
          <div className="mt-6 rounded-2xl bg-vx-card border border-vx-line p-10 text-center">
            <p className="text-[16px] font-semibold text-white">Bu kategoride şu an ürün yok</p>
            <p className="mt-1 text-[14px] text-vx-muted">İhtiyacınızı anlatın, size özel teklif hazırlayalım.</p>
            <Button size="sm" to={`${routes.contact}?konu=${encodeURIComponent(category.name)}`} className="mt-5">Teklif İste</Button>
          </div>
        )}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
          {visible.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-6 rounded-2xl bg-vx-card border border-vx-line">
        <div>
          <h2 className="text-lg font-semibold text-white">Farklı bir ihtiyacınız mı var?</h2>
          <p className="mt-1 text-[14px] text-vx-muted">Kapsamı birlikte belirleyelim, size özel yazılı teklif hazırlayalım.</p>
        </div>
        <Button to={`${routes.contact}?konu=${encodeURIComponent(`Özel ${category.name}`)}`}>Teklif İste</Button>
      </section>

      <TrustBadges />
      <HowItWorks />
      <Reviews />
    </div>
  )
}
