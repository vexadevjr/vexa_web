import { Link } from 'react-router-dom'
import { Check, Clock } from 'lucide-react'
import Button from './Button.jsx'
import PriceBlock from './PriceBlock.jsx'
import { useApp } from '../context/AppContext.jsx'
import { siteConfig } from '../config/siteConfig.js'
import { deliveryLabel, productPath } from '../lib/format.js'

// Compact listing card: image, name, three key points, price and the buy button all fit on one screen.
export default function ProductCard({ product }) {
  const { openOrder } = useApp()
  const quote = product.price == null
  const cover = (product.images || [])[0]
  const to = productPath(product)

  return (
    <article id={product.slug} className={`relative flex flex-col h-full rounded-2xl bg-vx-card border p-4 transition-colors hover:border-vx-accent-text/40 ${product.popular ? 'border-vx-accent/60' : 'border-vx-line'}`}>
      <Link to={to} className="relative block aspect-[16/8] overflow-hidden rounded-xl bg-vx-surface" aria-label={`${product.name} detayları`}>
        {cover ? (
          <img src={cover} alt={product.name} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-vx-accent/30 to-vx-surface text-3xl font-black text-white/70">{(product.name || '?').slice(0, 1)}</div>
        )}
        {product.popular && <span className="absolute left-2 top-2 px-2 h-6 inline-flex items-center rounded-md bg-vx-accent text-[11px] font-semibold text-white">En çok tercih edilen</span>}
        {(product.images || []).length > 1 && <span className="absolute right-2 top-2 px-2 h-6 inline-flex items-center rounded-md bg-black/60 text-[11px] text-white">{product.images.length} fotoğraf</span>}
      </Link>

      <div className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-vx-accent-soft">{product.subCategory}</div>
      <h3 className="mt-1 text-[17px] font-semibold leading-snug text-white">
        <Link to={to} className="hover:text-vx-accent-soft transition-colors">{product.name}</Link>
      </h3>
      <p className="mt-1 text-[13px] leading-snug text-vx-muted line-clamp-2">{product.tagline}</p>

      <ul className="mt-3 space-y-1.5">
        {(product.features || []).slice(0, 3).map((f) => (
          <li key={f} className="flex items-start gap-2 text-[13px] text-zinc-100"><Check className="w-4 h-4 mt-0.5 shrink-0 text-vx-accent-text" /><span className="line-clamp-1">{f}</span></li>
        ))}
      </ul>

      <div className="mt-auto pt-4">
        <div className="flex items-end justify-between gap-3 border-t border-vx-line pt-3">
          <PriceBlock product={product} compact />
          <div className="pb-1 text-right text-[12px] text-vx-muted"><Clock className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />{deliveryLabel(product)}</div>
        </div>
        <div className="mt-3 flex gap-2">
          {quote ? <Button size="sm" to={`${siteConfig.routes.contact}?konu=${encodeURIComponent(product.name)}`} className="flex-1">Teklif İste</Button> : <Button size="sm" onClick={() => openOrder(product)} className="flex-1">Sipariş Ver</Button>}
          <Button size="sm" variant="secondary" to={to}>Detay</Button>
        </div>
      </div>
    </article>
  )
}
