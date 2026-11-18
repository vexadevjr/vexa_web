import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import FitImage from './FitImage.jsx'

export function Lightbox({ images, start, alt, onClose }) {
  const [i, setI] = useState(start)
  const go = useCallback((d) => setI((x) => (x + d + images.length) % images.length), [images.length])
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [go, onClose])
  return createPortal(
    <div role="dialog" aria-label="Fotoğraf görüntüleyici" className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <button aria-label="Kapat" className="absolute top-4 right-4 w-11 h-11 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white" onClick={onClose}><X className="w-5 h-5" /></button>
      {images.length > 1 && (
        <>
          <button aria-label="Önceki" className="absolute left-3 sm:left-6 w-12 h-12 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white" onClick={(e) => { e.stopPropagation(); go(-1) }}><ChevronLeft className="w-6 h-6" /></button>
          <button aria-label="Sonraki" className="absolute right-3 sm:right-6 w-12 h-12 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white" onClick={(e) => { e.stopPropagation(); go(1) }}><ChevronRight className="w-6 h-6" /></button>
        </>
      )}
      <img src={images[i]} alt={`${alt} ${i + 1}`} className="max-h-[88vh] max-w-[92vw] rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
      {images.length > 1 && <div className="absolute bottom-5 text-[13px] text-white/80">{i + 1} / {images.length}</div>}
    </div>,
    document.body
  )
}

// Swipeable photo strip (touch swipe, trackpad scroll, arrow buttons, dots). Click opens a full-size viewer.
export default function Gallery({ images = [], alt = 'Proje görseli', aspect = 'aspect-[16/10]', className = '' }) {
  const track = useRef(null)
  const [index, setIndex] = useState(0)
  const [view, setView] = useState(-1)
  const [broken, setBroken] = useState({})
  const shown = images.filter((src) => !broken[src])
  if (!shown.length) return null

  const onScroll = () => {
    const el = track.current
    if (el && el.clientWidth) setIndex(Math.round(el.scrollLeft / el.clientWidth))
  }
  const move = (d) => {
    const el = track.current
    if (el) el.scrollBy({ left: d * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className={`group relative overflow-hidden rounded-xl bg-vx-surface ${className}`}>
      <div ref={track} onScroll={onScroll} className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {shown.map((src, n) => (
          <button key={src} type="button" onClick={() => setView(n)} aria-label={`${alt} ${n + 1} büyüt`} className={`relative shrink-0 w-full snap-center ${aspect} cursor-zoom-in`}>
            <FitImage src={src} alt={`${alt} ${n + 1}`} onError={() => setBroken((b) => ({ ...b, [src]: true }))} className="absolute inset-0" />
          </button>
        ))}
      </div>
      {shown.length > 1 && (
        <>
          <button type="button" aria-label="Önceki fotoğraf" onClick={() => move(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center rounded-full bg-black/55 hover:bg-black/80 text-white opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity"><ChevronLeft className="w-5 h-5" /></button>
          <button type="button" aria-label="Sonraki fotoğraf" onClick={() => move(1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center rounded-full bg-black/55 hover:bg-black/80 text-white opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity"><ChevronRight className="w-5 h-5" /></button>
          <div className="absolute bottom-2.5 inset-x-0 flex justify-center gap-1.5 pointer-events-none">
            {shown.map((_, n) => <i key={n} className={`h-1.5 rounded-full transition-all ${n === index ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`} />)}
          </div>
        </>
      )}
      {view >= 0 && <Lightbox images={shown} start={view} alt={alt} onClose={() => setView(-1)} />}
    </div>
  )
}
