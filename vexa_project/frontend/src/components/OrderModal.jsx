import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Clock, Package, ShieldCheck } from 'lucide-react'
import Modal from './Modal.jsx'
import Button from './Button.jsx'
import Field, { inputCls } from './Field.jsx'
import FitImage from './FitImage.jsx'
import TrustBadges from './TrustBadges.jsx'
import { useApp } from '../context/AppContext.jsx'
import { api } from '../lib/api.js'
import { useSite } from '../context/SiteContext.jsx'
import TermPicker from './TermPicker.jsx'
import { formatPrice, deliveryLabel, discountInfo, termLabel, termsOf, totalFor } from '../lib/format.js'
import OrderFields from './OrderFields.jsx'
import { validateOrderFields } from '../config/orderFields.js'

const STEPS = ['Paket', 'Bilgiler', 'Onay']

function Stepper({ step }) {
  return (
    <ol className="mb-6 flex items-center" aria-label="Sipariş adımları">
      {STEPS.map((label, i) => {
        const n = i + 1
        const done = step > n
        const cur = step === n
        return (
          <li key={label} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`} aria-current={cur ? 'step' : undefined}>
            <span className={`grid place-items-center w-8 h-8 rounded-full text-[13px] font-bold border transition-colors ${done ? 'bg-vx-accent border-vx-accent text-white' : cur ? 'border-vx-accent-text text-white bg-vx-accent/20' : 'border-vx-line text-vx-muted'}`}>
              {done ? <Check className="w-4 h-4" /> : n}
            </span>
            <span className={`ml-2 text-[13px] font-semibold ${cur ? 'text-white' : 'text-vx-muted'}`}>{label}</span>
            {i < STEPS.length - 1 && <span className={`mx-3 h-px flex-1 ${done ? 'bg-vx-accent' : 'bg-vx-line'}`} />}
          </li>
        )
      })}
    </ol>
  )
}

function Row({ k, v, strong }) {
  return (
    <div className={`flex items-start justify-between gap-4 py-2.5 ${strong ? '' : 'border-b border-vx-line/70'}`}>
      <span className="text-[13px] text-vx-muted">{k}</span>
      <span className={`text-right break-words min-w-0 ${strong ? 'text-xl font-black text-white tabular-nums' : 'text-[14px] text-zinc-100'}`}>{v}</span>
    </div>
  )
}

export default function OrderModal({ product, onClose }) {
  const { user } = useApp()
  const navigate = useNavigate()
  const siteConfig = useSite()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ note: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(null)
  const [accepted, setAccepted] = useState(false)
  const [extra, setExtra] = useState({})
  const terms = termsOf(product)
  const [months, setMonths] = useState(() => (product._term && terms.includes(product._term) ? product._term : terms[0] || 1))
  if (!user) return null
  const sale = discountInfo(product)
  const mm = terms.length ? months : 1
  const total = totalFor(product.price, mm)
  const cover = (product.images || [])[0]

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  function validateInfo() {
    const next = {}
    Object.assign(next, validateOrderFields(product.orderFields, extra))
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function goInfoNext() {
    setServerError('')
    if (validateInfo()) setStep(3)
  }

  async function submit(e) {
    e.preventDefault()
    if (!validateInfo()) return setStep(2)
    if (!accepted) return setErrors((x) => ({ ...x, legal: 'Devam etmek için sözleşmeyi onaylamanız gerekir.' }))
    setBusy(true)
    setServerError('')
    try {
      const data = await api.createOrder({ productSlug: product.slug, note: form.note, fields: extra, termMonths: terms.length ? months : 1, legalAccepted: true })
      setDone(data.order)
    } catch (err) {
      setErrors(err.errors || {})
      setServerError(err.message)
      if (err.errors && Object.keys(err.errors).some((k) => k !== 'legal')) setStep(2)
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <Modal title="Siparişiniz alındı" onClose={onClose}>
        <div className="text-center">
          <span className="mx-auto grid place-items-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300"><Check className="w-8 h-8" /></span>
          <h3 className="mt-4 text-xl font-bold text-white">Teşekkürler!</h3>
          <div className="mt-4 inline-block rounded-xl bg-vx-surface border border-vx-line px-5 py-3">
            <div className="text-[12px] text-vx-muted">Sipariş numaranız</div>
            <div className="text-lg font-bold tracking-widest text-white">{done.orderNo}</div>
          </div>
        </div>
        <p className="mt-5 text-[14px] leading-relaxed text-zinc-200">
          {done.productName} siparişiniz alındı. En geç 24 saat içinde {user.email} adresinden sizinle iletişime geçeceğiz. Ödeme bu aşamada alınmadı; sipariş onaylandıktan sonra ödeme bilgileri iletilir.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button size="sm" onClick={() => { onClose(); navigate(siteConfig.routes.orders) }}><Package className="w-4 h-4" /> Siparişlerime git</Button>
          {siteConfig.links.payment && <Button size="sm" href={siteConfig.links.payment} external>Ödeme bilgileri</Button>}
          <Button variant="secondary" size="sm" onClick={onClose}>Kapat</Button>
        </div>
      </Modal>
    )
  }

  const filled = (product.orderFields || []).map((d) => ({ d, v: extra[d.key] })).filter((x) => x.v && typeof x.v === 'string' && x.d.label && !/token|secret|şifre/i.test(`${x.d.key}${x.d.label}`))

  return (
    <Modal title="Sipariş Ver" onClose={onClose} wide>
      <Stepper step={step} />

      {step === 1 && (
        <div>
          <div className="flex gap-4 items-stretch">
            {cover && <FitImage src={cover} alt={product.name} className="hidden sm:block w-40 shrink-0 rounded-xl aspect-square" />}
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-vx-accent-soft">{product.subCategory}</div>
              <h3 className="text-lg font-bold text-white leading-snug">{product.name}</h3>
              {product.tagline && <p className="mt-1 text-[13px] text-vx-muted">{product.tagline}</p>}
              <div className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-zinc-200"><Clock className="w-4 h-4 text-vx-accent-text" /> Tahmini teslim: {deliveryLabel(product)}</div>
            </div>
          </div>
          <div className="mt-5 rounded-xl bg-vx-surface border border-vx-line px-4">
            {terms.length > 0 && <div className="py-3 border-b border-vx-line/70"><div className="mb-2 text-[13px] text-vx-muted">Abonelik süresi</div><TermPicker product={product} value={months} onChange={setMonths} /></div>}
            {sale && <Row k="Aylık liste fiyatı" v={<span className="line-through text-zinc-500">{formatPrice(sale.old)}</span>} />}
            {sale && <Row k={`İndirim (%${sale.pct})`} v={<span className="text-emerald-400">−{formatPrice(totalFor(sale.old - product.price, mm))}</span>} />}
            {terms.length > 0 && <Row k="Aylık fiyat" v={formatPrice(product.price)} />}
            {terms.length > 0 && <Row k="Süre" v={termLabel(months)} />}
            <Row k={terms.length ? 'Toplam' : product.priceFrom ? 'Başlangıç fiyatı' : 'Ödenecek tutar'} v={formatPrice(total)} strong />
          </div>
          <div className="mt-6 flex justify-end"><Button onClick={() => setStep(2)}>Devam Et <ArrowRight className="w-4 h-4" /></Button></div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <OrderFields product={product} values={extra} onChange={(k, v) => setExtra((x) => ({ ...x, [k]: v }))} errors={errors} />
          <div className="sm:col-span-2">
            <Field label="Notunuz (isteğe bağlı)" error={errors.note}>
              <textarea className={`${inputCls} h-24 py-3 resize-none`} value={form.note} onChange={set('note')} maxLength={1000} placeholder="Özel isteklerinizi veya sorularınızı yazabilirsiniz." />
            </Field>
          </div>
          {serverError && <p role="alert" className="sm:col-span-2 text-[13px] text-rose-400">{serverError}</p>}
          <div className="sm:col-span-2 flex justify-between gap-3">
            <Button variant="secondary" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4" /> Geri</Button>
            <Button onClick={goInfoNext}>İncele <ArrowRight className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={submit} noValidate>
          <div className="rounded-xl bg-vx-surface border border-vx-line px-4">
            <Row k="Paket" v={product.name} />
            <Row k="Sipariş sahibi" v={user.name} />
            <Row k="E-posta" v={user.email} />
            {filled.map(({ d, v }) => <Row key={d.key} k={d.label} v={v.length > 60 ? `${v.slice(0, 60)}…` : v} />)}
            {form.note.trim() && <Row k="Not" v={form.note.length > 80 ? `${form.note.slice(0, 80)}…` : form.note} />}
            {terms.length > 0 && <Row k="Süre" v={`${termLabel(months)} (aylık ${formatPrice(product.price)})`} />}
            <Row k="Toplam" v={formatPrice(total)} strong />
          </div>
          <button type="button" onClick={() => setStep(2)} className="mt-2 text-[12.5px] font-semibold text-vx-accent-text hover:text-vx-accent-soft">Bilgileri düzenle</button>

          <div className="mt-4 space-y-2">
            <label className="flex items-start gap-3 p-3 rounded-xl bg-vx-surface border border-vx-line cursor-pointer">
              <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 w-4 h-4 shrink-0 accent-violet-500" />
              <span className="text-[13px] leading-relaxed text-zinc-200">
                <Link to={siteConfig.routes.distance} target="_blank" className="font-semibold text-vx-accent-text underline underline-offset-2">Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu</Link>’nu,{' '}
                <Link to={siteConfig.routes.refund} target="_blank" className="font-semibold text-vx-accent-text underline underline-offset-2">İptal ve İade Koşulları</Link>’nı ve{' '}
                <Link to={siteConfig.routes.kvkk} target="_blank" className="font-semibold text-vx-accent-text underline underline-offset-2">KVKK Aydınlatma Metni</Link>’ni okudum, onaylıyorum.
              </span>
            </label>
            {errors.legal && <p role="alert" className="text-[12px] text-rose-400">{errors.legal}</p>}
          </div>
          <div className="mt-4"><TrustBadges compact /></div>
          {serverError && <p role="alert" className="mt-3 text-[13px] text-rose-400">{serverError}</p>}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Button variant="secondary" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4" /> Geri</Button>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[12px] text-zinc-400"><ShieldCheck className="w-4 h-4" /> Bu adımda ödeme alınmaz.</span>
              <Button type="submit" disabled={busy} className="min-w-[170px]">{busy ? 'Gönderiliyor…' : 'Siparişi Tamamla'}</Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  )
}
