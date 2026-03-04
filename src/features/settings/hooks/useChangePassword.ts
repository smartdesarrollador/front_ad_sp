import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

interface ChangePasswordPayload {
  current_password: string
  new_password: string
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordPayload) =>
      apiClient.post('/auth/change-password/', data).then((r) => r.data),
  })
}
