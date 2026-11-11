import { Code2, Server, Settings, ArrowRight } from 'lucide-react'
import { DiscordIcon } from './Icons.jsx'

const services = [
  { title: 'Discord Botları', icon: DiscordIcon, desc: 'Sunucunuz için gelişmiş, güvenli ve özelleştirilebilir botlar.' },
  { title: 'Web Geliştirme', icon: Code2, desc: 'Modern ve performanslı web siteleri ile projelerinizi büyütün.' },
  { title: 'Sunucu Çözümleri', icon: Server, desc: 'Sunucu, hosting ve altyapı desteği ile kesintisiz hizmet.' },
  { title: 'Özel Yazılım', icon: Settings, desc: 'İhtiyacınıza özel yazılım çözümleri geliştiriyoruz.' },
]

export default function ServiceCards() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
      {services.map(({ title, icon: Icon, desc }) => (
        <article
          key={title}
          className="group h-full min-h-[190px] flex flex-col p-6 rounded-2xl bg-[#131422] border border-purple-950/40 transition-colors hover:border-indigo-900/80"
        >
          <div className="flex gap-4">
            <Icon className="w-9 h-9 shrink-0 text-indigo-400" strokeWidth={2} />
            <div className="min-w-0">
              <h3 className="text-[17px] font-semibold text-white">{title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{desc}</p>
            </div>
          </div>

          <div className="mt-auto pt-6 flex items-center justify-between">
            <a href="#" className="flex items-center gap-2 text-[14px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              İncele
              <ArrowRight className="w-4 h-4" />
            </a>
            <span className="grid place-items-center shrink-0 w-9 h-9 rounded-full bg-[#0c0d14] border border-purple-950/60 text-white group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </article>
      ))}
    </section>
  )
}
