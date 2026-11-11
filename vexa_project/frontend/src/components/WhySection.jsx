import { ShieldCheck, Zap, Headphones, Star, ArrowRight } from 'lucide-react'
import CtaFx from './CtaFx.jsx'
import { siteConfig } from '../config/siteConfig.js'
import { scrollToHash } from '../lib/scroll.js'
import { cta } from './styles.js'

const points = [
  { label: 'Güvenli ve Stabil Altyapı', icon: ShieldCheck },
  { label: 'Hızlı Teslimat', icon: Zap },
  { label: '7/24 Destek', icon: Headphones },
  { label: 'Uygun Fiyat', icon: Star },
]

export default function WhySection() {
  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-[1.25fr_1fr] gap-10 p-8 rounded-2xl bg-[#131422] border border-purple-950/40">
      <div>
        <div className="text-[15px] font-semibold text-indigo-300">Neden Vexa Development?</div>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">Güvenilir Teknoloji Ortağınız</h2>
        <p className="mt-4 text-[14px] leading-relaxed text-slate-400 max-w-[470px]">
          Yılların deneyimi, profesyonel ekibimiz ve müşteri odaklı hizmet anlayışımızla projelerinizi bir üst seviyeye taşıyoruz.
        </p>
        <a
          href={siteConfig.sections.contact}
          onClick={(e) => scrollToHash(e, siteConfig.sections.contact)}
          className={`${cta} mt-7 h-11 px-5 text-[14px]`}
        >
          <CtaFx />
          Daha Fazla Bilgi
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>

      <ul className="flex flex-col justify-center gap-6">
        {points.map(({ label, icon: Icon }) => (
          <li key={label} className="flex items-center gap-4 text-[14px] text-white">
            <Icon className="w-6 h-6 shrink-0 text-indigo-400" strokeWidth={1.8} />
            {label}
          </li>
        ))}
      </ul>
    </div>
  )
}
