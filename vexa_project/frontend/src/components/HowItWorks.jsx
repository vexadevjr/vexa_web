import { siteConfig } from '../config/siteConfig.js'

export default function HowItWorks() {
  return (
    <section className="p-8 rounded-2xl bg-vx-card border border-vx-line">
      <h2 className="text-2xl font-bold tracking-tight text-white">Nasıl Çalışır?</h2>
      <p className="mt-2 text-[14px] text-vx-muted">Talepten teslime dört net adım.</p>

      <ol className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
        {siteConfig.steps.map((step, i) => (
          <li key={step.title} className="relative">
            {i < siteConfig.steps.length - 1 && (
              <span aria-hidden="true" className="hidden md:block absolute top-5 left-12 right-[-1.5rem] h-px bg-vx-line" />
            )}
            <span className="relative grid place-items-center w-10 h-10 rounded-xl bg-vx-surface border border-vx-line text-[14px] font-bold text-vx-accent-soft">
              {i + 1}
            </span>
            <h3 className="mt-4 text-[15px] font-semibold text-white">{step.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-vx-muted">{step.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
