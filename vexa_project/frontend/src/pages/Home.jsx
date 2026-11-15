import Hero from '../components/Hero.jsx'
import Solutions from '../components/Solutions.jsx'
import Featured from '../components/Featured.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import WhyUs from '../components/WhyUs.jsx'
import HomeReviews from '../components/HomeReviews.jsx'
import Faq from '../components/Faq.jsx'
import FinalCta from '../components/FinalCta.jsx'
import Reveal from '../components/Reveal.jsx'

export default function Home() {
  return (
    <div className="space-y-14 sm:space-y-20">
      <Hero />
      <Reveal><Solutions /></Reveal>
      <Reveal><Featured /></Reveal>
      <Reveal><HowItWorks /></Reveal>
      <Reveal><WhyUs /></Reveal>
      <Reveal><HomeReviews /></Reveal>
      <Reveal><Faq /></Reveal>
      <Reveal><FinalCta /></Reveal>
    </div>
  )
}
