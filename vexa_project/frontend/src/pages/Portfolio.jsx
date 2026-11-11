import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Button from '../components/Button.jsx'
import Reviews from '../components/Reviews.jsx'
import { StatsGrid } from '../components/StatsSection.jsx'
import { siteConfig } from '../config/siteConfig.js'

export default function Portfolio() {
  const [filter, setFilter] = useState('Tümü')
  const chips = ['Tümü', ...siteConfig.portfolioCategories]
  const items = filter === 'Tümü' ? siteConfig.portfolio : siteConfig.portfolio.filter((p) => p.category === filter)

  return (
    <div className="space-y-10">
      <PageHeader title="Portföy" description="Tamamladığımız projelerden seçmeler. Her proje için hedef, sonuç ve müşteri memnuniyeti puanını paylaşıyoruz." />

      <StatsGrid />

      <section>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Proje kategorileri">
          {chips.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={filter === c}
              onClick={() => setFilter(c)}
              className={`h-10 px-4 rounded-xl text-[13px] font-semibold border transition-colors ${
                filter === c ? 'bg-vx-accent border-vx-accent text-white' : 'bg-vx-card border-vx-line text-vx-muted hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
          {items.map((p) => (
            <article key={p.id} className="flex flex-col h-full p-6 rounded-2xl bg-vx-card border border-vx-line hover:border-vx-accent-text/40 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <span className="px-2.5 h-6 inline-flex items-center rounded-md bg-vx-surface border border-vx-line text-[11px] font-medium text-vx-accent-soft">{p.category}</span>
                {p.sample && <span className="text-[11px] text-slate-500">Örnek içerik</span>}
              </div>
              <h3 className="mt-4 text-[18px] font-semibold text-white">{p.title}</h3>
              <div className="mt-1 text-[13px] text-vx-muted">{p.client}</div>
              <p className="mt-4 text-[14px] leading-relaxed text-slate-200">{p.result}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span key={t} className="px-2.5 h-6 inline-flex items-center rounded-md border border-vx-line text-[11px] text-vx-muted">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-auto pt-5">
                <div className="flex items-center justify-between border-t border-vx-line pt-4 text-[13px]">
                  <span className="text-vx-muted">Müşteri memnuniyeti</span>
                  <span className="font-bold text-white">%{p.satisfaction}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Reviews />

      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-6 rounded-2xl bg-vx-card border border-vx-line">
        <div>
          <h2 className="text-lg font-semibold text-white">Sıradaki proje sizinki olsun</h2>
          <p className="mt-1 text-[14px] text-vx-muted">Fikrinizi anlatın, size kapsam ve fiyat teklifi hazırlayalım.</p>
        </div>
        <Button to={siteConfig.routes.contact}>İletişime Geç</Button>
      </section>
    </div>
  )
}
