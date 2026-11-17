import { useMemo, useRef, useState } from 'react'
import { Eye, Users, MessageSquare, ShoppingBag, Star, Package, TrendingUp, TrendingDown, Plus, ExternalLink, AlertTriangle, Wallet, Smartphone, Monitor, Tablet } from 'lucide-react'
import { admin } from '../../lib/adminApi.js'
import { formatPrice } from '../../lib/format.js'
import { Card, Btn, Badge, Empty, Pager, useAdmin, useLoad, fmtDate } from './ui.jsx'

const RANGES = [['day', 'Son 24 saat'], ['week', 'Son 7 gün'], ['month', 'Son 30 gün'], ['year', 'Son 12 ay']]
const RANGE_NAME = Object.fromEntries(RANGES)
const nf = (n) => Number(n || 0).toLocaleString('tr-TR')

// ───────── smooth area chart with hover tooltip (no chart library) ─────────
const smooth = (pts) => {
  if (pts.length < 2) return pts.length ? `M${pts[0][0]},${pts[0][1]}` : ''
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`
  }
  return d
}
const niceMax = (m) => {
  const mag = 10 ** Math.floor(Math.log10(m))
  const n = m / mag
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag
}

function AreaChart({ series }) {
  const W = 900
  const H = 320
  const pad = { l: 46, r: 14, t: 14, b: 32 }
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b
  const n = series.length
  const nice = niceMax(Math.max(4, ...series.map((s) => s.views)))
  const x = (i) => pad.l + (n === 1 ? iw / 2 : (iw * i) / (n - 1))
  const y = (v) => pad.t + ih - (v / nice) * ih
  const [hover, setHover] = useState(-1)
  const wrap = useRef(null)

  const vPts = series.map((s, i) => [x(i), y(s.views)])
  const uPts = series.map((s, i) => [x(i), y(s.unique)])
  const vLine = smooth(vPts)
  const uLine = smooth(uPts)
  const area = (line, pts) => `${line} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z`
  const every = Math.ceil(n / 8)

  function onMove(e) {
    const r = wrap.current.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    const i = Math.round(((px - pad.l) / iw) * (n - 1))
    setHover(Math.max(0, Math.min(n - 1, i)))
  }
  const hs = hover >= 0 ? series[hover] : null
  const left = hover >= 0 ? Math.min(88, Math.max(12, (x(hover) / W) * 100)) : 0

  return (
    <div className="relative" ref={wrap} onPointerMove={onMove} onPointerLeave={() => setHover(-1)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto touch-pan-y" role="img" aria-label="Ziyaret grafiği">
        <defs>
          <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" /></linearGradient>
          <linearGradient id="gUnique" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f0abfc" stopOpacity="0.28" /><stop offset="100%" stopColor="#f0abfc" stopOpacity="0" /></linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((g) => {
          const v = (nice / 4) * g
          return (
            <g key={g}>
              <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="#2e2c38" strokeDasharray={g ? '4 6' : '0'} />
              <text x={pad.l - 10} y={y(v) + 4} textAnchor="end" fontSize="12" fill="#a1a1b0">{Math.round(v)}</text>
            </g>
          )
        })}
        <path d={area(vLine, vPts)} fill="url(#gViews)" />
        <path d={area(uLine, uPts)} fill="url(#gUnique)" />
        <path d={vLine} fill="none" stroke="#8b5cf6" strokeWidth="2.6" strokeLinecap="round" />
        <path d={uLine} fill="none" stroke="#f0abfc" strokeWidth="2.2" strokeLinecap="round" />
        {series.map((s, i) => i % every === 0 && <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11.5" fill="#a1a1b0">{s.label}</text>)}
        {hs && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="#8b5cf6" strokeOpacity="0.5" />
            <circle cx={x(hover)} cy={y(hs.views)} r="5" fill="#8b5cf6" stroke="#fff" strokeWidth="2" />
            <circle cx={x(hover)} cy={y(hs.unique)} r="4.5" fill="#f0abfc" stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hs && (
        <div className="pointer-events-none absolute top-2 -translate-x-1/2 px-3 py-2 rounded-xl bg-vx-surface border border-vx-line shadow-xl text-[12px]" style={{ left: `${left}%` }}>
          <div className="font-semibold text-white mb-1">{hs.label}</div>
          <div className="flex items-center gap-2 text-zinc-200"><i className="w-2.5 h-2.5 rounded-full bg-violet-500" /> {nf(hs.views)} görüntüleme</div>
          <div className="flex items-center gap-2 text-zinc-200"><i className="w-2.5 h-2.5 rounded-full bg-fuchsia-300" /> {nf(hs.unique)} tekil ziyaretçi</div>
        </div>
      )}
      <div className="mt-1 flex items-center gap-5 text-[12px] text-vx-muted">
        <span className="inline-flex items-center gap-2"><i className="w-3 h-3 rounded-full bg-violet-500" /> Sayfa görüntüleme</span>
        <span className="inline-flex items-center gap-2"><i className="w-3 h-3 rounded-full bg-fuchsia-300" /> Tekil ziyaretçi (IP)</span>
      </div>
    </div>
  )
}

function Delta({ now, before }) {
  if (!before) return <span className="text-[12px] text-vx-muted">önceki dönemde veri yok</span>
  const pct = Math.round(((now - before) / before) * 100)
  const up = pct >= 0
  const Icon = up ? TrendingUp : TrendingDown
  return <span className={`inline-flex items-center gap-1 text-[12px] font-semibold ${up ? 'text-emerald-400' : 'text-rose-400'}`}><Icon className="w-4 h-4" /> {up ? '+' : ''}{pct}% <span className="font-normal text-vx-muted">önceki döneme göre</span></span>
}

function Bars({ items, icons }) {
  const total = items.reduce((a, b) => a + b.views, 0) || 1
  if (!items.length) return <Empty>Henüz veri yok.</Empty>
  return (
    <ul className="space-y-3">
      {items.map((it) => {
        const Icon = icons && icons[it.name]
        const pct = Math.round((it.views / total) * 100)
        return (
          <li key={it.name}>
            <div className="flex items-center justify-between text-[13px] mb-1.5">
              <span className="inline-flex items-center gap-2 text-zinc-100">{Icon && <Icon className="w-4 h-4 text-vx-accent-text" />}{it.name}</span>
              <span className="text-vx-muted">{pct}% · {nf(it.views)}</span>
            </div>
            <div className="h-2 rounded-full bg-vx-surface overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" style={{ width: `${pct}%` }} /></div>
          </li>
        )
      })}
    </ul>
  )
}

const deviceOf = (ua = '') => (/ipad|tablet|(android(?!.*mobile))/i.test(ua) ? 'Tablet' : /mobi|iphone|android/i.test(ua) ? 'Mobil' : 'Masaüstü')

function VisitorTable({ range }) {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [applied, setApplied] = useState('')
  const { data, loading } = useLoad(() => admin.visitors({ range, page, q: applied }), [range, page, applied])

  return (
    <Card
      title={`Ziyaretçi IP Tablosu · ${RANGE_NAME[range]}`}
      actions={
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setPage(1); setApplied(q.trim()) }}>
          <input className="h-9 w-40 px-3 rounded-lg bg-vx-surface border border-vx-line text-[13px] text-white outline-none focus:border-vx-accent-text/60" placeholder="IP ara…" value={q} onChange={(e) => setQ(e.target.value)} maxLength={45} />
          <Btn type="submit" variant="ghost">Ara</Btn>
        </form>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead>
            <tr className="text-vx-muted border-b border-vx-line">
              {['IP adresi', 'Cihaz', 'Görüntüleme', 'İlk ziyaret', 'Son ziyaret', 'Son sayfa'].map((h) => <th key={h} className="py-2 pr-3 font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data && data.rows.map((r) => (
              <tr key={r.ip} className="border-b border-vx-line/60 last:border-0 align-top" title={r.ua}>
                <td className="py-2.5 pr-3 font-mono text-white">{r.ip}</td>
                <td className="py-2.5 pr-3 text-zinc-200">{deviceOf(r.ua)}</td>
                <td className="py-2.5 pr-3">{nf(r.hits)} <span className="text-vx-muted">({r.pageCount} sayfa)</span></td>
                <td className="py-2.5 pr-3 text-vx-muted whitespace-nowrap">{fmtDate(r.firstSeen)}</td>
                <td className="py-2.5 pr-3 text-vx-muted whitespace-nowrap">{fmtDate(r.lastSeen)}</td>
                <td className="py-2.5 text-zinc-200">{r.lastPath}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && data.rows.length === 0 && <Empty>Bu aralıkta kayıtlı ziyaretçi yok. (Ziyaretler yalnızca çerez tercihinde “Analitik”e izin veren kullanıcılar için kaydedilir.)</Empty>}
        {loading && !data && <Empty>Yükleniyor…</Empty>}
      </div>
      {data && <Pager page={page} total={data.total} perPage={data.perPage} onPage={setPage} />}
      <p className="mt-4 text-[11px] text-slate-500">IP kayıtları 400 gün sonra otomatik silinir. IP adresi kişisel veridir; KVKK Aydınlatma Metni’nde belirtilmiştir.</p>
    </Card>
  )
}

export default function Dashboard() {
  const { goTo } = useAdmin()
  const [range, setRange] = useState('week')
  const { data: ov } = useLoad(() => admin.overview(), [])
  const { data, error, loading } = useLoad(() => admin.analytics(range), [range])

  const stats = useMemo(() => {
    if (!data) return null
    const peak = data.series.reduce((a, b) => (b.views > a.views ? b : a), data.series[0])
    return { views: data.totals[range].views, unique: data.totals[range].unique, peak, prev: data.previous }
  }, [data, range])

  const counters = [
    { k: 'newOrders', label: 'Yeni sipariş', icon: ShoppingBag, to: 'orders' },
    { k: 'openTickets', label: 'Okunmamış destek talebi', icon: MessageSquare, to: 'tickets' },
    { k: 'pendingReviews', label: 'Onay bekleyen yorum', icon: Star, to: 'reviews' },
    { k: 'users', label: 'Kayıtlı müşteri', icon: Users, to: 'users' },
  ]

  return (
    <div className="space-y-6">
      {ov && ov.legalMissing && (
        <button onClick={() => goTo('content', 'legal')} className="w-full flex items-center gap-3 text-left p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 hover:bg-amber-500/15 transition-colors">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-300" />
          <span className="text-[14px] text-amber-100"><b>Yasal bilgiler eksik.</b> KVKK ve mesafeli satış sayfalarında görünecek işletme unvanı, adres ve vergi/MERSİS numarasını girin. Düzenlemek için tıklayın.</span>
        </button>
      )}

      <div className="flex flex-wrap gap-3">
        <Btn onClick={() => goTo('products', 'new')}><Plus className="w-4 h-4" /> Yeni ürün</Btn>
        <Btn variant="ghost" onClick={() => goTo('portfolio', 'new')}><Plus className="w-4 h-4" /> Yeni proje</Btn>
        <Btn variant="ghost" onClick={() => goTo('tickets')}><MessageSquare className="w-4 h-4" /> Destek kutusu</Btn>
        <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-vx-line bg-vx-surface text-[13px] font-semibold text-white hover:bg-vx-line"><ExternalLink className="w-4 h-4" /> Siteyi aç</a>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {counters.map(({ k, label, icon: Icon, to }) => (
          <button key={k} onClick={() => goTo(to)} className="text-left p-4 rounded-2xl bg-vx-card border border-vx-line hover:border-vx-accent-text/40 transition-colors">
            <div className="flex items-center justify-between"><Icon className="w-5 h-5 text-vx-accent-text" />{ov && ov[k] > 0 && ['newOrders', 'openTickets', 'pendingReviews'].includes(k) && <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />}</div>
            <div className="mt-3 text-2xl font-black text-white">{ov ? nf(ov[k]) : '…'}</div>
            <div className="text-[12px] text-vx-muted">{label}</div>
          </button>
        ))}
        <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-gradient-to-br from-vx-accent/30 to-vx-card border border-vx-accent/40">
          <Wallet className="w-5 h-5 text-vx-accent-soft" />
          <div className="mt-3 text-2xl font-black text-white tabular-nums">{ov ? formatPrice(ov.revenue.total) : '…'}</div>
          <div className="text-[12px] text-zinc-200">Toplam sipariş tutarı ({ov ? ov.revenue.count : 0} sipariş, iptaller hariç)</div>
        </div>
      </div>

      <Card
        title="Ziyaretçi Analizi"
        actions={RANGES.map(([id, label]) => <Btn key={id} variant={range === id ? 'primary' : 'ghost'} onClick={() => setRange(id)}>{label}</Btn>)}
      >
        {error && <p className="text-[13px] text-rose-400">{error}</p>}
        {stats && (
          <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-vx-surface border border-vx-line"><div className="text-[12px] text-vx-muted flex items-center gap-2"><Eye className="w-4 h-4" /> Sayfa görüntüleme</div><div className="mt-1 text-2xl font-black text-white">{nf(stats.views)}</div><Delta now={stats.views} before={stats.prev.views} /></div>
            <div className="p-4 rounded-xl bg-vx-surface border border-vx-line"><div className="text-[12px] text-vx-muted flex items-center gap-2"><Users className="w-4 h-4" /> Tekil ziyaretçi</div><div className="mt-1 text-2xl font-black text-white">{nf(stats.unique)}</div><Delta now={stats.unique} before={stats.prev.unique} /></div>
            <div className="p-4 rounded-xl bg-vx-surface border border-vx-line"><div className="text-[12px] text-vx-muted">Ziyaretçi başına sayfa</div><div className="mt-1 text-2xl font-black text-white">{stats.unique ? (stats.views / stats.unique).toFixed(1) : '—'}</div><span className="text-[12px] text-vx-muted">{RANGE_NAME[range]}</span></div>
            <div className="p-4 rounded-xl bg-vx-surface border border-vx-line"><div className="text-[12px] text-vx-muted">En yoğun an</div><div className="mt-1 text-2xl font-black text-white">{stats.peak && stats.peak.views ? stats.peak.label : '—'}</div><span className="text-[12px] text-vx-muted">{stats.peak && stats.peak.views ? `${nf(stats.peak.views)} görüntüleme` : 'Henüz veri yok'}</span></div>
          </div>
        )}
        {!data && loading && <Empty>Yükleniyor…</Empty>}
        {data && <AreaChart series={data.series} />}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Cihazlar">{data ? <Bars items={data.devices} icons={{ Mobil: Smartphone, Masaüstü: Monitor, Tablet }} /> : <Empty>Yükleniyor…</Empty>}</Card>
        <Card title="Tarayıcılar">{data ? <Bars items={data.browsers} /> : <Empty>Yükleniyor…</Empty>}</Card>
        <Card title="En çok bakılan sayfalar">
          {data && data.topPages.length === 0 && <Empty>Henüz veri yok.</Empty>}
          <ul className="space-y-2.5">
            {data && data.topPages.map((p) => (
              <li key={p.path} className="flex items-center justify-between gap-3 text-[13px]"><span className="truncate text-zinc-200">{p.path}</span><Badge tone="blue">{nf(p.views)}</Badge></li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title="Son siparişler" actions={<Btn variant="ghost" onClick={() => goTo('orders')}>Tümü</Btn>}>
          {ov && ov.recentOrders.length === 0 && <Empty>Henüz sipariş yok.</Empty>}
          <ul className="divide-y divide-vx-line/60">
            {ov && ov.recentOrders.map((o) => (
              <li key={o.orderNo} className="py-3 flex items-center justify-between gap-3 text-[13px]">
                <div className="min-w-0"><div className="font-semibold text-white truncate">{o.productName}</div><div className="text-vx-muted">{o.customer && o.customer.name} · {o.orderNo} · {fmtDate(o.createdAt)}</div></div>
                <div className="text-right shrink-0"><div className="font-bold tabular-nums text-white">{formatPrice(o.price)}</div><Badge tone={o.status === 'yeni' ? 'amber' : o.status === 'iptal' ? 'red' : o.status === 'teslim-edildi' ? 'green' : 'blue'}>{o.status}</Badge></div>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Son destek talepleri" actions={<Btn variant="ghost" onClick={() => goTo('tickets')}>Tümü</Btn>}>
          {ov && ov.recentTickets.length === 0 && <Empty>Henüz talep yok.</Empty>}
          <ul className="divide-y divide-vx-line/60">
            {ov && ov.recentTickets.map((t) => (
              <li key={t.ticketNo} className="py-3 flex items-center justify-between gap-3 text-[13px]">
                <div className="min-w-0"><div className="font-semibold text-white truncate flex items-center gap-2">{t.unreadByAdmin && <i className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />}{t.subject}</div><div className="text-vx-muted">{t.name} · {t.ticketNo} · {fmtDate(t.updatedAt)}</div></div>
                <Badge tone={t.status === 'acik' ? 'amber' : t.status === 'yanitlandi' ? 'green' : 'gray'}>{t.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <VisitorTable range={range} />
    </div>
  )
}
