import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import Button from '../components/Button.jsx'
import { useApp } from '../context/AppContext.jsx'
import { api } from '../lib/api.js'
import { siteConfig } from '../config/siteConfig.js'
import { formatPrice, dateLabel } from '../lib/format.js'

const STATUS = {
  yeni: 'Yeni',
  onaylandi: 'Onaylandı',
  hazirlaniyor: 'Hazırlanıyor',
  'teslim-edildi': 'Teslim edildi',
  iptal: 'İptal',
}

export default function Panel() {
  const { user, logout, openAuth } = useApp()
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    let alive = true
    api
      .myOrders()
      .then((d) => alive && setOrders(d.orders))
      .catch((e) => alive && setError(e.message))
    return () => {
      alive = false
    }
  }, [user])

  if (!user) {
    return (
      <div className="space-y-6">
        <PageHeader title="Müşteri Paneli" description="Siparişlerinizi görmek için giriş yapın veya hesap oluşturun." />
        <div className="flex gap-3">
          <Button onClick={() => openAuth('login')}>Giriş Yap</Button>
          <Button variant="secondary" onClick={() => openAuth('register')}>
            Kayıt Ol
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Müşteri Paneli" description={`${user.name} · ${user.email}`} />

      <section className="rounded-2xl bg-vx-card border border-vx-line overflow-hidden">
        <div className="px-6 py-4 border-b border-vx-line text-[15px] font-semibold text-white">Siparişlerim</div>
        {error && <p className="px-6 py-5 text-[13px] text-rose-400">{error}</p>}
        {!error && orders === null && <p className="px-6 py-5 text-[13px] text-vx-muted">Yükleniyor…</p>}
        {orders && orders.length === 0 && (
          <div className="px-6 py-8">
            <p className="text-[14px] text-vx-muted">Henüz siparişiniz yok.</p>
            <Button size="sm" to={siteConfig.routes.bots} className="mt-4">
              Botlara göz at
            </Button>
          </div>
        )}
        {orders && orders.length > 0 && (
          <ul className="divide-y divide-vx-line">
            {orders.map((o) => (
              <li key={o.orderNo} className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[14px] font-semibold text-white">{o.productName}</div>
                  <div className="text-[12px] text-vx-muted">
                    {o.orderNo} · {dateLabel(o.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-2.5 h-6 inline-flex items-center rounded-md bg-vx-surface border border-vx-line text-[11px] font-medium text-vx-accent-soft">
                    {STATUS[o.status] || o.status}
                  </span>
                  <span className="text-[14px] font-bold text-white">{formatPrice(o.price)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Button variant="secondary" size="sm" onClick={logout}>
        <LogOut className="w-4 h-4" /> Çıkış Yap
      </Button>
    </div>
  )
}
