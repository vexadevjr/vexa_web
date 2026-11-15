import { useState } from 'react'
import { admin } from '../../lib/adminApi.js'
import { Card, Btn, Badge, Empty, Pager, AreaField, SelectField, useAdmin, useLoad, useToast, fmtDate, confirmDo } from './ui.jsx'

const STATUS = { acik: ['Açık', 'amber'], yanitlandi: ['Yanıtlandı', 'green'], kapali: ['Kapalı', 'gray'] }

function Detail({ ticketNo, onChanged, onGone }) {
  const { refreshCounts } = useAdmin()
  const { data, error, reload } = useLoad(() => admin.ticket(ticketNo), [ticketNo])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [toast, push] = useToast()

  if (error) return <p className="text-[13px] text-rose-400">{error}</p>
  if (!data) return <Empty>Yükleniyor…</Empty>
  const t = data.ticket

  async function send() {
    setBusy(true)
    try {
      await admin.replyTicket(t.ticketNo, text)
      setText('')
      push('Yanıt gönderildi. Müşteri panelinde / talep takibinde görecek.')
      await reload()
      onChanged()
      refreshCounts()
    } catch (e) {
      push(e.message, 'err')
    } finally {
      setBusy(false)
    }
  }
  async function status(v) {
    try {
      await admin.setTicketStatus(t.ticketNo, v)
      await reload()
      onChanged()
    } catch (e) {
      push(e.message, 'err')
    }
  }
  async function remove() {
    if (!confirmDo(`${t.ticketNo} talebi kalıcı olarak silinsin mi?`)) return
    try {
      await admin.deleteTicket(t.ticketNo)
      onGone()
    } catch (e) {
      push(e.message, 'err')
    }
  }

  const bubble = (from, body, at, key) => (
    <div key={key} className={`max-w-[92%] rounded-xl px-4 py-3 text-[13px] leading-relaxed ${from === 'admin' ? 'bg-vx-accent/20 border border-vx-accent/40 ml-auto' : 'bg-vx-surface border border-vx-line'}`}>
      <div className="text-[11px] mb-1 text-vx-muted">
        {from === 'admin' ? 'Siz (yönetici)' : t.name} · {fmtDate(at)}
      </div>
      <div className="whitespace-pre-wrap break-words text-slate-100">{body}</div>
    </div>
  )

  return (
    <div className="space-y-4">
      {toast}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[13px]">
        <div><span className="text-vx-muted">Kayıt no: </span><b className="text-white">{t.ticketNo}</b></div>
        <div><span className="text-vx-muted">Konu: </span>{t.subject}</div>
        <div><span className="text-vx-muted">Ad: </span>{t.name}</div>
        <div><span className="text-vx-muted">E-posta: </span><a className="text-vx-accent-soft break-all" href={`mailto:${t.email}`}>{t.email}</a></div>
        <div><span className="text-vx-muted">Sipariş no: </span>{t.orderNo || '—'}</div>
        <div><span className="text-vx-muted">Hesap: </span>{t.user ? 'Üye' : 'Misafir'}</div>
        <div><span className="text-vx-muted">Tarih: </span>{fmtDate(t.createdAt)}</div>
      </div>

      <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
        {bubble('user', t.message, t.createdAt, 'first')}
        {t.replies.map((r, i) => bubble(r.from, r.text, r.at, i))}
      </div>

      <AreaField label="Müşteriye yanıt" value={text} onChange={setText} rows={4} max={3000} placeholder="Yanıtınız müşterinin destek panelinde görünür…" />
      <div className="flex flex-wrap items-center gap-2">
        <Btn onClick={send} disabled={busy || text.trim().length < 2}>
          {busy ? 'Gönderiliyor…' : 'Yanıtı Gönder'}
        </Btn>
        {t.status !== 'kapali' ? (
          <Btn variant="ghost" onClick={() => status('kapali')}>Talebi Kapat</Btn>
        ) : (
          <Btn variant="ghost" onClick={() => status('acik')}>Yeniden Aç</Btn>
        )}
        <Btn variant="danger" onClick={remove} className="ml-auto">Sil</Btn>
      </div>
      <p className="text-[11px] text-zinc-400">Yanıtlar e-posta ile gönderilmez; müşteri “Hesap menüsü → Destek Taleplerim” veya İletişim sayfasındaki “Talebimi Takip Et” bölümünden görür. İsterseniz yanıtı ayrıca e-posta ile de iletebilirsiniz.</p>
    </div>
  )
}

export default function Tickets() {
  const { refreshCounts } = useAdmin()
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [applied, setApplied] = useState('')
  const [page, setPage] = useState(1)
  const [sel, setSel] = useState('')
  const { data, loading, reload } = useLoad(() => admin.tickets({ status, q: applied, page }), [status, applied, page])

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-6 items-start">
      <Card
        title={`Talepler${data ? ` (${data.total})` : ''}`}
        actions={
          <>
            <select className="h-9 px-2 rounded-lg bg-vx-surface border border-vx-line text-[13px] text-white" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} aria-label="Durum">
              <option value="">Tümü</option>
              <option value="acik">Açık</option>
              <option value="yanitlandi">Yanıtlandı</option>
              <option value="kapali">Kapalı</option>
            </select>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setPage(1); setApplied(q.trim()) }}>
              <input className="h-9 w-36 px-3 rounded-lg bg-vx-surface border border-vx-line text-[13px] text-white outline-none" placeholder="Ara…" value={q} onChange={(e) => setQ(e.target.value)} maxLength={60} />
              <Btn type="submit" variant="ghost">Ara</Btn>
            </form>
          </>
        }
      >
        {loading && !data && <Empty>Yükleniyor…</Empty>}
        {data && data.tickets.length === 0 && <Empty>Talep bulunamadı.</Empty>}
        <ul className="divide-y divide-vx-line/60">
          {data &&
            data.tickets.map((t) => (
              <li key={t.ticketNo}>
                <button onClick={() => setSel(t.ticketNo)} className={`w-full text-left py-3 px-2 rounded-lg transition-colors ${sel === t.ticketNo ? 'bg-vx-surface' : 'hover:bg-vx-surface/60'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-white flex items-center gap-2">
                      {t.unreadByAdmin && <i className="w-2 h-2 rounded-full bg-rose-500" aria-label="Okunmamış" />}
                      {t.subject}
                    </span>
                    <Badge tone={STATUS[t.status][1]}>{STATUS[t.status][0]}</Badge>
                  </div>
                  <div className="mt-1 text-[12px] text-vx-muted truncate">{t.name} · {t.email}</div>
                  <div className="text-[12px] text-zinc-300 truncate">{t.message}</div>
                  <div className="mt-1 text-[11px] text-zinc-400">{t.ticketNo} · {fmtDate(t.updatedAt)}</div>
                </button>
              </li>
            ))}
        </ul>
        {data && <Pager page={page} total={data.total} perPage={data.perPage} onPage={setPage} />}
      </Card>

      <Card title={sel ? 'Talep Detayı' : 'Bir talep seçin'}>
        {sel ? (
          <Detail key={sel} ticketNo={sel} onChanged={() => { reload(); refreshCounts() }} onGone={() => { setSel(''); reload(); refreshCounts() }} />
        ) : (
          <Empty>Soldaki listeden bir talep seçerek tüm içeriğini görebilir ve yanıt yazabilirsiniz.</Empty>
        )}
      </Card>
    </div>
  )
}
