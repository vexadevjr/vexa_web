import { Check, Clock } from 'lucide-react'
import Button from './Button.jsx'
import Gallery from './Gallery.jsx'
import PriceBlock from './PriceBlock.jsx'
import { useApp } from '../context/AppContext.jsx'
import { siteConfig } from '../config/siteConfig.js'
import { deliveryLabel } from '../lib/format.js'

export default function ProductCard({ product, large = false }) {
  const { openOrder } = useApp()
  const quote = product.price == null
  const images = product.images || []

  return (
    <article
      id={product.slug}
      className={`relative flex flex-col h-full rounded-2xl bg-vx-card border transition-colors hover:border-vx-accent-text/40 ${
        product.popular ? 'border-vx-accent/60' : 'border-vx-line'
      } ${large ? 'p-8' : 'p-6'}`}
    >
      {images.length > 0 && <Gallery images={images} alt={product.name} aspect="aspect-[16/9]" className="mb-5" />}

      <div className="flex items-center gap-2">
        <span className="px-2.5 h-6 inline-flex items-center rounded-md bg-vx-surface border border-vx-line text-[11px] font-medium text-vx-accent-soft">
          {product.subCategory}
        </span>
        {product.popular && (
          <span className="px-2.5 h-6 inline-flex items-center rounded-md bg-vx-accent text-[11px] font-semibold text-white">En çok tercih edilen</span>
        )}
      </div>

      <h3 className={`mt-4 font-semibold text-white ${large ? 'text-2xl' : 'text-[19px]'}`}>{product.name}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-vx-muted">{product.tagline}</p>

      <ul className="mt-5 space-y-2.5">
        {product.features.slice(0, large ? 6 : 5).map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[13px] text-zinc-100">
            <Check className="w-4 h-4 mt-0.5 shrink-0 text-vx-accent-text" />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <div className="border-t border-vx-line pt-5">
          <PriceBlock product={product} large={large} />
          <div className="mt-3 flex items-center gap-1.5 text-[13px] text-vx-muted">
            <Clock className="w-4 h-4 shrink-0" /> Teslim: <span className="text-zinc-100">{deliveryLabel(product)}</span>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          {quote ? (
            <Button to={`${siteConfig.routes.contact}?konu=${encodeURIComponent(product.name)}`} className="flex-1">
              Teklif İste
            </Button>
          ) : (
            <Button onClick={() => openOrder(product)} className="flex-1">
              Sipariş Ver
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
