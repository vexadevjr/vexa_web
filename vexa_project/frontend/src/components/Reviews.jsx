import { Star, BadgeCheck } from 'lucide-react'
import { siteConfig } from '../config/siteConfig.js'

export default function Reviews() {
  return (
    <section>
      <h2 className="text-2xl font-bold tracking-tight text-white">Müşteri Yorumları</h2>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
        {siteConfig.reviews.map((r) => (
          <figure key={r.name + r.product} className="flex flex-col p-6 rounded-2xl bg-vx-card border border-vx-line">
            <div className="flex gap-0.5" aria-label={`${r.rating} yıldız`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-vx-accent-soft text-vx-accent-soft' : 'text-vx-line'}`} />
              ))}
            </div>
            <blockquote className="mt-4 text-[14px] leading-relaxed text-slate-200">“{r.text}”</blockquote>
            <figcaption className="mt-auto pt-5 flex items-center justify-between gap-3">
              <div>
                <div className="text-[14px] font-semibold text-white">{r.name}</div>
                <div className="text-[12px] text-vx-muted">
                  {r.role} · {r.product}
                </div>
              </div>
              {r.verified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-vx-accent-soft">
                  <BadgeCheck className="w-4 h-4" /> Doğrulanmış müşteri
                </span>
              ) : (
                r.sample && <span className="text-[11px] text-slate-500">Örnek içerik</span>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
