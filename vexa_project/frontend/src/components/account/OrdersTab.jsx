import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Copy, Package, X, LifeBuoy, Clock } from 'lucide-react'
import Button from '../Button.jsx'
import Modal from '../Modal.jsx'
import { inputCls } from '../Field.jsx'
import { api } from '../../lib/api.js'
import { siteConfig } from '../../config/siteConfig.js'
import { formatPrice, termLabel } from '../../lib/format.js'

const { routes } = siteConfig
const card = 'rounded-2xl bg-vx-card border border-vx-line'

const STEPS = [
  { k: 'yeni', title: 'Sipariş alındı', desc: 'Siparişiniz bize ulaştı. Kısa süre içinde inceleyip onaylayacağız.' },
  { k: 'onaylandi', title: 'Onaylandı', desc: 'Siparişiniz onaylandı ve iş planına alındı.' },
  { k: 'hazirlaniyor', title: 'Hazırlanıyor', desc: 'Ürününüz üzerinde çalışıyoruz.' },
  { k: 'teslim-edildi', title: 'Teslim edildi', desc: 'Siparişiniz teslim edildi. Deneyiminizi yorum olarak paylaşabilirsiniz.' },
]
const BADGE = {
  yeni: ['Onay bekliyor', 'bg-amber-500/15 border-amber-500/40 text-amber-300'],
  onaylandi: ['Onaylandı', 'bg-sky-500/15 border-sky-500/40 text-sky-300'],
  hazirlaniyor: ['Hazırlanıyor', 'bg-violet-500/20 border-violet-400/40 text-violet-200'],
  'teslim-edildi': ['Teslim edildi', 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'],
  iptal: ['İptal edildi', 'bg-rose-500/15 border-rose-500/40 text-rose-300'],
}
const FILTERS = [['active', 'Aktif'], ['done', 'Tamamlanan'], ['cancelled', 'İptal'], ['all', 'Tümü']]
const group = (s) => (s === 'teslim-edildi' ? 'done' : s === 'iptal' ? 'cancelled' : 'active')

const stamp = (iso) => (iso ? new Date(iso).toLocaleString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : '')
const dayOnly = (iso) => new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

function Timeline({ order }) {
  const at = {}
  ;(order.history || []).forEach((h) => { at[h.status] = h.at })
  if (!at.yeni) at.yeni = order.createdAt
  const cancelled = order.status === 'iptal'
  const idx = STEPS.findIndex((s) => s.k === order.status)
  // for a cancelled order show only the steps that were reached before the cancellation
  const reached = cancelled ? STEPS.filter((s) => at[s.k]) : STEPS

  return (
    <ol className="mt-6">
      {reached.map((s, i) => {
        const done = cancelled ? true : i < idx || order.status === 'teslim-edildi'
        const current = !cancelled && i === idx && order.status !== 'teslim-edildi'
        const last = i === reached.length - 1 && !cancelled
        return (
          <li key={s.k} className="relative flex gap-4 pb-6 last:pb-0">
            {!last && <span className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${done ? 'bg-vx-accent' : 'bg-vx-line'}`} />}
            <span className={`relative z-10 grid place-items-center w-8 h-8 shrink-0 rounded-full border-2 ${done ? 'bg-vx-accent border-vx-accent text-white' : current ? 'bg-vx-card border-vx-accent-text text-vx-accent-text ring-4 ring-vx-accent/25' : 'bg-vx-card border-vx-line text-vx-muted'}`}>
              {done ? <Check className="w-4 h-4" strokeWidth={3} /> : current ? <Clock className="w-4 h-4" /> : <i className="w-2 h-2 rounded-full bg-vx-line" />}
            </span>
            <div className="min-w-0 pt-0.5">
              <div className={`text-[15px] font-semibold ${done || current ? 'text-white' : 'text-vx-muted'}`}>{s.title}</div>
              {at[s.k] && <div className="text-[12px] text-vx-muted">{stamp(at[s.k])}</div>}
              {current && <p className="mt-1 text-[14px] leading-relaxed text-zinc-200">{s.desc}</p>}
              {done && s.k === 'teslim-edildi' && <p className="mt-1 text-[14px] leading-relaxed text-zinc-200">{s.desc}</p>}
            </div>
          </li>
        )
      })}
      {cancelled && (
        <li className="relative flex gap-4">
          <span className="relative z-10 grid place-items-center w-8 h-8 shrink-0 rounded-full border-2 bg-rose-500 border-rose-500 text-white"><X className="w-4 h-4" strokeWidth={3} /></span>
          <div className="min-w-0 pt-0.5">
            <div className="text-[15px] font-semibold text-rose-300">İptal edildi</div>
            <div className="text-[12px] text-vx-muted">{stamp(at.iptal || order.updatedAt)} · {order.cancelledBy === 'admin' ? 'Vexstar tarafından' : 'Sizin tarafınızdan'}</div>
            {order.cancelReason && <p className="mt-1 text-[14px] text-zinc-200">“{order.cancelReason}”</p>}
          </div>
        </li>
      )}
    </ol>
  )
}

function CopyNo({ no }) {
  const [ok, setOk] = useState(false)
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard && navigator.clipboard.writeText(no).then(() => { setOk(true); setTimeout(() => setOk(false), 1500) }).catch(() => {})}
      className="inline-flex items-center gap-1.5 font-mono text-[13px] text-zinc-100 hover:text-white"
      aria-label="Sipariş numarasını kopyala"
    >
      {no} {ok ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-vx-muted" />}
    </button>
  )
}

function CancelModal({ order, onClose, onDone }) {
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function go() {
    setBusy(true)
    setError('')
    try {
      const d = await api.cancelOrder(order.orderNo, reason)
      onDone(d.order)
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }

  return (
    <Modal title="Siparişi iptal et" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-[14px] leading-relaxed text-zinc-200"><b className="text-white">{order.productName}</b> siparişini ({order.orderNo}) iptal etmek istediğinize emin misiniz? Çalışma başlamadığı için ücret iadesi yapılır; iade süreci için sizinle iletişime geçeceğiz. Bu işlem geri alınamaz.</p>
        <textarea className={`${inputCls} h-24 py-3 resize-none`} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} placeholder="İptal nedeniniz (isteğe bağlı)" />
        {error && <p role="alert" className="text-[13px] text-rose-400">{error}</p>}
        <div className="flex gap-3">
          <Button size="sm" variant="flat" className="!bg-rose-600 hover:!bg-rose-700" onClick={go} disabled={busy}>{busy ? 'İptal ediliyor…' : 'Evet, iptal et'}</Button>
          <Button size="sm" variant="secondary" onClick={onClose}>Vazgeç</Button>
        </div>
      </div>
    </Modal>
  )
}

function OrderCard({ order, onCancel }) {
  const [label, tone] = BADGE[order.status] || BADGE.yeni
  const canCancel = order.status === 'yeni' || order.status === 'onaylandi'
  return (
    <li className={`${card} p-5 sm:p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-[19px] font-bold text-white">{order.productName}</h3>
        <span className={`inline-flex items-center h-8 px-3.5 rounded-full border text-[13px] font-semibold ${tone}`}>{label}</span>
      </div>

      <dl className="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-4 p-4 rounded-xl bg-vx-surface border border-vx-line">
        <div><dt className="text-[12px] text-vx-muted">Sipariş no</dt><dd className="mt-1"><CopyNo no={order.orderNo} /></dd></div>
        <div><dt className="text-[12px] text-vx-muted">Sipariş tarihi</dt><dd className="mt-1 text-[14px] text-zinc-100">{dayOnly(order.createdAt)}</dd></div>
        <div><dt className="text-[12px] text-vx-muted">Abonelik</dt><dd className="mt-1 text-[14px] text-zinc-100">{order.monthlyPrice ? termLabel(order.termMonths || 1) : '-'}</dd></div>
        <div><dt className="text-[12px] text-vx-muted">Tutar</dt><dd className="mt-1 text-[16px] font-bold tabular-nums text-white">{formatPrice(order.price)}</dd></div>
        <div><dt className="text-[12px] text-vx-muted">Tahmini teslim</dt><dd className="mt-1 text-[14px] text-zinc-100">{order.delivery || 'Kapsama göre'}</dd></div>
      </dl>

      <Timeline order={order} />

      {(order.fields || []).length > 0 && (
        <div className="mt-5 rounded-xl bg-vx-surface border border-vx-line p-4">
          <div className="text-[13px] font-semibold text-white">Gönderdiğiniz kurulum bilgileri</div>
          <dl className="mt-2 space-y-1.5 text-[13px]">
            {order.fields.map((f) => (
              <div key={f.key} className="flex flex-wrap gap-x-2">
                <dt className="text-vx-muted">{f.label}:</dt>
                <dd className="text-zinc-100 break-all">
                  {f.secret ? (f.provided ? 'Kaydedildi (şifreli saklanıyor; teslim/iptal sonrası silinir)' : 'Silindi') : f.key === 'botLogo' && f.value ? <img src={f.value} alt="Bot logosu" className="inline-block w-10 h-10 rounded-lg object-cover align-middle" /> : f.value || '—'}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {order.note && (
        <div className="mt-5 text-[13px] text-zinc-300"><span className="text-vx-muted">Sipariş notunuz: </span>“{order.note}”</div>
      )}

      <div className="mt-6 pt-5 border-t border-vx-line flex flex-wrap items-center gap-3">
        <Link to={`${routes.contact}?siparis=${encodeURIComponent(order.orderNo)}`} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-vx-line text-[14px] font-semibold text-zinc-100 hover:border-vx-accent-text/60 hover:bg-vx-surface transition-colors">
          <LifeBuoy className="w-4 h-4 text-vx-accent-text" /> Bu sipariş için destek al
        </Link>
        {order.status === 'teslim-edildi' && order.productSlug && <Link to={`${routes.product}/${order.productSlug}#yorumlar`} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-vx-accent text-[14px] font-semibold text-white hover:bg-vx-accent-hover transition-colors">Ürünü değerlendir</Link>}
        {canCancel && <button onClick={() => onCancel(order)} className="h-10 px-4 rounded-xl text-[14px] font-semibold text-rose-300 border border-rose-500/40 hover:bg-rose-500/10 transition-colors">Siparişi iptal et</button>}
        {order.status === 'hazirlaniyor' && <span className="text-[12px] text-vx-muted">Çalışma başladığı için iptal talebinizi destek üzerinden iletin.</span>}
      </div>
    </li>
  )
}

export default function OrdersTab() {
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('active')
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    let alive = true
    api.myOrders().then((d) => {
      if (!alive) return
      setOrders(d.orders)
      if (!d.orders.some((o) => group(o.status) === 'active')) setFilter('all')
    }).catch((e) => alive && setError(e.message))
    return () => {
      alive = false
    }
  }, [])

  if (error) return <p className="text-[14px] text-rose-400">{error}</p>
  if (!orders) return <p className="text-[14px] text-vx-muted">Yükleniyor…</p>
  if (!orders.length) {
    return (
      <div className={`${card} p-10 text-center`}>
        <Package className="w-11 h-11 mx-auto text-vx-accent-text" strokeWidth={1.5} />
        <p className="mt-4 text-[17px] font-semibold text-white">Henüz siparişiniz yok</p>
        <p className="mt-1.5 text-[14px] text-vx-muted">Bir hizmet seçtiğinizde siparişinizin her aşamasını buradan takip edebilirsiniz.</p>
        <Button size="sm" to={routes.home} className="mt-6">Hizmetlere göz at</Button>
      </div>
    )
  }

  const count = (k) => (k === 'all' ? orders.length : orders.filter((o) => group(o.status) === k).length)
  const shown = orders.filter((o) => filter === 'all' || group(o.status) === filter)

  return (
    <div className="space-y-5">
      <section className={`${card} flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5`}>
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-vx-accent-text/20 bg-vx-accent/15 text-vx-accent-text"><Package className="h-5 w-5" /></span>
          <div><p className="text-[14px] font-bold text-white">Sipariş geçmişiniz</p><p className="mt-0.5 text-[12px] text-vx-muted">Tüm hizmetlerinizi ve teslimat süreçlerini takip edin.</p></div>
        </div>
        <div className="rounded-xl border border-vx-line bg-vx-surface px-4 py-2 text-right"><div className="text-lg font-bold tabular-nums text-white">{orders.length}</div><div className="text-[10px] font-semibold uppercase tracking-wider text-vx-muted">Toplam sipariş</div></div>
      </section>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Sipariş durumu">
        {FILTERS.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={filter === k} onClick={() => setFilter(k)} className={`h-10 px-4 rounded-full text-[13px] font-semibold border transition-colors ${filter === k ? 'bg-vx-accent border-vx-accent text-white' : 'bg-vx-card border-vx-line text-vx-muted hover:text-white'}`}>
            {l} <span className="opacity-70">({count(k)})</span>
          </button>
        ))}
      </div>
      {shown.length === 0 && <p className={`${card} p-8 text-center text-[14px] text-vx-muted`}>Bu durumda sipariş yok.</p>}
      <ul className="space-y-5">
        {shown.map((o) => <OrderCard key={o.orderNo} order={o} onCancel={setCancelling} />)}
      </ul>
      {cancelling && (
        <CancelModal
          order={cancelling}
          onClose={() => setCancelling(null)}
          onDone={(updated) => {
            setOrders((l) => l.map((o) => (o.orderNo === updated.orderNo ? { ...o, ...updated } : o)))
            setCancelling(null)
            setFilter('cancelled')
          }}
        />
      )}
    </div>
  )
}
