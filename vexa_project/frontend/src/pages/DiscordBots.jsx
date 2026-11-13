import { useMemo, useState } from 'react'
import { Check, Minus } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import ProductCard from '../components/ProductCard.jsx'
import TrustBadges from '../components/TrustBadges.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import Reviews from '../components/Reviews.jsx'
import useProducts from '../hooks/useProducts.js'
import { siteConfig } from '../config/siteConfig.js'

export default function DiscordBots() {
  const products = useProducts()
  const [filter, setFilter] = useState('Tümü')

  const bots = useMemo(() => products.filter((p) => p.category === 'discord-bot'), [products])
  const visible = filter === 'Tümü' ? bots : bots.filter((b) => b.subCategory === filter)
  // sub-categories come straight from the products, so editing a product's category in /admin updates this
  const chips = ['Tümü', ...Array.from(new Set(bots.map((b) => b.subCategory).filter(Boolean)))]
  const count = (c) => (c === 'Tümü' ? bots.length : bots.filter((b) => b.subCategory === c).length)

  return (
    <div className="space-y-10">
      <PageHeader
        title={siteConfig.seo.pages[siteConfig.routes.bots].h1}
        description="Sunucunuzun ihtiyacına göre hazırlanan, özel isim ve avatarla teslim edilen botlar."
      />

      <section>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Bot kategorileri">
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
              {c} <span className="opacity-60">({count(c)})</span>
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
          {visible.map((bot) => (
            <ProductCard key={bot.slug} product={bot} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight text-white">Özellik Karşılaştırması</h2>
        <div className="mt-5 overflow-x-auto rounded-2xl bg-vx-card border border-vx-line">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-vx-line">
                <th className="px-5 py-4 font-medium text-vx-muted">Özellik</th>
                {bots.map((b) => (
                  <th key={b.slug} className="px-3 py-4 text-center font-semibold text-white">
                    {b.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {siteConfig.botComparison.map((row) => (
                <tr key={row.label} className="border-b border-vx-line last:border-0">
                  <td className="px-5 py-3.5 text-slate-200">{row.label}</td>
                  {bots.map((b) => (
                    <td key={b.slug} className="px-3 py-3.5 text-center">
                      {row.slugs.includes(b.slug) ? (
                        <Check className="w-4 h-4 mx-auto text-vx-accent-text" aria-label="Var" />
                      ) : (
                        <Minus className="w-4 h-4 mx-auto text-slate-600" aria-label="Yok" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <TrustBadges />
      <HowItWorks />
      <Reviews />
    </div>
  )
}
