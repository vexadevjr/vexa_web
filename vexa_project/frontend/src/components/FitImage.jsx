import { useRef, useState } from 'react'

// Photo frame without empty bands:
//  - photo shape close to the frame  -> fills the frame completely (object-cover, only a tiny crop)
//  - very different shape (tall/wide) -> shown whole (object-contain) on a blurred, darkened copy of itself,
//    so there is never a plain empty strip above/below or beside it.
// The frame is measured in the browser, so it works for every card, gallery and slider size.
export default function FitImage({ src, alt, className = '', imgClass = '', loading = 'lazy', onError }) {
  const box = useRef(null)
  const [cover, setCover] = useState(false)

  function onLoad(e) {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget
    const el = box.current
    if (!w || !h || !el || !el.clientWidth || !el.clientHeight) return
    const diff = Math.abs(w / h / (el.clientWidth / el.clientHeight) - 1)
    setCover(diff <= 0.3) // up to ~30% shape difference: fill the frame
  }

  return (
    <div ref={box} className={`relative overflow-hidden bg-vx-surface ${className}`}>
      {!cover && <img src={src} alt="" aria-hidden="true" loading={loading} decoding="async" className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl brightness-75 saturate-125" />}
      <img src={src} alt={alt} loading={loading} decoding="async" onLoad={onLoad} onError={onError} draggable="false" className={`relative w-full h-full ${cover ? 'object-cover' : 'object-contain'} ${imgClass}`} />
    </div>
  )
}
