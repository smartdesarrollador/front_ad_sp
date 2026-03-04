import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.post('/admin/notifications/read-all/'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
    },
  })
}
