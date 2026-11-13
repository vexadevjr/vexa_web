import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Clock } from 'lucide-react'
import Button from './Button.jsx'
import useProducts from '../hooks/useProducts.js'
import { useApp } from '../context/AppContext.jsx'
import { siteConfig } from '../config/siteConfig.js'
import { priceLabel, deliveryLabel, productPath } from '../lib/format.js'

// Home page shop window: the popular products first, so a visitor sees real prices without clicking around.
export default function Featured() {
  const products = useProducts()
  const { openOrder } = useApp()
  const [tab, setTab] = useState('discord-bot')
  const picks = products.filter((p) => p.category === tab).sort((a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular))).slice(0, 3)

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Popüler Paketler</h2>
          <p className="mt-1 text-[14px] text-vx-muted">En çok tercih edilenler, net fiyatlarla.</p>
        </div>
        <div className="flex items-center gap-2">
          {[['discord-bot', 'Discord Botları'], ['web', 'Web Siteleri']].map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} className={`h-10 px-4 rounded-xl text-[13px] font-semibold border transition-colors ${tab === id ? 'bg-vx-accent border-vx-accent text-white' : 'bg-vx-card border-vx-line text-vx-muted hover:text-white'}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
        {picks.length === 0 && <p className="text-[14px] text-vx-muted">Bu kategoride şu an paket yok.</p>}
        {picks.map((p) => (
          <article key={p.slug} className={`flex flex-col p-6 rounded-2xl bg-vx-card border transition-colors hover:border-vx-accent-text/40 ${p.popular ? 'border-vx-accent/60' : 'border-vx-line'}`}>
            <div className="flex items-center gap-2">
              <span className="px-2.5 h-6 inline-flex items-center rounded-md bg-vx-surface border border-vx-line text-[11px] font-medium text-vx-accent-soft">{p.subCategory || 'Hizmet'}</span>
              {p.popular && <span className="px-2.5 h-6 inline-flex items-center rounded-md bg-vx-accent text-[11px] font-semibold text-white">Popüler</span>}
            </div>
            <h3 className="mt-4 text-[19px] font-semibold text-white">{p.name}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-vx-muted">{p.tagline}</p>
            <ul className="mt-4 space-y-2">
              {(p.features || []).slice(0, 3).map((f) => (
                <li key={f} className="flex items-start gap-2 text-[13px] text-zinc-100">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-vx-accent-text" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <div className="flex items-end justify-between border-t border-vx-line pt-4">
                <div>
                  <div className="text-2xl font-black tracking-tight text-white">{priceLabel(p)}</div>
                  <div className="text-[12px] text-vx-muted">{p.period}</div>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-vx-muted"><Clock className="w-4 h-4" /> {deliveryLabel(p)}</div>
              </div>
              <div className="mt-4 flex gap-3">
                {p.price == null ? (
                  <Button size="sm" to={`${siteConfig.routes.contact}?konu=${encodeURIComponent(p.name)}`} className="flex-1">Teklif İste</Button>
                ) : (
                  <Button size="sm" onClick={() => openOrder(p)} className="flex-1">Sipariş Ver</Button>
                )}
                <Button size="sm" variant="secondary" to={productPath(p)}>Detay</Button>
              </div>
            </div>
          </article>
        ))}
      </div>
          <div className="mt-5 text-center">
        <Link to={tab === 'web' ? siteConfig.routes.web : siteConfig.routes.bots} className="inline-flex items-center gap-2 text-[14px] font-semibold text-vx-accent-text hover:text-vx-accent-soft">
          Tüm {tab === 'web' ? 'web paketlerini' : 'botları'} gör <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}
