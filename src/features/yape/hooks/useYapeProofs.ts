import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { YapeProofFilters, YapeProofsResponse } from '../types'

export function useYapeProofs(filters: YapeProofFilters & { page: number; per_page: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['yape-proofs', filters],
    queryFn: () =>
      apiClient
        .get<YapeProofsResponse>('/admin/yape/proofs/', { params: filters })
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
