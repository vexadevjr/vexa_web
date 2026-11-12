import Hero from '../components/Hero.jsx'
import ServiceCards from '../components/ServiceCards.jsx'
import Featured from '../components/Featured.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import HomeReviews from '../components/HomeReviews.jsx'
import StatsSection from '../components/StatsSection.jsx'

export default function Home() {
  return (
    <div className="space-y-10">
      <Hero />
      <ServiceCards />
      <Featured />
      <HowItWorks />
      <HomeReviews />
      <StatsSection />
    </div>
  )
}
