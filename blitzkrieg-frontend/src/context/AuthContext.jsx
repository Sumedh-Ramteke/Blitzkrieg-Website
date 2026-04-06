import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const TOKEN_KEY = 'blitzkrieg_admin_token'
const USER_KEY  = 'blitzkrieg_admin_user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null)
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })

  // Attach token to every axios request whenever it changes
  useEffect(() => {
    axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : ''
  }, [token])

  const login = useCallback(async (username, password) => {
    const res = await axios.post('/api/auth/login', { username, password })
    const { token: jwt, user: u } = res.data
    localStorage.setItem(TOKEN_KEY, jwt)
    localStorage.setItem(USER_KEY,  JSON.stringify(u))
    axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`
    setToken(jwt)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    axios.defaults.headers.common['Authorization'] = ''
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
