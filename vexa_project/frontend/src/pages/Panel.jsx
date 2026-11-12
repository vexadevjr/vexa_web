import { useEffect, useState } from 'react'
import { LogOut, MessageCircle } from 'lucide-react'
import TicketThread, { statusLabel } from '../components/TicketThread.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Button from '../components/Button.jsx'
import { useApp } from '../context/AppContext.jsx'
import { api } from '../lib/api.js'
import { siteConfig } from '../config/siteConfig.js'
import { formatPrice, dateLabel } from '../lib/format.js'

const STATUS = {
  yeni: 'Yeni',
  onaylandi: 'Onaylandı',
  hazirlaniyor: 'Hazırlanıyor',
  'teslim-edildi': 'Teslim edildi',
  iptal: 'İptal',
}

export default function Panel() {
  const { user, logout, openAuth } = useApp()
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')
  const [tickets, setTickets] = useState(null)
  const [openNo, setOpenNo] = useState('')

  useEffect(() => {
    if (!user) return
    let alive = true
    api
      .myOrders()
      .then((d) => alive && setOrders(d.orders))
      .catch((e) => alive && setError(e.message))
    api
      .myTickets()
      .then((d) => alive && setTickets(d.tickets))
      .catch(() => alive && setTickets([]))
    return () => {
      alive = false
    }
  }, [user])

  async function toggleTicket(t) {
    const next = openNo === t.ticketNo ? '' : t.ticketNo
    setOpenNo(next)
    if (next && t.unread) {
      api.readTicket(t.ticketNo).catch(() => {})
      setTickets((list) => list.map((x) => (x.ticketNo === t.ticketNo ? { ...x, unread: false } : x)))
    }
  }

  async function replyTo(ticketNo, text) {
    const d = await api.replyTicket({ ticketNo, text })
    setTickets((list) => list.map((x) => (x.ticketNo === ticketNo ? d.ticket : x)))
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <PageHeader title="Müşteri Paneli" description="Siparişlerinizi görmek için giriş yapın veya hesap oluşturun." />
        <div className="flex gap-3">
          <Button onClick={() => openAuth('login')}>Giriş Yap</Button>
          <Button variant="secondary" onClick={() => openAuth('register')}>
            Kayıt Ol
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Müşteri Paneli" description={`${user.name} · ${user.email}`} />

      <section className="rounded-2xl bg-vx-card border border-vx-line overflow-hidden">
        <div className="px-6 py-4 border-b border-vx-line text-[15px] font-semibold text-white">Siparişlerim</div>
        {error && <p className="px-6 py-5 text-[13px] text-rose-400">{error}</p>}
        {!error && orders === null && <p className="px-6 py-5 text-[13px] text-vx-muted">Yükleniyor…</p>}
        {orders && orders.length === 0 && (
          <div className="px-6 py-8">
            <p className="text-[14px] text-vx-muted">Henüz siparişiniz yok.</p>
            <Button size="sm" to={siteConfig.routes.bots} className="mt-4">
              Botlara göz at
            </Button>
          </div>
        )}
        {orders && orders.length > 0 && (
          <ul className="divide-y divide-vx-line">
            {orders.map((o) => (
              <li key={o.orderNo} className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[14px] font-semibold text-white">{o.productName}</div>
                  <div className="text-[12px] text-vx-muted">
                    {o.orderNo} · {dateLabel(o.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-2.5 h-6 inline-flex items-center rounded-md bg-vx-surface border border-vx-line text-[11px] font-medium text-vx-accent-soft">
                    {STATUS[o.status] || o.status}
                  </span>
                  <span className="text-[14px] font-bold text-white">{formatPrice(o.price)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl bg-vx-card border border-vx-line overflow-hidden">
        <div className="px-6 py-4 border-b border-vx-line text-[15px] font-semibold text-white flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-vx-accent-text" /> Destek Taleplerim
        </div>
        {tickets === null && <p className="px-6 py-5 text-[13px] text-vx-muted">Yükleniyor…</p>}
        {tickets && tickets.length === 0 && (
          <div className="px-6 py-8">
            <p className="text-[14px] text-vx-muted">Henüz destek talebiniz yok.</p>
            <Button size="sm" to={siteConfig.routes.contact} className="mt-4">
              Destek Talebi Oluştur
            </Button>
          </div>
        )}
        {tickets && tickets.length > 0 && (
          <ul className="divide-y divide-vx-line">
            {tickets.map((t) => (
              <li key={t.ticketNo} className="px-6 py-4">
                <button type="button" onClick={() => toggleTicket(t)} className="w-full flex flex-wrap items-center justify-between gap-3 text-left">
                  <div>
                    <div className="text-[14px] font-semibold text-white flex items-center gap-2">
                      {t.subject}
                      {t.unread && <span className="px-2 h-5 inline-flex items-center rounded-md bg-vx-accent text-[10px] font-semibold text-white">Yeni yanıt</span>}
                    </div>
                    <div className="text-[12px] text-vx-muted">
                      {t.ticketNo} · {dateLabel(t.createdAt)}
                    </div>
                  </div>
                  <span className="px-2.5 h-6 inline-flex items-center rounded-md bg-vx-surface border border-vx-line text-[11px] font-medium text-vx-accent-soft">{statusLabel(t.status)}</span>
                </button>
                {openNo === t.ticketNo && (
                  <div className="mt-4">
                    <TicketThread ticket={t} onReply={(text) => replyTo(t.ticketNo, text)} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <Button variant="secondary" size="sm" onClick={logout}>
        <LogOut className="w-4 h-4" /> Çıkış Yap
      </Button>
    </div>
  )
}
