import Hero from '../components/Hero.jsx'
import Solutions from '../components/Solutions.jsx'
import Featured from '../components/Featured.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import WhyUs from '../components/WhyUs.jsx'
import HomeReviews from '../components/HomeReviews.jsx'
import Faq from '../components/Faq.jsx'
import FinalCta from '../components/FinalCta.jsx'

export default function Home() {
  return (
    <div className="space-y-12">
      <Hero />
      <Solutions />
      <Featured />
      <HowItWorks />
      <WhyUs />
      <HomeReviews />
      <Faq />
      <FinalCta />
    </div>
  )
}
