import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, tokenStore } from '../lib/api.js'

const AppContext = createContext(null)

export const useApp = () => useContext(AppContext)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState('login')
  const [orderProduct, setOrderProduct] = useState(null)
  const [demoProduct, setDemoProduct] = useState(null)

  // restore an existing session
  useEffect(() => {
    if (!tokenStore.get()) return
    api
      .me()
      .then((data) => setUser(data.user))
      .catch((err) => {
        if (err.status === 401) tokenStore.set(null)
      })
  }, [])

  const finishAuth = useCallback((data) => {
    tokenStore.set(data.token)
    setUser(data.user)
    setAuthOpen(false)
  }, [])

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
  const closeAuth = useCallback(() => setAuthOpen(false), [])

  const openOrder = useCallback((product) => {
    setDemoProduct(null)
    setOrderProduct(product)
  }, [])
  const closeOrder = useCallback(() => setOrderProduct(null), [])
  const openDemo = useCallback((product) => setDemoProduct(product), [])
  const closeDemo = useCallback(() => setDemoProduct(null), [])

  const value = useMemo(
    () => ({
      user, login, register, logout,
      authOpen, authTab, openAuth, closeAuth,
      orderProduct, openOrder, closeOrder,
      demoProduct, openDemo, closeDemo,
    }),
    [user, login, register, logout, authOpen, authTab, openAuth, closeAuth, orderProduct, openOrder, closeOrder, demoProduct, openDemo, closeDemo]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
