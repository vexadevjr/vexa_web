import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck } from 'lucide-react'
import StarBar from './StarBar.jsx'
import { useReviews } from '../hooks/useLive.js'
import { siteConfig } from '../config/siteConfig.js'

// Shown on the home page only when real, published reviews exist (nothing empty or fake is ever displayed).
export default function HomeReviews() {
  const { reviews, stats } = useReviews()
  if (!reviews.length || !stats) return null

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Müşterilerimiz Ne Diyor?</h2>
          <div className="mt-3 flex items-center gap-3">
            <StarBar value={stats.average} className="w-6 h-6" />
            <span className="text-[14px] text-vx-muted"><b className="text-white text-lg">{stats.average.toFixed(1)}</b> / 5 · {stats.count} yorum</span>
          </div>
        </div>
        <Link to={`${siteConfig.routes.bots}#yorumlar`} className="inline-flex items-center gap-2 text-[14px] font-semibold text-vx-accent-text hover:text-vx-accent-soft">
          Yorum yaz <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
        {reviews.slice(0, 3).map((r) => (
          <figure key={`${r.name}${r.createdAt}`} className="flex flex-col p-6 rounded-2xl bg-vx-card border border-vx-line">
            <StarBar value={r.rating} className="w-4 h-4" />
            <blockquote className="mt-4 text-[14px] leading-relaxed text-slate-200 break-words line-clamp-5">“{r.text}”</blockquote>
            <figcaption className="mt-auto pt-5 flex items-center justify-between gap-2 text-[13px]">
              <span className="font-semibold text-white">{r.name}</span>
              {r.verified && <span className="inline-flex items-center gap-1 text-[11px] text-vx-accent-soft"><BadgeCheck className="w-4 h-4" /> Doğrulanmış müşteri</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
