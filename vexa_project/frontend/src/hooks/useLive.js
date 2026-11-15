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
