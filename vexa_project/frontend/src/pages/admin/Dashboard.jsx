import { useState } from 'react'
import { Eye, Users, MessageSquare, ShoppingBag, Star, Package } from 'lucide-react'
import { admin } from '../../lib/adminApi.js'
import { Card, Btn, Badge, Empty, Pager, TextField, useAdmin, useLoad, fmtDate } from './ui.jsx'

const RANGES = [
  ['day', 'Gün'],
  ['week', 'Hafta'],
  ['month', 'Ay'],
  ['year', 'Yıl'],
]
const RANGE_NAME = { day: 'Son 24 saat', week: 'Son 7 gün', month: 'Son 30 gün', year: 'Son 12 ay' }
const nf = (n) => Number(n || 0).toLocaleString('tr-TR')

// Dependency-free SVG chart: bars = page views, line = unique visitors (distinct IPs).
function Chart({ series }) {
  const W = 800
  const H = 260
  const pad = { l: 44, r: 12, t: 14, b: 30 }
  const max = Math.max(4, ...series.map((s) => s.views))
  const nice = Math.ceil(max / 4) * 4
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b
  const step = iw / series.length
  const x = (i) => pad.l + step * i + step / 2
  const y = (v) => pad.t + ih - (v / nice) * ih
  const every = Math.ceil(series.length / 12)
  const line = series.map((s, i) => `${x(i)},${y(s.unique)}`).join(' ')

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[560px]" role="img" aria-label="Ziyaretçi grafiği">
        {[0, 1, 2, 3, 4].map((g) => {
          const v = (nice / 4) * g
          return (
            <g key={g}>
              <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="#201b3a" strokeWidth="1" />
              <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#94a3b8">
                {Math.round(v)}
              </text>
            </g>
          )
        })}
        {series.map((s, i) => (
          <g key={s.label + i}>
            <rect x={x(i) - Math.min(step * 0.7, 28) / 2} y={y(s.views)} width={Math.min(step * 0.7, 28)} height={Math.max(0, pad.t + ih - y(s.views))} rx="3" fill="#4f46e5" opacity="0.85">
              <title>{`${s.label}: ${s.views} görüntülenme, ${s.unique} tekil ziyaretçi`}</title>
            </rect>
            {i % every === 0 && (
              <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="10.5" fill="#94a3b8">
                {s.label}
              </text>
            )}
          </g>
        ))}
        <polyline points={line} fill="none" stroke="#a5b4fc" strokeWidth="2.2" strokeLinejoin="round" />
        {series.map((s, i) => (
          <circle key={`c${i}`} cx={x(i)} cy={y(s.unique)} r="3" fill="#a5b4fc" />
        ))}
      </svg>
      <div className="mt-2 flex items-center gap-5 text-[12px] text-vx-muted">
        <span className="inline-flex items-center gap-2">
          <i className="w-3 h-3 rounded-sm bg-vx-accent" /> Sayfa görüntüleme
        </span>
        <span className="inline-flex items-center gap-2">
          <i className="w-3 h-1 rounded bg-vx-accent-soft" /> Tekil ziyaretçi (IP)
        </span>
      </div>
    </div>
  )
}

function Counters() {
  const { goTo } = useAdmin()
  const { data } = useLoad(() => admin.overview(), [])
  const items = [
    { k: 'openTickets', label: 'Okunmamış destek talebi', icon: MessageSquare, to: 'tickets' },
    { k: 'newOrders', label: 'Yeni sipariş', icon: ShoppingBag, to: 'orders' },
    { k: 'pendingReviews', label: 'Onay bekleyen yorum', icon: Star, to: 'reviews' },
    { k: 'users', label: 'Kayıtlı müşteri', icon: Users, to: 'users' },
    { k: 'products', label: 'Ürün / hizmet', icon: Package, to: 'products' },
  ]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {items.map(({ k, label, icon: Icon, to }) => (
        <button key={k} onClick={() => goTo(to)} className="text-left p-4 rounded-2xl bg-vx-card border border-vx-line hover:border-vx-accent-text/40 transition-colors">
          <Icon className="w-5 h-5 text-vx-accent-text" />
          <div className="mt-3 text-2xl font-black text-white">{data ? nf(data[k]) : '…'}</div>
          <div className="text-[12px] text-vx-muted">{label}</div>
        </button>
      ))}
    </div>
  )
}

function VisitorTable({ range }) {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [applied, setApplied] = useState('')
  const { data, loading } = useLoad(() => admin.visitors({ range, page, q: applied }), [range, page, applied])

  return (
    <Card
      title={`Ziyaretçi IP Tablosu · ${RANGE_NAME[range]}`}
      actions={
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            setPage(1)
            setApplied(q.trim())
          }}
        >
          <input className="h-9 w-40 px-3 rounded-lg bg-vx-surface border border-vx-line text-[13px] text-white outline-none focus:border-vx-accent-text/60" placeholder="IP ara…" value={q} onChange={(e) => setQ(e.target.value)} maxLength={45} />
          <Btn type="submit" variant="ghost">
            Ara
          </Btn>
        </form>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead>
            <tr className="text-vx-muted border-b border-vx-line">
              <th className="py-2 pr-3 font-medium">IP adresi</th>
              <th className="py-2 pr-3 font-medium">Görüntüleme</th>
              <th className="py-2 pr-3 font-medium">Sayfa</th>
              <th className="py-2 pr-3 font-medium">İlk ziyaret</th>
              <th className="py-2 pr-3 font-medium">Son ziyaret</th>
              <th className="py-2 pr-3 font-medium">Son sayfa</th>
              <th className="py-2 font-medium">Tarayıcı</th>
            </tr>
          </thead>
          <tbody>
            {data &&
              data.rows.map((r) => (
                <tr key={r.ip} className="border-b border-vx-line/60 last:border-0 align-top">
                  <td className="py-2.5 pr-3 font-mono text-white">{r.ip}</td>
                  <td className="py-2.5 pr-3">{nf(r.hits)}</td>
                  <td className="py-2.5 pr-3">{r.pageCount}</td>
                  <td className="py-2.5 pr-3 text-vx-muted whitespace-nowrap">{fmtDate(r.firstSeen)}</td>
                  <td className="py-2.5 pr-3 text-vx-muted whitespace-nowrap">{fmtDate(r.lastSeen)}</td>
                  <td className="py-2.5 pr-3 text-slate-200">{r.lastPath}</td>
                  <td className="py-2.5 text-[11px] text-slate-500 max-w-[220px] truncate" title={r.ua}>
                    {r.ua || '—'}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {data && data.rows.length === 0 && <Empty>Bu aralıkta kayıtlı ziyaretçi yok.</Empty>}
        {loading && !data && <Empty>Yükleniyor…</Empty>}
      </div>
      {data && <Pager page={page} total={data.total} perPage={data.perPage} onPage={setPage} />}
      <p className="mt-4 text-[11px] text-slate-500">IP kayıtları 400 gün sonra otomatik silinir. Kişisel veri sayıldığı için gizlilik politikanızda belirtmeniz önerilir (KVKK).</p>
    </Card>
  )
}

export default function Dashboard() {
  const [range, setRange] = useState('week')
  const { data, error, loading } = useLoad(() => admin.analytics(range), [range])

  return (
    <div className="space-y-6">
      <Counters />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {RANGES.map(([id, label]) => (
          <div key={id} className={`p-4 rounded-2xl bg-vx-card border ${range === id ? 'border-vx-accent/60' : 'border-vx-line'}`}>
            <div className="text-[12px] text-vx-muted">{RANGE_NAME[id]}</div>
            <div className="mt-2 flex items-center gap-2 text-2xl font-black text-white">
              <Eye className="w-5 h-5 text-vx-accent-text" /> {data ? nf(data.totals[id].views) : '…'}
            </div>
            <div className="mt-1 flex items-center gap-2 text-[12px] text-vx-muted">
              <Users className="w-4 h-4" /> {data ? nf(data.totals[id].unique) : '…'} tekil ziyaretçi
            </div>
          </div>
        ))}
      </div>

      <Card
        title="Ziyaretçi Grafiği"
        actions={RANGES.map(([id, label]) => (
          <Btn key={id} variant={range === id ? 'primary' : 'ghost'} onClick={() => setRange(id)}>
            {label}
          </Btn>
        ))}
      >
        {error && <p className="text-[13px] text-rose-400">{error}</p>}
        {!data && loading && <Empty>Yükleniyor…</Empty>}
        {data && <Chart series={data.series} />}
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_2.2fr] gap-6 items-start">
        <Card title="En çok bakılan sayfalar">
          {data && data.topPages.length === 0 && <Empty>Henüz veri yok.</Empty>}
          <ul className="space-y-2.5">
            {data &&
              data.topPages.map((p) => (
                <li key={p.path} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="truncate text-slate-200">{p.path}</span>
                  <Badge tone="blue">{nf(p.views)}</Badge>
                </li>
              ))}
          </ul>
        </Card>
        <VisitorTable range={range} />
      </div>
    </div>
  )
}
