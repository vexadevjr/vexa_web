import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { admin } from '../../lib/adminApi.js'
import Modal from '../../components/Modal.jsx'
import { Card, Btn, Badge, Empty, TextField, AreaField, SelectField, CheckField, useLoad, useToast, confirmDo } from './ui.jsx'

const CATEGORY = { 'discord-bot': 'Discord Botu', web: 'Web Geliştirme', server: 'Sunucu', software: 'Yazılım' }
const catOptions = Object.entries(CATEGORY)

const BLANK = { slug: '', category: 'discord-bot', subCategory: '', name: '', tagline: '', description: '', features: '', tags: '', price: '', priceFrom: false, period: 'tek seferlik', deliveryDays: '', popular: false, active: true }

const toForm = (p) => ({
  ...BLANK,
  ...p,
  price: p.price == null ? '' : String(p.price),
  deliveryDays: p.deliveryDays == null ? '' : String(p.deliveryDays),
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
    deliveryDays: f.deliveryDays === '' ? null : Number(f.deliveryDays),
    popular: f.popular,
    active: f.active,
  }
  if (creating) body.slug = f.slug
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
        <TextField label="Ad" value={f.name} onChange={set('name')} max={120} />
        <TextField label="Kısa ad (slug)" hint={creating ? 'Küçük harf, rakam ve tire. Sonradan değiştirilemez.' : 'Değiştirilemez.'} value={f.slug} onChange={(v) => set('slug')(v.toLowerCase().replace(/[^a-z0-9-]/g, ''))} max={60} disabled={!creating} />
        <SelectField label="Ana kategori" value={f.category} onChange={set('category')} options={catOptions} />
        <TextField label="Alt kategori" list="sub-list" value={f.subCategory} onChange={set('subCategory')} max={40} hint="Yeni bir ad yazarak yeni alt kategori oluşturabilirsiniz." />
        <datalist id="sub-list">{subs.map((s) => <option key={s} value={s} />)}</datalist>
        <div className="sm:col-span-2"><TextField label="Kısa açıklama" value={f.tagline} onChange={set('tagline')} max={200} /></div>
        <div className="sm:col-span-2"><AreaField label="Açıklama" value={f.description} onChange={set('description')} rows={3} max={1000} /></div>
        <TextField label="Fiyat (₺)" type="number" value={f.price} onChange={set('price')} max={10} hint="Boş bırakırsanız “Teklif İste” olarak görünür." />
        <TextField label="Dönem etiketi" value={f.period} onChange={set('period')} max={40} placeholder="tek seferlik" />
        <TextField label="Teslim süresi (iş günü)" type="number" value={f.deliveryDays} onChange={set('deliveryDays')} max={4} />
        <div className="flex flex-col justify-end gap-3 pb-1">
          <CheckField label="“Başlangıç fiyatı” olarak göster" checked={f.priceFrom} onChange={set('priceFrom')} />
          <CheckField label="“En çok tercih edilen” rozeti" checked={f.popular} onChange={set('popular')} />
          <CheckField label="Sitede yayında" checked={f.active} onChange={set('active')} />
        </div>
        <div className="sm:col-span-2"><AreaField label="Özellikler (her satıra bir özellik)" value={f.features} onChange={set('features')} rows={5} max={3000} /></div>
        <div className="sm:col-span-2"><TextField label="Arama etiketleri (virgülle ayırın)" value={f.tags} onChange={set('tags')} max={300} /></div>
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
  const [filter, setFilter] = useState('')
  const [editing, setEditing] = useState(undefined) // undefined = closed, null = new, object = edit
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
        <div className="mb-4 flex flex-wrap gap-2">
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
              {products.filter((p) => !filter || p.category === filter).map((p) => (
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
                  </td>
                  <td className="py-2.5 text-right whitespace-nowrap space-x-2">
                    <Btn variant="ghost" onClick={() => move(p, -1)} aria-label="Yukarı taşı"><ArrowUp className="w-3.5 h-3.5" /></Btn>
                    <Btn variant="ghost" onClick={() => move(p, 1)} aria-label="Aşağı taşı"><ArrowDown className="w-3.5 h-3.5" /></Btn>
                    <Btn variant="ghost" onClick={() => setEditing(p)}><Pencil className="w-3.5 h-3.5" /> Düzenle</Btn>
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
