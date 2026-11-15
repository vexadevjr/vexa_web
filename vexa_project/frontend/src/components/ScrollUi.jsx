import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

// Thin reading-progress bar at the very top + a "back to top" button after a long scroll.
export default function ScrollUi() {
  const [pct, setPct] = useState(0)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    let ticking = false
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      const y = window.scrollY
      setPct(h > 0 ? Math.min(100, (y / h) * 100) : 0)
      setShowTop(y > 900)
      ticking = false
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <>
      <div aria-hidden="true" className="fixed top-0 left-0 z-[60] h-[3px] bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-300" style={{ width: `${pct}%` }} />
      <button
        type="button"
        aria-label="Sayfanın başına dön"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
        className={`fixed right-4 sm:right-6 z-40 w-12 h-12 grid place-items-center rounded-full bg-vx-card/90 backdrop-blur border border-vx-line text-white shadow-xl shadow-black/50 transition-all duration-300 hover:bg-vx-accent hover:border-vx-accent ${showTop ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </>
  )
}
