import { useRef, useState } from 'react'
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

const NEXT = { yeni: ['onaylandi', 'Onayla'], onaylandi: ['hazirlaniyor', 'Hazırlamaya başla'], hazirlaniyor: ['teslim-edildi', 'Teslim edildi olarak işaretle'] }
const STATUS_TONE = { yeni: 'amber', onaylandi: 'blue', hazirlaniyor: 'blue', 'teslim-edildi': 'green', iptal: 'red' }
const STATUS_NAME = Object.fromEntries(ORDER_STATUS)

function SecretCell({ o, f, onPurged }) {
  const [val, setVal] = useState('')
  const [err, setErr] = useState('')
  const timer = useRef(null)
  async function reveal() {
    setErr('')
    try {
      const r = await admin.orderSecret(o.orderNo, f.key)
      setVal(r.value)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setVal(''), 30000)
    } catch (e) {
      setErr(e.message)
    }
  }
  async function purge() {
    if (!confirmDo('Bu siparişteki gizli bilgiler (bot token) kalıcı olarak silinsin mi?')) return
    try {
      await admin.purgeSecrets(o.orderNo)
      setVal('')
      onPurged()
    } catch (e) {
      setErr(e.message)
    }
  }
  if (!f.provided) return <span className="text-vx-muted">{o.secretsPurgedAt ? 'Silindi (teslim/iptal sonrası otomatik)' : 'Girilmedi'}</span>
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <code className="px-2 py-1 rounded bg-vx-card border border-vx-line text-[12px] break-all">{val || '••••••••••••••••••••'}</code>
        {!val ? <Btn variant="ghost" onClick={reveal}>Göster (30 sn)</Btn> : <Btn variant="ghost" onClick={() => navigator.clipboard && navigator.clipboard.writeText(val)}>Kopyala</Btn>}
        <Btn variant="danger" onClick={purge}>Sil</Btn>
      </div>
      {err && <div className="text-rose-400 text-[12px]">{err}</div>}
    </div>
  )
}

function OrderRow({ o, onChange }) {
  const [open, setOpen] = useState(false)
  const next = NEXT[o.status]
  return (
    <li className="rounded-xl bg-vx-surface border border-vx-line overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full text-left p-4 flex flex-wrap items-center gap-x-6 gap-y-2" aria-expanded={open}>
        <div className="min-w-[200px] flex-1">
          <div className="text-[14px] font-semibold text-white">{o.productName}</div>
          <div className="text-[12px] text-vx-muted">{o.orderNo} · {fmtDate(o.createdAt)}</div>
        </div>
        <div className="text-[13px] text-zinc-200 min-w-[140px]">{o.customer.name}<div className="text-[12px] text-vx-muted break-all">{o.customer.email}</div></div>
        <div className="text-[15px] font-bold tabular-nums text-white">{formatPrice(o.price)}</div>
        <Badge tone={STATUS_TONE[o.status]}>{STATUS_NAME[o.status]}</Badge>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-vx-line space-y-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-[13px] pt-3">
            <div><dt className="inline text-vx-muted">E-posta: </dt><dd className="inline"><a className="text-vx-accent-soft break-all" href={`mailto:${o.customer.email}`}>{o.customer.email}</a></dd></div>
            <div><dt className="inline text-vx-muted">Discord: </dt><dd className="inline text-zinc-100">{o.customer.discord || '—'}</dd></div>
            <div><dt className="inline text-vx-muted">Teslim tahmini: </dt><dd className="inline text-zinc-100">{o.delivery || '—'}</dd></div>
            <div><dt className="inline text-vx-muted">Hesap: </dt><dd className="inline text-zinc-100">{o.user ? 'Üye' : 'Misafir'}</dd></div>
            <div className="sm:col-span-2"><dt className="inline text-vx-muted">Sözleşme onayı: </dt><dd className="inline text-zinc-100">{o.legalAcceptedAt ? `${fmtDate(o.legalAcceptedAt)} (sürüm ${o.legalVersion || '-'})` : 'Kayıt yok (eski sipariş)'}</dd></div>
            {o.note && <div className="sm:col-span-2"><dt className="text-vx-muted">Müşteri notu</dt><dd className="mt-1 p-3 rounded-lg bg-vx-card border border-vx-line text-zinc-100 whitespace-pre-wrap">{o.note}</dd></div>}
            {o.status === 'iptal' && <div className="sm:col-span-2 text-rose-300">İptal eden: {o.cancelledBy === 'customer' ? 'müşteri' : 'yönetici'}{o.cancelReason ? ` — “${o.cancelReason}”` : ''}</div>}
          </dl>
          {(o.fields || []).length > 0 && (
            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-[0.14em] text-vx-accent-text">Kurulum bilgileri</h4>
              <dl className="mt-2 rounded-xl border border-vx-line divide-y divide-vx-line/60 text-[13px]">
                {o.fields.map((f) => (
                  <div key={f.key} className="grid grid-cols-[170px_1fr] gap-3 px-3 py-2.5">
                    <dt className="text-vx-muted">{f.label}</dt>
                    <dd className="text-zinc-100 break-words">
                      {f.secret ? <SecretCell o={o} f={f} onPurged={() => onChange(o.orderNo, o.status, true)} />
                        : f.key === 'botLogo' && f.value ? <a href={f.value} target="_blank" rel="noopener noreferrer"><img src={f.value} alt="Bot logosu" className="w-16 h-16 rounded-xl object-cover border border-vx-line" /></a>
                        : f.key === 'serverInvite' && f.value ? <a className="text-vx-accent-soft underline" href={f.value} target="_blank" rel="noopener noreferrer nofollow">{f.value}</a>
                        : f.value || '—'}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {(o.history || []).length > 0 && (
            <ol className="flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-vx-muted">
              {o.history.map((h, i) => <li key={i}><b className="text-zinc-200">{STATUS_NAME[h.status] || h.status}</b> · {fmtDate(h.at)}</li>)}
            </ol>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {next && <Btn onClick={() => onChange(o.orderNo, next[0])}>{next[1]}</Btn>}
            {o.status !== 'iptal' && o.status !== 'teslim-edildi' && <Btn variant="danger" onClick={() => confirmDo('Sipariş iptal edilsin mi?') && onChange(o.orderNo, 'iptal')}>İptal et</Btn>}
            <select className="h-9 px-2 rounded-lg bg-vx-card border border-vx-line text-[13px] text-white" value={o.status} onChange={(e) => onChange(o.orderNo, e.target.value)} aria-label="Durumu değiştir">
              {ORDER_STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
      )}
    </li>
  )
}

export function Orders() {
  const { refreshCounts } = useAdmin()
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [applied, setApplied] = useState('')
  const [page, setPage] = useState(1)
  const { data, loading, reload } = useLoad(() => admin.orders({ status, q: applied, page }), [status, applied, page])
  const [toast, push] = useToast()

  async function change(no, v, refreshOnly = false) {
    try {
      if (refreshOnly) {
        push('Gizli bilgiler silindi.')
        await reload()
        return
      }
      await admin.setOrderStatus(no, v)
      push('Sipariş durumu güncellendi.')
      reload()
      refreshCounts()
    } catch (e) {
      push(e.message, 'err')
    }
  }
  const counts = (data && data.counts) || {}
  const all = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <Card
      title="Siparişler"
      actions={
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setPage(1); setApplied(q.trim()) }}>
          <input className="h-9 w-48 px-3 rounded-lg bg-vx-surface border border-vx-line text-[13px] text-white outline-none" placeholder="Sipariş no, ad, e-posta…" value={q} onChange={(e) => setQ(e.target.value)} maxLength={60} />
          <Btn type="submit" variant="ghost">Ara</Btn>
        </form>
      }
    >
      {toast}
      <div className="mb-5 flex flex-wrap gap-2">
        {[['', 'Tümü', all], ...ORDER_STATUS.map(([v, l]) => [v, l, counts[v] || 0])].map(([v, l, n]) => (
          <Btn key={v || 'all'} variant={status === v ? 'primary' : 'ghost'} onClick={() => { setStatus(v); setPage(1) }}>{l} <span className="opacity-70">({n})</span></Btn>
        ))}
      </div>
      {loading && !data && <Empty>Yükleniyor…</Empty>}
      {data && data.orders.length === 0 && <Empty>Bu filtrede sipariş yok.</Empty>}
      <ul className="space-y-3">{data && data.orders.map((o) => <OrderRow key={o.orderNo} o={o} onChange={change} />)}</ul>
      {data && <Pager page={page} total={data.total} perPage={data.perPage} onPage={setPage} />}
      <p className="mt-4 text-[11px] text-slate-500">Bir siparişe tıklayarak müşteri bilgilerini, notunu, durum geçmişini ve sözleşme onay kaydını görebilirsiniz. “Teslim edildi” durumu yorumlardaki “Doğrulanmış müşteri” rozetine yansır; durum değişiklikleri müşterinin “Siparişlerim” sayfasındaki zaman çizelgesinde görünür.</p>
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
