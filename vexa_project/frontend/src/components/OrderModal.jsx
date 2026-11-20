import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Package } from 'lucide-react'
import Modal from './Modal.jsx'
import Button from './Button.jsx'
import Field, { inputCls } from './Field.jsx'
import TrustBadges from './TrustBadges.jsx'
import { useApp } from '../context/AppContext.jsx'
import { api } from '../lib/api.js'
import { useSite } from '../context/SiteContext.jsx'
import { formatPrice, deliveryLabel, discountInfo } from '../lib/format.js'
import OrderFields from './OrderFields.jsx'
import { validateOrderFields } from '../config/orderFields.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function OrderModal({ product, onClose }) {
  const { user } = useApp()
  const navigate = useNavigate()
  const siteConfig = useSite()
  const [form, setForm] = useState({ name: user ? user.name : '', email: user ? user.email : '', note: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(null)
  const [accepted, setAccepted] = useState(false)
  const [extra, setExtra] = useState({})

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Ad soyad girin.'
    if (!EMAIL.test(form.email.trim())) next.email = 'Geçerli bir e-posta adresi girin.'
    Object.assign(next, validateOrderFields(product.orderFields, extra))
    if (!accepted) next.legal = 'Devam etmek için sözleşmeyi onaylamanız gerekir.'
    setErrors(next)
    setServerError('')
    if (Object.keys(next).length) return

    setBusy(true)
    try {
      const data = await api.createOrder({ productSlug: product.slug, ...form, fields: extra, legalAccepted: true })
      setDone(data.order)
    } catch (err) {
      setErrors(err.errors || {})
      setServerError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <Modal title="Siparişiniz alındı" onClose={onClose}>
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-vx-accent">
            <Check className="w-5 h-5" />
          </span>
          <div>
            <div className="text-[13px] text-vx-muted">Sipariş numaranız</div>
            <div className="text-lg font-bold tracking-wide text-white">{done.orderNo}</div>
          </div>
        </div>
        <p className="mt-5 text-[14px] leading-relaxed text-zinc-200">
          {done.productName} siparişiniz bize ulaştı. En geç 24 saat içinde {form.email} adresinden sizinle iletişime geçeceğiz.
          Ödeme bu aşamada alınmadı; talebiniz onaylandıktan sonra ödeme bilgileri iletilir.
        </p>
        {!user && <p className="mt-3 text-[13px] text-vx-muted">Siparişlerinizi hesabınızdan adım adım takip etmek için bir sonraki siparişte giriş yaparak devam edin.</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          {user && (
            <Button
              size="sm"
              onClick={() => {
                onClose()
                navigate(siteConfig.routes.orders)
              }}
            >
              <Package className="w-4 h-4" /> Siparişlerime git
            </Button>
          )}
          {siteConfig.links.payment && (
            <Button size="sm" href={siteConfig.links.payment} external>
              Ödeme bilgileri
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Sipariş Ver" onClose={onClose} wide>
      <div className="rounded-xl bg-vx-surface border border-vx-line p-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-[15px] font-semibold text-white">{product.name}</div>
          <div className="text-[12px] text-vx-muted">Tahmini teslim: {deliveryLabel(product)}</div>
        </div>
        <div className="text-right">
          {discountInfo(product) && <div className="text-[13px] tabular-nums text-zinc-400/70 line-through decoration-rose-400/70 decoration-2">{formatPrice(product.oldPrice)}</div>}
          <div className="text-2xl font-black tabular-nums text-white">{formatPrice(product.price)}</div>
          <div className="text-[12px] text-vx-muted">{product.priceFrom ? 'başlangıç fiyatı' : product.period}</div>
        </div>
      </div>

      <form onSubmit={submit} noValidate className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Ad soyad" error={errors.name}>
          <input className={inputCls} value={form.name} onChange={set('name')} autoComplete="name" maxLength={80} />
        </Field>
        <Field label="E-posta" error={errors.email}>
          <input className={inputCls} type="email" value={form.email} onChange={set('email')} autoComplete="email" maxLength={254} />
        </Field>
        <OrderFields product={product} values={extra} onChange={(k, v) => setExtra((x) => ({ ...x, [k]: v }))} errors={errors} />
        <div className="sm:col-span-2">
          <Field label="Notunuz (isteğe bağlı)" error={errors.note}>
            <textarea
              className={`${inputCls} h-24 py-3 resize-none`}
              value={form.note}
              onChange={set('note')}
              maxLength={1000}
              placeholder="Özel isteklerinizi veya sorularınızı yazabilirsiniz."
            />
          </Field>
        </div>

        <div className="sm:col-span-2 space-y-2">
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
        <div className="sm:col-span-2">
          <TrustBadges compact />
        </div>

        {serverError && (
          <p role="alert" className="sm:col-span-2 text-[13px] text-rose-400">
            {serverError}
          </p>
        )}

        <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={busy} className="min-w-[180px]">
            {busy ? 'Gönderiliyor…' : 'Siparişi Gönder'}
          </Button>
          <span className="text-[12px] text-zinc-400">Bu adımda ödeme alınmaz.</span>
        </div>
      </form>
    </Modal>
  )
}
