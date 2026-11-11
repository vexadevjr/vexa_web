import Hero from '../components/Hero.jsx'
import ServiceCards from '../components/ServiceCards.jsx'
import WhySection from '../components/WhySection.jsx'
import StatsSection from '../components/StatsSection.jsx'

export default function Home() {
  return (
    <div className="space-y-6">
      <Hero />
      <ServiceCards />
      <section className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-6 items-stretch">
        <WhySection />
        <StatsSection />
      </section>
    </div>
  )
}
