import { useEffect, useRef, useState } from 'react'

// Fades a section up the first time it scrolls into view. Content is never hidden if the browser lacks
// IntersectionObserver or the visitor prefers reduced motion.
export default function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(
    () => typeof IntersectionObserver === 'undefined' || (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  )

  useEffect(() => {
    if (shown || !ref.current) return undefined
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [shown])

  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`vx-reveal ${shown ? 'is-in' : ''} ${className}`}>
      {children}
    </div>
  )
}
