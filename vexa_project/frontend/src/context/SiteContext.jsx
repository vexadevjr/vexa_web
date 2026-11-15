import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api.js'
import { siteConfig } from '../config/siteConfig.js'
import { readCache, writeCache } from '../lib/consent.js'

// siteConfig.js holds the defaults; anything edited in the admin panel (/admin) is loaded from the
// API and layered on top. `ready` stays false until the real data is here (or cached from the last
// visit), so the page never flashes the default content first.
const SiteContext = createContext({ ...siteConfig, products: siteConfig.catalog, ready: true })

export const useSite = () => useContext(SiteContext)

export function SiteProvider({ children }) {
  const cached = useState(() => readCache())[0]
  const [content, setContent] = useState((cached && cached.content) || {})
  const [products, setProducts] = useState((cached && cached.products) || null)
  const [ready, setReady] = useState(Boolean(cached))

  useEffect(() => {
    let alive = true
    const timer = setTimeout(() => alive && setReady(true), 3000) // never block the site on a slow API
    Promise.allSettled([api.content(), api.products()]).then(([c, p]) => {
      if (!alive) return
      const nextContent = c.status === 'fulfilled' && c.value && c.value.content ? c.value.content : null
      const nextProducts = p.status === 'fulfilled' && p.value && Array.isArray(p.value.products) && p.value.products.length ? p.value.products : null
      if (nextContent) setContent(nextContent)
      if (nextProducts) setProducts(nextProducts)
      if (nextContent || nextProducts) writeCache({ content: nextContent || content, products: nextProducts || products })
      setReady(true)
    })
    return () => {
      alive = false
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const site = useMemo(
    () => ({
      ...siteConfig,
      ...content,
      contact: { ...siteConfig.contact, ...(content.contact || {}) },
      links: { ...siteConfig.links, ...(content.links || {}) },
      products: products || siteConfig.catalog,
      ready,
    }),
    [content, products, ready]
  )

  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>
}
