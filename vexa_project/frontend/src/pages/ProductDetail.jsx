import { Link, useParams } from 'react-router-dom'
import { Check, ChevronRight, Clock, ShieldCheck, MessageSquare, ListChecks, Package } from 'lucide-react'
import Button from '../components/Button.jsx'
import Gallery from '../components/Gallery.jsx'
import PriceBlock from '../components/PriceBlock.jsx'
import ProductCard from '../components/ProductCard.jsx'
import NotFound from './NotFound.jsx'
import useProducts from '../hooks/useProducts.js'
import { useApp } from '../context/AppContext.jsx'
import { useSite } from '../context/SiteContext.jsx'
import { siteConfig } from '../config/siteConfig.js'
import { deliveryLabel, formatPrice } from '../lib/format.js'

const { routes } = siteConfig
const LABEL = { 'discord-bot': 'Discord Botu', web: 'Web Sitesi', server: 'Sunucu', software: 'Yazılım' }
const listFor = (p) => (p.category === 'web' ? [routes.web, 'Web Geliştirme'] : [routes.bots, 'Discord Botları'])

export default function ProductDetail() {
  const { slug } = useParams()
  const products = useProducts()
  const { openOrder } = useApp()
  const { guarantees } = useSite()
  const p = products.find((x) => x.slug === slug)
  if (!p) return <NotFound />

  const [listTo, listName] = listFor(p)
  const quote = p.price == null
  const paragraphs = (p.details || p.description || '').split(/\n{2,}/).map((s) => s.trim()).filter(Boolean)
  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 3)
  const images = p.images || []

  const order = () => openOrder(p)
  const cta = quote ? (
    <Button size="lg" to={`${routes.contact}?konu=${encodeURIComponent(p.name)}`} className="w-full">Teklif İste</Button>
  ) : (
    <Button size="lg" onClick={order} className="w-full">Sipariş Ver</Button>
  )

  return (
    <div className="space-y-12 pb-20 lg:pb-0">
      <nav aria-label="Sayfa yolu" className="flex flex-wrap items-center gap-1.5 text-[13px] text-vx-muted">
        <Link to={routes.home} className="hover:text-white">Ana Sayfa</Link><ChevronRight className="w-3.5 h-3.5" />
        <Link to={listTo} className="hover:text-white">{listName}</Link><ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-100">{p.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
        <div className="space-y-8 min-w-0">
          <header>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 h-7 inline-flex items-center rounded-md bg-vx-surface border border-vx-line text-[12px] font-medium text-vx-accent-soft">{LABEL[p.category] || 'Hizmet'}</span>
              {p.subCategory && <span className="px-2.5 h-7 inline-flex items-center rounded-md border border-vx-line text-[12px] text-vx-muted">{p.subCategory}</span>}
              {p.popular && <span className="px-2.5 h-7 inline-flex items-center rounded-md bg-vx-accent text-[12px] font-semibold text-white">En çok tercih edilen</span>}
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{p.name}</h1>
            {p.tagline && <p className="mt-3 text-[17px] leading-relaxed text-zinc-300">{p.tagline}</p>}
          </header>

          {images.length > 0 ? (
            <Gallery images={images} alt={p.name} aspect="aspect-[16/10]" className="rounded-2xl" />
          ) : (
            <div className="aspect-[16/8] rounded-2xl bg-gradient-to-br from-vx-accent/25 via-vx-surface to-vx-card grid place-items-center border border-vx-line">
              <Package className="w-16 h-16 text-vx-accent-text/70" strokeWidth={1.2} />
            </div>
          )}

          {paragraphs.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold tracking-tight text-white">Genel Bakış</h2>
              <div className="mt-3 space-y-4 text-[16px] leading-relaxed text-zinc-300">
                {paragraphs.map((t, i) => <p key={i} className="whitespace-pre-line">{t}</p>)}
              </div>
            </section>
          )}

          {(p.features || []).length > 0 && (
            <section>
              <h2 className="text-2xl font-bold tracking-tight text-white">Neler Dahil?</h2>
              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 p-4 rounded-xl bg-vx-card border border-vx-line text-[15px] text-zinc-100">
                    <Check className="w-5 h-5 mt-0.5 shrink-0 text-vx-accent-text" /> {f}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(p.requirements || []).length > 0 && (
            <section>
              <h2 className="text-2xl font-bold tracking-tight text-white">Teslim İçin Gerekenler</h2>
              <p className="mt-1 text-[14px] text-vx-muted">Sürecin hızlı ilerlemesi için sizden isteyeceğimiz bilgi ve materyaller.</p>
              <ul className="mt-4 space-y-2.5">
                {p.requirements.map((r) => (
                  <li key={r} className="flex items-start gap-3 text-[15px] text-zinc-200"><ListChecks className="w-5 h-5 mt-0.5 shrink-0 text-vx-accent-text" /> {r}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-2xl bg-vx-card border border-vx-line p-6">
            <h2 className="text-xl font-bold text-white">Satın alma güvencesi</h2>
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {guarantees.slice(0, 4).map((g) => (
                <li key={g.title} className="flex gap-3">
                  <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0 text-vx-accent-text" />
                  <div><div className="text-[15px] font-semibold text-white">{g.title}</div><div className="text-[13px] leading-relaxed text-vx-muted">{g.text}</div></div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[13px] text-vx-muted">Cayma hakkı ve iptal koşulları için <Link className="text-vx-accent-text hover:text-white underline underline-offset-2" to={routes.refund}>İptal ve İade Koşulları</Link> sayfasına bakın.</p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 rounded-2xl bg-vx-card border border-vx-line p-6 space-y-5 !bg-vx-card !backdrop-blur-none">
          <PriceBlock product={p} large />
          <div className="flex items-center gap-2 text-[14px] text-vx-muted"><Clock className="w-4 h-4 shrink-0" /> Teslim: <span className="text-zinc-100 font-medium">{deliveryLabel(p)}</span></div>
          <div className="space-y-3">
            {cta}
            <Button size="md" variant="secondary" className="w-full" to={`${routes.contact}?konu=${encodeURIComponent(p.name)}`}><MessageSquare className="w-4 h-4" /> Soru Sor</Button>
          </div>
          <ul className="pt-4 border-t border-vx-line space-y-2.5 text-[13px] text-zinc-300">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-vx-accent-text" /> Net fiyat, sipariş öncesi bilgilendirme</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-vx-accent-text" /> Teslim sonrası destek</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-vx-accent-text" /> Hesabınızdan sipariş takibi</li>
          </ul>
        </aside>
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-white">Benzer Paketler</h2>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">{related.map((r) => <ProductCard key={r.slug} product={r} />)}</div>
        </section>
      )}

      {/* phones: the price and the order button stay reachable while reading */}
      <div data-bottom-bar className="lg:hidden fixed inset-x-0 bottom-0 z-30 px-4 py-3 bg-vx-surface/95 backdrop-blur-xl border-t border-vx-line flex items-center gap-4" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
        <div className="min-w-0">
          <div className="text-[12px] text-vx-muted truncate">{p.name}</div>
          <div className="text-[20px] font-black tabular-nums text-white leading-tight">{quote ? 'Teklif alın' : formatPrice(p.price)}</div>
        </div>
        <div className="ml-auto shrink-0 w-[150px]">{quote ? <Button size="md" to={`${routes.contact}?konu=${encodeURIComponent(p.name)}`} className="w-full">Teklif İste</Button> : <Button size="md" onClick={order} className="w-full">Sipariş Ver</Button>}</div>
      </div>
    </div>
  )
}
