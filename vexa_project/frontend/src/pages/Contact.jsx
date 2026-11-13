import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Mail, Clock, MapPin, Check } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import { siteConfig as seoConfig } from '../config/siteConfig.js'
import Field, { inputCls } from '../components/Field.jsx'
import Button from '../components/Button.jsx'
import Faq from '../components/Faq.jsx'
import TrustBadges from '../components/TrustBadges.jsx'
import { useApp } from '../context/AppContext.jsx'
import { api } from '../lib/api.js'
import { useSite } from '../context/SiteContext.jsx'
import TicketLookup from '../components/TicketLookup.jsx'

const SUBJECTS = ['Sipariş Hakkında', 'Teknik Destek', 'Fiyat Teklifi', 'Diğer']
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// remount the form when the ?konu= topic changes (e.g. coming from different service cards)
export default function Contact() {
  const [params] = useSearchParams()
  const topic = (params.get('konu') || '').slice(0, 80)
  return <ContactPage key={topic} topic={topic} />
}

function ContactPage({ topic }) {
  const { user } = useApp()
  const siteConfig = useSite()

  const [form, setForm] = useState({
    name: user ? user.name : '',
    email: user ? user.email : '',
    subject: topic ? 'Fiyat Teklifi' : SUBJECTS[0],
    orderNo: '',
    message: topic ? `${topic} hakkında teklif almak istiyorum.` : '',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)
  const [ticket, setTicket] = useState('')

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Ad soyad girin.'
    if (!EMAIL.test(form.email.trim())) next.email = 'Geçerli bir e-posta adresi girin.'
    if (form.message.trim().length < 10) next.message = 'Mesajınız en az 10 karakter olmalıdır.'
    setErrors(next)
    setServerError('')
    if (Object.keys(next).length) return

    setBusy(true)
    try {
      const data = await api.contact(form)
      setTicket(data.ticketNo)
    } catch (err) {
      setErrors(err.errors || {})
      setServerError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-10">
      <PageHeader title={seoConfig.seo.pages[seoConfig.routes.contact].h1} description="Sipariş, teknik destek veya teklif talepleriniz için formu doldurun. Talebiniz bir destek kaydı olarak oluşturulur." />

      <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6 items-start">
        <div className="p-6 sm:p-8 rounded-2xl bg-vx-card border border-vx-line">
          {ticket ? (
            <div>
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-vx-accent">
                <Check className="w-5 h-5" />
              </span>
              <h2 className="mt-4 text-xl font-semibold text-white">Mesajınız alındı</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-vx-muted">
                Destek kayıt numaranız: <strong className="text-white">{ticket}</strong>. En geç 24 saat içinde {form.email} adresinden dönüş yapacağız.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Ad soyad" error={errors.name}>
                <input className={inputCls} value={form.name} onChange={set('name')} autoComplete="name" maxLength={80} />
              </Field>
              <Field label="E-posta" error={errors.email}>
                <input className={inputCls} type="email" value={form.email} onChange={set('email')} autoComplete="email" maxLength={254} />
              </Field>
              <Field label="Konu" error={errors.subject}>
                <select className={inputCls} value={form.subject} onChange={set('subject')}>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Sipariş numarası (varsa)" error={errors.orderNo}>
                <input className={inputCls} value={form.orderNo} onChange={set('orderNo')} maxLength={30} placeholder="VX-..." />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Mesajınız" error={errors.message}>
                  <textarea className={`${inputCls} h-36 py-3 resize-none`} value={form.message} onChange={set('message')} maxLength={3000} />
                </Field>
              </div>

              {serverError && (
                <p role="alert" className="sm:col-span-2 text-[13px] text-rose-400">
                  {serverError}
                </p>
              )}

              <div className="sm:col-span-2">
                <Button type="submit" disabled={busy} className="min-w-[180px]">
                  {busy ? 'Gönderiliyor…' : 'Gönder'}
                </Button>
              </div>
            </form>
          )}
        </div>

        <aside className="space-y-5">
          <div className="p-6 rounded-2xl bg-vx-card border border-vx-line space-y-5">
            <h2 className="text-lg font-semibold text-white">İletişim Bilgileri</h2>
            <div className="flex gap-3 text-[14px] text-slate-200">
              <Mail className="w-5 h-5 shrink-0 text-vx-accent-text" />
              <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-white break-all">
                {siteConfig.contact.email}
              </a>
            </div>
            <div className="flex gap-3 text-[14px] text-slate-200">
              <Clock className="w-5 h-5 shrink-0 text-vx-accent-text" />
              <span>{siteConfig.contact.hours}</span>
            </div>
            <div className="flex gap-3 text-[14px] text-slate-200">
              <MapPin className="w-5 h-5 shrink-0 text-vx-accent-text" />
              <span>{siteConfig.contact.location}</span>
            </div>
            <Button variant="secondary" size="sm" href={siteConfig.links.support} external>
              Discord destek kanalı
            </Button>
          </div>
          <TrustBadges compact />
        </aside>
      </section>

      {!user && <TicketLookup />}

      <Faq />
    </div>
  )
}
