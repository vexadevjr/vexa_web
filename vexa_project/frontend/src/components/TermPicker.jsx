import { formatPrice, termLabel, termsOf, totalFor, discountedTotalFor, discountInfo } from '../lib/format.js'

// 1 Aylık / 3 Aylık / 6 Aylık / Yıllık selector: each option shows its total price.
export default function TermPicker({ product, value, onChange, discounts = {} }) {
  const terms = termsOf(product)
  if (!terms.length || product.price == null) return null
  const sale = discountInfo(product)
  return (
    <div role="radiogroup" aria-label="Abonelik süresi" className="product-term-grid">
      {terms.map((m) => {
        const on = m === value
        const now = discountedTotalFor(product.price, m, discounts)
        const old = totalFor(sale ? sale.old : product.price, m)
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(m)}
            className={`product-term-option rounded-lg border text-center transition-colors ${on ? 'border-vx-accent bg-vx-accent/15 text-white' : 'border-vx-line bg-vx-surface text-zinc-300 hover:border-vx-accent-text/40 hover:text-white'}`}
          >
            <span className="product-term-label block font-semibold">{termLabel(m)}</span>
            <span className={`product-term-price block tabular-nums ${on ? 'text-vx-accent-soft' : 'text-vx-muted'}`}>{old > now && <span className="mr-1 text-zinc-500 line-through decoration-rose-400/70">{formatPrice(old)}</span>}{formatPrice(now)}</span>
            {(Number(discounts[m]) || 0) > 0 && <span className="product-term-discount block text-emerald-400">%{discounts[m]} indirim</span>}
          </button>
        )
      })}
    </div>
  )
}
