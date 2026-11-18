import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSite } from '../context/SiteContext.jsx'
import FitImage from './FitImage.jsx'
import { siteConfig } from '../config/siteConfig.js'

// Home page showcase: real projects from the portfolio, swipeable. Hidden until at least one project exists.
export default function PortfolioSlider() {
  const { portfolio } = useSite()
  const track = useRef(null)
  if (!portfolio.length) return null

  const move = (d) => {
    const el = track.current
    if (el) el.scrollBy({ left: d * Math.max(280, el.clientWidth * 0.8), behavior: 'smooth' })
  }

  return (
    <section aria-labelledby="ornek-projeler">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="vx-eyebrow">Portföy</span>
          <h2 id="ornek-projeler" className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Örnek Projeler</h2>
          <p className="mt-1 text-[14px] text-vx-muted">Daha önce teslim ettiğimiz Discord botu ve web sitesi projelerinden seçmeler.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => move(-1)} aria-label="Önceki projeler" className="w-11 h-11 grid place-items-center rounded-full border border-vx-line bg-vx-card text-white hover:bg-vx-accent hover:border-vx-accent"><ChevronLeft className="w-5 h-5" /></button>
          <button type="button" onClick={() => move(1)} aria-label="Sonraki projeler" className="w-11 h-11 grid place-items-center rounded-full border border-vx-line bg-vx-card text-white hover:bg-vx-accent hover:border-vx-accent"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div ref={track} className="mt-6 -mx-4 px-4 sm:mx-0 sm:px-0 flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {portfolio.map((p) => (
          <Link
            key={p.id}
            to={`${siteConfig.routes.portfolio}#${p.id}`}
            className="group snap-start shrink-0 w-[82%] sm:w-[46%] xl:w-[31.5%] flex flex-col overflow-hidden rounded-2xl bg-vx-card border border-vx-line hover:border-vx-accent-text/50 transition-colors"
          >
            <div className="relative aspect-[16/10] bg-vx-surface overflow-hidden">
              {p.images && p.images[0] ? (
                <FitImage src={p.images[0]} alt={p.title} className="absolute inset-0" imgClass="transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-vx-accent/30 to-vx-surface text-4xl font-black text-white/70">{(p.title || '?').slice(0, 1)}</div>
              )}
              {p.category && <span className="absolute left-3 top-3 px-2.5 h-6 inline-flex items-center rounded-md bg-black/60 backdrop-blur text-[11px] font-semibold text-white">{p.category}</span>}
              {p.images && p.images.length > 1 && <span className="absolute right-3 top-3 px-2 h-6 inline-flex items-center rounded-md bg-black/60 backdrop-blur text-[11px] text-white">{p.images.length} fotoğraf</span>}
            </div>
            <div className="flex flex-col flex-1 p-5">
              <h3 className="text-[17px] font-semibold text-white">{p.title}</h3>
              {p.result && <p className="mt-2 text-[14px] leading-relaxed text-vx-muted line-clamp-3">{p.result}</p>}
              <span className="mt-auto pt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-vx-accent-text group-hover:text-white">İncele <ArrowRight className="w-4 h-4" /></span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 text-center">
        <Link to={siteConfig.routes.portfolio} className="inline-flex items-center gap-2 text-[14px] font-semibold text-vx-accent-text hover:text-vx-accent-soft">Tüm projeleri gör <ArrowRight className="w-4 h-4" /></Link>
      </div>
    </section>
  )
}
