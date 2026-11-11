import { ArrowRight, ShoppingCart, Headphones } from 'lucide-react'
import CtaFx from './CtaFx.jsx'
import { siteConfig } from '../config/siteConfig.js'
import { scrollToHash, external } from '../lib/scroll.js'
import { cta } from './styles.js'
import vLogo from '../assets/v-logo.png'

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#131422] border border-purple-950/40 min-h-[400px]">
      <img
        src={vLogo}
        alt=""
        aria-hidden="true"
        className="pointer-events-none hidden md:block absolute right-8 top-1/2 -translate-y-1/2 w-[44%] max-w-[540px] opacity-90"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#131422] via-[#131422]/70 to-transparent" />

      <div className="relative z-10 p-8 sm:p-10">

        <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-extrabold tracking-tight leading-[1.05] text-white">
          Vexa{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-300">Development</span>
        </h1>

        <p className="mt-5 max-w-[600px] text-xl sm:text-2xl font-semibold leading-snug text-white">
          Discord botları, web projeleri ve daha fazlası için modern ve güvenilir çözümler.
        </p>
        <p className="mt-4 max-w-[540px] text-[15px] leading-relaxed text-slate-400">
          Hayal ettiğiniz projeleri birlikte gerçeğe dönüştürelim.
          <br />
          Güvenilir, hızlı ve profesyonel destek ile her zaman yanınızdayız.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={siteConfig.sections.services}
            onClick={(e) => scrollToHash(e, siteConfig.sections.services)}
            className={`${cta} h-[52px] px-6 text-[15px]`}
          >
            <CtaFx />
            <ShoppingCart className="w-5 h-5" />
            Hizmetleri İncele
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          <a href={siteConfig.links.support} {...external} className="group flex items-center gap-3 h-[52px] px-6 rounded-xl font-semibold text-[15px] text-white border border-indigo-900/60 hover:bg-[#131422] hover:border-indigo-700/60 hover:-translate-y-0.5 transition-all duration-300">
            <Headphones className="w-5 h-5" />
            Destek Al
          </a>
        </div>
      </div>
    </section>
  )
}
