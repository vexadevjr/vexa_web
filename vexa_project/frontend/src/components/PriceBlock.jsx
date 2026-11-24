import { formatPrice, discountInfo } from '../lib/format.js'

// Every product card uses this block, so prices line up identically across cards:
// row 1 chips (Başlangıç / indirim), row 2 old price, row 3 the price, row 4 the period.
export default function PriceBlock({ product, large = false, compact = false }) {
  const sale = discountInfo(product)
  const quote = product.price == null
  if (compact) {
    return (
      <div>
        <div className="h-5 flex items-center gap-2">
          {product.priceFrom && !quote && <span className="text-[11px] font-bold uppercase tracking-wide text-vx-accent-soft">Başlangıç</span>}
          {sale && <span className="px-1.5 h-5 inline-flex items-center rounded bg-rose-500 text-[11px] font-bold text-white">%{sale.pct}</span>}
        </div>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[30px] font-black tracking-tight tabular-nums text-white leading-none">{quote ? 'Teklif alın' : formatPrice(product.price)}</span>
          {sale && <span className="text-[14px] tabular-nums text-zinc-400/70 line-through decoration-rose-400/70 decoration-2">{formatPrice(sale.old)}</span>}
        </div>
        <div className="mt-1 h-4 text-[12px] text-vx-muted">{quote ? '' : product.period}</div>
      </div>
    )
  }
  return (
    <div className="flex flex-col">
      <div className="h-6 flex items-center gap-2">
        {product.priceFrom && !quote && <span className="px-2 h-6 inline-flex items-center rounded-md bg-vx-surface border border-vx-line text-[11px] font-semibold uppercase tracking-wide text-vx-accent-soft">Başlangıç</span>}
        {sale && <span className="px-2 h-6 inline-flex items-center rounded-md bg-rose-500/90 text-[11px] font-bold text-white">%{sale.pct} İNDİRİM</span>}
      </div>
      <div className="h-6 flex items-center">
        {sale && (
          <span className="text-[15px] font-medium tabular-nums text-zinc-400/70 line-through decoration-rose-400/70 decoration-2">{formatPrice(sale.old)}</span>
        )}
      </div>
      <div className={`font-black tracking-tight tabular-nums text-white leading-none ${large ? 'text-[38px]' : 'text-[32px]'} ${sale ? 'text-white' : ''}`}>
        {quote ? 'Teklif alın' : formatPrice(product.price)}
      </div>
      <div className="mt-1.5 h-4 text-[12px] text-vx-muted">{quote ? '' : product.period}</div>
    </div>
  )
}
