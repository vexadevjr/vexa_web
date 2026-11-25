import { createContext, useCallback, useContext, useEffect, useMemo, useState, useRef } from 'react'
import { api, tokenStore } from '../lib/api.js'

const AppContext = createContext(null)
const USER_KEY = 'vexstar_user'
const CART_KEY = 'vexstar_cart'
function readCart() {
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
    // hizmetler adetle satılmaz: her satır tek sipariştir
    return Array.isArray(value) ? value.filter((i) => i && i.key && i.product).map((i) => ({ ...i, quantity: 1 })) : []
  } catch { return [] }
}

// the signed-in user is remembered next to the session token, so a reload shows the avatar immediately
function readUser() {
  try {
    return tokenStore.get() ? JSON.parse(localStorage.getItem(USER_KEY)) : null
  } catch (e) {
    return null
  }
}
function writeUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  } catch (e) {
    /* storage unavailable */
  }
}

export const useApp = () => useContext(AppContext)

export function AppProvider({ children }) {
  const [user, setUser] = useState(readUser)
  const [checking, setChecking] = useState(() => Boolean(tokenStore.get()) && !readUser())
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState('login')
  const [orderProduct, setOrderProduct] = useState(null)
  const [cart, setCart] = useState(readCart)
  const [cartOpen, setCartOpen] = useState(false)
  const [cartToast, setCartToast] = useState(null)
  const cartRef = useRef(cart)
  cartRef.current = cart
  const [authNotice, setAuthNotice] = useState('')
  const pendingOrder = useRef(null) // product the visitor wanted to order before logging in

  // restore an existing session
  useEffect(() => {
    if (!tokenStore.get()) return
    api
      .me()
      .then((data) => setUser(data.user))
      .catch((err) => {
        if (err.status === 401) {
          tokenStore.set(null)
          setUser(null)
        }
      })
      .finally(() => setChecking(false))
  }, [])

  useEffect(() => {
    writeUser(user)
  }, [user])

  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)) } catch { /* storage unavailable */ }
  }, [cart])

  const addToCart = useCallback((product, months = null) => {
    const term = months || product?._term || null
    const key = `${product.slug || product.id}:${term || 'once'}`
    const exists = cartRef.current.some((item) => item.key === key)
    if (!exists) setCart((items) => (items.some((item) => item.key === key) ? items : [...items, { key, product, months: term, quantity: 1 }]))
    setCartToast({ id: Date.now(), kind: exists ? 'exists' : 'added', name: product.name, image: (product.images || [])[0] || '' })
  }, [])
  const removeFromCart = useCallback((key) => setCart((items) => items.filter((item) => item.key !== key)), [])
  const clearCart = useCallback(() => setCart([]), [])
  // abonelik süresini sepette değiştir; aynı ürün+süre zaten varsa satırlar birleşir
  const setCartTerm = useCallback((key, months) => {
    setCart((items) => {
      const cur = items.find((item) => item.key === key)
      if (!cur) return items
      const nextKey = `${cur.product.slug || cur.product.id}:${months || 'once'}`
      if (nextKey === key) return items
      if (items.some((item) => item.key === nextKey)) return items.filter((item) => item.key !== key)
      return items.map((item) => (item.key === key ? { ...item, key: nextKey, months, product: { ...item.product, _term: months } } : item))
    })
  }, [])
  const openCart = useCallback(() => { setCartToast(null); setCartOpen(true) }, [])
  const closeCart = useCallback(() => setCartOpen(false), [])
  const dismissCartToast = useCallback(() => setCartToast(null), [])

  const finishAuth = useCallback((data) => {
    tokenStore.set(data.token)
    setUser(data.user)
    setAuthOpen(false)
    setAuthNotice('')
    // continue the order the visitor started before signing in
    if (pendingOrder.current) {
      setOrderProduct(pendingOrder.current)
      pendingOrder.current = null
    }
  }, [])

  // Returning from Google / Discord: /?oauth=<one-time code> (success) or /?auth_error=<reason> (failure)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('oauth')
    const failure = params.get('auth_error')
    if (!code && !failure) return
    window.history.replaceState(null, '', window.location.pathname + window.location.hash)
    if (code) {
      api
        .exchange(code)
        .then(finishAuth)
        .catch((err) => {
          setAuthNotice(err.message)
          setAuthTab('login')
          setAuthOpen(true)
        })
    } else {
      const messages = {
        not_configured: 'Bu giriş yöntemi henüz yapılandırılmadı. Lütfen e-posta ile giriş yapın.',
        cancelled: 'Giriş iptal edildi.',
        invalid_state: 'Giriş oturumu doğrulanamadı. Lütfen tekrar deneyin.',
        email_unverified: 'Hesabınızın e-posta adresi doğrulanmamış veya paylaşılmamış. Doğrulanmış bir e-posta gereklidir.',
        failed: 'Giriş tamamlanamadı. Lütfen tekrar deneyin.',
      }
      setAuthNotice(messages[failure] || messages.failed)
      setAuthTab('login')
      setAuthOpen(true)
    }
  }, [finishAuth])

  const login = useCallback(async (payload) => finishAuth(await api.login(payload)), [finishAuth])
  const register = useCallback(async (payload) => finishAuth(await api.register(payload)), [finishAuth])
  const logout = useCallback(() => {
    tokenStore.set(null)
    setUser(null)
  }, [])

  const openAuth = useCallback((tab = 'login') => {
    setAuthTab(tab)
    setAuthOpen(true)
  }, [])
  const closeAuth = useCallback(() => {
    setAuthOpen(false)
    pendingOrder.current = null
  }, [])

  // ordering needs an account: guests are sent to login / register first and returned to the order afterwards
  const openOrder = useCallback(
    (base, months) => {
      const product = months ? { ...base, _term: months } : base
      if (!user) {
        pendingOrder.current = product
        setAuthNotice('Sipariş vermek için giriş yapın veya kayıt olun.')
        setAuthTab('login')
        setAuthOpen(true)
        return
      }
      setOrderProduct(product)
    },
    [user]
  )
  const closeOrder = useCallback(() => setOrderProduct(null), [])

  // sepetten sipariş: her hizmetin kurulum bilgileri ayrı istendiği için ürünler sırayla tamamlanır
  const checkoutItem = useCallback((item) => {
    setCartOpen(false)
    openOrder(item.product, item.months)
  }, [openOrder])
  // sipariş tamamlanınca o satır sepetten düşer
  const completeCartItem = useCallback((product) => {
    const key = `${product.slug || product.id}:${product._term || 'once'}`
    setCart((items) => items.filter((item) => item.key !== key))
  }, [])
  const continueCheckout = useCallback(() => {
    const next = cartRef.current.find((item) => item.product && item.product.price != null)
    setOrderProduct(null)
    if (next) setTimeout(() => setOrderProduct(next.months ? { ...next.product, _term: next.months } : next.product), 60)
  }, [])

  const value = useMemo(
    () => ({
      user, setUser, checking, login, register, logout,
      authOpen, authTab, authNotice, openAuth, closeAuth,
      orderProduct, openOrder, closeOrder, cart, addToCart, removeFromCart, clearCart,
      setCartTerm, cartOpen, openCart, closeCart, cartToast, dismissCartToast, checkoutItem, completeCartItem, continueCheckout,
    }),
    [user, setUser, checking, login, register, logout, authOpen, authTab, authNotice, openAuth, closeAuth, orderProduct, openOrder, closeOrder, cart, addToCart, removeFromCart, clearCart, setCartTerm, cartOpen, openCart, closeCart, cartToast, dismissCartToast, checkoutItem, completeCartItem, continueCheckout]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
