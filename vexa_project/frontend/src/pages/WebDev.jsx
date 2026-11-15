import PageHeader from '../components/PageHeader.jsx'
import ProductCard from '../components/ProductCard.jsx'
import TrustBadges from '../components/TrustBadges.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import Reviews from '../components/Reviews.jsx'
import Button from '../components/Button.jsx'
import useProducts from '../hooks/useProducts.js'
import { siteConfig } from '../config/siteConfig.js'

export default function WebDev() {
  const packages = useProducts().filter((p) => p.category === 'web')

  return (
    <div className="space-y-10">
      <PageHeader
        title={siteConfig.seo.pages[siteConfig.routes.web].h1}
        description="Şeffaf fiyatlar ve net teslim süreleri. Her paket, kapsamı ve teslim tarihi yazılı olarak onaylandıktan sonra başlar."
      />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {packages.map((p) => (
          <ProductCard key={p.slug} product={p} large />
        ))}
      </section>

      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-6 rounded-2xl bg-vx-card border border-vx-line">
        <div>
          <h2 className="text-lg font-semibold text-white">Farklı bir ihtiyacınız mı var?</h2>
          <p className="mt-1 text-[14px] text-vx-muted">Kapsamı birlikte belirleyelim, size özel yazılı teklif hazırlayalım.</p>
        </div>
        <Button to={`${siteConfig.routes.contact}?konu=${encodeURIComponent('Özel Web Projesi')}`}>Teklif İste</Button>
      </section>

      <TrustBadges />
      <HowItWorks />
      <Reviews />
    </div>
  )
}
