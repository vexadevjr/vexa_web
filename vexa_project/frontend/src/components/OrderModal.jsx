import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Clock, Lock, Package, ShieldCheck, Trash2, X, AlertTriangle } from 'lucide-react'
import Button from './Button.jsx'
import Field, { inputCls } from './Field.jsx'
import FitImage from './FitImage.jsx'
import TrustBadges from './TrustBadges.jsx'
import TermPicker from './TermPicker.jsx'
import OrderFields from './OrderFields.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useSite } from '../context/SiteContext.jsx'
import { api } from '../lib/api.js'
import { formatPrice, deliveryLabel, discountInfo, termLabel, termsOf, totalFor, discountedTotalFor } from '../lib/format.js'
import { validateOrderFields } from '../config/orderFields.js'

const STEPS = ['Sepetim', 'Bilgiler', 'Onay']

function Stepper({ step }) {
  return (
    <ol className="flex items-center" aria-label="Sipariş adımları">
      {STEPS.map((label, i) => {
        const n = i + 1
        const done = step > n
        const cur = step === n
        return (
          <li key={label} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`} aria-current={cur ? 'step' : undefined}>
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[13px] font-bold transition-colors ${done ? 'border-vx-accent bg-vx-accent text-white' : cur ? 'border-vx-accent-text bg-vx-accent/20 text-white' : 'border-vx-line text-vx-muted'}`}>{done ? <Check className="h-4 w-4" /> : n}</span>
            <span className={`ml-2 text-[13px] font-semibold ${cur ? 'text-white' : 'text-vx-muted'}`}>{label}</span>
            {i < STEPS.length - 1 && <span className={`mx-3 h-px flex-1 ${done ? 'bg-vx-accent' : 'bg-vx-line'}`} />}
          </li>
        )
      })}
    </ol>
  )
}

const Sum = ({ k, v, tone = '' }) => (
  <div className="flex items-start justify-between gap-4 py-1.5 text-[13px]">
    <span className="text-vx-muted">{k}</span>
    <span className={`text-right font-medium tabular-nums ${tone || 'text-zinc-100'}`}>{v}</span>
  </div>
)

// Para birimli tutar: indirim varsa üstü çizili eski fiyat + yeni fiyat
const Money = ({ old, now, big = false }) => (
  <span className="inline-flex flex-wrap items-baseline justify-end gap-x-2">
    {old > now && <span className="text-[12px] font-normal tabular-nums text-zinc-500 line-through decoration-rose-400/70">{formatPrice(old)}</span>}
    <span className={`font-black tabular-nums text-white ${big ? 'text-[22px]' : 'text-[16px]'}`}>{formatPrice(now)}</span>
  </span>
)

export default function OrderModal({ onClose }) {
  const { user, orderItems, completeCartKey } = useApp()
  const { products, termDiscounts = {}, routes, links } = useSite()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [lines, setLines] = useState(() =>
    (orderItems || []).map((it) => {
      const live = (products || []).find((p) => p.slug === it.product.slug) || it.product
      const terms = termsOf(live)
      return { key: it.key, slug: it.product.slug, snapshot: it.product, months: terms.length ? (terms.includes(it.months) ? it.months : terms[0]) : null }
    })
  )
  const [extra, setExtra] = useState({})
  const [lineErrors, setLineErrors] = useState({})
  const [note, setNote] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [legalError, setLegalError] = useState('')
  const [results, setResults] = useState({}) // key -> { orderNo, productName } | { error }
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && !busy && onClose()
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [onClose, busy])

  // canlı ürün verisi (fiyat/alan değişmiş olabilir); fiyatı sunucu zaten kendi kataloğundan alır
  const rows = useMemo(
    () =>
      lines.map((l) => {
        const live = (products || []).find((p) => p.slug === l.slug)
        const p = live || l.snapshot
        const terms = termsOf(p)
        const mm = terms.length ? l.months || terms[0] : 1
        const sale = discountInfo(p)
        const ok = Boolean(live) && p.price != null
        const base = ok ? totalFor(p.price, mm) : 0
        const total = ok ? (terms.length ? discountedTotalFor(p.price, mm, termDiscounts) : base) : 0
        const old = ok ? Math.max(base, sale ? totalFor(sale.old, mm) : 0) : 0
        return { ...l, p, terms, mm, sale, ok, total, old, termPct: terms.length ? Number(termDiscounts[mm]) || 0 : 0, result: results[l.key] }
      }),
    [lines, products, termDiscounts, results]
  )

  if (!user || !orderItems) return null

  const pending = rows.filter((r) => r.ok && !(r.result && r.result.orderNo))
  const placed = rows.filter((r) => r.result && r.result.orderNo)
  const sumOld = pending.reduce((a, r) => a + r.old, 0)
  const sumTotal = pending.reduce((a, r) => a + r.total, 0)
  const saving = Math.max(0, Math.round((sumOld - sumTotal) * 100) / 100)
  const allDone = rows.length > 0 && placed.length > 0 && pending.length === 0

  const setMonths = (key, m) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, months: m } : l)))
  const dropLine = (key) => setLines((ls) => (ls.length > 1 ? ls.filter((l) => l.key !== key) : ls))
  const setVal = (key, k, v) => setExtra((x) => ({ ...x, [key]: { ...(x[key] || {}), [k]: v } }))

  function validateAll() {
    const next = {}
    for (const r of pending) {
      const e = validateOrderFields(r.p.orderFields, extra[r.key] || {})
      if (Object.keys(e).length) next[r.key] = e
    }
    setLineErrors(next)
    return Object.keys(next).length === 0
  }

  function toInfo() {
    if (validateAll()) setStep(3)
  }

  async function submit(e) {
    e.preventDefault()
    if (!validateAll()) return setStep(2)
    if (!accepted) return setLegalError('Devam etmek için sözleşmeleri onaylamanız gerekir.')
    setLegalError('')
    setBusy(true)
    const nextErrors = {}
    let failedFields = false
    for (const r of pending) {
      try {
        const data = await api.createOrder({ productSlug: r.p.slug, note, fields: extra[r.key] || {}, termMonths: r.terms.length ? r.mm : 1, legalAccepted: true })
        setResults((x) => ({ ...x, [r.key]: { orderNo: data.order.orderNo, productName: data.order.productName } }))
        completeCartKey(r.key)
      } catch (err) {
        setResults((x) => ({ ...x, [r.key]: { error: err.message } }))
        if (err.errors && Object.keys(err.errors).some((k) => k.startsWith('f_'))) { nextErrors[r.key] = err.errors; failedFields = true }
      }
    }
    setLineErrors(nextErrors)
    setBusy(false)
    if (failedFields) setStep(2)
  }

  // ───── sipariş tamamlandı ─────
  if (allDone) {
    return createPortal(
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-4" role="dialog" aria-modal="true" aria-label="Siparişiniz alındı">
        <div className="mx-auto my-8 w-full max-w-xl rounded-2xl border border-vx-line bg-vx-card p-6 sm:p-8">
          <div className="text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-emerald-400/40 bg-emerald-500/15 text-emerald-300"><Check className="h-8 w-8" /></span>
            <h2 className="mt-4 text-xl font-bold text-white">{placed.length > 1 ? `${placed.length} siparişiniz alındı` : 'Siparişiniz alındı'}</h2>
            <p className="mt-1.5 text-[13.5px] text-vx-muted">En geç 24 saat içinde {user.email} adresinden size dönüş yapacağız. Ödeme bu aşamada alınmadı; onaydan sonra ödeme bilgileri iletilir.</p>
          </div>
          <ul className="mt-6 divide-y divide-vx-line rounded-xl border border-vx-line bg-vx-surface">
            {placed.map((r) => (
              <li key={r.key} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0"><div className="truncate text-[14px] font-semibold text-white">{r.p.name}</div><div className="text-[12px] text-vx-muted">{r.terms.length ? termLabel(r.mm) : 'Tek seferlik'}</div></div>
                <div className="shrink-0 text-right"><div className="text-[11px] text-vx-muted">Sipariş no</div><div className="font-mono text-[13px] font-bold tracking-wider text-white">{r.result.orderNo}</div></div>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button size="sm" onClick={() => { onClose(); navigate(routes.orders) }}><Package className="h-4 w-4" /> Siparişlerime git</Button>
            {links && links.payment && <Button size="sm" href={links.payment} external>Ödeme bilgileri</Button>}
            <Button variant="secondary" size="sm" onClick={onClose}>Kapat</Button>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  const filled = (r) => (r.p.orderFields || []).map((d) => ({ d, v: (extra[r.key] || {})[d.key] })).filter((x) => x.v && typeof x.v === 'string' && x.d.label && !/token|secret|şifre/i.test(`${x.d.key}${x.d.label}`))

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="Sipariş" onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <div className="mx-auto my-2 w-full max-w-5xl rounded-2xl border border-vx-line bg-vx-card sm:my-6">
        <div className="flex items-center justify-between gap-4 border-b border-vx-line px-5 py-4 sm:px-7">
          <div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-vx-accent/20 text-vx-accent-soft"><Lock className="h-[18px] w-[18px]" /></span><div><div className="text-[16px] font-bold text-white">Güvenli Sipariş</div><div className="text-[12px] text-vx-muted">{rows.length} hizmet · {user.email}</div></div></div>
          <button onClick={onClose} disabled={busy} aria-label="Kapat" className="grid h-10 w-10 place-items-center rounded-xl border border-vx-line bg-vx-surface text-white hover:bg-vx-line"><X className="h-5 w-5" /></button>
        </div>

        <div className="border-b border-vx-line px-5 py-4 sm:px-7"><Stepper step={step} /></div>

        <div className="grid grid-cols-1 gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0">
            {step === 1 && (
              <ul className="space-y-4">
                {rows.map((r) => {
                  const cover = (r.p.images || [])[0]
                  return (
                    <li key={r.key} className={`rounded-2xl border p-4 ${r.ok ? 'border-vx-line bg-vx-surface/50' : 'border-amber-500/40 bg-amber-500/5'}`}>
                      <div className="flex gap-4">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-vx-line bg-vx-surface">
                          {cover ? <FitImage src={cover} alt={r.p.name} className="h-full w-full" /> : <span className="grid h-full w-full place-items-center bg-gradient-to-br from-vx-accent/30 to-vx-surface text-2xl font-black text-white/60">{(r.p.name || '?').slice(0, 1)}</span>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0"><div className="text-[11px] font-semibold uppercase tracking-wide text-vx-accent-soft">{r.p.subCategory}</div><h3 className="text-[16px] font-bold leading-snug text-white">{r.p.name}</h3></div>
                            {rows.length > 1 && <button onClick={() => dropLine(r.key)} aria-label={`${r.p.name} bu siparişten çıkar`} title="Bu siparişten çıkar (sepette kalır)" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-vx-muted hover:bg-rose-500/10 hover:text-rose-300"><Trash2 className="h-4 w-4" /></button>}
                          </div>
                          <div className="mt-1 inline-flex items-center gap-1.5 text-[12.5px] text-zinc-300"><Clock className="h-3.5 w-3.5 text-vx-accent-text" /> Tahmini teslim: {deliveryLabel(r.p)}</div>
                        </div>
                      </div>
                      {r.ok && r.terms.length > 0 && <div className="mt-4"><div className="mb-2 text-[12px] font-semibold text-vx-muted">Abonelik süresi</div><TermPicker product={r.p} value={r.mm} onChange={(m) => setMonths(r.key, m)} discounts={termDiscounts} /></div>}
                      {r.ok ? (
                        <div className="mt-4 flex items-end justify-between gap-4 border-t border-vx-line pt-3">
                          <div className="text-[12.5px] text-vx-muted">{r.terms.length ? `${termLabel(r.mm)} · aylık ${formatPrice(r.p.price)}` : 'Tek seferlik'}{r.termPct > 0 && <div className="font-semibold text-emerald-400">%{r.termPct} toplu ödeme indirimi</div>}{r.sale && <div className="font-semibold text-rose-300">%{r.sale.pct} kampanya indirimi</div>}</div>
                          <Money old={r.old} now={r.total} big />
                        </div>
                      ) : (
                        <div className="mt-4 flex items-start gap-2 border-t border-amber-500/30 pt-3 text-[12.5px] text-amber-200"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Bu hizmet şu an satışta değil. Siparişten çıkarın.</div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}

            {step === 2 && (
              <div className="space-y-5">
                {pending.map((r, i) => (
                  <section key={r.key} className="rounded-2xl border border-vx-line bg-vx-surface/50 p-4 sm:p-5">
                    <div className="mb-3 flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-vx-accent/20 text-[12px] font-bold text-vx-accent-soft">{i + 1}</span><h3 className="text-[15px] font-bold text-white">{r.p.name}</h3></div>
                    {r.result && r.result.error && <p role="alert" className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[12.5px] text-rose-300">{r.result.error}</p>}
                    {(r.p.orderFields || []).length > 0 ? (
                      <div className="grid grid-cols-1 gap-4"><OrderFields product={r.p} values={extra[r.key] || {}} onChange={(k, v) => setVal(r.key, k, v)} errors={lineErrors[r.key] || {}} /></div>
                    ) : (
                      <p className="text-[13px] text-vx-muted">Bu hizmet için sizden ek bilgi istenmiyor.</p>
                    )}
                  </section>
                ))}
                <Field label="Siparişe not (isteğe bağlı)"><textarea className={`${inputCls} h-24 resize-none py-3`} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} placeholder="Özel isteklerinizi veya sorularınızı yazabilirsiniz." /></Field>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={submit} noValidate className="space-y-5">
                {placed.length > 0 && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-200">{placed.map((r) => `${r.p.name}: ${r.result.orderNo}`).join(' · ')} alındı. Kalanlar için tekrar deneyin.</div>}
                <div className="divide-y divide-vx-line rounded-2xl border border-vx-line bg-vx-surface/50">
                  {pending.map((r) => (
                    <div key={r.key} className="px-4 py-3.5 sm:px-5">
                      <div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="text-[14px] font-semibold text-white">{r.p.name}</div><div className="text-[12px] text-vx-muted">{r.terms.length ? `${termLabel(r.mm)} · aylık ${formatPrice(r.p.price)}` : 'Tek seferlik'}</div></div><Money old={r.old} now={r.total} /></div>
                      {filled(r).length > 0 && <dl className="mt-2 grid gap-x-6 gap-y-0.5 text-[12px] sm:grid-cols-2">{filled(r).map(({ d, v }) => <div key={d.key} className="flex gap-1.5"><dt className="text-vx-muted">{d.label}:</dt><dd className="truncate text-zinc-200">{v}</dd></div>)}</dl>}
                      {r.result && r.result.error && <p role="alert" className="mt-2 text-[12.5px] text-rose-300">{r.result.error}</p>}
                    </div>
                  ))}
                  <div className="grid gap-x-6 gap-y-1 px-4 py-3.5 text-[13px] sm:grid-cols-2 sm:px-5"><div><span className="text-vx-muted">Sipariş sahibi: </span><span className="text-zinc-100">{user.name}</span></div><div className="min-w-0"><span className="text-vx-muted">E-posta: </span><span className="break-all text-zinc-100">{user.email}</span></div>{note.trim() && <div className="sm:col-span-2"><span className="text-vx-muted">Not: </span><span className="text-zinc-100">{note.length > 120 ? `${note.slice(0, 120)}…` : note}</span></div>}</div>
                </div>
                <button type="button" onClick={() => setStep(2)} className="text-[12.5px] font-semibold text-vx-accent-text hover:text-vx-accent-soft">Bilgileri düzenle</button>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-vx-line bg-vx-surface p-3.5">
                  <input type="checkbox" checked={accepted} onChange={(e) => { setAccepted(e.target.checked); setLegalError('') }} className="mt-1 h-4 w-4 shrink-0 accent-violet-500" />
                  <span className="text-[13px] leading-relaxed text-zinc-200">
                    <Link to={routes.distance} target="_blank" className="font-semibold text-vx-accent-text underline underline-offset-2">Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu</Link>’nu,{' '}
                    <Link to={routes.refund} target="_blank" className="font-semibold text-vx-accent-text underline underline-offset-2">İptal ve İade Koşulları</Link>’nı ve{' '}
                    <Link to={routes.kvkk} target="_blank" className="font-semibold text-vx-accent-text underline underline-offset-2">KVKK Aydınlatma Metni</Link>’ni okudum, onaylıyorum.
                  </span>
                </label>
                {legalError && <p role="alert" className="text-[12.5px] text-rose-400">{legalError}</p>}
                <TrustBadges compact />
                <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
              </form>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-vx-line pt-5">
              {step > 1 ? <Button variant="secondary" onClick={() => setStep(step - 1)} disabled={busy}><ArrowLeft className="h-4 w-4" /> Geri</Button> : <Button variant="secondary" onClick={onClose}>Vazgeç</Button>}
              {step === 1 && <Button onClick={() => setStep(2)} disabled={!pending.length}>Bilgilere Geç <ArrowRight className="h-4 w-4" /></Button>}
              {step === 2 && <Button onClick={toInfo} disabled={!pending.length}>Siparişi İncele <ArrowRight className="h-4 w-4" /></Button>}
              {step === 3 && <Button onClick={submit} disabled={busy || !pending.length} className="min-w-[210px]">{busy ? 'Siparişler gönderiliyor…' : `Siparişi Tamamla (${pending.length})`}</Button>}
            </div>
          </div>

          {/* sipariş özeti */}
          <aside className="h-fit rounded-2xl border border-vx-line bg-vx-surface p-5 lg:sticky lg:top-4">
            <h3 className="text-[15px] font-bold text-white">Sipariş Özeti</h3>
            <ul className="mt-3 space-y-2 border-b border-vx-line pb-3">
              {pending.map((r) => <li key={r.key} className="flex items-start justify-between gap-3 text-[12.5px]"><span className="min-w-0 text-zinc-200"><span className="line-clamp-1">{r.p.name}</span><span className="text-vx-muted">{r.terms.length ? termLabel(r.mm) : 'Tek seferlik'}</span></span><span className="shrink-0 tabular-nums text-zinc-100">{formatPrice(r.total)}</span></li>)}
            </ul>
            <div className="pt-2">
              <Sum k={`Ürünler (${pending.length})`} v={formatPrice(sumOld)} />
              {saving > 0 && <Sum k="Toplam indirim" v={`−${formatPrice(saving)}`} tone="text-emerald-400" />}
              <div className="mt-1 flex items-baseline justify-between border-t border-vx-line pt-3"><span className="text-[14px] font-semibold text-white">Ödenecek tutar</span><span className="text-[24px] font-black tabular-nums text-white">{formatPrice(sumTotal)}</span></div>
            </div>
            {saving > 0 && <div className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-center text-[12px] font-semibold text-emerald-300">{formatPrice(saving)} tasarruf ediyorsunuz</div>}
            <p className="mt-4 flex items-start gap-2 text-[11.5px] leading-snug text-vx-muted"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> Bu adımda ödeme alınmaz. İş başlamadan önce ücretsiz iptal edebilirsiniz.</p>
          </aside>
        </div>
      </div>
    </div>,
    document.body
  )
}
