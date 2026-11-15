import { useState } from 'react'
import Field, { inputCls } from './Field.jsx'
import Button from './Button.jsx'
import TicketThread from './TicketThread.jsx'
import { api } from '../lib/api.js'

// Guests can follow a request with the ticket number they received and the e-mail they used.
export default function TicketLookup() {
  const [form, setForm] = useState({ ticketNo: '', email: '' })
  const [ticket, setTicket] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function find(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const d = await api.lookupTicket(form)
      setTicket(d.ticket)
    } catch (err) {
      setTicket(null)
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function reply(text) {
    const d = await api.replyTicket({ ticketNo: ticket.ticketNo, email: form.email, text })
    setTicket(d.ticket)
  }

  return (
    <section className="p-6 sm:p-8 rounded-2xl bg-vx-card border border-vx-line">
      <h2 className="text-xl font-semibold text-white">Talebimi Takip Et</h2>
      <p className="mt-1 text-[14px] text-vx-muted">Destek kayıt numaranız ve formda kullandığınız e-posta ile talebinize verilen yanıtları görebilirsiniz.</p>
      {!ticket && (
        <form onSubmit={find} className="mt-5 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          <Field label="Destek kayıt numarası">
            <input className={inputCls} value={form.ticketNo} onChange={set('ticketNo')} placeholder="TK-..." maxLength={40} />
          </Field>
          <Field label="E-posta">
            <input className={inputCls} type="email" value={form.email} onChange={set('email')} maxLength={254} />
          </Field>
          <Button type="submit" disabled={busy || !form.ticketNo || !form.email}>
            {busy ? 'Aranıyor…' : 'Sorgula'}
          </Button>
          {error && <p className="sm:col-span-3 text-[13px] text-rose-400">{error}</p>}
        </form>
      )}
      {ticket && (
        <div className="mt-5">
          <TicketThread ticket={ticket} onReply={reply} />
        </div>
      )}
    </section>
  )
}
