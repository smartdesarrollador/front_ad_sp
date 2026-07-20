import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { PromotionStats } from '../types'

export function usePromotionStats(id: string | null) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-promotion-stats', id],
    queryFn: () =>
      apiClient.get<PromotionStats>(`/admin/promotions/${id}/stats/`).then((r) => r.data),
    enabled: id !== null,
    staleTime: 30_000,
  })
  return { stats: data ?? null, isLoading }
}
