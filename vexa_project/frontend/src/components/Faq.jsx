import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useSite } from '../context/SiteContext.jsx'

export default function Faq() {
  const { faq } = useSite()
  const [open, setOpen] = useState(0)
  if (!faq.length) return null

  return (
    <section>
      <h2 className="text-2xl font-bold tracking-tight text-white">Sık Sorulan Sorular</h2>
      <div className="mt-5 rounded-2xl bg-vx-card border border-vx-line divide-y divide-vx-line">
        {faq.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={item.q}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left text-[15px] font-semibold text-white hover:text-vx-accent-soft transition-colors"
              >
                {item.q}
                <ChevronDown className={`w-5 h-5 shrink-0 text-vx-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && <p className="px-6 pb-5 text-[14px] leading-relaxed text-vx-muted">{item.a}</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
