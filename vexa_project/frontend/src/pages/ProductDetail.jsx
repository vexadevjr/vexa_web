import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BadgeCheck, Check, ChevronRight, Clock, Headphones, ListChecks, MessageSquare, PackageCheck, RotateCcw, ShieldCheck, Tag, Truck, ShoppingCart, Info } from 'lucide-react'
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
import TermPicker from '../components/TermPicker.jsx'
import { deliveryLabel, discountInfo, estimateDelivery, formatPrice, dateLabel, termLabel, termsOf, totalFor, discountedTotalFor } from '../lib/format.js'

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
  const { addToCart, cart, openCart } = useApp()
  const ratings = useRatings()
  const { reviews: mine, reload: reloadReviews } = useProductReviews(slug)
  const { categories, termDiscounts = {} } = useSite()
  const ann = useActiveAnnouncement()
  const p = products.find((x) => x.slug === slug)
  const [active, setActive] = useState('genel')
  const [months, setMonths] = useState(null)

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
  const terms = termsOf(p)
  const m = terms.includes(months) ? months : terms[0] || 1
  const grand = quote ? null : (terms.length ? discountedTotalFor(p.price, m, termDiscounts) : totalFor(p.price, m))
  const termPctNow = terms.length ? Number(termDiscounts[m]) || 0 : 0
  const oldTotal = sale ? totalFor(sale.old, m) : (termPctNow > 0 ? totalFor(p.price, m) : null)
  const saving = sale ? totalFor(sale.old - p.price, terms.length ? m : 1) : 0
  const eta = estimateDelivery(p.delivery || (p.deliveryDays ? `${p.deliveryDays} iş günü` : ''))
  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 3)
  const topFeatures = (p.features || []).slice(0, 4)
  const specs = (p.specs || []).length
    ? p.specs
    : [
        { k: 'Hizmet türü', v: listName },
        ...(p.subCategory ? [{ k: 'Kategori', v: p.subCategory }] : []),
        ...(terms.length ? [{ k: 'Ödeme türü', v: 'Aylık abonelik (1, 3, 6 veya 12 ay)' }] : p.period ? [{ k: 'Ödeme türü', v: p.period }] : []),
        { k: 'Teslim süresi', v: deliveryLabel(p) },
        { k: 'Teslim sonrası destek', v: 'Dahil' },
        { k: 'Sipariş takibi', v: 'Hesabım → Siparişlerim' },
      ]
  const go = (id) => document.getElementById(id) && document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start' })
  const addProductToCart = () => addToCart(p, terms.length ? m : null)
  const inCart = cart.some((i) => i.key === `${p.slug}:${terms.length ? m : 'once'}`)
  const askTo = `${routes.contact}?konu=${encodeURIComponent(p.name)}`

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      <nav aria-label="Sayfa yolu" className="flex flex-wrap items-center gap-1.5 text-[13px] text-vx-muted">
        <Link to={routes.home} className="hover:text-white">Ana Sayfa</Link><ChevronRight className="w-3.5 h-3.5" />
        <Link to={listTo} className="hover:text-white">{listName}</Link><ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-100">{p.name}</span>
      </nav>

      {/* ───── above the fold: gallery on the left, everything needed to buy on the right ───── */}
      <div className="product-detail-top grid grid-cols-1 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] gap-5 items-stretch">
        <ProductGallery images={p.images || []} name={p.name} />

        <div className="product-detail-summary flex flex-col min-w-0 h-full">
          <div className="product-detail-heading">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 h-6 inline-flex items-center rounded-md bg-vx-surface border border-vx-line text-[11px] font-semibold uppercase tracking-wide text-vx-accent-soft">{listName}</span>
              {p.subCategory && <span className="text-[12px] text-vx-muted">{p.subCategory}</span>}
              {p.popular && <span className="px-2.5 h-6 inline-flex items-center rounded-md bg-vx-accent text-[11px] font-semibold text-white">En çok tercih edilen</span>}
            </div>
            <h1 className="mt-2 text-[25px] sm:text-[27px] font-extrabold leading-tight tracking-tight text-white">{p.name}</h1>
            {total > 0 ? (
              <button onClick={() => go('yorumlar')} className="mt-2 inline-flex items-center gap-2 text-[14px] text-vx-muted hover:text-white">
                <StarBar value={avg} className="w-4 h-4" /> <b className="text-white">{avg.toFixed(1)}</b> · {total} değerlendirme
              </button>
            ) : (
              <div className="mt-1.5 text-[12px] text-vx-muted">Bu ürün için henüz değerlendirme yok</div>
            )}
            {p.tagline && <p className="mt-2 text-[14px] leading-snug text-zinc-300">{p.tagline}</p>}
          </div>

          {topFeatures.length > 0 && (
            <ul className="product-detail-top-features grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
              {topFeatures.map((f) => <li key={f} className="flex items-start gap-2 text-[13px] leading-snug text-zinc-100"><Check className="w-4 h-4 mt-0.5 shrink-0 text-vx-accent-text" />{f}</li>)}
            </ul>
          )}

          {/* buy box */}
          <div className="product-detail-buybox mt-auto rounded-2xl bg-vx-card border border-vx-accent/30 p-3 sm:p-3.5">
            {sale && (
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
                <span className="grid place-items-center w-9 h-9 shrink-0 rounded-full bg-rose-500/90 text-white"><Tag className="w-4 h-4" /></span>
                <div className="min-w-0 leading-snug">
                  <div className="text-[14px] font-semibold text-white">%{sale.pct} indirim</div>
                  <div className="text-[13px] text-zinc-300">{terms.length ? `${termLabel(m)} abonelikte` : 'Liste fiyatına göre'} <b className="text-white">{formatPrice(saving)}</b> tasarruf</div>
                </div>
              </div>
            )}
            {quote ? (
              <div>
                <div className="text-[34px] font-black leading-none tracking-tight text-white">Teklif alın</div>
                <div className="mt-1 text-[13px] text-vx-muted">İhtiyacınıza göre özel fiyat</div>
              </div>
            ) : terms.length ? (
              <>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-vx-muted">Abonelik süresi</div>
                <div className="mt-1.5"><TermPicker product={p} value={m} onChange={setMonths} discounts={termDiscounts} /></div>
                <dl className="product-detail-price-table mt-2 rounded-xl border border-vx-line bg-vx-surface divide-y divide-vx-line text-[12px] sm:text-[13px]">
                  <div className="flex items-baseline justify-between gap-4 px-3 py-2"><dt className="text-vx-muted">{p.priceFrom ? 'Aylık fiyat (başlangıç)' : 'Aylık fiyat'}</dt><dd className="tabular-nums font-semibold text-white">{sale && <span className="mr-2 text-[13px] font-normal text-zinc-500 line-through">{formatPrice(sale.old)}</span>}{formatPrice(p.price)}</dd></div>
                  <div className="flex items-baseline justify-between gap-4 px-3 py-2"><dt className="text-vx-muted">Süre</dt><dd className="font-semibold text-white">{termLabel(m)}</dd></div>
                  {(Number(termDiscounts[m]) || 0) > 0 && <div className="flex items-baseline justify-between gap-4 px-3 py-2"><dt className="text-vx-muted">Toplu ödeme indirimi (%{termDiscounts[m]})</dt><dd className="font-semibold text-emerald-400"><span className="mr-2 text-[12px] font-normal text-zinc-500 line-through decoration-rose-400/70">{formatPrice(totalFor(p.price, m))}</span>−{formatPrice(totalFor(p.price, m) - grand)}</dd></div>}
                  <div className="flex items-baseline justify-between gap-4 px-3 py-2"><dt className="font-semibold text-zinc-200">Toplam</dt><dd className="tabular-nums text-white"><span className="text-[20px] sm:text-[21px] font-black leading-none">{formatPrice(grand)}</span>{oldTotal > grand && <span className="ml-2 text-[14px] text-zinc-500 line-through decoration-rose-400/70">{formatPrice(oldTotal)}</span>}</dd></div>
                </dl>
              </>
            ) : (
              <div>
                {p.priceFrom && <div className="text-[12px] font-bold uppercase tracking-wide text-vx-accent-soft">Başlangıç fiyatı</div>}
                <div className="mt-1 flex flex-wrap items-baseline gap-x-3">
                  <span className="text-[38px] font-black leading-none tracking-tight tabular-nums text-white">{formatPrice(p.price)}</span>
                  {sale && <span className="text-[18px] tabular-nums text-zinc-500 line-through">{formatPrice(sale.old)}</span>}
                </div>
                <div className="mt-1 text-[13px] text-vx-muted">{p.period}</div>
              </div>
            )}

            <div className="product-detail-delivery mt-2 flex items-start gap-2 p-2 rounded-xl bg-vx-surface border border-vx-line">
              <Truck className="w-4 h-4 mt-0.5 shrink-0 text-vx-accent-text" />
              <div className="text-[12px] leading-snug">
                <div className="text-zinc-100"><b>Teslim süresi:</b> {deliveryLabel(p)}</div>
                {eta && <div className="text-vx-muted">Bugün sipariş verirseniz tahmini teslim: <b className="text-zinc-100">{eta}</b></div>}
              </div>
            </div>

            <div className="product-detail-actions mt-2 flex flex-col sm:flex-row gap-2">
              {quote ? <Button size="lg" to={askTo} className="product-detail-action flex-1">Teklif İste</Button> : (inCart ? <Button size="lg" variant="secondary" onClick={openCart} className="product-detail-action flex-1"><Check className="w-4 h-4 text-emerald-400" /> Sepette · Sepete Git</Button> : <Button size="lg" onClick={addProductToCart} className="product-detail-action flex-1"><ShoppingCart className="w-4 h-4" /> Sepete Ekle</Button>)}
              <Button size="lg" variant="secondary" to={askTo} className="product-detail-action"><Info className="w-4 h-4" /> Ürün Hakkında Bilgi Al</Button>
            </div>

          </div>
        </div>
      </div>

      <ul className="product-detail-trust grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-5 gap-y-3 rounded-xl border border-vx-line bg-vx-card/70 px-4 py-3">
        {TRUST.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-2.5 min-w-0">
            <Icon className="w-4 h-4 mt-0.5 shrink-0 text-vx-accent-text" />
            <div className="text-[12px] leading-snug"><div className="font-semibold text-white">{title}</div><div className="text-vx-muted">{text}</div></div>
          </li>
        ))}
      </ul>

      {/* ───── section tabs ───── */}
      <div className={`sticky z-20 -mx-4 sm:mx-0 px-4 sm:px-0 bg-vx-bg/95 backdrop-blur-xl border-b border-vx-line ${ann ? 'top-[130px] md:top-[68px]' : 'top-[68px]'}`}>
        <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist">
          {tabs.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={active === id} onClick={() => go(id)} className={`shrink-0 h-12 px-4 text-[14px] font-semibold border-b-2 transition-colors ${active === id ? 'border-vx-accent-text text-white' : 'border-transparent text-vx-muted hover:text-white'}`}>{label}</button>
          ))}
        </div>
      </div>

      <div className="product-detail-sections grid grid-cols-1 gap-5 w-full max-w-none">
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
          {!quote && oldTotal > (terms.length ? grand : p.price) && <div className="text-[12px] tabular-nums text-zinc-500 line-through">{formatPrice(terms.length ? oldTotal : sale.old)}</div>}
          <div className="text-[20px] font-black tabular-nums text-white leading-tight">{quote ? 'Teklif alın' : formatPrice(terms.length ? grand : p.price)}</div>
          {!quote && terms.length > 0 && <div className="text-[11.5px] text-vx-muted">{termLabel(m)} toplam</div>}
        </div>
        <div className="ml-auto shrink-0 w-[160px]">{quote ? <Button size="md" to={askTo} className="w-full">Teklif İste</Button> : <Button size="md" onClick={inCart ? openCart : addProductToCart} className="w-full">{inCart ? 'Sepete Git' : 'Sepete Ekle'}</Button>}</div>
      </div>
    </div>
  )
}
