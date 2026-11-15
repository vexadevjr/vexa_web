import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import PageHeader from './PageHeader.jsx'
import { siteConfig } from '../config/siteConfig.js'

const { routes } = siteConfig
const DOCS = [
  { to: routes.privacy, label: 'Gizlilik Politikası' },
  { to: routes.terms, label: 'Kullanım Şartları' },
  { to: routes.cookies, label: 'Çerez Politikası' },
]

export const P = ({ children }) => <p>{children}</p>
export const Ul = ({ items }) => (
  <ul className="list-disc pl-5 space-y-1.5 marker:text-vx-accent-text">
    {items.map((i) => (
      <li key={i}>{i}</li>
    ))}
  </ul>
)

// Shared layout for legal pages: numbered sections on the left, a sticky table of contents on the right.
export default function LegalDoc({ path, updated = 'Son güncelleme: 14 Kasım 2026', sections }) {
  const page = siteConfig.seo.pages[path]
  return (
    <div className="space-y-8">
      <PageHeader title={page.h1} description={updated} />
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-8 items-start">
        <div className="space-y-5 min-w-0">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-6 rounded-2xl bg-vx-card border border-vx-line p-6 sm:p-8">
              <h2 className="text-xl font-bold tracking-tight text-white">
                <span className="text-vx-accent-text mr-2">{i + 1}.</span>
                {s.title}
              </h2>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-vx-muted">{s.content}</div>
            </section>
          ))}
        </div>
        <aside className="lg:sticky lg:top-6 space-y-4 !bg-transparent !backdrop-blur-none" style={{ position: undefined }}>
          <nav aria-label="Bu sayfada" className="rounded-2xl bg-vx-card border border-vx-line p-5">
            <div className="vx-eyebrow">Bu sayfada</div>
            <ol className="space-y-2 text-[13px]">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="flex gap-2 text-vx-muted hover:text-white transition-colors">
                    <span className="text-vx-accent-text">{i + 1}.</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <nav aria-label="Diğer yasal belgeler" className="rounded-2xl bg-vx-card border border-vx-line p-5">
            <div className="vx-eyebrow">Yasal belgeler</div>
            <ul className="space-y-2 text-[13px]">
              {DOCS.filter((d) => d.to !== path).map((d) => (
                <li key={d.to}>
                  <Link to={d.to} className="inline-flex items-center gap-2 text-vx-muted hover:text-white transition-colors">
                    {d.label} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  )
}
