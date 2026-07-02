import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export function useDeleteAnnouncement() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/admin/announcements/${id}/`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-announcements'] })
    },
  })
}
