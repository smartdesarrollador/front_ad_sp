import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { AdminPlan } from '../types'

export function useAdminPlans() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: () =>
      apiClient
        .get<{ plans: AdminPlan[] }>('/admin/billing/plans/')
        .then((r) => r.data.plans),
    staleTime: 5 * 60 * 1000,
  })
  return { plans: data ?? [], isLoading }
}
