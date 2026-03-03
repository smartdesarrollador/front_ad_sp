import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { RoleCreateRequest, RoleDetail } from '../types'

export function useCreateRole() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: RoleCreateRequest) =>
      apiClient.post<RoleDetail>('/admin/roles/create/', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-roles'] })
    },
  })
}
