import { useState } from 'react'
import { Star, BadgeCheck } from 'lucide-react'
import { admin } from '../../lib/adminApi.js'
import { formatPrice } from '../../lib/format.js'
import { Card, Btn, Badge, Empty, Pager, useAdmin, useLoad, useToast, fmtDate, confirmDo } from './ui.jsx'

const ORDER_STATUS = [
  ['yeni', 'Yeni'],
  ['onaylandi', 'Onaylandı'],
  ['hazirlaniyor', 'Hazırlanıyor'],
  ['teslim-edildi', 'Teslim edildi'],
  ['iptal', 'İptal'],
]

export function Orders() {
  const { refreshCounts } = useAdmin()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const { data, loading, reload } = useLoad(() => admin.orders({ status, page }), [status, page])
  const [toast, push] = useToast()

  async function change(no, v) {
    try {
      await admin.setOrderStatus(no, v)
      push('Sipariş durumu güncellendi.')
      reload()
      refreshCounts()
    } catch (e) {
      push(e.message, 'err')
    }
  }

  return (
    <Card
      title={`Siparişler${data ? ` (${data.total})` : ''}`}
      actions={
        <select className="h-9 px-2 rounded-lg bg-vx-surface border border-vx-line text-[13px] text-white" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} aria-label="Durum">
          <option value="">Tüm durumlar</option>
          {ORDER_STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      }
    >
      {toast}
      {loading && !data && <Empty>Yükleniyor…</Empty>}
      {data && data.orders.length === 0 && <Empty>Sipariş yok.</Empty>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <tbody>
            {data && data.orders.map((o) => (
              <tr key={o.orderNo} className="border-b border-vx-line/60 last:border-0 align-top">
                <td className="py-3 pr-3">
                  <div className="font-semibold text-white">{o.productName}</div>
                  <div className="text-[11px] text-vx-muted">{o.orderNo} · {fmtDate(o.createdAt)}</div>
                </td>
                <td className="py-3 pr-3 text-zinc-100">
                  {o.customer.name}
                  <div className="text-[11px] text-vx-muted break-all">{o.customer.email}{o.customer.discord ? ` · Discord: ${o.customer.discord}` : ''}</div>
                  {o.note && <div className="mt-1 text-[12px] text-zinc-300 max-w-[280px] whitespace-pre-wrap">“{o.note}”</div>}
                </td>
                <td className="py-3 pr-3 font-bold text-white whitespace-nowrap">{formatPrice(o.price)}</td>
                <td className="py-3">
                  <select className="h-9 px-2 rounded-lg bg-vx-surface border border-vx-line text-[13px] text-white" value={o.status} onChange={(e) => change(o.orderNo, e.target.value)} aria-label="Sipariş durumu">
                    {ORDER_STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data && <Pager page={page} total={data.total} perPage={data.perPage} onPage={setPage} />}
      <p className="mt-4 text-[11px] text-zinc-400">“Teslim edildi” durumu, müşteri memnuniyeti istatistiğindeki tamamlanan sipariş sayısına ve yorumlardaki “Doğrulanmış müşteri” rozetine yansır.</p>
    </Card>
  )
}

const REVIEW_STATUS = { pending: ['Onay bekliyor', 'amber'], approved: ['Yayında', 'green'], rejected: ['Reddedildi', 'red'] }

export function Reviews() {
  const { refreshCounts } = useAdmin()
  const [status, setStatus] = useState('pending')
  const { data, loading, reload } = useLoad(() => admin.reviews(status), [status])
  const [toast, push] = useToast()

  async function set(id, v) {
    try {
      await admin.setReviewStatus(id, v)
      push('Yorum güncellendi.')
      reload()
      refreshCounts()
    } catch (e) {
      push(e.message, 'err')
    }
  }
  async function remove(id) {
    if (!confirmDo('Yorum kalıcı olarak silinsin mi?')) return
    try {
      await admin.deleteReview(id)
      reload()
      refreshCounts()
    } catch (e) {
      push(e.message, 'err')
    }
  }

  return (
    <Card
      title="Müşteri Yorumları"
      actions={['pending', 'approved', 'rejected', ''].map((s) => (
        <Btn key={s || 'all'} variant={status === s ? 'primary' : 'ghost'} onClick={() => setStatus(s)}>
          {s ? REVIEW_STATUS[s][0] : 'Tümü'}
        </Btn>
      ))}
    >
      {toast}
      {loading && !data && <Empty>Yükleniyor…</Empty>}
      {data && data.reviews.length === 0 && <Empty>Bu durumda yorum yok.</Empty>}
      <ul className="space-y-4">
        {data && data.reviews.map((r) => (
          <li key={r.id} className="p-4 rounded-xl bg-vx-surface border border-vx-line">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`w-4 h-4 ${n <= r.rating ? 'fill-vx-accent-soft text-vx-accent-soft' : 'text-zinc-500'}`} />)}
                </div>
                <b className="text-[13px] text-white">{r.name}</b>
                {r.verified && <span className="inline-flex items-center gap-1 text-[11px] text-vx-accent-soft"><BadgeCheck className="w-4 h-4" /> Doğrulanmış müşteri</span>}
              </div>
              <Badge tone={REVIEW_STATUS[r.status][1]}>{REVIEW_STATUS[r.status][0]}</Badge>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-zinc-100 whitespace-pre-wrap break-words">{r.text}</p>
            <div className="mt-2 text-[11px] text-vx-muted">{r.email} · {r.product || 'Hizmet seçilmedi'} · {fmtDate(r.createdAt)}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {r.status !== 'approved' && <Btn variant="success" onClick={() => set(r.id, 'approved')}>Yayınla</Btn>}
              {r.status !== 'rejected' && <Btn variant="ghost" onClick={() => set(r.id, 'rejected')}>Reddet</Btn>}
              <Btn variant="danger" onClick={() => remove(r.id)}>Sil</Btn>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[11px] text-zinc-400">Memnuniyet yüzdesi, yayındaki yorumların yıldızlarından hesaplanır (toplam yıldız ÷ en yüksek olası yıldız). Yalnızca spam, hakaret veya sahte içerikleri reddetmeniz önerilir; olumsuz ama gerçek yorumları gizlemek güveni zedeler.</p>
    </Card>
  )
}

export function Customers() {
  const [page, setPage] = useState(1)
  const { data, loading } = useLoad(() => admin.users({ page }), [page])
  return (
    <Card title={`Müşteriler${data ? ` (${data.total})` : ''}`}>
      {loading && !data && <Empty>Yükleniyor…</Empty>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-[13px]">
          <thead>
            <tr className="text-vx-muted border-b border-vx-line">
              <th className="py-2 pr-3 font-medium">Ad</th>
              <th className="py-2 pr-3 font-medium">E-posta</th>
              <th className="py-2 pr-3 font-medium">Giriş yöntemi</th>
              <th className="py-2 font-medium">Kayıt tarihi</th>
            </tr>
          </thead>
          <tbody>
            {data && data.users.map((u) => (
              <tr key={u.id} className="border-b border-vx-line/60 last:border-0">
                <td className="py-2.5 pr-3 text-white">{u.name}</td>
                <td className="py-2.5 pr-3 break-all">{u.email}</td>
                <td className="py-2.5 pr-3 space-x-1">
                  {!u.google && !u.discord && <Badge>E-posta</Badge>}
                  {u.google && <Badge tone="blue">Google</Badge>}
                  {u.discord && <Badge tone="blue">Discord</Badge>}
                </td>
                <td className="py-2.5 text-vx-muted whitespace-nowrap">{fmtDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data && <Pager page={page} total={data.total} perPage={data.perPage} onPage={setPage} />}
    </Card>
  )
}
