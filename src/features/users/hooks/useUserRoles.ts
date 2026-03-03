import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export function useUserRoles() {
  const qc = useQueryClient()

  const assignRole = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      apiClient.post(`/admin/users/${userId}/roles/`, { role_id: roleId }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const removeRole = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      apiClient.delete(`/admin/users/${userId}/roles/${roleId}/`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  return { assignRole, removeRole }
}
