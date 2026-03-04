import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { MFASetupResponse } from '../types'

export function useMFASetup() {
  const setUser = useAuthStore((s) => s.setUser)
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: () =>
      apiClient.post<MFASetupResponse>('/auth/mfa/enable/').then((r) => r.data),
    onSuccess: () => {
      if (user) {
        setUser({ ...user, mfaEnabled: true })
      }
    },
  })
}
