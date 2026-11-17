import { useState } from 'react'
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { admin } from '../../lib/adminApi.js'
import Modal from '../../components/Modal.jsx'
import { Card, Btn, Badge, Empty, TextField, AreaField, ImageUploader, useAdmin, useLoad, useToast, confirmDo } from './ui.jsx'

const BLANK = { id: '', title: '', category: 'Discord Bot', client: '', result: '', tags: '', link: '', images: [] }
const CATS = ['Discord Bot', 'Web Sitesi', 'E-Ticaret', 'Sunucu', 'Yazılım']

function Editor({ item, onClose, onSave }) {
  const [f, setF] = useState(item ? { ...item, tags: (item.tags || []).join(', '), link: item.link || '', images: item.images || [] } : BLANK)
  const [busy, setBusy] = useState(false)
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }))

  async function save() {
    setBusy(true)
    await onSave({ ...f, tags: f.tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 8) })
    setBusy(false)
  }

  return (
    <Modal title={item ? `Düzenle: ${item.title}` : 'Yeni Proje'} onClose={onClose} wide>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Proje adı" value={f.title} onChange={set('title')} max={120} />
        <TextField label="Kategori" list="pf-cats" value={f.category} onChange={set('category')} max={40} />
        <datalist id="pf-cats">{CATS.map((c) => <option key={c} value={c} />)}</datalist>
        <TextField label="Müşteri / marka (isteğe bağlı)" value={f.client} onChange={set('client')} max={120} hint="Müşteri izni yoksa boş bırakın." />
        <TextField label="Proje bağlantısı (isteğe bağlı)" value={f.link} onChange={set('link')} max={300} placeholder="https://..." hint="Yalnızca https:// ile başlayan adresler." />
        <div className="sm:col-span-2"><AreaField label="Açıklama / sonuç" value={f.result} onChange={set('result')} rows={4} max={600} placeholder="Ne yaptınız, hangi sonucu aldınız?" /></div>
        <div className="sm:col-span-2"><TextField label="Etiketler (virgülle)" value={f.tags} onChange={set('tags')} max={300} placeholder="Moderasyon, Ticket, Slash komut" /></div>
        <div className="sm:col-span-2"><ImageUploader label="Proje fotoğrafları" value={f.images} onChange={set('images')} max={8} upload={admin.uploadMedia} /></div>
      </div>
      <div className="mt-6 flex gap-3">
        <Btn onClick={save} disabled={busy || !f.title.trim()}>{busy ? 'Kaydediliyor…' : 'Kaydet'}</Btn>
        <Btn variant="ghost" onClick={onClose}>Vazgeç</Btn>
      </div>
    </Modal>
  )
}

export default function PortfolioAdmin() {
  const { data, error, loading, reload } = useLoad(() => admin.content(), [])
  const { focus } = useAdmin()
  const [editing, setEditing] = useState(focus === 'new' ? null : undefined) // undefined closed, null new, object edit
  const [toast, push] = useToast()
  const items = (data && data.content.portfolio) || []

  async function persist(list, okMsg) {
    try {
      await admin.saveContent('portfolio', list)
      push(okMsg)
      await reload()
      return true
    } catch (e) {
      push(e.message, 'err')
      return false
    }
  }
  async function save(item) {
    const list = item.id && items.some((x) => x.id === item.id) ? items.map((x) => (x.id === item.id ? item : x)) : [...items, item]
    if (await persist(list, 'Proje kaydedildi, sitede yayında.')) setEditing(undefined)
  }
  const move = (i, d) => {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const next = items.slice()
    ;[next[i], next[j]] = [next[j], next[i]]
    persist(next, 'Sıralama güncellendi.')
  }
  const remove = (p) => confirmDo(`“${p.title}” portföyden kaldırılsın mı?`) && persist(items.filter((x) => x.id !== p.id), 'Proje kaldırıldı.')

  return (
    <div className="space-y-6">
      {toast}
      <Card title={`Portföy Projeleri${data ? ` (${items.length})` : ''}`} actions={<Btn onClick={() => setEditing(null)}><Plus className="w-4 h-4" /> Yeni Proje</Btn>}>
        {error && <p className="text-[13px] text-rose-400">{error}</p>}
        {loading && !data && <Empty>Yükleniyor…</Empty>}
        {data && items.length === 0 && <Empty>Henüz proje yok. Daha önce yaptığınız bot ve siteleri fotoğraflarıyla ekleyin; ziyaretçiler portföyde fotoğrafları sağa sola kaydırarak inceleyebilir.</Empty>}
        <ul className="space-y-3">
          {items.map((p, i) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 p-3 rounded-xl bg-vx-surface border border-vx-line">
              {p.images && p.images[0] ? <img src={p.images[0]} alt="" className="w-28 aspect-video object-cover rounded-lg" /> : <div className="w-28 aspect-video rounded-lg bg-vx-card grid place-items-center text-[11px] text-vx-muted">Fotoğraf yok</div>}
              <div className="flex-1 min-w-[180px]">
                <div className="text-[14px] font-semibold text-white">{p.title}</div>
                <div className="mt-1 flex flex-wrap gap-2 items-center"><Badge tone="blue">{p.category || 'Kategorisiz'}</Badge>{(p.images || []).length > 0 && <Badge>📷 {p.images.length}</Badge>}{p.client && <span className="text-[12px] text-vx-muted">{p.client}</span>}</div>
              </div>
              <div className="flex gap-2">
                <Btn variant="ghost" onClick={() => move(i, -1)} aria-label="Yukarı"><ArrowUp className="w-3.5 h-3.5" /></Btn>
                <Btn variant="ghost" onClick={() => move(i, 1)} aria-label="Aşağı"><ArrowDown className="w-3.5 h-3.5" /></Btn>
                <Btn variant="ghost" onClick={() => setEditing(p)}><Pencil className="w-3.5 h-3.5" /> Düzenle</Btn>
                <Btn variant="danger" onClick={() => remove(p)} aria-label="Sil"><Trash2 className="w-3.5 h-3.5" /></Btn>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      {editing !== undefined && <Editor item={editing} onClose={() => setEditing(undefined)} onSave={save} />}
    </div>
  )
}
