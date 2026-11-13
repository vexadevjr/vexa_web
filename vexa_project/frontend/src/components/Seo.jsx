import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { siteConfig } from '../config/siteConfig.js'

const { seo } = siteConfig
const NOINDEX = ['/hesap', '/panel', '/admin']

function setTag(selector, create, attr, value) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement(create.tag)
    Object.entries(create.attrs).forEach(([k, v]) => el.setAttribute(k, v))
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}
const meta = (name, value) => setTag(`meta[name="${name}"]`, { tag: 'meta', attrs: { name } }, 'content', value)
const prop = (property, value) => setTag(`meta[property="${property}"]`, { tag: 'meta', attrs: { property } }, 'content', value)

// The server already sends the right tags for the first load; this keeps them correct while the visitor navigates.
export default function Seo() {
  const { pathname } = useLocation()
  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/'
    const page = seo.pages[path]
    const noindex = !page || NOINDEX.some((p) => path === p || path.startsWith(`${p}/`))
    const title = page ? page.title : path.startsWith('/hesap') || path === '/panel' ? 'Hesabım | Vexstar' : 'Sayfa bulunamadı | Vexstar'
    const desc = page ? page.description : seo.pages['/'].description
    // Preserve the canonical origin chosen by the server (SITE_URL on Render), rather than
    // overwriting it with a potentially stale build-time domain from siteConfig.js.
    const serverCanonical = document.querySelector('link[rel="canonical"]')?.href
    let canonicalOrigin = seo.siteUrl
    try { if (serverCanonical) canonicalOrigin = new URL(serverCanonical).origin } catch { /* keep configured fallback */ }
    const url = `${canonicalOrigin}${path === '/' ? '/' : path}`

    document.title = title
    meta('description', desc)
    meta('robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
    setTag('link[rel="canonical"]', { tag: 'link', attrs: { rel: 'canonical' } }, 'href', url)
    prop('og:title', title)
    prop('og:description', desc)
    prop('og:url', url)
    meta('twitter:title', title)
    meta('twitter:description', desc)
  }, [pathname])
  return null
}
