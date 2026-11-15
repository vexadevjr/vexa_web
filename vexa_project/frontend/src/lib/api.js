const BASE = `${import.meta.env.VITE_API_URL || ''}/api`
const TOKEN_KEY = 'vexstar_token'

export const tokenStore = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch (e) {
      return null
    }
  },
  set(token) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token)
      else localStorage.removeItem(TOKEN_KEY)
    } catch (e) {
      /* storage unavailable */
    }
  },
}

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.status = status
    this.errors = errors || {}
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  const token = tokenStore.get()
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  } catch (e) {
    throw new ApiError('Sunucuya ulaşılamadı. Lütfen daha sonra tekrar deneyin.', 0)
  }

  let data = null
  try {
    data = await res.json()
  } catch (e) {
    /* empty or non-JSON body */
  }
  if (!res.ok) throw new ApiError((data && data.message) || 'Bir hata oluştu.', res.status, data && data.errors)
  return data
}

export const api = {
  products: () => request('/products'),
  content: () => request('/content'),
  stats: () => request('/stats'),
  reviews: () => request('/reviews'),
  myReview: () => request('/reviews/mine'),
  postReview: (payload) => request('/reviews', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  exchange: (code) => request('/auth/exchange', { method: 'POST', body: { code } }),
  me: () => request('/auth/me'),
  updateProfile: (payload) => request('/auth/profile', { method: 'PATCH', body: payload }),
  changePassword: (payload) => request('/auth/password', { method: 'POST', body: payload }),
  deleteAccount: (payload) => request('/auth/account/delete', { method: 'POST', body: payload }),
  createOrder: (payload) => request('/orders', { method: 'POST', body: payload }),
  myOrders: () => request('/orders/mine'),
  contact: (payload) => request('/contact', { method: 'POST', body: payload }),
  myTickets: () => request('/contact/mine'),
  lookupTicket: (payload) => request('/contact/lookup', { method: 'POST', body: payload }),
  replyTicket: (payload) => request('/contact/reply', { method: 'POST', body: payload }),
  readTicket: (ticketNo) => request('/contact/read', { method: 'POST', body: { ticketNo } }),
  // visit counter: fire and forget, never throws
  track(path) {
    try {
      fetch(`${BASE}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
        keepalive: true,
      }).catch(() => {})
    } catch (e) {
      /* ignore */
    }
  },
}
