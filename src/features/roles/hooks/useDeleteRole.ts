import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export function useDeleteRole() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/admin/roles/${id}/delete/`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-roles'] })
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}
