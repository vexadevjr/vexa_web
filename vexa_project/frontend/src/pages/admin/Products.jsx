import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Copy, ExternalLink } from 'lucide-react'
import { admin } from '../../lib/adminApi.js'
import Modal from '../../components/Modal.jsx'
import { Card, Btn, Badge, Empty, TextField, AreaField, SelectField, CheckField, ImageUploader, useAdmin, useLoad, useToast, confirmDo } from './ui.jsx'

const CATEGORY = { 'discord-bot': 'Discord Botu', web: 'Web Geliştirme', server: 'Sunucu', software: 'Yazılım' }
const catOptions = Object.entries(CATEGORY)

const BLANK = { slug: '', category: 'discord-bot', subCategory: '', name: '', tagline: '', description: '', features: '', tags: '', price: '', oldPrice: '', priceFrom: false, period: 'tek seferlik', delivery: '', images: [], details: '', requirements: '', specs: '', metaTitle: '', metaDescription: '', popular: false, active: true }

const toForm = (p) => ({
  ...BLANK,
  ...p,
  price: p.price == null ? '' : String(p.price),
  oldPrice: p.oldPrice == null ? '' : String(p.oldPrice),
  delivery: p.delivery || (p.deliveryDays ? `${p.deliveryDays} iş günü` : ''),
  images: p.images || [],
  details: p.details || '',
  specs: (p.specs || []).map((r) => `${r.k}: ${r.v}`).join('\n'),
  requirements: (p.requirements || []).join('\n'),
  metaTitle: p.metaTitle || '',
  metaDescription: p.metaDescription || '',
  features: (p.features || []).join('\n'),
  tags: (p.tags || []).join(', '),
})

function toPayload(f, creating) {
  const lines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean)
  const body = {
    category: f.category,
    subCategory: f.subCategory,
    name: f.name,
    tagline: f.tagline,
    description: f.description,
    features: lines(f.features),
    tags: f.tags.split(',').map((x) => x.trim()).filter(Boolean),
    price: f.price === '' ? null : Number(f.price),
    priceFrom: f.priceFrom,
    period: f.period,
    oldPrice: f.oldPrice === '' ? null : Number(f.oldPrice),
    delivery: f.delivery,
    deliveryDays: null,
    images: f.images,
    slug: f.slug,
    details: f.details,
    specs: lines(f.specs).map((l) => { const i = l.indexOf(':'); return i > 0 ? { k: l.slice(0, i).trim(), v: l.slice(i + 1).trim() } : null }).filter((r) => r && r.k && r.v),
    requirements: lines(f.requirements),
    metaTitle: f.metaTitle,
    metaDescription: f.metaDescription,
    popular: f.popular,
    active: f.active,
  }
  return body
}

function Editor({ product, subs, onClose, onSaved }) {
  const creating = !product
  const [f, setF] = useState(product ? toForm(product) : BLANK)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }))

  async function save() {
    setBusy(true)
    setError('')
    try {
      const body = toPayload(f, creating)
      if (creating) await admin.createProduct(body)
      else await admin.updateProduct(product.slug, body)
      onSaved()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={creating ? 'Yeni Ürün / Hizmet' : `Düzenle: ${product.name}`} onClose={onClose} wide>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <h4 className="sm:col-span-2 text-[12px] font-bold uppercase tracking-[0.14em] text-vx-accent-text">1 · Genel bilgiler</h4>
        <TextField label="Ad" value={f.name} onChange={set('name')} max={120} />
        <TextField label="Kısa ad (slug)" hint={creating ? 'Küçük harf, rakam ve tire. Ürün sayfası: /urunler/kisa-ad' : 'Değiştirirseniz ürünün sayfa adresi değişir.'} value={f.slug} onChange={(v) => set('slug')(v.toLowerCase().replace(/[^a-z0-9-]/g, ''))} max={60} />
        <SelectField label="Ana kategori" value={f.category} onChange={set('category')} options={catOptions} />
        <TextField label="Alt kategori" list="sub-list" value={f.subCategory} onChange={set('subCategory')} max={40} hint="Yeni bir ad yazarak yeni alt kategori oluşturabilirsiniz." />
        <datalist id="sub-list">{subs.map((s) => <option key={s} value={s} />)}</datalist>
        <div className="sm:col-span-2"><TextField label="Kısa açıklama (kartlarda görünür)" value={f.tagline} onChange={set('tagline')} max={200} /></div>
        <div className="sm:col-span-2 flex flex-wrap gap-x-6 gap-y-3">
          <CheckField label="Sitede yayında" checked={f.active} onChange={set('active')} />
          <CheckField label="“En çok tercih edilen” rozeti" checked={f.popular} onChange={set('popular')} />
        </div>

        <h4 className="sm:col-span-2 mt-3 text-[12px] font-bold uppercase tracking-[0.14em] text-vx-accent-text">2 · Fiyat ve teslim</h4>
        <TextField label="Satış fiyatı (₺)" type="number" value={f.price} onChange={set('price')} max={10} hint="Müşterinin ödeyeceği fiyat. Boş bırakırsanız “Teklif alın” görünür." />
        <TextField label="Eski fiyat (₺) — indirim için" type="number" value={f.oldPrice} onChange={set('oldPrice')} max={10} hint="Dolu ve satış fiyatından yüksekse üstü çizili görünür, %indirim rozeti eklenir. İndirimi kaldırmak için boşaltın." />
        <TextField label="Dönem etiketi" value={f.period} onChange={set('period')} max={40} placeholder="tek seferlik" />
        <TextField label="Teslim süresi" value={f.delivery} onChange={set('delivery')} max={60} placeholder="5-7 iş günü" hint="Serbest yazın: “5-7 iş günü”, “24 saat içinde”, “Kapsama göre” ..." />
        <div className="sm:col-span-2"><CheckField label="“Başlangıç” etiketi göster (fiyat bu tutardan başlar)" checked={f.priceFrom} onChange={set('priceFrom')} /></div>

        <h4 className="sm:col-span-2 mt-3 text-[12px] font-bold uppercase tracking-[0.14em] text-vx-accent-text">3 · Ürün sayfası içeriği</h4>
        <div className="sm:col-span-2"><AreaField label="Kısa tanım (kartlar ve arama)" value={f.description} onChange={set('description')} rows={2} max={1000} /></div>
        <div className="sm:col-span-2"><AreaField label="Detaylı açıklama (ürün sayfasında “Genel Bakış”)" hint="Paragrafları boş satırla ayırın." value={f.details} onChange={set('details')} rows={7} max={4000} /></div>
        <div className="sm:col-span-2"><AreaField label="Özellikler / neler dahil (her satıra bir madde)" value={f.features} onChange={set('features')} rows={5} max={3000} /></div>
        <div className="sm:col-span-2"><AreaField label="Teknik özellikler tablosu (her satıra “Ad: Değer”)" hint="Örn: Komut sayısı: 40+  |  Dil desteği: Türkçe / İngilizce  |  Barındırma: Dahil. Boş bırakırsanız otomatik tablo gösterilir." value={f.specs} onChange={set('specs')} rows={5} max={4000} /></div>
        <div className="sm:col-span-2"><AreaField label="Teslim için gerekenler (her satıra bir madde)" hint="Örn: Sunucu davet bağlantısı, logo dosyası, istenen komut listesi" value={f.requirements} onChange={set('requirements')} rows={4} max={2400} /></div>
        <div className="sm:col-span-2"><TextField label="Arama etiketleri (virgülle ayırın)" value={f.tags} onChange={set('tags')} max={300} /></div>

        <h4 className="sm:col-span-2 mt-3 text-[12px] font-bold uppercase tracking-[0.14em] text-vx-accent-text">4 · Görseller</h4>
        <div className="sm:col-span-2"><ImageUploader label="Örnek fotoğraflar" value={f.images} onChange={set('images')} max={6} upload={admin.uploadMedia} /></div>

        <h4 className="sm:col-span-2 mt-3 text-[12px] font-bold uppercase tracking-[0.14em] text-vx-accent-text">5 · Arama motoru (isteğe bağlı)</h4>
        <TextField label="Sayfa başlığı (SEO)" value={f.metaTitle} onChange={set('metaTitle')} max={70} hint="Boş bırakılırsa otomatik oluşturulur. 60 karakter ideal." />
        <TextField label="Sayfa açıklaması (SEO)" value={f.metaDescription} onChange={set('metaDescription')} max={170} hint="Google sonuçlarında görünen metin. 150-160 karakter ideal." />
      </div>
      {error && <p role="alert" className="mt-4 text-[13px] text-rose-400">{error}</p>}
      <div className="mt-6 flex gap-3">
        <Btn onClick={save} disabled={busy || !f.name || (creating && f.slug.length < 2)}>{busy ? 'Kaydediliyor…' : 'Kaydet'}</Btn>
        <Btn variant="ghost" onClick={onClose}>Vazgeç</Btn>
      </div>
    </Modal>
  )
}

function PriceCell({ product, onSaved, push }) {
  const [v, setV] = useState(product.price == null ? '' : String(product.price))
  async function commit() {
    const next = v === '' ? null : Number(v)
    if (next === product.price || Number.isNaN(next)) return
    try {
      await admin.updateProduct(product.slug, { price: next })
      push('Fiyat güncellendi.')
      onSaved()
    } catch (e) {
      push(e.message, 'err')
    }
  }
  return (
    <input
      type="number"
      min="0"
      value={v}
      placeholder="Teklif"
      onChange={(e) => setV(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      className="h-9 w-28 px-3 rounded-lg bg-vx-surface border border-vx-line text-[13px] text-white outline-none focus:border-vx-accent-text/60"
      aria-label={`${product.name} fiyatı`}
    />
  )
}

function RenameSub({ products, onDone, push }) {
  const [category, setCategory] = useState('discord-bot')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const subs = useMemo(() => Array.from(new Set(products.filter((p) => p.category === category).map((p) => p.subCategory).filter(Boolean))), [products, category])

  async function run() {
    try {
      const r = await admin.renameSub({ category, from, to })
      push(`${r.updated} ürünün alt kategorisi güncellendi.`)
      setFrom('')
      setTo('')
      onDone()
    } catch (e) {
      push(e.message, 'err')
    }
  }

  return (
    <Card title="Alt kategori adını toplu değiştir">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        <SelectField label="Ana kategori" value={category} onChange={(v) => { setCategory(v); setFrom('') }} options={catOptions} />
        <SelectField label="Mevcut ad" value={from} onChange={setFrom} options={[['', 'Seçin…'], ...subs.map((s) => [s, s])]} />
        <TextField label="Yeni ad" value={to} onChange={setTo} max={40} />
        <Btn onClick={run} disabled={!from || !to}>Değiştir</Btn>
      </div>
    </Card>
  )
}

export default function Products() {
  const { data, error, loading, reload } = useLoad(() => admin.products(), [])
  const { focus } = useAdmin()
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [showHidden, setShowHidden] = useState(true)
  const [editing, setEditing] = useState(focus === 'new' ? null : undefined) // undefined = closed, null = new, object = edit
  const [toast, push] = useToast()
  const products = data ? data.products : []
  const subs = useMemo(() => Array.from(new Set(products.map((p) => p.subCategory).filter(Boolean))), [products])

  async function remove(p) {
    if (!confirmDo(`“${p.name}” kalıcı olarak silinsin mi?\n(Sadece gizlemek için düzenleyip “Sitede yayında” seçeneğini kapatın.)`)) return
    try {
      await admin.deleteProduct(p.slug)
      push('Ürün silindi.')
      reload()
    } catch (e) {
      push(e.message, 'err')
    }
  }
  // moves a product up/down among the products of its own category (the order visitors see)
  async function move(p, dir) {
    const list = products.filter((x) => x.category === p.category).map((x) => x.slug)
    const i = list.indexOf(p.slug)
    const j = i + dir
    if (j < 0 || j >= list.length) return
    ;[list[i], list[j]] = [list[j], list[i]]
    try {
      await admin.reorderProducts(p.category, list)
      reload()
    } catch (e) {
      push(e.message, 'err')
    }
  }
  async function duplicate(p) {
    try {
      const copy = { ...p }
      const body = {
        slug: `${p.slug}-kopya`.slice(0, 60), category: p.category, subCategory: p.subCategory, name: `${p.name} (Kopya)`.slice(0, 120), tagline: p.tagline, description: p.description,
        features: p.features, tags: p.tags, price: p.price, oldPrice: p.oldPrice, priceFrom: p.priceFrom, period: p.period, delivery: p.delivery || (p.deliveryDays ? `${p.deliveryDays} iş günü` : ''),
        popular: false, active: false, images: p.images, details: p.details, requirements: p.requirements, metaTitle: '', metaDescription: '',
      }
      void copy
      await admin.createProduct(body)
      push('Kopya oluşturuldu (gizli). Düzenleyip yayına alabilirsiniz.')
      reload()
    } catch (e) {
      push(e.message, 'err')
    }
  }
  async function toggle(p) {
    try {
      await admin.updateProduct(p.slug, { active: !p.active })
      reload()
    } catch (e) {
      push(e.message, 'err')
    }
  }

  return (
    <div className="space-y-6">
      {toast}
      <Card title={`Ürünler & Fiyatlar${data ? ` (${products.length})` : ''}`} actions={<Btn onClick={() => setEditing(null)}><Plus className="w-4 h-4" /> Yeni Ekle</Btn>}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input className="h-9 w-56 px-3 rounded-lg bg-vx-surface border border-vx-line text-[13px] text-white outline-none" placeholder="Ürün ara…" value={search} onChange={(e) => setSearch(e.target.value)} maxLength={60} />
          <label className="inline-flex items-center gap-2 text-[13px] text-zinc-200 mr-2"><input type="checkbox" className="accent-violet-500" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} /> Gizlileri göster</label>
          {[['', 'Tümü'], ...catOptions].map(([v, l]) => (
            <Btn key={v || 'all'} variant={filter === v ? 'primary' : 'ghost'} onClick={() => setFilter(v)}>{l}</Btn>
          ))}
        </div>
        {error && <p className="text-[13px] text-rose-400">{error}</p>}
        {loading && !data && <Empty>Yükleniyor…</Empty>}
        {data && products.length === 0 && <Empty>Henüz ürün yok.</Empty>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead>
              <tr className="text-vx-muted border-b border-vx-line">
                <th className="py-2 pr-3 font-medium">Ürün</th>
                <th className="py-2 pr-3 font-medium">Kategori</th>
                <th className="py-2 pr-3 font-medium">Fiyat (₺)</th>
                <th className="py-2 pr-3 font-medium">Durum</th>
                <th className="py-2 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {products.filter((p) => (!filter || p.category === filter) && (showHidden || p.active) && (!search || `${p.name} ${p.slug} ${p.subCategory}`.toLowerCase().includes(search.toLowerCase()))).map((p) => (
                <tr key={p.slug} className="border-b border-vx-line/60 last:border-0">
                  <td className="py-2.5 pr-3">
                    <div className="font-semibold text-white">{p.name}</div>
                    <div className="text-[11px] text-vx-muted">{p.slug}</div>
                  </td>
                  <td className="py-2.5 pr-3 text-zinc-100">
                    {CATEGORY[p.category]}
                    {p.subCategory && <span className="text-vx-muted"> · {p.subCategory}</span>}
                  </td>
                  <td className="py-2.5 pr-3"><PriceCell key={`${p.slug}-${p.price}`} product={p} onSaved={reload} push={push} /></td>
                  <td className="py-2.5 pr-3 space-x-1">
                    <button onClick={() => toggle(p)} title="Yayın durumunu değiştir"><Badge tone={p.active ? 'green' : 'gray'}>{p.active ? 'Yayında' : 'Gizli'}</Badge></button>
                    {p.popular && <Badge tone="blue">Popüler</Badge>}
                    {p.oldPrice > p.price && p.price != null && <Badge tone="red">İndirimli</Badge>}
                    {(p.images || []).length > 0 && <Badge>📷 {p.images.length}</Badge>}
                  </td>
                  <td className="py-2.5 text-right whitespace-nowrap space-x-2">
                    <Btn variant="ghost" onClick={() => move(p, -1)} aria-label="Yukarı taşı"><ArrowUp className="w-3.5 h-3.5" /></Btn>
                    <Btn variant="ghost" onClick={() => move(p, 1)} aria-label="Aşağı taşı"><ArrowDown className="w-3.5 h-3.5" /></Btn>
                    <Btn variant="ghost" onClick={() => setEditing(p)}><Pencil className="w-3.5 h-3.5" /> Düzenle</Btn>
                    <Btn variant="ghost" onClick={() => duplicate(p)} aria-label="Kopyala" title="Kopyasını oluştur"><Copy className="w-3.5 h-3.5" /></Btn>
                    <a href={`/urunler/${p.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-vx-line bg-vx-surface text-white hover:bg-vx-line" aria-label="Sayfayı gör" title="Ürün sayfasını aç"><ExternalLink className="w-3.5 h-3.5" /></a>
                    <Btn variant="danger" onClick={() => remove(p)} aria-label="Sil"><Trash2 className="w-3.5 h-3.5" /></Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[11px] text-zinc-400">Oklar ürünü kendi kategorisi içinde (Discord botları, Web siteleri…) yukarı/aşağı taşır ve sitedeki sırayı değiştirir. Fiyat kutusuna yazıp Enter’a basmanız yeterlidir. Siparişlerde fiyat her zaman sunucudaki bu değerden alınır.</p>
      </Card>

      {data && <RenameSub products={products} onDone={reload} push={push} />}

      {editing !== undefined && (
        <Editor
          product={editing}
          subs={subs}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined)
            push('Kaydedildi.')
            reload()
          }}
        />
      )}
    </div>
  )
}
