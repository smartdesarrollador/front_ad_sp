import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export function useDeleteCatalogItem() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/admin/catalog/${id}/`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-catalog'] })
    },
  })
}
