import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { InviteUserRequest } from '../types'

interface InviteResponse {
  message: string
}

export function useInviteUser() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: InviteUserRequest) =>
      apiClient.post<InviteResponse>('/admin/users/invite/', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}
