import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { AdminPlan, PlanUpdateRequest } from '../types'

export function useUpdatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PlanUpdateRequest }) =>
      apiClient
        .patch<{ plan: AdminPlan }>(`/admin/billing/plans/${id}/`, data)
        .then((r) => r.data.plan),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-plans'] })
      qc.invalidateQueries({ queryKey: ['public-plans'] })
    },
  })
}
