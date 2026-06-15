import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { YapeConfig } from '../types'

export function useUpdateYapeConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<YapeConfig>) =>
      apiClient.patch<YapeConfig>('/admin/yape/config/', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['yape-config'] })
    },
  })
}
