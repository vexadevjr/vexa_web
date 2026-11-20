import { useState } from 'react'
import { ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react'
import { admin } from '../../lib/adminApi.js'
import { siteConfig } from '../../config/siteConfig.js'
import { Card, Btn, Empty, TextField, AreaField, SelectField, CheckField, useAdmin, useLoad, useToast, confirmDo } from './ui.jsx'

const ICON_OPTS = [['lock', 'Kilit'], ['shield', 'Kalkan'], ['clock', 'Saat'], ['refresh', 'Yenile']]
const SERVICE_ICONS = [['discord', 'Discord'], ['code', 'Kod'], ['server', 'Sunucu'], ['settings', 'Ayarlar']]

const SECTIONS = [
  { key: 'legal', label: 'Yasal Bilgiler', kind: 'object', hint: 'KVKK Aydınlatma Metni, Mesafeli Satış Sözleşmesi, Gizlilik ve Çerez sayfalarında “veri sorumlusu / satıcı” olarak görünür. Gerçek işletme bilgilerinizi girin; boş bırakılan satırlar gösterilmez.', fields: [
    { k: 'unvan', l: 'Ticari unvan / ad soyad', max: 150 },
    { k: 'yetkili', l: 'Yetkili kişi', max: 100 },
    { k: 'adres', l: 'Adres', t: 'area', max: 300 },
    { k: 'vergiDairesi', l: 'Vergi dairesi', max: 80 },
    { k: 'vergiNo', l: 'Vergi numarası / TCKN', max: 40 },
    { k: 'mersis', l: 'MERSİS numarası', max: 40 },
    { k: 'eposta', l: 'Hukuki bildirimler e-postası', max: 120 },
    { k: 'telefon', l: 'Telefon', max: 40 },
    { k: 'kep', l: 'KEP adresi (varsa)', max: 120 },
  ] },
  { key: 'announcement', label: 'Duyuru Bandı', kind: 'object', hint: 'Sitenin en üstünde görünen duyuru bandı. Kampanya veya bakım duyurusu için kullanın.', blank: { enabled: false, title: '', text: '', link: '', linkText: '', style: 'bilgi' }, fields: [
    { k: 'enabled', t: 'bool', l: 'Sitede göster' },
    { k: 'style', t: 'select', l: 'Görünüm', options: [['kampanya', 'Kampanya (turuncu-pembe)'], ['bilgi', 'Bilgi (mor-mavi)'], ['uyari', 'Uyarı (sarı)']] },
    { k: 'title', l: 'Başlık (kalın, dikkat çekici)', max: 80 },
    { k: 'text', l: 'Duyuru metni', max: 300 },
    { k: 'link', l: 'Bağlantı (isteğe bağlı: /iletisim veya https://...)', max: 300 },
    { k: 'linkText', l: 'Buton yazısı (örn. Fırsatı Gör)', max: 30 },
  ] },
  { key: 'contact', label: 'İletişim Bilgileri', kind: 'object', hint: 'İletişim sayfası ve alt bilgide görünür.', fields: [
    { k: 'email', l: 'E-posta', max: 120 },
    { k: 'discord', l: 'Discord bilgisi', max: 120 },
    { k: 'hours', l: 'Çalışma saatleri', t: 'area', max: 300 },
    { k: 'location', l: 'Konum', max: 120 },
  ] },
  { key: 'links', label: 'Bağlantılar', kind: 'object', hint: 'Yalnızca https:// ile başlayan adresler kabul edilir. Boş bırakılan bağlantı sitede gizlenir.', fields: [
    { k: 'discord', l: 'Discord davet bağlantısı' },
    { k: 'support', l: 'Destek kanalı' },
    { k: 'payment', l: 'Ödeme / fatura bağlantısı' },
    { k: 'github', l: 'GitHub' },
    { k: 'youtube', l: 'YouTube' },
    { k: 'x', l: 'X (Twitter)' },
  ] },
  { key: 'faq', label: 'Sık Sorulan Sorular', kind: 'list', hint: 'Ana sayfa ve iletişim sayfasındaki sık sorulan sorular. Google’da zengin sonuç için de kullanılır.', blank: { q: '', a: '' }, title: (i) => i.q, fields: [
    { k: 'q', l: 'Soru', max: 200 },
    { k: 'a', l: 'Cevap', t: 'area', max: 2000 },
  ] },
  { key: 'serviceCards', label: 'Ana Sayfa Hizmet Kartları', kind: 'list', hint: 'Arama kutusunda önerilen hizmet kartları.', blank: { title: '', icon: 'settings', to: '/iletisim', desc: '' }, title: (i) => i.title, fields: [
    { k: 'title', l: 'Başlık', max: 80 },
    { k: 'icon', l: 'Simge', t: 'select', options: SERVICE_ICONS },
    { k: 'to', l: 'Sayfa adresi (/ ile başlar)', max: 200 },
    { k: 'desc', l: 'Açıklama', t: 'area', max: 300 },
  ] },
  { key: 'guarantees', label: 'Garanti Kartları', kind: 'list', hint: 'Ana sayfa ve ürün sayfalarındaki güvence kartları.', blank: { icon: 'shield', title: '', text: '' }, title: (i) => i.title, fields: [
    { k: 'icon', l: 'Simge', t: 'select', options: ICON_OPTS },
    { k: 'title', l: 'Başlık', max: 100 },
    { k: 'text', l: 'Metin', t: 'area', max: 500 },
  ] },
  { key: 'steps', label: '“Nasıl Çalışır?” Adımları', kind: 'list', hint: '“Nasıl çalışır?” adımları.', blank: { title: '', desc: '' }, title: (i) => i.title, fields: [
    { k: 'title', l: 'Başlık', max: 100 },
    { k: 'desc', l: 'Açıklama', t: 'area', max: 400 },
  ] },
]

let uid = 0
const withKeys = (list) => list.map((i) => ({ ...i, _k: ++uid }))
const strip = (list) => list.map(({ _k, ...rest }) => rest) // eslint-disable-line no-unused-vars
const clone = (v) => JSON.parse(JSON.stringify(v))

function TagsInput({ label, value, onChange }) {
  const [text, setText] = useState((value || []).join(', '))
  return (
    <TextField
      label={label}
      value={text}
      max={300}
      onChange={(v) => {
        setText(v)
        onChange(v.split(',').map((x) => x.trim()).filter(Boolean).slice(0, 8))
      }}
    />
  )
}

function FieldInput({ f, value, onChange }) {
  if (f.t === 'bool') return <CheckField label={f.l} checked={value} onChange={onChange} />
  if (f.t === 'area') return <AreaField label={f.l} value={value} onChange={onChange} rows={3} max={f.max || 2000} />
  if (f.t === 'select') return <SelectField label={f.l} value={value} onChange={onChange} options={f.options} />
  if (f.t === 'tags') return <TagsInput label={f.l} value={value} onChange={onChange} />
  return <TextField label={f.l} value={value} onChange={onChange} max={f.max || 300} />
}

function SectionEditor({ section, initial, onSaved, onReset }) {
  const isList = section.kind === 'list'
  const [value, setValue] = useState(() => (isList ? withKeys(clone(initial)) : clone(initial)))
  const [busy, setBusy] = useState(false)
  const [toast, push] = useToast()

  const setItem = (idx, k, v) => setValue((list) => list.map((it, i) => (i === idx ? { ...it, [k]: v } : it)))
  const move = (idx, d) =>
    setValue((list) => {
      const next = list.slice()
      const j = idx + d
      if (j < 0 || j >= next.length) return list
      ;[next[idx], next[j]] = [next[j], next[idx]]
      return next
    })

  async function save() {
    setBusy(true)
    try {
      await admin.saveContent(section.key, isList ? strip(value) : value)
      push('Kaydedildi. Değişiklik sitede yayında.')
      onSaved()
    } catch (e) {
      push(e.message, 'err')
    } finally {
      setBusy(false)
    }
  }
  async function reset() {
    if (!confirmDo('Bu bölüm varsayılan içeriğe döndürülsün mü? Yaptığınız değişiklikler silinir.')) return
    try {
      await admin.resetContent(section.key)
      onReset()
    } catch (e) {
      push(e.message, 'err')
    }
  }

  return (
    <Card
      title={section.label}
      actions={
        <>
          {isList && <Btn variant="ghost" onClick={() => setValue((l) => [...l, ...withKeys([clone(section.blank)])])}><Plus className="w-4 h-4" /> Ekle</Btn>}
          <Btn variant="ghost" onClick={reset}>Varsayılana dön</Btn>
          <Btn onClick={save} disabled={busy}>{busy ? 'Kaydediliyor…' : 'Kaydet'}</Btn>
        </>
      }
    >
      {toast}
      {section.hint && <p className="mb-4 text-[12px] text-vx-muted">{section.hint}</p>}
      {!isList && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {section.fields.map((f) => (
            <div key={f.k} className={f.t === 'area' ? 'sm:col-span-2' : ''}>
              <FieldInput f={f} value={value[f.k]} onChange={(v) => setValue((o) => ({ ...o, [f.k]: v }))} />
            </div>
          ))}
        </div>
      )}
      {isList && value.length === 0 && <Empty>Henüz kayıt yok. “Ekle” ile yeni bir kayıt oluşturun.</Empty>}
      {isList && (
        <ul className="space-y-4">
          {value.map((item, idx) => (
            <li key={item._k} className="p-4 rounded-xl bg-vx-surface border border-vx-line">
              <div className="flex items-center justify-between gap-2 mb-3">
                <b className="text-[13px] text-white truncate">{idx + 1}. {section.title(item) || 'Yeni kayıt'}</b>
                <div className="flex gap-1.5 shrink-0">
                  <Btn variant="ghost" onClick={() => move(idx, -1)} aria-label="Yukarı taşı"><ArrowUp className="w-3.5 h-3.5" /></Btn>
                  <Btn variant="ghost" onClick={() => move(idx, 1)} aria-label="Aşağı taşı"><ArrowDown className="w-3.5 h-3.5" /></Btn>
                  <Btn variant="danger" onClick={() => setValue((l) => l.filter((_, i) => i !== idx))} aria-label="Sil"><Trash2 className="w-3.5 h-3.5" /></Btn>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.fields.map((f) => (
                  <div key={f.k} className={f.t === 'area' ? 'sm:col-span-2' : ''}>
                    <FieldInput f={f} value={item[f.k]} onChange={(v) => setItem(idx, f.k, v)} />
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default function Content() {
  const { focus } = useAdmin()
  const [active, setActive] = useState(SECTIONS.some((x) => x.key === focus) ? focus : SECTIONS[0].key)
  const { data, error, reload } = useLoad(() => admin.content(), [])
  const [version, setVersion] = useState(0) // remounts an editor after a reset
  const section = SECTIONS.find((s) => s.key === active)

  const initialFor = (s) => {
    const saved = data && data.content[s.key]
    if (saved !== undefined) return saved
    const def = siteConfig[s.key]
    if (s.key === 'announcement') return s.blank
    return def
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <Btn key={s.key} variant={active === s.key ? 'primary' : 'ghost'} onClick={() => setActive(s.key)}>{s.label}</Btn>
        ))}
      </div>
      {error && <p className="text-[13px] text-rose-400">{error}</p>}
      {!data && !error && <Empty>Yükleniyor…</Empty>}
      {data && (
        <SectionEditor
          key={`${active}-${version}`}
          section={section}
          initial={initialFor(section)}
          onSaved={reload}
          onReset={async () => {
            await reload()
            setVersion((v) => v + 1)
          }}
        />
      )}
      <p className="text-[12px] text-zinc-400">Ürünler, kategoriler ve fiyatlar için “Ürünler & Fiyatlar” sekmesini kullanın. Hero metinleri ve renkler <code>frontend/src/config/siteConfig.js</code> dosyasındadır.</p>
    </div>
  )
}
