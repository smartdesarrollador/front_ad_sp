import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { apiClient, publicClient } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { LoginResponse, MFALoginResponse, RegisterRequest, Tenant, User } from '@/types/auth'

export type LoginResult = { ok: true } | { mfaRequired: true; mfaToken: string }

interface AuthContextType {
  isLoading: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const { setUser, setTenant, setAccessToken, clearAuth } = useAuthStore()

  useEffect(() => {
    const refresh = localStorage.getItem('refreshToken')
    if (!refresh) {
      setIsLoading(false)
      return
    }

    publicClient
      .post<{ access_token: string; refresh_token: string }>('/auth/refresh-token', {
        refresh_token: refresh,
      })
      .then(({ data }) => {
        setAccessToken(data.access_token)
        localStorage.setItem('refreshToken', data.refresh_token)
        const storedUser = localStorage.getItem('authUser')
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser) as User
            setUser(user)
          } catch {
            localStorage.removeItem('authUser')
            clearAuth()
          }
        }
        const storedTenant = localStorage.getItem('authTenant')
        if (storedTenant) {
          try {
            const tenant = JSON.parse(storedTenant) as Tenant
            setTenant(tenant)
          } catch {
            localStorage.removeItem('authTenant')
          }
        }
      })
      .catch(() => {
        localStorage.removeItem('authUser')
        clearAuth()
      })
      .finally(() => {
        setIsLoading(false)
      })
    // Stable Zustand actions — intentionally omitted from deps to run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email: string, password: string): Promise<LoginResult> => {
    const { data } = await publicClient.post<LoginResponse | MFALoginResponse>('/auth/login', {
      email,
      password,
    })
    if ('mfa_required' in data) {
      return { mfaRequired: true, mfaToken: data.mfa_token }
    }
    const loginData = data as LoginResponse
    setUser(loginData.user)
    setTenant(loginData.tenant)
    setAccessToken(loginData.access_token)
    localStorage.setItem('refreshToken', loginData.refresh_token)
    localStorage.setItem('authUser', JSON.stringify(loginData.user))
    localStorage.setItem('authTenant', JSON.stringify(loginData.tenant))
    return { ok: true }
  }

  const logout = async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      localStorage.removeItem('authUser')
      localStorage.removeItem('authTenant')
      clearAuth()
    }
  }

  const register = async (data: RegisterRequest): Promise<void> => {
    await publicClient.post('/auth/register', {
      name: data.name,
      email: data.email,
      organization_name: data.organizationName,
      password: data.password,
      password2: data.confirmPassword,
    })
  }

  return (
    <AuthContext.Provider value={{ isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
