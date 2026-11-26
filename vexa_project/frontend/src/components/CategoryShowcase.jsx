import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import useProducts from '../hooks/useProducts.js'
import { useSite } from '../context/SiteContext.jsx'
import { iconFor } from '../lib/categories.js'
import { formatPrice, productPath, termsOf } from '../lib/format.js'

// Ana sayfa vitrini: her hizmet kategorisi için gerçek ürün sayısı, başlangıç fiyatı ve ilk paketler.
// Kategoriler ve ürünler yönetim panelinden geldiği için yeni kategori otomatik görünür.
export default function CategoryShowcase() {
  const products = useProducts()
  const { categories, routes } = useSite()
  if (!categories || !categories.length) return null

  return (
    <section id="services">
      <span className="vx-eyebrow">Hizmetlerimiz</span>
      <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">İhtiyacınıza uygun hizmeti seçin</h2>
      <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-vx-muted">Her kategoride hazır paketler, net fiyat ve belirli teslim süresi. Özel bir istek için yazılı teklif de alabilirsiniz.</p>

      <div className="mt-6 grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((c) => {
          const Icon = iconFor(c.icon)
          const list = products.filter((p) => p.category === c.id)
          const priced = list.filter((p) => p.price != null)
          const min = priced.length ? priced.reduce((a, b) => (b.price < a.price ? b : a)) : null
          const monthly = min && termsOf(min).length > 0
          return (
            <article key={c.id} className="flex h-full flex-col rounded-2xl border border-vx-line bg-vx-card p-6">
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-vx-line bg-vx-surface text-vx-accent-text"><Icon className="h-6 w-6" /></span>
                <span className="rounded-md border border-vx-line bg-vx-surface px-2.5 py-1 text-[11.5px] font-semibold text-vx-muted">{list.length} paket</span>
              </div>
              <h3 className="mt-5 text-[19px] font-bold leading-snug text-white">{c.name}</h3>
              {c.description && <p className="mt-2 line-clamp-3 text-[13.5px] leading-relaxed text-vx-muted">{c.description}</p>}

              {list.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-vx-line pt-4">
                  {list.slice(0, 3).map((p) => (
                    <li key={p.slug}>
                      <Link to={productPath(p)} className="group flex items-center gap-2.5 text-[13.5px] text-zinc-200 transition-colors hover:text-white">
                        <Check className="h-4 w-4 shrink-0 text-vx-accent-text" /> <span className="min-w-0 flex-1 truncate">{p.name}</span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-vx-muted opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                <div>
                  {min ? <><div className="text-[12px] text-vx-muted">Başlangıç fiyatı</div><div className="text-[22px] font-black tabular-nums leading-tight text-white">{formatPrice(min.price)}{monthly && <span className="text-[13px] font-medium text-vx-muted"> / ay</span>}</div></> : <div className="text-[13px] text-vx-muted">Fiyat teklif usulüdür</div>}
                </div>
                <Link to={list.length ? c.path : `${routes.contact}?konu=${encodeURIComponent(c.name)}`} className="inline-flex h-11 items-center gap-2 rounded-xl border border-vx-accent/50 px-4 text-[14px] font-semibold text-white transition-colors hover:border-vx-accent hover:bg-vx-accent">{list.length ? 'İncele' : 'Teklif iste'} <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
