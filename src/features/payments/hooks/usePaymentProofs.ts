import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { ProofFilters, ProofsResponse } from '../types'

export function usePaymentProofs(filters: ProofFilters & { page: number; per_page: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['payment-proofs', filters],
    queryFn: () =>
      apiClient
        .get<ProofsResponse>('/admin/payments/proofs/', { params: filters })
        .then((r) => r.data),
    staleTime: 30_000,
  })
  return {
    proofs:     data?.proofs ?? [],
    kpi:        data?.kpi ?? { total: 0, pending: 0, approved: 0, rejected: 0 },
    pagination: data?.pagination ?? { page: 1, per_page: 5, total: 0, total_pages: 1 },
    isLoading,
  }
}
