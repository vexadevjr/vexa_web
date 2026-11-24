import { useEffect, useMemo, useState } from 'react'
import { admin } from '../../lib/adminApi.js'
import { formatPrice, discountInfo } from '../../lib/format.js'
import { Card, Btn, Badge, Empty, SelectField, TextField, useLoad, useToast, confirmDo } from './ui.jsx'

// Apply a discount to one product or to a whole category. The server turns the current price into the
// "old price" and lowers the sale price; 0 removes the discount and restores the original price.
export default function Discounts() {
  const { data, error, loading, reload } = useLoad(() => admin.products())
  const [toast, push] = useToast()
  const [scope, setScope] = useState('category')
  const [target, setTarget] = useState('')
  const [percent, setPercent] = useState('10')
  const [busy, setBusy] = useState(false)
  const [termRates, setTermRates] = useState({ 1: '0', 3: '0', 6: '0', 12: '0' })
  const [termBusy, setTermBusy] = useState(false)
  const [termLoaded, setTermLoaded] = useState(false)

  useEffect(() => { admin.termDiscounts().then((r) => { setTermRates({ 1: String(r.discounts?.[1] ?? 0), 3: String(r.discounts?.[3] ?? 0), 6: String(r.discounts?.[6] ?? 0), 12: String(r.discounts?.[12] ?? 0) }); setTermLoaded(true) }).catch((e) => push(e.message, 'err')) }, [])

  const products = (data && data.products) || []
  const categories = (data && data.categories) || []
  const options = useMemo(() => (scope === 'category' ? categories.map((c) => [c.id, c.name]) : products.map((p) => [p.slug, p.name])), [scope, categories, products])
  const chosen = target && options.some(([v]) => v === target) ? target : ''
  const affected = scope === 'category' ? products.filter((p) => p.category === chosen) : products.filter((p) => p.slug === chosen)
  const pct = Math.round(Number(percent))
  const valid = chosen && Number.isFinite(pct) && pct >= 0 && pct <= 90

  async function apply(value) {
    const what = scope === 'category' ? `bu kategorideki ${affected.length} ürüne` : 'bu ürüne'
    if (!confirmDo(value === 0 ? `Seçili ${scope === 'category' ? 'kategorideki' : 'ürünün'} indirimi kaldırılsın mı?` : `%${value} indirim ${what} uygulansın mı?`)) return
    setBusy(true)
    try {
      const r = await admin.applyDiscount(scope, chosen, value)
      push(`${r.updated} ürün güncellendi${r.skipped ? ` (${r.skipped} ürün atlandı: teklifli veya çok düşük fiyat)` : ''}`)
      reload()
    } catch (e) {
      push(e.message, 'err')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      {toast}
      <Card title="Ödeme Dönemine Göre İndirimler">
        <p className="text-[13px] text-vx-muted mb-4">Toplu ödeme yapan müşterilere uygulanacak oranları buradan belirleyin. Bu oranlar aylık fiyat üzerinden seçilen toplam süreye uygulanır. 0 girilen dönemlerde indirim uygulanmaz.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
          {[[1, 'Aylık'], [3, '3 Aylık'], [6, '6 Aylık'], [12, 'Yıllık']].map(([m, label]) => <TextField key={m} label={`${label} indirimi (%)`} type="number" value={termRates[m]} onChange={(v) => setTermRates((x) => ({ ...x, [m]: v }))} max={5} hint="0–90 arası" />)}
        </div>
        <div className="mt-4 flex justify-end"><Btn disabled={!termLoaded || termBusy || [1,3,6,12].some((m) => !Number.isFinite(Number(termRates[m])) || Number(termRates[m]) < 0 || Number(termRates[m]) > 90)} onClick={async () => { setTermBusy(true); try { const r = await admin.saveTermDiscounts(Object.fromEntries([1,3,6,12].map((m) => [m, Number(termRates[m])]))); setTermRates(Object.fromEntries([1,3,6,12].map((m) => [m, String(r.discounts[m])]))); push('Ödeme dönemi indirimleri kaydedildi.') } catch (e) { push(e.message, 'err') } finally { setTermBusy(false) } }}>{termBusy ? 'Kaydediliyor…' : 'Dönem İndirimlerini Kaydet'}</Btn></div>
      </Card>

      <Card title="İndirim Uygula">
        {error && <p className="text-rose-400 text-[13px] mb-3">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <SelectField label="Nereye uygulansın?" value={scope} onChange={(v) => { setScope(v); setTarget('') }} options={[['category', 'Bir kategoriye'], ['product', 'Tek bir ürüne']]} />
          <SelectField label={scope === 'category' ? 'Kategori' : 'Ürün'} value={chosen} onChange={setTarget} options={[['', 'Seçin…'], ...options]} />
          <TextField label="İndirim oranı (%)" type="number" value={percent} onChange={setPercent} max={2} hint="1–90 arası. 0 = indirimi kaldır." />
          <div className="flex gap-2">
            <Btn disabled={!valid || busy || pct === 0} onClick={() => apply(pct)}>Uygula</Btn>
            <Btn variant="danger" disabled={!chosen || busy} onClick={() => apply(0)}>İndirimi Kaldır</Btn>
          </div>
        </div>
        <p className="mt-3 text-[12px] text-vx-muted">Mevcut fiyat “eski fiyat” olarak üstü çizili gösterilir, satış fiyatı seçilen orana göre düşer. Aynı ürüne tekrar uygularsanız oran ilk (eski) fiyat üzerinden hesaplanır. Teklif usulü (fiyatsız) ürünler atlanır. Her işlem “İşlem Kayıtları”na yazılır.</p>
      </Card>

      <Card title={chosen ? `Etkilenecek ürünler (${affected.length})` : 'Tüm ürünler ve indirim durumu'}>
        {loading && !data ? <Empty>Yükleniyor…</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead><tr className="text-left text-vx-muted"><th className="py-2 pr-3 font-medium">Ürün</th><th className="py-2 pr-3 font-medium">Kategori</th><th className="py-2 pr-3 font-medium text-right">Satış fiyatı</th><th className="py-2 font-medium text-right">İndirim</th></tr></thead>
              <tbody>
                {(chosen ? affected : products).map((p) => {
                  const s = discountInfo(p)
                  return (
                    <tr key={p.slug} className="border-t border-vx-line">
                      <td className="py-2.5 pr-3 text-white">{p.name}</td>
                      <td className="py-2.5 pr-3 text-zinc-300">{(categories.find((c) => c.id === p.category) || {}).name || p.category}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-white">{p.price == null ? 'Teklif' : formatPrice(p.price)}{s && <span className="ml-2 text-zinc-500 line-through">{formatPrice(s.old)}</span>}</td>
                      <td className="py-2.5 text-right">{s ? <Badge tone="red">%{s.pct}</Badge> : <span className="text-vx-muted">—</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
