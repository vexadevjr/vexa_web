const BASE = `${import.meta.env.VITE_API_URL || ''}/api`
const TOKEN_KEY = 'vexa_token'

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
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  me: () => request('/auth/me'),
  createOrder: (payload) => request('/orders', { method: 'POST', body: payload }),
  myOrders: () => request('/orders/mine'),
  contact: (payload) => request('/contact', { method: 'POST', body: payload }),
}
