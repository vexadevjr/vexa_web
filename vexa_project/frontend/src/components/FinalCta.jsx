import { ArrowRight, MessageSquare } from 'lucide-react'
import { DiscordIcon } from './Icons.jsx'
import Button from './Button.jsx'
import { useSite } from '../context/SiteContext.jsx'
import { siteConfig } from '../config/siteConfig.js'
import { external } from '../lib/scroll.js'

export default function FinalCta() {
  const { links } = useSite()
  return (
    <section className="relative overflow-hidden rounded-3xl border border-vx-accent/40 bg-gradient-to-r from-vx-accent/25 to-vx-card p-8 sm:p-12 text-center">
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Projenizi birlikte hayata geçirelim</h2>
      <p className="mt-3 mx-auto max-w-[560px] text-[15px] text-slate-300">İhtiyacınızı anlatın, size uygun paketi veya özel teklifi aynı gün içinde iletelim.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button size="lg" to={`${siteConfig.routes.contact}?konu=Fiyat%20Teklifi`}><MessageSquare className="w-5 h-5" /> Ücretsiz Teklif Al <ArrowRight className="w-4 h-4" /></Button>
        {links.discord && <Button size="lg" variant="secondary" href={links.discord} external><DiscordIcon className="w-5 h-5" /> Discord'a Katıl</Button>}
      </div>
    </section>
  )
}
