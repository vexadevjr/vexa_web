import { useState } from 'react'
import { ShieldCheck, ShieldAlert } from 'lucide-react'
import { admin } from '../../lib/adminApi.js'
import { Card, Btn, Badge, Empty, Pager, SelectField, TextField, useLoad, fmtDate } from './ui.jsx'

const CATS = [['', 'Tümü'], ['oturum', 'Oturum'], ['urun', 'Ürün'], ['indirim', 'İndirim'], ['siparis', 'Sipariş'], ['musteri', 'Müşteri'], ['destek', 'Destek'], ['yorum', 'Yorum'], ['icerik', 'İçerik']]
const TONE = { oturum: 'gray', urun: 'blue', indirim: 'amber', siparis: 'green', musteri: 'red', destek: 'blue', yorum: 'gray', icerik: 'blue' }

function Details({ d }) {
  if (!d) return null
  return <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-vx-surface border border-vx-line p-3 text-[12px] leading-relaxed text-zinc-200 whitespace-pre-wrap break-words">{JSON.stringify(d, null, 2)}</pre>
}

// Read-only list: the server offers no way to change or delete an entry, and the hash chain exposes any tampering.
export default function AuditLog() {
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState('')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState('')
  const { data, error, loading, reload } = useLoad(() => admin.audit({ page, category, q }), [page, category, q])
  const [check, setCheck] = useState(null)
  const [checking, setChecking] = useState(false)

  async function verify() {
    setChecking(true)
    try { setCheck(await admin.auditVerify()) } catch (e) { setCheck({ ok: false, reason: e.message }) } finally { setChecking(false) }
  }

  return (
    <Card
      title="İşlem Kayıtları"
      actions={<><Btn variant="ghost" onClick={reload}>Yenile</Btn><Btn variant="ghost" disabled={checking} onClick={verify}>{checking ? 'Denetleniyor…' : 'Bütünlüğü doğrula'}</Btn></>}
    >
      <p className="text-[12.5px] text-vx-muted">Panelde yapılan her işlem; kim, ne zaman, hangi IP’den ve ne değiştirdiği ile birlikte kaydedilir. Kayıtlar <b className="text-zinc-200">silinemez ve düzenlenemez</b> (zincirleme imzalı, yalnızca ekleme).</p>
      {check && (
        <div className={`mt-3 flex items-start gap-2 rounded-xl border px-4 py-3 text-[13px] ${check.ok ? 'border-emerald-500/40 bg-emerald-600/10 text-emerald-200' : 'border-rose-500/50 bg-rose-600/15 text-rose-200'}`}>
          {check.ok ? <ShieldCheck className="w-5 h-5 shrink-0" /> : <ShieldAlert className="w-5 h-5 shrink-0" />}
          <span>{check.ok ? `Tüm kayıtlar sağlam (${check.count} kayıt, zincir sonu ${check.head}).` : `Uyarı: ${check.reason || 'Zincir bozuk'}${check.brokenAt ? ` — #${check.brokenAt}. kayıt` : ''}`}</span>
        </div>
      )}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SelectField label="Tür" value={category} onChange={(v) => { setCategory(v); setPage(1) }} options={CATS} />
        <div className="sm:col-span-2"><TextField label="Ara (işlem, kişi, IP)" value={q} onChange={(v) => { setQ(v); setPage(1) }} max={60} /></div>
      </div>
      {error && <p className="mt-3 text-[13px] text-rose-400">{error}</p>}
      <div className="mt-4 overflow-x-auto">
        {loading && !data ? <Empty>Yükleniyor…</Empty> : data && data.rows.length === 0 ? <Empty>Kayıt yok.</Empty> : (
          <table className="w-full text-[13px]">
            <thead><tr className="text-left text-vx-muted"><th className="py-2 pr-3 font-medium">#</th><th className="py-2 pr-3 font-medium">Zaman</th><th className="py-2 pr-3 font-medium">Kim / IP</th><th className="py-2 font-medium">İşlem</th></tr></thead>
            <tbody>
              {(data ? data.rows : []).map((r) => (
                <tr key={r.seq} className="border-t border-vx-line align-top">
                  <td className="py-2.5 pr-3 text-zinc-400 tabular-nums">{r.seq}</td>
                  <td className="py-2.5 pr-3 whitespace-nowrap text-zinc-200">{fmtDate(r.at)}</td>
                  <td className="py-2.5 pr-3"><div className="text-white break-all">{r.actor}</div><div className="text-[12px] text-vx-muted tabular-nums">{r.ip || '—'}</div></td>
                  <td className="py-2.5">
                    <div className="flex flex-wrap items-center gap-2"><Badge tone={TONE[r.category] || 'gray'}>{r.category}</Badge><span className="text-[11px] text-vx-muted">{r.action}</span></div>
                    <div className="mt-1 text-zinc-100">{r.summary}</div>
                    {(r.details || r.ua) && <button onClick={() => setOpen(open === r.seq ? '' : r.seq)} className="mt-1 text-[12px] font-semibold text-vx-accent-text hover:text-white">{open === r.seq ? 'Detayı gizle' : 'Detay'}</button>}
                    {open === r.seq && <><Details d={r.details} />{r.ua && <div className="mt-2 text-[11px] text-vx-muted break-words">Tarayıcı: {r.ua}</div>}<div className="mt-1 text-[11px] text-vx-muted break-all">İmza: {r.hash}</div></>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {data && <Pager page={page} total={data.total} perPage={data.perPage} onPage={setPage} />}
    </Card>
  )
}
