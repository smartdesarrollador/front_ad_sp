import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { CurrentSubscription, UpgradeRequest } from '../types'

interface UpgradeResponse {
  subscription: CurrentSubscription
}

export function useUpgradeSubscription() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (req: UpgradeRequest) =>
      apiClient.post<UpgradeResponse>('/admin/subscriptions/upgrade', req).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-subscription'] })
      qc.invalidateQueries({ queryKey: ['plan-features'] })
    },
  })
}
