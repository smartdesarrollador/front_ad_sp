import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { AdminUser, UpdateUserRequest } from '../types'

interface UpdateUserPayload extends UpdateUserRequest {
  id: string
}

export function useUpdateUser() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateUserPayload) =>
      apiClient.patch<AdminUser>(`/admin/users/${id}/update/`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}
