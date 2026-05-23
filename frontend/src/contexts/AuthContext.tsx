import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  logout: () => void
  isHR: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  isEmployee: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const stored = localStorage.getItem('user')
    if (token && stored) {
      try {
        setUserState(JSON.parse(stored))
      } catch {
        localStorage.clear()
      }
    }
    setIsLoading(false)
  }, [])

  const setUser = (u: User | null) => {
    setUserState(u)
    if (u) {
      localStorage.setItem('token', u.token)
      localStorage.setItem('user', JSON.stringify(u))
    } else {
      localStorage.clear()
    }
  }

  const logout = () => setUser(null)

  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const isHR = user?.role === 'HR_MANAGER'
  const isAdmin = isSuperAdmin
  const isEmployee = user?.role === 'EMPLOYEE'

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout, isHR, isAdmin, isSuperAdmin, isEmployee }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
