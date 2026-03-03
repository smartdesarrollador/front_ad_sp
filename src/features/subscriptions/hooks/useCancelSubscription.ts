import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { CurrentSubscription } from '../types'

interface CancelResponse {
  subscription: CurrentSubscription
}

export function useCancelSubscription() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: () =>
      apiClient.post<CancelResponse>('/admin/subscriptions/cancel').then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-subscription'] })
    },
  })
}
