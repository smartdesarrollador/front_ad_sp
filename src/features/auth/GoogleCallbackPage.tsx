import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types/auth'

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser, setAccessToken } = useAuthStore()

  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const errorMsg = searchParams.get('error')

    if (errorMsg || !accessToken || !refreshToken) {
      navigate('/login', {
        replace: true,
        state: { error: errorMsg ?? 'Error al autenticar con Google' },
      })
      return
    }

    setAccessToken(accessToken)
    localStorage.setItem('refreshToken', refreshToken)

    // Try to restore user from base64-encoded data param (if backend provides it)
    const userParam = searchParams.get('user')
    if (userParam) {
      try {
        const user = JSON.parse(atob(userParam)) as User
        setUser(user)
        localStorage.setItem('authUser', JSON.stringify(user))
      } catch {
        // Proceed without user data — app will handle gracefully
      }
    }

    navigate('/', { replace: true })
  }, [searchParams, navigate, setUser, setAccessToken])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div
        className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
        role="status"
        aria-label="Procesando autenticación"
      />
    </div>
  )
}
