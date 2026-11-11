import Shimmer from './Shimmer.jsx'

// Primary CTA effects: the shared shimmer plus a tight ring pulse while hovered.
export default function CtaFx() {
  return (
    <>
      <Shimmer />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-indigo-300/50 opacity-0 group-hover:animate-cta-ring"
      />
    </>
  )
}
