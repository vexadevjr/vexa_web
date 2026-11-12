// Admin API client. The session lives in an httpOnly cookie (JavaScript cannot read it), and every
// request carries a custom header that cross-site pages cannot send (CSRF protection).
const BASE = `${import.meta.env.VITE_API_URL || ''}/api/admin`

export class AdminError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function call(method, path, body) {
  let res
  try {
    res = await fetch(BASE + path, {
      method,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-VX-Admin': '1' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (e) {
    throw new AdminError('Sunucuya ulaşılamadı.', 0)
  }
  let data = null
  try {
    data = await res.json()
  } catch (e) {
    /* empty body */
  }
  if (!res.ok) throw new AdminError((data && data.message) || 'Bir hata oluştu.', res.status)
  return data
}

const qs = (o = {}) => {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(o)) if (v !== undefined && v !== '' && v !== null) p.set(k, v)
  const s = p.toString()
  return s ? `?${s}` : ''
}

export const admin = {
  config: () => call('GET', '/config'),
  login: (payload) => call('POST', '/login', payload),
  logout: () => call('POST', '/logout', {}),
  me: () => call('GET', '/me'),
  overview: () => call('GET', '/overview'),
  analytics: (range) => call('GET', `/analytics${qs({ range })}`),
  visitors: (params) => call('GET', `/visitors${qs(params)}`),
  products: () => call('GET', '/products'),
  createProduct: (p) => call('POST', '/products', p),
  updateProduct: (slug, p) => call('PUT', `/products/${encodeURIComponent(slug)}`, p),
  deleteProduct: (slug) => call('DELETE', `/products/${encodeURIComponent(slug)}`),
  reorderProducts: (category, order) => call('POST', '/products-reorder', { category, order }),
  renameSub: (payload) => call('POST', '/products-rename-sub', payload),
  content: () => call('GET', '/content'),
  saveContent: (key, value) => call('PUT', `/content/${key}`, { value }),
  resetContent: (key) => call('DELETE', `/content/${key}`),
  tickets: (params) => call('GET', `/tickets${qs(params)}`),
  ticket: (no) => call('GET', `/tickets/${encodeURIComponent(no)}`),
  replyTicket: (no, text) => call('POST', `/tickets/${encodeURIComponent(no)}/reply`, { text }),
  setTicketStatus: (no, status) => call('PATCH', `/tickets/${encodeURIComponent(no)}`, { status }),
  deleteTicket: (no) => call('DELETE', `/tickets/${encodeURIComponent(no)}`),
  orders: (params) => call('GET', `/orders${qs(params)}`),
  setOrderStatus: (no, status) => call('PATCH', `/orders/${encodeURIComponent(no)}`, { status }),
  reviews: (status) => call('GET', `/reviews${qs({ status })}`),
  setReviewStatus: (id, status) => call('PATCH', `/reviews/${id}`, { status }),
  deleteReview: (id) => call('DELETE', `/reviews/${id}`),
  users: (params) => call('GET', `/users${qs(params)}`),
}
