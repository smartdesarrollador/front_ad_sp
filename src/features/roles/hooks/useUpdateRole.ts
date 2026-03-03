import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { RoleUpdateRequest, RoleDetail } from '../types'

export function useUpdateRole() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name, description, permission_ids }: RoleUpdateRequest) => {
      await apiClient.patch<RoleDetail>(`/admin/roles/${id}/update/`, { name, description })
      const { data } = await apiClient.put<RoleDetail>(`/admin/roles/${id}/permissions/`, {
        permission_ids: permission_ids ?? [],
      })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-roles'] })
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}
