import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BadgeCheck, Check, ChevronRight, Clock, Headphones, ListChecks, MessageSquare, PackageCheck, RotateCcw, ShieldCheck, Tag, Truck } from 'lucide-react'
import Button from '../components/Button.jsx'
import ProductGallery from '../components/ProductGallery.jsx'
import PriceBlock from '../components/PriceBlock.jsx'
import ProductCard from '../components/ProductCard.jsx'
import StarBar from '../components/StarBar.jsx'
import Faq from '../components/Faq.jsx'
import NotFound from './NotFound.jsx'
import { useActiveAnnouncement } from '../components/AnnouncementBanner.jsx'
import useProducts from '../hooks/useProducts.js'
import { useProductReviews, useRatings, ratingOf } from '../hooks/useLive.js'
import ReviewForm from '../components/ReviewForm.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useSite } from '../context/SiteContext.jsx'
import { siteConfig } from '../config/siteConfig.js'
import { deliveryLabel, discountInfo, estimateDelivery, formatPrice, dateLabel } from '../lib/format.js'

const { routes } = siteConfig

const Panel = ({ id, title, children, className = '' }) => (
  <section id={id} className={`scroll-mt-40 rounded-2xl bg-vx-card border border-vx-line p-5 sm:p-7 ${className}`}>
    <h2 className="text-[22px] font-bold tracking-tight text-white">{title}</h2>
    <div className="mt-4">{children}</div>
  </section>
)

const TRUST = [
  { icon: ShieldCheck, title: 'Fiyat güvencesi', text: 'Onaylanan siparişte fiyat değişmez' },
  { icon: RotateCcw, title: 'Ücretsiz iptal', text: 'İş başlamadan önce tam iade' },
  { icon: Headphones, title: 'Teslim sonrası destek', text: 'Hata düzeltme dahil' },
  { icon: PackageCheck, title: 'Sipariş takibi', text: 'Hesabım → Siparişlerim' },
]

export default function ProductDetail() {
  const { slug } = useParams()
  const products = useProducts()
  const { openOrder } = useApp()
  const ratings = useRatings()
  const { reviews: mine, reload: reloadReviews } = useProductReviews(slug)
  const { categories } = useSite()
  const ann = useActiveAnnouncement()
  const p = products.find((x) => x.slug === slug)
  const [active, setActive] = useState('genel')

  const paragraphs = useMemo(() => (p ? (p.details || p.description || '').split(/\n{2,}/).map((s) => s.trim()).filter(Boolean) : []), [p])
  const rate = p ? ratingOf(ratings, p) : null
  const avg = rate ? rate.average : 0
  const total = rate ? rate.count : 0

  const tabs = useMemo(() => {
    if (!p) return []
    return [
      paragraphs.length && ['genel', 'Açıklama'],
      (p.features || []).length && ['ozellikler', 'Özellikler'],
      ['teknik', 'Teknik Özellikler'],
      ['teslimat', 'Teslimat ve İade'],
      ['yorumlar', `Değerlendirmeler${total ? ` (${total})` : ''}`],
      ['sss', 'Sık Sorulanlar'],
    ].filter(Boolean)
  }, [p, paragraphs.length, total])

  // highlight the tab of the section being read
  useEffect(() => {
    if (!p || typeof IntersectionObserver === 'undefined') return undefined
    const els = tabs.map(([id]) => document.getElementById(id)).filter(Boolean)
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-30% 0px -60% 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [p, tabs])

  if (!p) return <NotFound />

  const cat = categories.find((c) => c.id === p.category)
  const listTo = cat ? cat.path : routes.home
  const listName = cat ? cat.name : 'Ürünler'
  const quote = p.price == null
  const sale = discountInfo(p)
  const eta = estimateDelivery(p.delivery || (p.deliveryDays ? `${p.deliveryDays} iş günü` : ''))
  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 3)
  const topFeatures = (p.features || []).slice(0, 4)
  const specs = (p.specs || []).length
    ? p.specs
    : [
        { k: 'Hizmet türü', v: listName },
        ...(p.subCategory ? [{ k: 'Kategori', v: p.subCategory }] : []),
        ...(p.period ? [{ k: 'Ödeme türü', v: p.period }] : []),
        { k: 'Teslim süresi', v: deliveryLabel(p) },
        { k: 'Teslim sonrası destek', v: 'Dahil' },
        { k: 'Sipariş takibi', v: 'Hesabım → Siparişlerim' },
      ]
  const go = (id) => document.getElementById(id) && document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start' })
  const order = () => openOrder(p)
  const askTo = `${routes.contact}?konu=${encodeURIComponent(p.name)}`

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      <nav aria-label="Sayfa yolu" className="flex flex-wrap items-center gap-1.5 text-[13px] text-vx-muted">
        <Link to={routes.home} className="hover:text-white">Ana Sayfa</Link><ChevronRight className="w-3.5 h-3.5" />
        <Link to={listTo} className="hover:text-white">{listName}</Link><ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-100">{p.name}</span>
      </nav>

      {/* ───── above the fold: gallery on the left, everything needed to buy on the right ───── */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-6 items-stretch">
        <ProductGallery images={p.images || []} name={p.name} />

        <div className="flex flex-col gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 h-6 inline-flex items-center rounded-md bg-vx-surface border border-vx-line text-[11px] font-semibold uppercase tracking-wide text-vx-accent-soft">{listName}</span>
              {p.subCategory && <span className="text-[12px] text-vx-muted">{p.subCategory}</span>}
              {p.popular && <span className="px-2.5 h-6 inline-flex items-center rounded-md bg-vx-accent text-[11px] font-semibold text-white">En çok tercih edilen</span>}
            </div>
            <h1 className="mt-3 text-[28px] sm:text-[32px] font-extrabold leading-tight tracking-tight text-white">{p.name}</h1>
            {total > 0 ? (
              <button onClick={() => go('yorumlar')} className="mt-2 inline-flex items-center gap-2 text-[14px] text-vx-muted hover:text-white">
                <StarBar value={avg} className="w-4 h-4" /> <b className="text-white">{avg.toFixed(1)}</b> · {total} değerlendirme
              </button>
            ) : (
              <div className="mt-2 text-[13px] text-vx-muted">Bu ürün için henüz değerlendirme yok</div>
            )}
            {p.tagline && <p className="mt-3 text-[15px] leading-relaxed text-zinc-300">{p.tagline}</p>}
          </div>

          {topFeatures.length > 0 && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2">
              {topFeatures.map((f) => <li key={f} className="flex items-start gap-2 text-[14px] text-zinc-100"><Check className="w-4 h-4 mt-0.5 shrink-0 text-vx-accent-text" />{f}</li>)}
            </ul>
          )}

          {/* buy box */}
          <div className="mt-auto rounded-2xl bg-vx-card border border-vx-accent/40 p-5 shadow-[0_20px_50px_-30px_rgba(124,58,237,0.8)]">
            {sale && (
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-500/25 via-orange-500/10 to-transparent px-4 py-3">
                <span className="grid place-items-center w-10 h-10 shrink-0 rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/30"><Tag className="w-5 h-5" /></span>
                <div className="min-w-0 leading-snug">
                  <div className="text-[14px] font-bold text-white">Kampanyalı fiyat · %{sale.pct} indirim</div>
                  <div className="text-[13px] text-rose-100/90">Liste fiyatına göre <b className="text-white">{formatPrice(sale.old - p.price)}</b> daha uygun</div>
                </div>
              </div>
            )}
            <div>
              {p.priceFrom && !quote && <div className="text-[12px] font-bold uppercase tracking-wide text-vx-accent-soft">Başlangıç fiyatı</div>}
              <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-[42px] font-black leading-none tracking-tight tabular-nums text-white">{quote ? 'Teklif alın' : formatPrice(p.price)}</span>
                {sale && <span className="text-[19px] tabular-nums text-zinc-400/70 line-through decoration-rose-400/70 decoration-2">{formatPrice(sale.old)}</span>}
              </div>
              <div className="mt-1 text-[13px] text-vx-muted">{quote ? 'İhtiyacınıza göre özel fiyat' : p.period}</div>
            </div>

            <div className="mt-4 flex items-start gap-3 p-3 rounded-xl bg-vx-surface border border-vx-line">
              <Truck className="w-5 h-5 mt-0.5 shrink-0 text-vx-accent-text" />
              <div className="text-[13px] leading-snug">
                <div className="text-zinc-100"><b>Teslim süresi:</b> {deliveryLabel(p)}</div>
                {eta && <div className="text-vx-muted">Bugün sipariş verirseniz tahmini teslim: <b className="text-zinc-100">{eta}</b></div>}
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              {quote ? <Button size="lg" to={askTo} className="flex-1">Teklif İste</Button> : <Button size="lg" onClick={order} className="flex-1">Hemen Sipariş Ver</Button>}
              <Button size="lg" variant="secondary" to={askTo}><MessageSquare className="w-4 h-4" /> Soru Sor</Button>
            </div>

            <ul className="mt-4 grid grid-cols-2 gap-3">
              {TRUST.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-start gap-2.5">
                  <Icon className="w-5 h-5 mt-0.5 shrink-0 text-vx-accent-text" />
                  <div className="text-[12px] leading-snug"><div className="font-semibold text-white">{title}</div><div className="text-vx-muted">{text}</div></div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ───── section tabs ───── */}
      <div className={`sticky z-20 -mx-4 sm:mx-0 px-4 sm:px-0 bg-vx-bg/95 backdrop-blur-xl border-b border-vx-line ${ann ? 'top-[116px] md:top-[68px]' : 'top-[68px]'}`}>
        <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist">
          {tabs.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={active === id} onClick={() => go(id)} className={`shrink-0 h-12 px-4 text-[14px] font-semibold border-b-2 transition-colors ${active === id ? 'border-vx-accent-text text-white' : 'border-transparent text-vx-muted hover:text-white'}`}>{label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 max-w-5xl">
        {paragraphs.length > 0 && (
          <Panel id="genel" title="Ürün açıklaması">
            <div className="space-y-4 max-w-3xl text-[16px] leading-[1.75] text-zinc-200">
              {paragraphs.map((t, i) => <p key={i} className="whitespace-pre-line">{t}</p>)}
            </div>
          </Panel>
        )}

        {(p.features || []).length > 0 && (
          <Panel id="ozellikler" title="Öne çıkan özellikler">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-3 p-3.5 rounded-xl bg-vx-surface border border-vx-line text-[15px] text-zinc-100">
                  <span className="grid place-items-center w-6 h-6 shrink-0 rounded-full bg-vx-accent/20 text-vx-accent-soft"><Check className="w-3.5 h-3.5" strokeWidth={3} /></span>{f}
                </li>
              ))}
            </ul>
          </Panel>
        )}

        <Panel id="teknik" title="Teknik özellikler">
          <dl className="overflow-hidden rounded-xl border border-vx-line">
            {specs.map((s, i) => (
              <div key={`${s.k}${i}`} className={`grid grid-cols-[42%_1fr] sm:grid-cols-[34%_1fr] text-[14px] ${i % 2 ? 'bg-vx-card' : 'bg-vx-surface'}`}>
                <dt className="px-4 py-3 font-semibold text-zinc-200 border-r border-vx-line">{s.k}</dt>
                <dd className="px-4 py-3 text-zinc-100 break-words">{s.v}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel id="teslimat" title="Teslimat ve iade">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-vx-surface border border-vx-line"><Clock className="w-5 h-5 text-vx-accent-text" /><div className="mt-2 font-semibold text-white">Teslim süresi</div><p className="mt-1 text-[14px] leading-relaxed text-vx-muted">{deliveryLabel(p)}. Gerekli bilgiler bize ulaştığında süre işlemeye başlar.</p></div>
            <div className="p-4 rounded-xl bg-vx-surface border border-vx-line"><RotateCcw className="w-5 h-5 text-vx-accent-text" /><div className="mt-2 font-semibold text-white">İptal ve iade</div><p className="mt-1 text-[14px] leading-relaxed text-vx-muted">İş başlamadan önce iptalde tam iade. Ayrıntılar için <Link className="text-vx-accent-text underline underline-offset-2" to={routes.refund}>İptal ve İade Koşulları</Link>.</p></div>
            <div className="p-4 rounded-xl bg-vx-surface border border-vx-line"><Headphones className="w-5 h-5 text-vx-accent-text" /><div className="mt-2 font-semibold text-white">Destek</div><p className="mt-1 text-[14px] leading-relaxed text-vx-muted">Teslim sonrası hata düzeltme dahildir. Sorularınız için 7/24 destek talebi açabilirsiniz.</p></div>
          </div>
          {(p.requirements || []).length > 0 && (
            <div className="mt-5">
              <h3 className="text-[16px] font-semibold text-white">Teslim için sizden istenenler</h3>
              <ul className="mt-3 space-y-2">{p.requirements.map((r) => <li key={r} className="flex items-start gap-3 text-[15px] text-zinc-200"><ListChecks className="w-5 h-5 mt-0.5 shrink-0 text-vx-accent-text" />{r}</li>)}</ul>
            </div>
          )}
        </Panel>

        <Panel id="yorumlar" title="Müşteri değerlendirmeleri">
          {mine.length === 0 ? (
            <p className="text-[14px] text-vx-muted">Bu ürün için henüz değerlendirme yok.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
              <div className="text-center md:text-left">
                <div className="text-5xl font-black text-white">{avg.toFixed(1)}</div>
                <div className="mt-2 flex md:block justify-center"><StarBar value={avg} className="w-5 h-5" /></div>
                <div className="mt-1 text-[13px] text-vx-muted">{total} değerlendirme</div>
              </div>
              <ul className="space-y-3">
                {mine.slice(0, 6).map((r) => (
                  <li key={`${r.name}${r.createdAt}`} className="p-4 rounded-xl bg-vx-surface border border-vx-line">
                    <div className="flex flex-wrap items-center justify-between gap-2"><StarBar value={r.rating} className="w-4 h-4" /><span className="text-[12px] text-vx-muted">{dateLabel(r.createdAt)}</span></div>
                    <p className="mt-2 text-[15px] leading-relaxed text-zinc-100 break-words">{r.text}</p>
                    <div className="mt-2 flex items-center gap-3 text-[13px]"><b className="text-white">{r.name}</b>{r.verified && <span className="inline-flex items-center gap-1 text-[12px] text-vx-accent-soft"><BadgeCheck className="w-4 h-4" /> Doğrulanmış müşteri</span>}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <ReviewForm product={p} onDone={reloadReviews} />
        </Panel>

        {related.length > 0 && (
          <section id="benzer" className="scroll-mt-40">
            <h2 className="text-[22px] font-bold tracking-tight text-white">Benzer paketler</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">{related.map((r) => <ProductCard key={r.slug} product={r} />)}</div>
          </section>
        )}

        <div id="sss" className="scroll-mt-40"><Faq /></div>
      </div>

      <div data-bottom-bar className="lg:hidden fixed inset-x-0 bottom-0 z-30 px-4 py-3 bg-vx-surface/95 backdrop-blur-xl border-t border-vx-line flex items-center gap-4" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
        <div className="min-w-0">
          {sale && <div className="text-[12px] tabular-nums text-zinc-400/70 line-through decoration-rose-400/70">{formatPrice(sale.old)}</div>}
          <div className="text-[20px] font-black tabular-nums text-white leading-tight">{quote ? 'Teklif alın' : formatPrice(p.price)}</div>
        </div>
        <div className="ml-auto shrink-0 w-[160px]">{quote ? <Button size="md" to={askTo} className="w-full">Teklif İste</Button> : <Button size="md" onClick={order} className="w-full">Sipariş Ver</Button>}</div>
      </div>
    </div>
  )
}
