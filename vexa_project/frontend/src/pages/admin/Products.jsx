import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Copy, ExternalLink } from 'lucide-react'
import { admin } from '../../lib/adminApi.js'
import Modal from '../../components/Modal.jsx'
import { ORDER_FIELD_PRESETS, PRESET_KEYS } from '../../config/orderFields.js'
import { ICON_OPTIONS, iconFor, slugify } from '../../lib/categories.js'
import { Card, Btn, Badge, Empty, TextField, AreaField, SelectField, CheckField, ImageUploader, useAdmin, useLoad, useToast, confirmDo } from './ui.jsx'


const BLANK = { slug: '', category: '', subCategory: '', name: '', tagline: '', description: '', features: '', tags: '', price: '', oldPrice: '', priceFrom: false, period: 'aylık', terms: [1, 3, 6, 12], delivery: '', images: [], details: '', requirements: '', specs: '', orderFields: [], metaTitle: '', metaDescription: '', popular: false, active: true }

const toForm = (p) => ({
  ...BLANK,
  ...p,
  price: p.price == null ? '' : String(p.price),
  oldPrice: p.oldPrice == null ? '' : String(p.oldPrice),
  delivery: p.delivery || (p.deliveryDays ? `${p.deliveryDays} iş günü` : ''),
  images: p.images || [],
  terms: Array.isArray(p.terms) ? p.terms : [1, 3, 6, 12],
  details: p.details || '',
  orderFields: p.orderFields || [],
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
    terms: f.terms,
    oldPrice: f.oldPrice === '' ? null : Number(f.oldPrice),
    delivery: f.delivery,
    deliveryDays: null,
    images: f.images,
    slug: f.slug,
    details: f.details,
    orderFields: (f.orderFields || []).filter((d) => PRESET_KEYS.includes(d.key) || (/^custom_[0-2]$/.test(d.key) && (d.label || '').trim())).map((d) => ({ key: d.key, required: Boolean(d.required), label: d.label || '' })),
    specs: lines(f.specs).map((l) => { const i = l.indexOf(':'); return i > 0 ? { k: l.slice(0, i).trim(), v: l.slice(i + 1).trim() } : null }).filter((r) => r && r.k && r.v),
    requirements: lines(f.requirements),
    metaTitle: f.metaTitle,
    metaDescription: f.metaDescription,
    popular: f.popular,
    active: f.active,
  }
  return body
}

// Which extra questions the order form asks for this product, and which of them are mandatory.
function OrderFieldsEditor({ value = [], onChange }) {
  const find = (key) => value.find((d) => d.key === key)
  const toggle = (key, on) => onChange(on ? [...value, { key, required: false, label: '' }] : value.filter((d) => d.key !== key))
  const patch = (key, p) => onChange(value.map((d) => (d.key === key ? { ...d, ...p } : d)))
  const customs = [0, 1, 2].map((i) => ({ key: `custom_${i}`, def: find(`custom_${i}`) }))
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Btn variant="ghost" onClick={() => onChange(PRESET_KEYS.map((key) => ({ key, required: key !== 'botLogo' && key !== 'serverInvite', label: '' })))}>Bot kurulumu şablonu</Btn>
        <Btn variant="ghost" onClick={() => onChange([])}>Hepsini kapat</Btn>
      </div>
      <ul className="divide-y divide-vx-line/60 rounded-xl border border-vx-line bg-vx-surface">
        {PRESET_KEYS.map((key) => {
          const d = find(key)
          const p = ORDER_FIELD_PRESETS[key]
          return (
            <li key={key} className="p-3 flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="min-w-[220px] flex-1"><div className="text-[14px] font-semibold text-white">{p.label}</div><div className="text-[12px] text-vx-muted">{key === 'botToken' ? 'Hassas veri: şifreli saklanır, teslim/iptalde silinir.' : p.hint || 'Müşteriden istenir.'}</div></div>
              <CheckField label="Siparişte iste" checked={Boolean(d)} onChange={(on) => toggle(key, on)} />
              <label className={`inline-flex items-center gap-2 text-[13px] select-none ${d ? 'text-slate-200 cursor-pointer' : 'text-slate-600'}`}>
                <input type="checkbox" className="w-4 h-4 accent-violet-500" disabled={!d} checked={Boolean(d && d.required)} onChange={(e) => patch(key, { required: e.target.checked })} /> Zorunlu
              </label>
            </li>
          )
        })}
      </ul>
      <div className="rounded-xl border border-vx-line bg-vx-surface p-3 space-y-3">
        <div className="text-[13px] font-semibold text-white">Özel alanlar (en fazla 3)</div>
        {customs.map(({ key, def }) => (
          <div key={key} className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]"><TextField label="Soru / alan adı" value={def ? def.label : ''} max={60} placeholder="Örn: Hangi komut öneki? (!, /)" onChange={(v) => (v ? (def ? patch(key, { label: v }) : onChange([...value, { key, required: false, label: v }])) : onChange(value.filter((d) => d.key !== key)))} /></div>
            <label className={`inline-flex items-center gap-2 pb-3 text-[13px] select-none ${def ? 'text-slate-200 cursor-pointer' : 'text-slate-600'}`}><input type="checkbox" className="w-4 h-4 accent-violet-500" disabled={!def} checked={Boolean(def && def.required)} onChange={(e) => patch(key, { required: e.target.checked })} /> Zorunlu</label>
          </div>
        ))}
      </div>
    </div>
  )
}

function Editor({ product, subs, categories, onClose, onSaved }) {
  const creating = !product
  const catOptions = categories.map((c) => [c.id, c.name])
  const [f, setF] = useState(product ? toForm(product) : { ...BLANK, category: categories[0] ? categories[0].id : '' })
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
        <TextField label="Aylık fiyat (₺)" type="number" value={f.price} onChange={set('price')} max={10} hint="Bir aylık abonelik bedeli. Boş bırakırsanız “Teklif alın” görünür." />
        <TextField label="Eski aylık fiyat (₺) — indirim için" type="number" value={f.oldPrice} onChange={set('oldPrice')} max={10} hint="Dolu ve satış fiyatından yüksekse üstü çizili görünür, %indirim rozeti eklenir. İndirimi kaldırmak için boşaltın." />
        <div className="sm:col-span-2">
          <span className="block mb-1.5 text-[12px] font-medium text-zinc-200">Abonelik süreleri</span>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[[1, '1 Aylık'], [3, '3 Aylık'], [6, '6 Aylık'], [12, 'Yıllık']].map(([n, l]) => (
              <CheckField key={n} label={l} checked={f.terms.includes(n)} onChange={(on) => set('terms')(on ? [...f.terms, n].sort((a, b) => a - b) : f.terms.filter((x) => x !== n))} />
            ))}
          </div>
          <span className="block mt-1 text-[11px] text-zinc-400">Müşteri seçtiği süreye göre aylık fiyat × ay kadar öder. Hiçbiri seçilmezse ürün tek seferlik satılır.</span>
        </div>
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

        <h4 className="sm:col-span-2 mt-3 text-[12px] font-bold uppercase tracking-[0.14em] text-vx-accent-text">5 · Sipariş formu (müşteriden istenecek bilgiler)</h4>
        <div className="sm:col-span-2"><OrderFieldsEditor value={f.orderFields} onChange={set('orderFields')} /></div>

        <h4 className="sm:col-span-2 mt-3 text-[12px] font-bold uppercase tracking-[0.14em] text-vx-accent-text">6 · Arama motoru (isteğe bağlı)</h4>
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

function RenameSub({ products, categories, onDone, push }) {
  const catOptions = categories.map((c) => [c.id, c.name])
  const [category, setCategory] = useState(categories[0] ? categories[0].id : '')
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

// Shop categories: each one gets its own page, sidebar entry and SEO tags on the site.
function CategoriesCard({ categories, products, onSaved, push }) {
  const [editing, setEditing] = useState(undefined) // undefined closed, null new, object edit
  const used = (id) => products.filter((p) => p.category === id).length

  async function persist(list, msg) {
    try {
      await admin.saveContent('categories', list)
      push(msg)
      onSaved()
      return true
    } catch (e) {
      push(e.message, 'err')
      return false
    }
  }
  const move = (i, d) => {
    const j = i + d
    if (j < 0 || j >= categories.length) return
    const next = categories.slice()
    ;[next[i], next[j]] = [next[j], next[i]]
    persist(next, 'Menü sırası güncellendi.')
  }
  const remove = (c) => {
    if (used(c.id)) return push('Bu kategoride ürün var. Önce ürünleri başka kategoriye taşıyın veya silin.', 'err')
    if (categories.length <= 1) return push('En az bir kategori kalmalı.', 'err')
    if (confirmDo(`“${c.name}” kategorisi silinsin mi? Menüden ve siteden kalkar.`)) persist(categories.filter((x) => x.id !== c.id), 'Kategori silindi.')
  }
  async function save(c) {
    const exists = categories.some((x) => x.id === c.id)
    const id = c.id || slugify(c.name)
    if (!exists && categories.some((x) => x.id === id)) return push('Bu ada sahip bir kategori zaten var.', 'err')
    const item = { ...c, id }
    const list = exists ? categories.map((x) => (x.id === id ? item : x)) : [...categories, item]
    if (await persist(list, 'Kategori kaydedildi. Soldaki menüde görünür.')) setEditing(undefined)
  }

  return (
    <Card title="Kategoriler (sol menü ve sayfalar)" actions={<Btn onClick={() => setEditing(null)}><Plus className="w-4 h-4" /> Yeni kategori</Btn>}>
      <ul className="space-y-3">
        {categories.map((c, i) => {
          const Icon = iconFor(c.icon)
          return (
            <li key={c.id} className="flex flex-wrap items-center gap-4 p-3 rounded-xl bg-vx-surface border border-vx-line">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-vx-accent/20 text-vx-accent-soft"><Icon className="w-5 h-5" /></span>
              <div className="min-w-[200px] flex-1">
                <div className="text-[14px] font-semibold text-white">{c.name}</div>
                <div className="text-[12px] text-vx-muted">{c.path} · {used(c.id)} ürün</div>
              </div>
              <div className="flex gap-2">
                <Btn variant="ghost" onClick={() => move(i, -1)} aria-label="Yukarı"><ArrowUp className="w-3.5 h-3.5" /></Btn>
                <Btn variant="ghost" onClick={() => move(i, 1)} aria-label="Aşağı"><ArrowDown className="w-3.5 h-3.5" /></Btn>
                <a href={c.path} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-vx-line bg-vx-surface text-white hover:bg-vx-line" aria-label="Sayfayı gör"><ExternalLink className="w-3.5 h-3.5" /></a>
                <Btn variant="ghost" onClick={() => setEditing(c)}><Pencil className="w-3.5 h-3.5" /> Düzenle</Btn>
                <Btn variant="danger" onClick={() => remove(c)} aria-label="Sil"><Trash2 className="w-3.5 h-3.5" /></Btn>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="mt-4 text-[11px] text-slate-500">Eklediğiniz kategori soldaki menüde, ana sayfada ve ürün sayfalarında Discord Hizmetleri / Web Geliştirme ile aynı görünümde yer alır. Alt kategoriler (ör. “Moderasyon”, “Sunucu Kurulumu”) ürün düzenlerken yazdığınız alt kategori adından otomatik oluşur.</p>
      {editing !== undefined && <CategoryEditor item={editing} onClose={() => setEditing(undefined)} onSave={save} />}
    </Card>
  )
}

function CategoryEditor({ item, onClose, onSave }) {
  const [f, setF] = useState(item || { id: '', name: '', icon: 'package', title: '', description: '', seoTitle: '', seoDescription: '' })
  const [busy, setBusy] = useState(false)
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }))
  return (
    <Modal title={item ? `Kategoriyi düzenle: ${item.name}` : 'Yeni kategori'} onClose={onClose} wide>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Menü adı" value={f.name} onChange={set('name')} max={40} hint="Soldaki menüde ve sekmelerde görünür. Örn: Sunucu Kurulumu" />
        <SelectField label="Simge" value={f.icon} onChange={set('icon')} options={ICON_OPTIONS} />
        <div className="sm:col-span-2"><TextField label="Sayfa başlığı" value={f.title} onChange={set('title')} max={100} hint="Boşsa menü adı kullanılır." /></div>
        <div className="sm:col-span-2"><AreaField label="Sayfa açıklaması" value={f.description} onChange={set('description')} rows={3} max={400} /></div>
        <TextField label="SEO başlığı" value={f.seoTitle} onChange={set('seoTitle')} max={70} hint="Google sonuçlarındaki başlık (boşsa otomatik)." />
        <TextField label="SEO açıklaması" value={f.seoDescription} onChange={set('seoDescription')} max={170} />
        {!item && <p className="sm:col-span-2 text-[12px] text-vx-muted">Sayfa adresi otomatik oluşturulur: /kategori/{slugify(f.name) || '...'}</p>}
      </div>
      <div className="mt-6 flex gap-3">
        <Btn disabled={busy || !f.name.trim() || (!item && slugify(f.name).length < 2)} onClick={async () => { setBusy(true); await onSave(f); setBusy(false) }}>{busy ? 'Kaydediliyor…' : 'Kaydet'}</Btn>
        <Btn variant="ghost" onClick={onClose}>Vazgeç</Btn>
      </div>
    </Modal>
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
  const categories = data ? data.categories : []
  const catOptions = categories.map((c) => [c.id, c.name])
  const catName = (id) => (categories.find((c) => c.id === id) || {}).name || id
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
        features: p.features, tags: p.tags, price: p.price, oldPrice: p.oldPrice, priceFrom: p.priceFrom, period: p.period, terms: p.terms, delivery: p.delivery || (p.deliveryDays ? `${p.deliveryDays} iş günü` : ''),
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
                <th className="py-2 pr-3 font-medium">Aylık fiyat (₺)</th>
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
                    {catName(p.category)}
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

      {data && <CategoriesCard categories={categories} products={products} onSaved={reload} push={push} />}
      {data && <RenameSub products={products} categories={categories} onDone={reload} push={push} />}

      {editing !== undefined && (
        <Editor
          product={editing}
          subs={subs}
          categories={categories}
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
