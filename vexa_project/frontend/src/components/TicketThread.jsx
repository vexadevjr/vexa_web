import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Send } from 'lucide-react'
import Button from './Button.jsx'
import { inputCls } from './Field.jsx'
import { siteConfig } from '../config/siteConfig.js'
import vLogo from '../assets/vexstar-logo.png'

const STATUS = { acik: 'Açık', yanitlandi: 'Yanıtlandı', kapali: 'Kapalı' }
const TONE = {
  acik: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
  yanitlandi: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
  kapali: 'bg-zinc-500/15 border-zinc-500/40 text-zinc-300',
}
export const statusLabel = (s) => STATUS[s] || s
export const StatusChip = ({ status }) => (
  <span className={`inline-flex items-center h-7 px-3 rounded-full border text-[12px] font-semibold ${TONE[status] || TONE.kapali}`}>{statusLabel(status)}</span>
)

const day = (iso) => new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
const hour = (iso) => new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

function Bubble({ mine, text, at }) {
  return (
    <div className={`flex items-end gap-2.5 ${mine ? 'flex-row-reverse' : ''}`}>
      <span className={`grid place-items-center w-8 h-8 shrink-0 rounded-full text-[11px] font-bold ${mine ? 'bg-vx-surface border border-vx-line text-zinc-200' : 'bg-vx-accent/25 border border-vx-accent/50'}`}>
        {mine ? 'Siz' : <img src={vLogo} alt="" className="w-5 h-auto" />}
      </span>
      <div className={`max-w-[82%] rounded-2xl px-4 py-3 ${mine ? 'rounded-br-md bg-vx-accent text-white' : 'rounded-bl-md bg-vx-surface border border-vx-line text-zinc-100'}`}>
        <div className={`text-[12px] font-semibold mb-1 ${mine ? 'text-white/80' : 'text-vx-accent-soft'}`}>{mine ? 'Siz' : 'Vexstar Destek'}</div>
        <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{text}</div>
        <div className={`mt-1.5 text-[11px] ${mine ? 'text-white/70' : 'text-vx-muted'}`}>{hour(at)}</div>
      </div>
    </div>
  )
}

// A support conversation: request details on top, chat-style messages with date separators, reply box at the bottom.
export default function TicketThread({ ticket, onReply }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef(null)
  const messages = [{ mine: true, text: ticket.message, at: ticket.createdAt }, ...ticket.replies.map((r) => ({ mine: r.from === 'user', text: r.text, at: r.at }))]

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ block: 'nearest' })
  }, [ticket.replies.length])

  async function send(e) {
    e.preventDefault()
    if (text.trim().length < 2 || busy) return
    setBusy(true)
    setError('')
    try {
      await onReply(text)
      setText('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  let lastDay = ''
  return (
    <div>
      <header className="pb-4 mb-4 border-b border-vx-line">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[18px] font-bold text-white">{ticket.subject}</h3>
          <StatusChip status={ticket.status} />
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[13px]">
          <div><dt className="inline text-vx-muted">Kayıt no: </dt><dd className="inline font-mono text-zinc-100">{ticket.ticketNo}</dd></div>
          <div><dt className="inline text-vx-muted">Açılış: </dt><dd className="inline text-zinc-100">{day(ticket.createdAt)}</dd></div>
          {ticket.orderNo && <div className="col-span-2"><dt className="inline text-vx-muted">İlgili sipariş: </dt><dd className="inline font-mono text-zinc-100">{ticket.orderNo}</dd></div>}
        </dl>
      </header>

      <div className="space-y-4 max-h-[52vh] overflow-y-auto pr-1">
        {messages.map((m, i) => {
          const d = day(m.at)
          const sep = d !== lastDay
          lastDay = d
          return (
            <div key={i} className="space-y-4">
              {sep && <div className="flex items-center gap-3 text-[12px] text-vx-muted"><span className="h-px flex-1 bg-vx-line" />{d}<span className="h-px flex-1 bg-vx-line" /></div>}
              <Bubble {...m} />
            </div>
          )
        })}
        {ticket.status === 'acik' && ticket.replies.length === 0 && (
          <p className="text-center text-[13px] text-vx-muted">Talebiniz bize ulaştı. Genellikle 24 saat içinde yanıt veriyoruz.</p>
        )}
        <div ref={endRef} />
      </div>

      {ticket.status === 'kapali' && <p className="mt-4 text-[13px] text-vx-muted">Bu talep kapatıldı. Yanıt yazarsanız yeniden açılır.</p>}
      <form onSubmit={send} className="mt-4 space-y-3">
        <textarea
          className={`${inputCls} h-24 py-3 resize-none`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => (e.ctrlKey || e.metaKey) && e.key === 'Enter' && send(e)}
          maxLength={3000}
          placeholder="Yanıtınızı yazın…"
        />
        {error && <p role="alert" className="text-[13px] text-rose-400">{error}</p>}
        <div className="flex items-center justify-between gap-3">
          <Link to={siteConfig.routes.contact} className="text-[12px] text-vx-muted hover:text-white">Yeni talep oluştur</Link>
          <Button type="submit" size="sm" disabled={busy || text.trim().length < 2}>
            <Send className="w-4 h-4" /> {busy ? 'Gönderiliyor…' : 'Gönder'}
          </Button>
        </div>
      </form>
    </div>
  )
}
