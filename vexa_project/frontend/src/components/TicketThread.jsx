import { useState } from 'react'
import Button from './Button.jsx'
import { inputCls } from './Field.jsx'
import { dateLabel } from '../lib/format.js'

const STATUS = { acik: 'Açık', yanitlandi: 'Yanıtlandı', kapali: 'Kapalı' }
export const statusLabel = (s) => STATUS[s] || s

const when = (iso) => `${dateLabel(iso)} ${new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`

// A support conversation: the original request, then the replies from the Vexstar team and the customer.
export default function TicketThread({ ticket, onReply }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function send(e) {
    e.preventDefault()
    if (text.trim().length < 2) return
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

  const bubble = (from, body, at, key) => (
    <div key={key} className={`max-w-[88%] rounded-xl px-4 py-3 text-[13px] leading-relaxed ${from === 'admin' ? 'bg-vx-accent/20 border border-vx-accent/40 text-white' : 'bg-vx-surface border border-vx-line text-slate-200 ml-auto'}`}>
      <div className="text-[11px] mb-1 text-vx-muted">
        {from === 'admin' ? 'Vexstar Destek' : 'Siz'} · {when(at)}
      </div>
      <div className="whitespace-pre-wrap break-words">{body}</div>
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-[12px] text-vx-muted">
        <span className="font-semibold text-white">{ticket.ticketNo}</span>·<span>{ticket.subject}</span>·
        <span className="px-2 h-5 inline-flex items-center rounded-md bg-vx-surface border border-vx-line text-vx-accent-soft">{statusLabel(ticket.status)}</span>
      </div>
      <div className="space-y-2 flex flex-col">
        {bubble('user', ticket.message, ticket.createdAt, 'first')}
        {ticket.replies.map((r, i) => bubble(r.from, r.text, r.at, i))}
      </div>
      <form onSubmit={send} className="pt-2 space-y-2">
        <textarea className={`${inputCls} h-20 py-3 resize-none`} value={text} onChange={(e) => setText(e.target.value)} maxLength={3000} placeholder="Yanıtınızı yazın…" />
        {error && <p className="text-[12px] text-rose-400">{error}</p>}
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? 'Gönderiliyor…' : 'Yanıt Gönder'}
        </Button>
      </form>
    </div>
  )
}
