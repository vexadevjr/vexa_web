import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api.js'

// Real numbers computed on the server from orders, customers and approved reviews.
export function useStats() {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    let alive = true
    api
      .stats()
      .then((d) => alive && setStats(d))
      .catch(() => alive && setStats({ available: false }))
    return () => {
      alive = false
    }
  }, [])
  return stats
}

export function useReviews() {
  const [state, setState] = useState({ loading: true, reviews: [], stats: null })
  const load = useCallback(() => {
    api
      .reviews()
      .then((d) => setState({ loading: false, reviews: d.reviews || [], stats: d.stats || null }))
      .catch(() => setState({ loading: false, reviews: [], stats: null }))
  }, [])
  useEffect(() => {
    load()
  }, [load])
  return { ...state, reload: load }
}

// Average stars and review count per product, loaded once and shared by every card on the page.
let ratingsPromise = null
export function useRatings() {
  const [ratings, setRatings] = useState({ bySlug: {}, byName: {} })
  useEffect(() => {
    let alive = true
    if (!ratingsPromise) ratingsPromise = api.ratings().catch(() => ({ bySlug: {}, byName: {} }))
    ratingsPromise.then((d) => alive && setRatings({ bySlug: d.bySlug || {}, byName: d.byName || {} }))
    return () => {
      alive = false
    }
  }, [])
  return ratings
}
export const ratingOf = (ratings, p) => ratings.bySlug[p.slug] || ratings.byName[p.name] || null

// Reviews of one product (approved only)
export function useProductReviews(slug) {
  const [state, setState] = useState({ loading: true, reviews: [] })
  const load = useCallback(() => {
    api
      .reviews(slug)
      .then((d) => setState({ loading: false, reviews: d.reviews || [] }))
      .catch(() => setState({ loading: false, reviews: [] }))
  }, [slug])
  useEffect(() => {
    load()
  }, [load])
  return { ...state, reload: load }
}

// Member / online numbers of the Discord community, read from Discord by the server
export function useDiscordStats() {
  const [d, setD] = useState(null)
  useEffect(() => {
    let alive = true
    api
      .discordStats()
      .then((x) => alive && setD(x))
      .catch(() => alive && setD({ available: false }))
    return () => {
      alive = false
    }
  }, [])
  return d
}

// number that counts up once when it appears
export function useCountUp(target, ms = 900) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!target) return undefined
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setV(target)
      return undefined
    }
    let raf
    const t0 = performance.now()
    const step = (t) => {
      const p = Math.min(1, (t - t0) / ms)
      setV(Math.round(target * (1 - (1 - p) ** 3)))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}
