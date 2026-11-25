import { Link } from 'react-router-dom'
import { ArrowRight, Check, Clock, ShoppingCart } from 'lucide-react'
import Button from './Button.jsx'
import FitImage from './FitImage.jsx'
import StarBar from './StarBar.jsx'
import { useRatings, ratingOf } from '../hooks/useLive.js'
import { useApp } from '../context/AppContext.jsx'
import { siteConfig } from '../config/siteConfig.js'
import { deliveryLabel, discountInfo, productPath, termsOf, totalFor, discountedTotalFor, formatPrice } from '../lib/format.js'
import { useSite } from '../context/SiteContext.jsx'

// Compact listing card. The whole card opens the product page (stretched link); the buy button stays separately clickable.
export default function ProductCard({ product, categoryName = '' }) {
  const { addToCart, cart, openCart } = useApp()
  const { termMonths, termDiscounts } = useSite()
  const rate = ratingOf(useRatings(), product)
  const quote = product.price == null
  const cover = (product.images || [])[0]
  const sale = discountInfo(product)
  const terms = termsOf(product)
  const months = terms.includes(termMonths) ? termMonths : (terms[0] || 1)
  const termPct = terms.length ? Number(termDiscounts?.[months]) || 0 : 0
  const termTotal = terms.length && product.price != null ? discountedTotalFor(product.price, months, termDiscounts) : product.price
  const termOldTotal = terms.length && product.price != null ? totalFor(product.price, months) : null
  const to = productPath(product)
  const inCart = cart.some((i) => i.key === `${product.slug}:${terms.length ? months : 'once'}`)

  return (
    <article id={product.slug} className={`group relative flex flex-col h-full rounded-2xl bg-vx-card border p-3 pb-4 transition-all duration-300 hover:shadow-[0_28px_60px_-30px_rgba(124,58,237,0.65)] ${product.popular ? 'border-vx-accent/60' : 'border-vx-line hover:border-vx-accent-text/40'}`}>
      <div className="relative">
        {cover ? (
          <FitImage src={cover} alt={product.name} className="aspect-[16/9] rounded-xl" imgClass="transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="aspect-[16/9] rounded-xl bg-gradient-to-br from-vx-accent/30 via-vx-surface to-vx-card grid place-items-center text-4xl font-black text-white/60">{(product.name || '?').slice(0, 1)}</div>
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {sale && <span className="px-2 h-6 inline-flex items-center rounded-md bg-rose-500 text-[11px] font-bold text-white shadow">%{sale.pct} İNDİRİM</span>}
          {product.popular && <span className="px-2 h-6 inline-flex items-center rounded-md bg-vx-accent text-[11px] font-semibold text-white shadow">⭐ En Çok Tercih Edilen</span>}
        </div>
        {(product.images || []).length > 1 && <span className="absolute right-2 bottom-2 px-2 h-6 inline-flex items-center rounded-md bg-black/60 text-[11px] text-white">{product.images.length} fotoğraf</span>}
      </div>

      <div className="flex flex-col flex-1 px-2 pt-3">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-vx-accent-soft">{categoryName ? `${categoryName}${product.subCategory ? ' · ' : ''}` : ''}{product.subCategory}</div>
        <h3 className="mt-0.5 text-[16px] font-semibold leading-snug text-white">
          <Link to={to} className="after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-vx-accent-text after:rounded-2xl group-hover:text-vx-accent-soft transition-colors">{product.name}</Link>
        </h3>
        <div className="mt-1.5 flex items-center gap-1.5 text-[12.5px]">
          <StarBar value={rate ? rate.average : 0} className="w-3.5 h-3.5" />
          {rate ? <><b className="text-white">{rate.average.toFixed(1)}</b><span className="text-vx-muted">({rate.count} değerlendirme)</span></> : <span className="text-vx-muted">Henüz değerlendirme yok</span>}
        </div>
        <p className="mt-1.5 text-[13px] leading-snug text-vx-muted line-clamp-2">{product.tagline}</p>

        <ul className="mt-2.5 space-y-1">
          {(product.features || []).slice(0, 3).map((f) => (
            <li key={f} className="flex items-start gap-2 text-[13px] text-zinc-100"><Check className="w-4 h-4 mt-0.5 shrink-0 text-vx-accent-text" /><span className="line-clamp-1">{f}</span></li>
          ))}
        </ul>

        <div className="mt-auto pt-3">
          <div className="flex items-end justify-between gap-3 border-t border-vx-line pt-3">
            <div className="min-w-0">
              {product.price == null ? <div className="text-[22px] font-black text-white">Teklif alın</div> : <><div className="flex items-baseline gap-2 flex-wrap"><span className="text-[24px] font-black tracking-tight tabular-nums text-white">{formatPrice(terms.length ? termTotal : product.price)}</span>{termPct > 0 && <span className="text-[13px] text-vx-muted line-through">{formatPrice(termOldTotal)}</span>}</div>{terms.length > 0 && termPct > 0 && <div className="mt-1 text-[11px] text-emerald-400">Seçilen döneme özel %{termPct} indirim</div>}</>}
            </div>
            <div className="pb-1 text-right text-[12px] text-vx-muted"><Clock className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />{deliveryLabel(product)}</div>
          </div>
          <div className="relative z-10 mt-3 flex items-center gap-2">
            {quote ? <Button size="sm" to={`${siteConfig.routes.contact}?konu=${encodeURIComponent(product.name)}`} className="flex-1">Teklif İste</Button> : (inCart ? <Button size="sm" variant="secondary" onClick={openCart} className="flex-1"><Check className="h-4 w-4 text-emerald-400" /> Sepette</Button> : <Button size="sm" onClick={() => addToCart(product, terms.length ? months : null)} className="flex-1"><ShoppingCart className="h-4 w-4" /> Sepete Ekle</Button>)}
            <Link to={to} className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl text-[13px] font-semibold text-vx-accent-soft hover:text-white transition-colors" aria-label={`${product.name} detayları`}>Detay <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" /></Link>
          </div>
        </div>
      </div>
    </article>
  )
}
