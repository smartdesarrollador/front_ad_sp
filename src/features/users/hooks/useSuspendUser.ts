import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { AdminUser } from '../types'

export function useSuspendUser() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) =>
      apiClient.post<AdminUser>(`/admin/users/${userId}/suspend/`, {}).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}
