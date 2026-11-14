import { useState } from 'react'
import { ExternalLink, FolderOpen } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import Button from '../components/Button.jsx'
import Gallery from '../components/Gallery.jsx'
import Reviews from '../components/Reviews.jsx'
import { siteConfig as seoConfig } from '../config/siteConfig.js'
import { useSite } from '../context/SiteContext.jsx'

export default function Portfolio() {
  const siteConfig = useSite()
  const [filter, setFilter] = useState('Tümü')
  const all = siteConfig.portfolio
  const chips = ['Tümü', ...Array.from(new Set(all.map((p) => p.category).filter(Boolean)))]
  const items = filter === 'Tümü' ? all : all.filter((p) => p.category === filter)

  return (
    <div className="space-y-10">
      <PageHeader title={seoConfig.seo.pages[seoConfig.routes.portfolio].h1} description="Tamamladığımız Discord botu ve web sitesi projelerinden seçmeler." />

      <section>
        {all.length > 1 && chips.length > 2 && (
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Proje kategorileri">
            {chips.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={filter === c}
                onClick={() => setFilter(c)}
                className={`h-10 px-4 rounded-xl text-[13px] font-semibold border transition-colors ${filter === c ? 'bg-vx-accent border-vx-accent text-white' : 'bg-vx-card border-vx-line text-vx-muted hover:text-white'}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {all.length === 0 && (
          <div className="rounded-2xl bg-vx-card border border-vx-line p-10 text-center">
            <FolderOpen className="w-10 h-10 mx-auto text-vx-accent-text" strokeWidth={1.5} />
            <p className="mt-3 text-[16px] font-semibold text-white">Projelerimiz çok yakında burada</p>
            <p className="mt-1 text-[14px] text-vx-muted">Bu sırada ihtiyacınızı anlatın, size özel bir teklif hazırlayalım.</p>
            <Button size="sm" to={siteConfig.routes.contact} className="mt-5">Teklif İste</Button>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
          {items.map((p) => (
            <article key={p.id} className="flex flex-col h-full p-4 rounded-2xl bg-vx-card border border-vx-line hover:border-vx-accent-text/40 transition-colors">
              {(p.images || []).length > 0 ? (
                <Gallery images={p.images} alt={p.title} />
              ) : (
                <div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-vx-accent/30 to-vx-surface grid place-items-center text-3xl font-black text-white/70">{(p.title || '?').slice(0, 1)}</div>
              )}
              <div className="flex flex-col flex-1 px-2 pt-5 pb-2">
                <div className="flex items-center gap-2">
                  {p.category && <span className="px-2.5 h-6 inline-flex items-center rounded-md bg-vx-surface border border-vx-line text-[11px] font-medium text-vx-accent-soft">{p.category}</span>}
                </div>
                <h3 className="mt-3 text-[18px] font-semibold text-white">{p.title}</h3>
                {p.client && <div className="mt-1 text-[13px] text-vx-muted">{p.client}</div>}
                {p.result && <p className="mt-3 text-[14px] leading-relaxed text-zinc-100 whitespace-pre-line">{p.result}</p>}
                {(p.tags || []).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.tags.map((t) => <span key={t} className="px-2.5 h-6 inline-flex items-center rounded-md border border-vx-line text-[11px] text-vx-muted">{t}</span>)}
                  </div>
                )}
                {p.link && (
                  <a href={p.link} target="_blank" rel="noopener noreferrer nofollow" className="mt-auto pt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-vx-accent-text hover:text-white transition-colors">
                    Projeyi gör <ExternalLink className="w-4 h-4" />
                  </a>
                )}
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
