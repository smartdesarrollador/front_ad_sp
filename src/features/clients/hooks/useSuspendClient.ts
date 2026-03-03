import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export interface SuspendClientInput {
  id: string
  active: boolean
}

export function useSuspendClient() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, active }: SuspendClientInput) =>
      apiClient.post(`/admin/clients/${id}/suspend/`, { active }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-clients'] })
    },
  })
}
