import { Bot, Globe, ArrowRight, Check } from 'lucide-react'
import Button from './Button.jsx'
import useProducts from '../hooks/useProducts.js'
import { siteConfig } from '../config/siteConfig.js'
import { formatPrice } from '../lib/format.js'

const BLOCKS = [
  {
    category: 'discord-bot',
    icon: Bot,
    title: 'Discord Botları',
    text: 'Moderasyon, ekonomi, müzik, ticket ve size özel komutlar. Sunucunuza göre ayarlanmış, 7/24 çalışan botlar.',
    bullets: ['Hazır paketler veya sıfırdan özel bot', 'Slash komutlar ve yönetim paneli', 'Kurulum ve kullanım desteği'],
    to: siteConfig.routes.bots,
    cta: 'Botları incele',
  },
  {
    category: 'web',
    icon: Globe,
    title: 'Web Siteleri',
    text: 'Kurumsal tanıtım sitesinden e-ticarete: mobil uyumlu, hızlı ve arama motorlarına hazır web siteleri.',
    bullets: ['Mobil uyumlu, modern tasarım', 'SEO ve hız optimizasyonu', 'Alan adı ve yayına alma desteği'],
    to: siteConfig.routes.web,
    cta: 'Paketleri incele',
  },
]

// Two big "what we sell" blocks with the lowest real price pulled from the catalog.
export default function Solutions() {
  const products = useProducts()
  const fromPrice = (cat) => {
    const prices = products.filter((p) => p.category === cat && p.price != null).map((p) => p.price)
    return prices.length ? Math.min(...prices) : null
  }

  return (
    <section id={siteConfig.sections.services.replace('#', '')} className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {BLOCKS.map(({ category, icon: Icon, title, text, bullets, to, cta }) => {
        const min = fromPrice(category)
        return (
          <div key={category} className="flex flex-col p-8 rounded-2xl bg-vx-card border border-vx-line hover:border-vx-accent-text/40 transition-colors">
            <span className="grid place-items-center w-12 h-12 rounded-xl bg-vx-accent/20 border border-vx-accent/40 text-vx-accent-soft"><Icon className="w-6 h-6" /></span>
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-white">{title}</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-vx-muted">{text}</p>
            <ul className="mt-5 space-y-2.5">
              {bullets.map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-[13px] text-slate-200"><Check className="w-4 h-4 text-vx-accent-text" /> {b}</li>
              ))}
            </ul>
            <div className="mt-auto pt-7 flex items-center justify-between gap-4">
              <div>
                {min != null && (<><div className="text-[12px] text-vx-muted">Başlangıç fiyatı</div><div className="text-2xl font-black text-white">{formatPrice(min)}</div></>)}
              </div>
              <Button to={to} size="sm">{cta} <ArrowRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )
      })}
    </section>
  )
}
