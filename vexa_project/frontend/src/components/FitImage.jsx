// Shows the whole picture (never cropped) on a soft blurred copy of itself, so any aspect ratio looks intentional.
export default function FitImage({ src, alt, className = '', imgClass = '', loading = 'lazy', onError }) {
  return (
    <div className={`relative overflow-hidden bg-vx-surface ${className}`}>
      <img src={src} alt="" aria-hidden="true" loading={loading} decoding="async" className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60" />
      <img src={src} alt={alt} loading={loading} decoding="async" onError={onError} draggable="false" className={`relative w-full h-full object-contain ${imgClass}`} />
    </div>
  )
}
