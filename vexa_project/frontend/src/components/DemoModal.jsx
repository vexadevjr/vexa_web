import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import Modal from './Modal.jsx'
import Button from './Button.jsx'
import { useApp } from '../context/AppContext.jsx'
import { siteConfig } from '../config/siteConfig.js'

export default function DemoModal({ product, onClose }) {
  const { openOrder } = useApp()
  const lines = product.demo || []
  const [shown, setShown] = useState(0)
  const [run, setRun] = useState(0)

  useEffect(() => {
    setShown(0)
    let i = 0
    const id = setInterval(() => {
      i += 1
      setShown(i)
      if (i >= lines.length) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [product, run, lines.length])

  return (
    <Modal title={`${product.name} · Demo`} onClose={onClose} wide>
      <div className="rounded-xl bg-vx-surface border border-vx-line p-4 min-h-[220px] space-y-4" aria-live="polite">
        {lines.slice(0, shown).map((line, i) => (
          <div key={i} className="flex gap-3">
            <div
              className={`w-9 h-9 shrink-0 rounded-full grid place-items-center text-[12px] font-bold ${
                line.who === 'bot' ? 'bg-vx-accent text-white' : 'bg-vx-line text-slate-300'
              }`}
            >
              {line.who === 'bot' ? 'V' : 'S'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-white">
                {line.who === 'bot' ? product.name : 'Siz'}
                {line.who === 'bot' && <span className="px-1.5 rounded bg-vx-accent text-[10px] font-bold">BOT</span>}
              </div>
              <div className={`mt-0.5 text-[14px] break-words ${line.who === 'user' ? 'font-mono text-vx-accent-soft' : 'text-slate-200'}`}>
                {line.text}
              </div>
            </div>
          </div>
        ))}
        {shown === 0 && <div className="text-[13px] text-slate-500">Demo başlıyor…</div>}
      </div>

      <p className="mt-3 text-[12px] text-slate-500">Bu önizleme, botun komutlara verdiği yanıtları simüle eder. Gerçek ortamda denemek için demo sunucusuna katılabilirsiniz.</p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button variant="secondary" size="sm" onClick={() => setRun((n) => n + 1)}>
          <RotateCcw className="w-4 h-4" /> Tekrar oynat
        </Button>
        <Button variant="secondary" size="sm" href={siteConfig.links.demoServer} external>
          Demo sunucusuna katıl
        </Button>
        {product.price != null && (
          <Button size="sm" onClick={() => openOrder(product)} className="ml-auto">
            Sipariş Ver
          </Button>
        )}
      </div>
    </Modal>
  )
}
