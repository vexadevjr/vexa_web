import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { siteConfig } from '../config/siteConfig.js'
import useProducts from '../hooks/useProducts.js'
import { useSite } from '../context/SiteContext.jsx'

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
  const products = useProducts()
  const { categories } = useSite()
  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/'
    const pm = path.match(/^\/urunler\/([a-z0-9-]+)$/)
    const prod = pm ? products.find((x) => x.slug === pm[1]) : null
    const cat = categories.find((c) => c.path === path)
    const page = cat
      ? { title: cat.seoTitle || `${cat.name} | Vexstar`, description: cat.seoDescription || cat.description }
      : prod
      ? { title: prod.metaTitle || `${prod.name} | Vexstar`, description: prod.metaDescription || `${prod.tagline || ''} ${prod.description || ''}`.trim().slice(0, 160) }
      : seo.pages[path]
    const noindex = !page || NOINDEX.some((p) => path === p || path.startsWith(`${p}/`))
    const title = page ? page.title : path.startsWith('/hesap') || path === '/panel' ? 'Hesabım | Vexstar' : 'Sayfa bulunamadı | Vexstar'
    const desc = page ? page.description : seo.pages['/'].description
    const url = `${seo.siteUrl}${path === '/' ? '/' : path}`

    document.title = title
    meta('description', desc)
    meta('robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
    setTag('link[rel="canonical"]', { tag: 'link', attrs: { rel: 'canonical' } }, 'href', url)
    prop('og:title', title)
    prop('og:description', desc)
    prop('og:url', url)
    meta('twitter:title', title)
    meta('twitter:description', desc)
  }, [pathname, products, categories])
  return null
}
