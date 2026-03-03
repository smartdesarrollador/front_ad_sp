import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { Promotion } from '../types'

export function usePromotions() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-promotions'],
    queryFn: () =>
      apiClient.get<{ promotions: Promotion[] }>('/admin/promotions/').then((r) => r.data),
    staleTime: 60_000,
  })

  return {
    promotions: data?.promotions ?? [],
    isLoading,
  }
}
