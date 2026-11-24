import { useEffect, useState } from 'react'
import { Star, BadgeCheck } from 'lucide-react'
import Button from './Button.jsx'
import StarBar from './StarBar.jsx'
import { inputCls } from './Field.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useReviews } from '../hooks/useLive.js'
import useProducts from '../hooks/useProducts.js'
import { api } from '../lib/api.js'
import { dateLabel } from '../lib/format.js'

const Stars = ({ value, className = 'w-4 h-4' }) => (
  <div className="flex gap-0.5" aria-label={`${value} yıldız`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`${className} ${i < Math.round(value) ? 'fill-vx-accent-soft text-vx-accent-soft' : 'text-vx-line'}`} />
    ))}
  </div>
)

export default function Reviews() {
  const { loading, reviews, stats, reload } = useReviews()

  return (
    <section id="yorumlar">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Müşteri Yorumları</h2>
        {stats && stats.count > 0 && (
          <div className="flex items-center gap-3 text-[13px] text-vx-muted">
            <StarBar value={stats.average} className="w-5 h-5" />
            <span>
              <strong className="text-white">{stats.average.toFixed(1)}</strong> / 5 · {stats.count} yorum
            </span>
          </div>
        )}
      </div>

      {!loading && reviews.length === 0 && (
        <div className="mt-5 p-6 rounded-2xl bg-vx-card border border-vx-line text-[14px] text-vx-muted">Henüz yayınlanmış yorum yok.</div>
      )}

      {reviews.length > 0 && (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.slice(0, 9).map((r) => (
            <figure key={`${r.name}${r.createdAt}`} className="flex flex-col p-6 rounded-2xl bg-vx-card border border-vx-line">
              <Stars value={r.rating} />
              <blockquote className="mt-4 text-[14px] leading-relaxed text-zinc-100 break-words">“{r.text}”</blockquote>
              <figcaption className="mt-auto pt-5 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[14px] font-semibold text-white">{r.name}</div>
                  <div className="text-[12px] text-vx-muted">
                    {r.product ? `${r.product} · ` : ''}
                    {dateLabel(r.createdAt)}
                  </div>
                </div>
                {r.verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-vx-accent-soft">
                    <BadgeCheck className="w-4 h-4" /> Doğrulanmış müşteri
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

    </section>
  )
}
