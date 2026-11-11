import { ArrowRight, ShoppingCart, Headphones } from 'lucide-react'
import Button from './Button.jsx'
import { siteConfig } from '../config/siteConfig.js'
import { scrollToHash } from '../lib/scroll.js'
import vLogo from '../assets/v-logo.png'

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden rounded-2xl bg-vx-card border border-vx-line min-h-[400px]">
      <img
        src={vLogo}
        alt=""
        aria-hidden="true"
        className="pointer-events-none hidden md:block absolute right-8 top-1/2 -translate-y-1/2 w-[44%] max-w-[540px] opacity-90"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-vx-card via-vx-card/70 to-transparent" />

      <div className="relative z-10 p-8 sm:p-10">
        <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-extrabold tracking-tight leading-[1.05] text-white">
          Vexa{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-300">Development</span>
        </h1>

        <p className="mt-5 max-w-[600px] text-xl sm:text-2xl font-semibold leading-snug text-white">
          Discord botları, web projeleri ve daha fazlası için modern ve güvenilir çözümler.
        </p>
        <p className="mt-4 max-w-[540px] text-[15px] leading-relaxed text-vx-muted">
          Hayal ettiğiniz projeleri birlikte gerçeğe dönüştürelim.
          <br />
          Güvenilir, hızlı ve profesyonel destek ile her zaman yanınızdayız.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            size="lg"
            href={siteConfig.sections.services}
            onClick={(e) => scrollToHash(e, siteConfig.sections.services)}
          >
            <ShoppingCart className="w-5 h-5" />
            Hizmetleri İncele
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
          <Button size="lg" variant="secondary" to={siteConfig.routes.contact}>
            <Headphones className="w-5 h-5" />
            Destek Al
          </Button>
        </div>
      </div>
    </section>
  )
}
