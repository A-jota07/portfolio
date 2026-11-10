import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthUser, LoginCredentials } from '@/types/auth'
import * as authService from '@/services/authService'
import { AuthContext } from '@/hooks/useAuth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    authService.fetchCurrentUser().then((currentUser) => {
      setUser(currentUser)
      setIsLoading(false)
    })
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await authService.login(credentials)
    if (result.success) {
      const currentUser = await authService.fetchCurrentUser()
      setUser(currentUser)
    }
    return result
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user && user.role === 'admin',
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
