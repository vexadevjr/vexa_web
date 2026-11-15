import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, LifeBuoy, Plus } from 'lucide-react'
import Button from '../Button.jsx'
import TicketThread, { StatusChip } from '../TicketThread.jsx'
import { api } from '../../lib/api.js'
import { siteConfig } from '../../config/siteConfig.js'

const { routes } = siteConfig
const card = 'rounded-2xl bg-vx-card border border-vx-line'
const FILTERS = [['all', 'Tümü'], ['acik', 'Açık'], ['yanitlandi', 'Yanıtlandı'], ['kapali', 'Kapalı']]
const when = (iso) => new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })

export default function TicketsTab() {
  const [tickets, setTickets] = useState(null)
  const [sel, setSel] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    let alive = true
    api.myTickets().then((d) => alive && setTickets(d.tickets)).catch(() => alive && setTickets([]))
    return () => {
      alive = false
    }
  }, [])

  function open(t) {
    setSel(t.ticketNo)
    if (t.unread) {
      api.readTicket(t.ticketNo).catch(() => {})
      setTickets((l) => l.map((x) => (x.ticketNo === t.ticketNo ? { ...x, unread: false } : x)))
    }
  }
  async function reply(ticketNo, text) {
    const d = await api.replyTicket({ ticketNo, text })
    setTickets((l) => l.map((x) => (x.ticketNo === ticketNo ? d.ticket : x)))
  }

  if (!tickets) return <p className="text-[14px] text-vx-muted">Yükleniyor…</p>
  if (!tickets.length) {
    return (
      <div className={`${card} p-10 text-center`}>
        <LifeBuoy className="w-11 h-11 mx-auto text-vx-accent-text" strokeWidth={1.5} />
        <p className="mt-4 text-[17px] font-semibold text-white">Henüz destek talebiniz yok</p>
        <p className="mt-1.5 text-[14px] text-vx-muted">Sorularınız için bir talep oluşturun; yanıtları burada görürsünüz.</p>
        <Button size="sm" to={routes.contact} className="mt-6">Yeni Talep Oluştur</Button>
      </div>
    )
  }

  const unread = tickets.filter((t) => t.unread).length
  const list = tickets.filter((t) => filter === 'all' || t.status === filter)
  const current = tickets.find((t) => t.ticketNo === sel)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] gap-5 items-start">
      <div className={`${card} overflow-hidden ${sel ? 'hidden lg:block' : ''}`}>
        <div className="px-4 pt-4 pb-3 border-b border-vx-line space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-semibold text-white">Taleplerim <span className="text-vx-muted font-normal">({tickets.length})</span>{unread > 0 && <span className="ml-2 px-2 h-5 inline-flex items-center rounded-full bg-rose-500 text-[11px] font-bold text-white">{unread} yeni yanıt</span>}</span>
            <Link to={routes.contact} className="inline-flex items-center gap-1 text-[13px] font-semibold text-vx-accent-text hover:text-white"><Plus className="w-4 h-4" /> Yeni</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} className={`h-8 px-3 rounded-full text-[12px] font-semibold border transition-colors ${filter === k ? 'bg-vx-accent border-vx-accent text-white' : 'border-vx-line text-vx-muted hover:text-white'}`}>{l}</button>
            ))}
          </div>
        </div>
        {list.length === 0 && <p className="p-6 text-center text-[13px] text-vx-muted">Bu durumda talep yok.</p>}
        <ul className="divide-y divide-vx-line max-h-[620px] overflow-y-auto">
          {list.map((t) => {
            const last = t.replies.length ? t.replies[t.replies.length - 1] : null
            return (
              <li key={t.ticketNo}>
                <button onClick={() => open(t)} className={`w-full text-left px-4 py-4 transition-colors ${sel === t.ticketNo ? 'bg-vx-surface' : 'hover:bg-vx-surface/60'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[15px] font-semibold text-white flex items-center gap-2 min-w-0">
                      {t.unread && <i className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" aria-label="Yeni yanıt" />}
                      <span className="truncate">{t.subject}</span>
                    </span>
                    <StatusChip status={t.status} />
                  </div>
                  <p className="mt-2 text-[13px] leading-snug text-zinc-300 line-clamp-2">
                    {last ? <><b className="text-vx-muted font-medium">{last.from === 'admin' ? 'Vexstar Destek: ' : 'Siz: '}</b>{last.text}</> : t.message}
                  </p>
                  <div className="mt-2 text-[12px] text-vx-muted">{t.ticketNo} · {when(t.updatedAt)}</div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className={`${card} p-5 sm:p-6 ${!sel ? 'hidden lg:block' : ''}`}>
        {current ? (
          <>
            <button onClick={() => setSel('')} className="lg:hidden mb-4 inline-flex items-center gap-2 text-[14px] font-semibold text-vx-accent-text"><ArrowLeft className="w-4 h-4" /> Taleplerim</button>
            <TicketThread key={current.ticketNo} ticket={current} onReply={(text) => reply(current.ticketNo, text)} />
          </>
        ) : (
          <p className="py-16 text-center text-[14px] text-vx-muted">Konuşmayı görmek için soldan bir talep seçin.</p>
        )}
      </div>
    </div>
  )
}
