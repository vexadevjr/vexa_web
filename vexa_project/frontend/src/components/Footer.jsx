import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { DiscordIcon, GithubIcon, YoutubeIcon, XIcon } from './Icons.jsx'
import vLogo from '../assets/vexstar-logo.png'
import { siteConfig } from '../config/siteConfig.js'
import { useSite } from '../context/SiteContext.jsx'
import { openConsentSettings } from '../lib/consent.js'
import { external } from '../lib/scroll.js'

const { routes } = siteConfig

const col = (title, links) => ({ title, links })
const columns = (categories) => [
  col('Hizmetler', [...categories.map((c) => [c.name, c.path]), ['Portföy', routes.portfolio]]),
  col('Destek', [['İletişim ve Teklif', routes.contact], ['Talep Takibi', routes.contact], ['Hesabım', routes.orders]]),
  col('Yasal', [['KVKK Aydınlatma Metni', routes.kvkk], ['Gizlilik Politikası', routes.privacy], ['Kullanım Şartları', routes.terms], ['Mesafeli Satış Sözleşmesi', routes.distance], ['İptal ve İade', routes.refund], ['Çerez Politikası', routes.cookies]]),
]

const socialDefs = [
  { label: 'Discord', Icon: DiscordIcon, key: 'discord' },
  { label: 'GitHub', Icon: GithubIcon, key: 'github' },
  { label: 'YouTube', Icon: YoutubeIcon, key: 'youtube' },
  { label: 'X', Icon: XIcon, key: 'x' },
]

export default function Footer() {
  const { links, contact, categories } = useSite()
  const socials = socialDefs.filter((s) => links[s.key])

  return (
    <footer className="mt-4 rounded-3xl bg-vx-surface border border-vx-line px-6 sm:px-10 pt-10 pb-6">
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_repeat(3,1fr)] gap-10">
        <div>
          <div className="flex items-center gap-3">
            <img src={vLogo} alt="" width="44" height="40" className="w-11 h-auto" />
            <div>
              <div className="text-[16px] font-bold tracking-wide text-white">VEXSTAR</div>
              <div className="text-[10px] tracking-[0.25em] text-vx-muted">DEVELOPMENT</div>
            </div>
          </div>
          <p className="mt-4 max-w-[300px] text-[13px] leading-relaxed text-vx-muted">Discord botu ve web sitesi çözümleri: net fiyat, hızlı teslimat ve 7/24 destek.</p>
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="mt-4 inline-flex items-center gap-2 text-[13px] text-vx-accent-soft hover:text-white transition-colors">
              <Mail className="w-4 h-4" /> {contact.email}
            </a>
          )}
        </div>

        {columns(categories).map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <div className="text-[13px] font-semibold text-white">{c.title}</div>
            <ul className="mt-4 space-y-2.5">
              {c.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-[13px] text-vx-muted hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
              {c.title === 'Yasal' && (
                <li>
                  <button type="button" onClick={openConsentSettings} className="text-[13px] text-vx-muted hover:text-white transition-colors">Çerez Tercihleri</button>
                </li>
              )}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mt-10 pt-5 border-t border-vx-line flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-[12px] text-vx-muted">© 2026 Vexstar Development. Tüm hakları saklıdır.</div>
        <div className="flex items-center gap-5 text-vx-muted">
          {socials.map(({ label, Icon, key }) => (
            <a key={key} href={links[key]} {...external} aria-label={label} className="hover:text-white transition-colors"><Icon className="w-5 h-5" /></a>
          ))}
        </div>
      </div>
    </footer>
  )
}
