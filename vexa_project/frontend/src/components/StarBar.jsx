import { Star } from 'lucide-react'

// Five empty stars; a filled copy is clipped on top so exactly `value` / 5 of the row is filled (4.5 = four and a half stars).
export default function StarBar({ value = 0, className = 'w-7 h-7' }) {
  const pct = Math.max(0, Math.min(5, value)) * 20
  const row = (fill) => (
    <div className="flex gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className={`${className} shrink-0 ${fill ? 'fill-vx-accent-soft text-vx-accent-soft' : 'text-slate-600'}`} strokeWidth={1.6} />
      ))}
    </div>
  )
  return (
    <div className="relative inline-block" role="img" aria-label={`5 üzerinden ${value}`}>
      {row(false)}
      <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>
        {row(true)}
      </div>
    </div>
  )
}
