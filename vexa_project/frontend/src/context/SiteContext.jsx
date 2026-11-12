import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api.js'
import { siteConfig } from '../config/siteConfig.js'

// siteConfig.js holds the defaults; anything edited in the admin panel (/admin) is loaded from the
// API and layered on top, so content changes go live without a new deploy.
const SiteContext = createContext(siteConfig)

export const useSite = () => useContext(SiteContext)

export function SiteProvider({ children }) {
  const [content, setContent] = useState({})

  useEffect(() => {
    let alive = true
    api
      .content()
      .then((d) => alive && d && d.content && setContent(d.content))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const site = useMemo(
    () => ({
      ...siteConfig,
      ...content,
      contact: { ...siteConfig.contact, ...(content.contact || {}) },
      links: { ...siteConfig.links, ...(content.links || {}) },
    }),
    [content]
  )

  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>
}
