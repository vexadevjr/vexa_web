import { useState } from 'react'
import { ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { Lightbox } from './Gallery.jsx'
import FitImage from './FitImage.jsx'

// Marketplace-style gallery: one large image with arrows and a thumbnail strip underneath.
export default function ProductGallery({ images = [], name }) {
  const [i, setI] = useState(0)
  const [view, setView] = useState(-1)
  const [broken, setBroken] = useState({})
  const list = images.filter((s) => !broken[s])

  if (!list.length) {
    return (
      <div className="h-full min-h-[280px] aspect-[4/3] xl:aspect-auto rounded-2xl border border-vx-line bg-gradient-to-br from-vx-accent/25 via-vx-surface to-vx-card grid place-items-center">
        <div className="text-center px-6">
          <Package className="w-14 h-14 mx-auto text-vx-accent-text/70" strokeWidth={1.2} />
          <div className="mt-3 text-[15px] font-semibold text-white/90">{name}</div>
        </div>
      </div>
    )
  }
  const cur = Math.min(i, list.length - 1)
  const go = (d) => setI((x) => (x + d + list.length) % list.length)

  return (
    <div className="flex flex-col min-w-0">
      <div className="relative">
        <button type="button" onClick={() => setView(cur)} aria-label="Fotoğrafı büyüt" className="relative block w-full min-h-[260px] aspect-[16/9] overflow-hidden rounded-2xl border border-vx-line bg-vx-surface cursor-zoom-in">
          <FitImage src={list[cur]} alt={`${name} ${cur + 1}`} loading="eager" onError={() => setBroken((b) => ({ ...b, [list[cur]]: true }))} className="absolute inset-0" imgClass="!object-cover" />
        </button>
        {list.length > 1 && (
          <>
            <button type="button" aria-label="Önceki" onClick={() => go(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center rounded-full bg-black/55 hover:bg-black/80 text-white"><ChevronLeft className="w-5 h-5" /></button>
            <button type="button" aria-label="Sonraki" onClick={() => go(1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center rounded-full bg-black/55 hover:bg-black/80 text-white"><ChevronRight className="w-5 h-5" /></button>
            <span className="absolute right-3 bottom-3 px-2.5 h-7 inline-flex items-center rounded-full bg-black/60 text-[12px] text-white">{cur + 1} / {list.length}</span>
          </>
        )}
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {list.map((src, n) => (
            <button key={src} type="button" onClick={() => setI(n)} aria-label={`Fotoğraf ${n + 1}`} aria-current={n === cur} className={`relative shrink-0 w-20 h-16 overflow-hidden rounded-lg border-2 transition-colors ${n === cur ? 'border-vx-accent-text' : 'border-vx-line opacity-70 hover:opacity-100'}`}>
              <img src={src} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {view >= 0 && <Lightbox images={list} start={view} alt={name} onClose={() => setView(-1)} />}
    </div>
  )
}
