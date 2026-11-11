import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { siteConfig } from '../config/siteConfig.js'

let cache = null

// Starts with the catalog from siteConfig (no loading flash), then swaps in the API/database copy.
export default function useProducts() {
  const [products, setProducts] = useState(cache || siteConfig.catalog)

  useEffect(() => {
    if (cache) return undefined
    let alive = true
    api
      .products()
      .then((data) => {
        if (alive && Array.isArray(data.products) && data.products.length) {
          cache = data.products
          setProducts(data.products)
        }
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  return products
}
