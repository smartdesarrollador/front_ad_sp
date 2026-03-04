import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/notifications/${id}/read/`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
    },
  })
}
