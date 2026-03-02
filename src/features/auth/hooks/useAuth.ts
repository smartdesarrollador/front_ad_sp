import { useAuthContext } from '../AuthContext'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { isLoading, login, logout, register } = useAuthContext()
  const { user, isAuthenticated } = useAuthStore()
  return { user, isAuthenticated, isLoading, login, logout, register }
}
