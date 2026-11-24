import { formatPrice, termLabel, termsOf, totalFor, discountedTotalFor } from '../lib/format.js'

const COLS = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }

// 1 Aylık / 3 Aylık / 6 Aylık / Yıllık selector: each option shows its total price.
export default function TermPicker({ product, value, onChange, discounts = {} }) {
  const terms = termsOf(product)
  if (!terms.length || product.price == null) return null
  return (
    <div role="radiogroup" aria-label="Abonelik süresi" className={`grid gap-2 ${COLS[terms.length] || 'grid-cols-4'}`}>
      {terms.map((m) => {
        const on = m === value
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(m)}
            className={`rounded-xl border px-2 py-2.5 text-center transition-colors ${on ? 'border-vx-accent bg-vx-accent/15 text-white' : 'border-vx-line bg-vx-surface text-zinc-300 hover:border-vx-accent-text/40 hover:text-white'}`}
          >
            <span className="block text-[13px] font-semibold">{termLabel(m)}</span>
            <span className={`mt-0.5 block text-[11.5px] tabular-nums ${on ? 'text-vx-accent-soft' : 'text-vx-muted'}`}>{formatPrice(discountedTotalFor(product.price, m, discounts))}</span>
            {(Number(discounts[m]) || 0) > 0 && <span className="block text-[10px] text-emerald-400">%{discounts[m]} indirim</span>}
          </button>
        )
      })}
    </div>
  )
}
